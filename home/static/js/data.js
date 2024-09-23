const createCircuitData = () => {
  let elements = [];
  let connections = [];
  let nodes = [];

  return {
    addElement: function (element) {
      elements.push(element);
    },
    addConnection: function (connection) {
      connections.push(connection);
    },
    addNode: function (node) {
      nodes.push(node);
    },
    getData: function () {
      return {
        elements,
        connections,
        nodes,
        groundNodeNum
      };
    },
    replaceConnection: function (modifiedConnection) {
      connections = modifiedConnection;
    }
  };
};

const circuitData = createCircuitData();
const board = window.boardId;
const wire2node = {};
const node2wire = {};
let nodeNum = 1;
let groundNodeNum = null;

export const getNodeNum = (wireNum) => {
  console.log(`wireNum ${wireNum}`)
  console.log(wire2node);
  return wire2node[wireNum];
}
export const getData = () => {
  return circuitData.getData();
}

export const addElement = (name, type, value) => {
  const element = {name, type, value, board};
  circuitData.addElement(element);

  console.log(circuitData.getData());
}

export const addConnection = (wire, element, position) => {
  const node = wire2node[wire];
  const connection = {node, element, position};
  circuitData.addConnection(connection);
  console.log(element);
  if (element[0]=="G") groundNodeNum = node;
  console.log(circuitData.getData());
}

export const addNode = (wireName, startWire, endWire) => {
  const startNode = wire2node[startWire];
  const endNode = wire2node[endWire];
  if (startNode && endNode) {
    const minNode = (startNode < endNode) ? startNode : endNode;
    const maxNode = (startNode < endNode) ? endNode : startNode;

    [...node2wire[maxNode], wireName].forEach((wire) => {
      wire2node[wire] = minNode;
      node2wire[minNode].push(wire);
    })
    delete node2wire[maxNode];
    
    const connections = circuitData.getData().connections;
    connections.forEach((connection) => {
      if (connection.node == maxNode) {
        connection.node = minNode;
      }
    })
    circuitData.replaceConnection(connections);
  }
  else if (startNode || endNode) {
    const node = startNode ? startNode : endNode;
    const wire = startNode ? startWire : endWire;
    console.log(node2wire[node]);
    node2wire[node].push(wireName);
    node2wire[node].push(wire);
    wire2node[wireName] = node;
    wire2node[wire] = node;
  }
  else {
    node2wire[nodeNum] = [wireName];
    node2wire[nodeNum] = [startWire];
    node2wire[nodeNum] = [endWire];
    wire2node[wireName] = nodeNum;
    wire2node[startWire] = nodeNum;
    wire2node[endWire] = nodeNum;
    const node = {name: nodeNum};
    circuitData.addNode(node);
    nodeNum += 1;
  }
  // const node = {name};
  // circuitData.addNode(node);
  console.log(circuitData.getData());
}
