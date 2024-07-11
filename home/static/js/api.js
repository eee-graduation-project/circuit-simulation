import {getCookie} from "./utils.js";
import {getData} from "./data.js";

const componentId = {};
const nodeId = {};

const button = document.querySelector('button');
button.addEventListener('click', () => {
  postSimulate()
});

const postSimulate = async () => {
  const data = getData();
  try {
    await Promise.all([postComponent(data.elements), postNode(data.nodes)]);
    await postConnection(data.connections);
    await getSimulate(window.boardId);
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

const postConnection = async (infos) => {
  const connections = infos.map((info) => {
    return {
      node: nodeId[info.node],
      component: componentId[info.element],
      position: Number(info.position)
    };
  })
  await requestAPI('POST', '/api/connection/', connections);
}

const getSimulate = async (boardId) => {
  const url = `/api/simulation?` + new URLSearchParams({boardId}).toString();
  await requestAPI('GET', url);
}

const requestAPI = async (method, url, data) => {
  const request = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCookie('csrftoken')
    }
  }
  if (body) request.body = JSON.stringify(data);

  const response = fetch(url, request);
  return response.json();
}
