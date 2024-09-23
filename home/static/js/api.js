import {getCookie, getSVGCoordinates} from "./utils.js";
import {getData, getNodeNum} from "./data.js";

const componentId = {};
const nodeId = {};

const board = document.querySelector('.board');
const button = document.querySelector('button');
button.addEventListener('click', () => {
  postSimulate()
});

const postSimulate = async () => {
  const data = getData();
  try {
    await Promise.all([postComponent(data.elements), postNode(data.nodes)]);
    await postConnection(data.connections);
    await getSimulate(window.boardId, data.groundNodeNum);
  } catch (error) {
    console.error('Error in postSimulate:', error);
  }
}

const postComponent = async (components) => {
  const data = await requestAPI('POST', '/api/component/', components);
  data.forEach((d) => {
    componentId[d.name] = d.id;
  });
}

const postNode = async (nodes) => {
  const data = await requestAPI('POST', '/api/node/', nodes);
  data.forEach((d) => {
    nodeId[d.name] = d.id;
  })
}

const postConnection = async (duplicatedInfos) => {
  const infoSet = new Set(duplicatedInfos.map(duplicatedInfo => JSON.stringify(duplicatedInfo)));
  const infos = Array.from(infoSet).map(str => JSON.parse(str));
  const connections = infos.map((info) => {
    return {
      node: nodeId[info.node],
      component: componentId[info.element],
      position: Number(info.position)
    };
  })
  await requestAPI('POST', '/api/connection/', connections);
}

const getSimulate = async (boardId, groundNodeNum) => {
  const url = `/api/simulation?` + new URLSearchParams({boardId, groundNodeNum}).toString();
  const data = await requestAPI('GET', url);
  const voltageList = document.querySelector('.result__voltage_list');
  const currentList = document.querySelector('.result__current_list');
  Object.entries(data.result_node).forEach(([key, value]) => {
    const listItem = document.createElement('li');
    listItem.textContent = `node${key}: ${value}V`;
    voltageList.appendChild(listItem);
  })
  Object.entries(data.result_current).forEach(([key, value]) => {
    const listItem = document.createElement('li');
    listItem.textContent = `${key}: ${value}A`;
    currentList.appendChild(listItem);
  })

  const voltageProbes = document.querySelectorAll('.line__probe_voltage');
  voltageProbes.forEach((voltageProbe) => {
    const wireNum = voltageProbe.getAttribute('connectedWireNum');
    const nodeNum = getNodeNum(wireNum);
    const x = voltageProbe.getAttribute('x');
    const y = voltageProbe.getAttribute('y');

    const nodeName = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    nodeName.setAttribute('x', Number(x)+10);
    nodeName.setAttribute('y', Number(y)+40);
    nodeName.setAttribute('font-size', '12');
    nodeName.setAttribute('font-weight', 'bold');
    nodeName.setAttribute('fill', '#FF4C4C');
    nodeName.textContent = `node${nodeNum}: ${data.result_node[nodeNum]}V`;
    board.appendChild(nodeName);
  })
}

const requestAPI = async (method, url, data) => {
  const request = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCookie('csrftoken')
    }
  }
  if (data) request['body'] = JSON.stringify(data);

  const response = await fetch(url, request);
  return response.json();
}
