from scipy.sparse import csr_matrix
from scipy.sparse.linalg import spsolve
import numpy as np

'''
resistor ["name", node1, node2, value]
voltage ["name", node1, node2, value]
current ["name", node1, node2, value]
vcvs ["name", node1, node2, sense_node1, sense_node2, value]
vccs ["name", node1, node2, sense_node1, sense_node2, value]
ccvs ["name", node1, node2, "sense_name", value]
cccs ["name", node1, node2, "sense_name", value]
'''
resistors = []
voltages = []
currents = []
vcvs = []
vccs = []
ccvs = []
cccs = []
G = []
solve = []
node_num = 0
node_map = []
reverse_node_map = []


# data
data = [
    ["F1", 4, 5, 1, 2, 2/3],
    ["R1", 1, 4, 3],
    ["R2", 4, 5, 0.5],
    ["R3", 5, 0, 6],
    ["I1", 1, 0, 1.5]
]

# data reordering
def reorder(self):

    global reverse_node_map
    global node_num

    # Deduplication
    seen = set()
    unique_data = []

    for line in self:
        name = line[0]
        if name not in seen:
            unique_data.append(line)
            seen.add(name)
    
    # node remapping
    nodes = set()
    for line in unique_data:
        nodes.add(line[1])
        nodes.add(line[2])
    sorted_nodes = sorted(nodes)

    node_map = {node: i for i, node in enumerate(sorted_nodes)}
    reverse_node_map = {i: node for i, node in enumerate(sorted_nodes)}
    
    for line in unique_data:
        line[1] = node_map[line[1]]
        line[2] = node_map[line[2]]
    
    # max num of node
    node_num = len(node_map) - 1

    # elements separation
    for line in unique_data:
        first_element = line[0]
        if first_element.startswith('R'):
            resistors.append(line)
        elif first_element.startswith('V'):
            voltages.append(line)
        elif first_element.startswith('I'):
            currents.append(line)
        elif first_element.startswith('E'): # VCVS
            vcvs.append(line)
        elif first_element.startswith('F'): # VCCS
            vccs.append(line)
        elif first_element.startswith('G'): # CCVS
            ccvs.append(line)
        elif first_element.startswith('H'): # CCCS
            cccs.append(line)

    # sort
    resistors.sort(key=lambda x: x[0])
    voltages.sort(key=lambda x: x[0])
    currents.sort(key=lambda x: x[0])
    vcvs.sort(key=lambda x: x[0])
    vccs.sort(key=lambda x: x[0])
    ccvs.sort(key=lambda x: x[0])
    cccs.sort(key=lambda x: x[0])

    print("Resistors:")
    for resistor in resistors:
        print(resistor)

    print("\nVoltages:")
    for voltage in voltages:
        print(voltage)

    print("\nCurrents:")
    for current in currents:
        print(current)

    print("\nvcvs:")
    for vcvs_item in vcvs:
        print(vcvs_item)

    print("vccs:")
    for vccs_item in vccs:
        print(vccs_item)

    print("\nccvs:")
    for ccvs_item in ccvs:
        print(ccvs_item)

    print("\ncccs:")
    for cccs_item in cccs:
        print(cccs_item)

def g_matrix():

    g = []
    g_row = []
    g_col = []

    # resistors
    for item in resistors:
        N1 = item[1]
        N2 = item[2]

        if (N1 == 0) or (N2 == 0):
            g.append(1.0 / item[3])
            g_row.append(max([N1, N2]) - 1)
            g_col.append(max([N1, N2]) - 1)

        else:

            g.append(1.0 / item[3])
            g_row.append(N1 - 1)
            g_col.append(N1 - 1)

            g.append(1.0 / item[3])
            g_row.append(N2 - 1)
            g_col.append(N2 - 1)

            g.append(-1.0 / item[3])
            g_row.append(N1 - 1)
            g_col.append(N2 - 1)

            g.append(-1.0 / item[3])
            g_row.append(N2 - 1)
            g_col.append(N1 - 1)


    # independent voltage Sources
    for k, item in enumerate(voltages):
        N1 = item[1]
        N2 = item[2]

        if N1 == 0:
            g.append(-1)
            g_row.append(N2 - 1)
            g_col.append(node_num + k)

            g.append(-1)
            g_row.append(node_num + k)
            g_col.append(N2 - 1)

        elif N2 == 0:
            g.append(1)
            g_row.append(N1 - 1)
            g_col.append(node_num + k)

            g.append(1)
            g_row.append(node_num + k)
            g_col.append(N1 - 1)

        else:
            g.append(1)
            g_row.append(N1 - 1)
            g_col.append(node_num + k)

            g.append(1)
            g_row.append(node_num + k)
            g_col.append(N1 - 1)

            g.append(-1)
            g_row.append(N2 - 1)
            g_col.append(node_num + k)

            g.append(-1)
            g_row.append(node_num + k)
            g_col.append(N2 - 1)


    # Voltage Controlled Voltage Sources (VCVS)
    for k, item in enumerate(vcvs):
        N1 = item[1]
        N2 = item[2]
        Nc1 = item[3]
        Nc2 = item[4]

        if N1 == 0:
            g.append(-1)
            g_row.append(N2 - 1)
            g_col.append(node_num + len(voltages) + k)

            g.append(-1)
            g_row.append(node_num + len(voltages) + k)
            g_col.append(N2 - 1)

        elif N2 == 0:
            g.append(1)
            g_row.append(N1 - 1)
            g_col.append(node_num + len(voltages) + k)

            g.append(1)
            g_row.append(node_num + len(voltages) + k)
            g_col.append(N1 - 1)

        else:
            g.append(1)
            g_row.append(N1 - 1)
            g_col.append(node_num + len(voltages) + k)

            g.append(1)
            g_row.append(node_num + len(voltages) + k)
            g_col.append(N1 - 1)

            g.append(-1)
            g_row.append(N2 - 1)
            g_col.append(node_num + len(voltages) + k)

            g.append(-1)
            g_row.append(node_num + len(voltages) + k)
            g_col.append(N2 - 1)

        if Nc1 == 0:
            g.append(item[5])
            g_row.append(node_num + len(voltages) + k)
            g_col.append(Nc2 - 1)

        elif Nc2 == 0:
            g.append(-item[5])
            g_row.append(node_num + len(voltages) + k)
            g_col.append(Nc1 - 1)

        else:
            g.append(-item[5])
            g_row.append(node_num + len(voltages) + k)
            g_col.append(Nc1 - 1)

            g.append(item[5])
            g_row.append(node_num + len(voltages) + k)
            g_col.append(Nc2 - 1)


    # Voltage Controlled Current Source (VCCS)
    for k, item in enumerate(vccs):
        N1 = item[1]
        N2 = item[2]
        Nc1 = item[3]
        Nc2 = item[4]

        if (N1 != 0) & (Nc1 != 0):
            g.append(-item[5])
            g_row.append(N1 - 1)
            g_col.append(Nc1 - 1)
        if (N1 != 0) & (Nc2 != 0):
            g.append(item[5])
            g_row.append(N1 - 1)
            g_col.append(Nc2 - 1)
        if (N2 != 0) & (Nc1 != 0):
            g.append(item[5])
            g_row.append(N2 - 1)
            g_col.append(Nc1 - 1)
        if (N2 != 0) & (Nc2 != 0):
            g.append(-item[5])
            g_row.append(N2 - 1)
            g_col.append(Nc2 - 1)


    # Current Controlled Voltage Source (CCVS)
    for k, item in enumerate(ccvs):
        N1 = item[1]
        N2 = item[2]
        sens = item[3]

        if sens.startswith('R'):
            h = next((i for i, item in enumerate(resistors) if sens in item), None)
            Nc1 = resistors[h][1]   # sensing R node1
            Nc2 = resistors[h][2]   # sensing R node2
            Rval = resistors[h][3]  # R value

            if N1 == 0:
                g.append(-1)
                g_row.append(N2 - 1)
                g_col.append(node_num + len(voltages) + len(vcvs) + k)

                g.append(-1)
                g_row.append(node_num + len(voltages) + len(vcvs) + k)
                g_col.append(N2 - 1)

            elif N2 == 0:
                g.append(1)
                g_row.append(N1 - 1)
                g_col.append(node_num + len(voltages) + len(vcvs) + k)

                g.append(1)
                g_row.append(node_num + len(voltages) + len(vcvs) + k)
                g_col.append(N1 - 1)

            else:
                g.append(1)
                g_row.append(N1 - 1)
                g_col.append(node_num + len(voltages) + len(vcvs) + k)

                g.append(1)
                g_row.append(node_num + len(voltages) + len(vcvs) + k)
                g_col.append(N1 - 1)

                g.append(-1)
                g_row.append(N2 - 1)
                g_col.append(node_num + len(voltages) + len(vcvs) + k)

                g.append(-1)
                g_row.append(node_num + len(voltages) + len(vcvs) + k)
                g_col.append(N2 - 1)

            if Nc1 == 0:
                g.append(item[4]/Rval)
                g_row.append(node_num + len(voltages) + len(vcvs) + k)
                g_col.append(Nc2 - 1)

            elif Nc2 == 0:
                g.append(-item[4]/Rval)
                g_row.append(node_num + len(voltages) + len(vcvs) + k)
                g_col.append(Nc1 - 1)

            else:
                g.append(-item[4]/Rval)
                g_row.append(node_num + len(voltages) + k)
                g_col.append(Nc1 - 1)

                g.append(item[4]/Rval)
                g_row.append(node_num + len(voltages) + k)
                g_col.append(Nc2 - 1)

        else:
            if sens.startswith('V'): # independent voltage source
                h = next((i for i, item in enumerate(voltages) if sens in item), None)
                n = node_num + h
            elif sens.startswith('E'): # VCVS
                h = next((i for i, item in enumerate(vcvs) if sens in item), None)
                n = node_num + len(voltages) + h
            elif sens.startswith('G'): # CCVS
                h = next((i for i, item in enumerate(ccvs) if sens in item), None)
                n = node_num + len(voltages) + len(vcvs) + h

            if N1 != 0:
                g.append(1)
                g_row.append(N1 - 1)
                g_col.append(node_num + len(voltages) + len(vcvs) + k)

                g.append(1)
                g_row.append(node_num + len(voltages) + len(vcvs) + k)
                g_col.append(N1 - 1)

            if N2 != 0:
                g.append(-1)
                g_row.append(N2 - 1)
                g_col.append(node_num + len(voltages) + len(vcvs) + k)

                g.append(-1)
                g_row.append(node_num + len(voltages) + len(vcvs) + k)
                g_col.append(N2 - 1)

            g.append(-item[4])
            g_row.append(node_num + len(voltages) + len(vcvs) + k)
            g_col.append(n)


    # Current Controlled Current Source (CCCS)
    for k, item in enumerate(cccs):
        N1 = item[1]
        N2 = item[2]
        sens = item[3]

        if sens.startswith('R'):
            h = next((i for i, item in enumerate(resistors) if sens in item), None)
            Nc1 = resistors[h][1]   # sensing R node1
            Nc2 = resistors[h][2]   # sensing R node2
            Rval = resistors[h][3]  # R value

            if (N1 != 0) & (Nc1 != 0):
                g.append(-item[4]/Rval)
                g_row.append(N1 - 1)
                g_col.append(Nc1 - 1)
            if (N1 != 0) & (Nc2 != 0):
                g.append(item[4]/Rval)
                g_row.append(N1 - 1)
                g_col.append(Nc2 - 1)
            if (N2 != 0) & (Nc1 != 0):
                g.append(item[4]/Rval)
                g_row.append(N2 - 1)
                g_col.append(Nc1 - 1)
            if (N2 != 0) & (Nc2 != 0):
                g.append(-item[4]/Rval)
                g_row.append(N2 - 1)
                g_col.append(Nc2 - 1)

        else:
            if sens.startswith('V'): # independent voltage source
                h = next((i for i, item in enumerate(voltages) if sens in item), None)
                n = node_num + h
            elif sens.startswith('E'): # VCVS
                h = next((i for i, item in enumerate(vcvs) if sens in item), None)
                n = node_num + len(voltages) + h
            elif sens.startswith('G'): # CCVS
                h = next((i for i, item in enumerate(ccvs) if sens in item), None)
                n = node_num + len(voltages) + len(vcvs) + h

            if N1 == 0:
                g.append(item[4])
                g_row.append(N2 - 1)
                g_col.append(n)

            elif N2 == 0:
                g.append(-item[4])
                g_row.append(N1 - 1)
                g_col.append(n)

            else:
                g.append(-item[4])
                g_row.append(N1 - 1)
                g_col.append(n)

                g.append(item[4])
                g_row.append(N2 - 1)
                g_col.append(n)

    return csr_matrix((g,(g_row,g_col)))


def rhs_matrix():
    rhs = [0] * (node_num + len(voltages) + len(vcvs) + len(ccvs))

    for k, item in enumerate(voltages):
        rhs[node_num + k] = item[3]

    for item in currents:
        N1 = item[1]
        N2 = item[2]

        if N1 == 0:
            rhs[N2 - 1] -= item[3]

        elif N2 == 0:
            rhs[N1 - 1] += item[3]

        else:
            rhs[N1 - 1] += item[3]
            rhs[N2 - 1] -= item[3]

    return rhs


reorder(data)
G = g_matrix()
rhs = rhs_matrix()

#print g_matrix
print("\ng_matrix : ")
print(G.toarray())

# print rhs_matrix
print("\nrhs_matrix : ")
print(rhs)

# solve matrix
solve = spsolve(g_matrix(), rhs_matrix())
print("\nsolve is : ")
print(solve)

#result reodering
def resultf():

  result = []
  result2 = []

  x = np.insert(solve, 0, 0.) # insert 0 at the first element
  ## reoder for source ##
  '''
  ['naem', voltage, current]
  '''
  # resistor
  for i, ritem in enumerate(resistors):
    result.append([ritem[0], x[ritem[1]] - x[ritem[2]], (x[ritem[1]] - x[ritem[2]])/ritem[3]])
  # independent voltage source
  for j, vitem in enumerate(voltages):
    result.append([vitem[0], vitem[3], x[node_num + j + 1]])
  # independent current source
  for k, citem in enumerate(currents):
    result.append([citem[0], x[citem[1]] - x[citem[2]], -citem[3]])
  # vcvs
  for l, vcvsitem in enumerate(vcvs):
    result.append([vcvsitem[0], x[vcvsitem[1]] - x[vcvsitem[2]], x[node_num + len(voltages) + l + 1]])
  # vccs
  for m, vccsitem in enumerate(vccs):
    result.append([vccsitem[0], x[vccsitem[1]] - x[vccsitem[2]], -vccsitem[5] * (x[vccsitem[3]] - x[vccsitem[4]])])
  # ccvs
  for n, ccvsitem in enumerate(ccvs):
    result.append([ccvsitem[0], x[ccvsitem[1]] - x[ccvsitem[2]], x[node_num + len(voltages) + len(vcvs) + n + 1]])
  # cccs
  for q, cccsitem in enumerate(cccs):
    sensecurrent = None
    for row in result:
      if row[0] == cccsitem[3]:
        sensecurrent = row[2]
    if sensecurrent is None:
      print("There is no source to sense")
      return
    elif sensecurrent < 0:
      result.append([cccsitem[0], x[cccsitem[1]] - x[cccsitem[2]], cccsitem[4] * sensecurrent])
    else:
      result.append([cccsitem[0], x[cccsitem[1]] - x[cccsitem[2]], -cccsitem[4] * sensecurrent])

  ## reoder for node voltage ##
  '''
  [node_num, voltage]
  '''
  for ix, value in enumerate(x):
    if ix <= node_num:
        result2.append([reverse_node_map[ix], value])

  return result, result2


result_source, result_node = resultf()
print("\nresult_source :", result_source)
print("\nresult_node :", result_node)

