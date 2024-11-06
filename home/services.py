from .models import Component, Wire

def id_2_comp(components):
    id2comp = {}
    for component in components.values():
        id2comp[component['num']] = component
    return id2comp

def dfs_node(id2comp, com2node, comps, nodeNum):
    for comp in comps:
        id = comp[:-1]
        pos = comp[-1]
        if (comp in com2node): return
        com2node[comp] = nodeNum
        connection = id2comp[id]['connections'][f'{id}{pos}']
        dfs_node(id2comp, com2node, connection, nodeNum)

def find_ground(id2comp, components):
    com2node = {}
    for component in components.values():
        if (component['type'] == 'ground'):
            dfs_node(id2comp, com2node, component['connections'][f"{component['num']}T"], 0)
    return com2node

def generate_netlist(board_id):
  netlist = []
  components = Component.objects.filter(board=board_id)
  wires = Wire.objects.filter(board=board_id)
  
  id2comp = id_2_comp(components)
  com2node = find_ground(id2comp, components) 
  
  nodeNum = 1
  for component in components:
      for pos, connection in component.connections.items():
          if (pos in com2node): continue
          com2node[pos] = nodeNum
          dfs_node(id2comp, com2node, connection, nodeNum)
          nodeNum+=1
  
  wire2node = {}
  for wire in wires:
      startPos = f"{wire.start}{wire.startDir}"
      wire2node[wire.num] = com2node[startPos]
  
  for component in components:
      if component.type == 'ground':
          continue
      net = [component.name]

      # node
      for dir in ('T', 'B', 'I', 'M', 'L', 'R'):
          pos = f"{component.num}{dir}"
          if pos in com2node:
            net.append(com2node[pos])
      
      if component.type in ('current-source', 'current-signal-source', 'current-source-voltage-controlled', 'current-source-current-controlled'):
          temp = net[1]
          net[1] = net[2]
          net[2] = temp
      
      # value & option
      if component.type in ('voltage-source', 'current-source'):
          net.append('DC')
      elif component.type in ('voltage-signal-source', 'current-signal-source'):
          print(component.options)
          net.append(component.options['type'])
          option = ''
          if component.options['type'] == 'AC':
              option += f"{component.options['magnitude']}"
          elif component.options['type'] == 'SINE':
              option += f"({component.options['offset']} {component.options['amplitude']} {component.options['frequency']})"
          elif component.options['type'] == 'PULSE':
              option += f"({component.options['amplitude']} {component.options['period']} {component.options['tmax']} {component.options['option']})"
          elif component.options['type'] == 'UNIT':
              option += f"({component.options['offset']} {component.options['amplitude']} {component.options['trise']})"
          elif component.options['type'] == 'PWL':
              option += f"({' '.join(component.options['tv'].values())})"
          net.append(option)
          netlist.append(net)
          continue
      elif component.type in ('voltage-source-current-controlled', 'current-source-current-controlled'):
          net.append(component.options['sense'])
      net.append(component.value)
      netlist.append(net)
  print('netlist: ')
  print(netlist)

  return [netlist, com2node, wire2node]

def generate_probe(probes, com2node, wire2node):
  # probe
  probeVoltage = []
  probeCurrent = []
  probeVout = []
  for probe in sorted(probes['probeVoltagePlus'], key=lambda x: x["num"]):
      targetNum = probe['targetNum']
      if (probe['targetType'] == 'component'):
          node = com2node[targetNum]
          probeVoltage.append([node])
      else:
          node = wire2node[targetNum]
          probeVoltage.append([node])
  
  for probe in sorted(probes['probeVoltageMinus'], key=lambda x: x["num"]):
      targetNum = probe['targetNum']
      if (probe['targetType'] == 'component'):
          node = com2node[targetNum]
          probeVoltage[probe['num']].append(node)
      else:
          node = wire2node[targetNum]
          probeVoltage[probe['num']].append(node)
  
  for probe in sorted(probes['probeCurrent'], key=lambda x: x["num"]):
      probeCurrent.append(probe['targetName'])
  
  for probe in (probes.get('probeVoutPlus', None), probes.get('probeVoutMinus', None)):
    if not probe is None:
      targetNum = probe['targetNum']
      if (probe['targetType'] == 'component'):
          node = com2node[targetNum]
          probeVout.append(node)
      else:
          node = wire2node[targetNum]
          probeVout.append(node)
  
  return [probeVoltage, probeCurrent, probeVout]
