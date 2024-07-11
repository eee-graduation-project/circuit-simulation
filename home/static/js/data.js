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
        nodes
      };
    }
  };
};

const circuitData = createCircuitData();
const board = window.boardId;

export const getData = () => {
  return circuitData.getData();
}

export const addElement = (name, type, value) => {
  const element = {name, type, value, board};
  circuitData.addElement(element);
  console.log(circuitData.getData());
}

export const addConnection = (node, element, position) => {
  const connection = {node, element, position};
  circuitData.addConnection(connection);
  console.log(circuitData.getData());
}

export const addNode = (name) => {
  const node = {name};
  circuitData.addNode(node);
  console.log(circuitData.getData());
}
