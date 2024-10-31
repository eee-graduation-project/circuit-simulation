from .models import Component, Wire

def id_2_comp(components):
    id2comp = {}
    for component in components.values():
        # print(component.items())
        id2comp[component['num']] = component
    return id2comp

def dfs_node(id2comp, com2node, comps, nodeNum):
    # component['connections']
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
            dfs_node(id2comp, com2node, component['connections'][f'{component['num']}T'], 0)
    return com2node

def generate_netlist(board_id):
  netlist = []
  components = Component.objects.filter(board=board_id)
  wires = Wire.objects.filter(board=board_id)
  
  id2comp = id_2_comp(components)
  com2node = find_ground(id2comp, components) # 'G0'이 아니라 ground의 번호(dataId)여야 함. 일단 ground를 가장 먼저 추가하기
  print('???')
  # node_num = 1
  # wire2node = {}

  # # netlist
  # for wire in wires:
  #     startPos = f"{wire.start}{wire.startDir}"
  #     endPos = f"{wire.end}{wire.endDir}"
      
  #     for pos in (startPos, endPos):
  #       wire2node[str(wire.num)] = node_num
  #       if not pos in com2node:
  #         com2node[pos] = node_num
  #     node_num += 1
  # node
  nodeNum = 1
  for component in components:
      for pos, connection in component.connections.items():
          if (pos in com2node): continue
          dfs_node(id2comp, com2node, connection, nodeNum)
          nodeNum+=1
  
  wire2node = {}
  for wire in wires:
      startPos = f"{wire.start}{wire.startDir}"
      wire2node[wire.num] = com2node[startPos]
  
  for component in components:
      # print(component)
      if component.type == 'ground':
          continue
      net = [component.name]
      startPos = f"{component.num}R"
      endPos = f"{component.num}L"
      for pos in (startPos, endPos):
          net.append(com2node[pos])
      
      if component.type in ('voltage-source', 'current-source'):
          net.append('DC')
      elif component.type in ('voltage-signal-source', 'current-signal-source'):
          print(component.options)
          net.append(component.options['type'])
          option = ''
          if component.options['type'] == 'AC':
              option += f"{component.options['magnitude']}"
          elif component.options['type'] == 'SIN':
              option += f"({component.options['offset']} {component.options['amplitude']} {component.options['frequency']})"
          elif component.options['type'] == 'PULSE':
              option += f"({component.options['amplitude']} {component.options['period']} {component.options['tmax']} {component.options['option']})"
          elif component.options['type'] == 'UNIT':
              option += f"({component.options['offset']} {component.options['amplitude']} {component.options['trise']})"
          net.append(option)
          netlist.append(net)
          print(netlist)
          continue
      
      net.append(component.value)
      netlist.append(net)
  print('com2node:')
  print(com2node)
  print('wire2node:')
  print(wire2node)

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

def process_result(analysis_type, result):
    # dc
    if (analysis_type == '.dc'):
        pass