import {getCookie} from "./utils.js";
import { circuitComponents } from "./component.js";
import { circuitProbes } from "./probes.js";
import { generateAcResult, generateDcResult, generateOpResult, generateTranResult } from "./draw-graph.js";

const runButton = document.querySelector('.button__simulate');

export const apis = {'POST':[], 'PUT':[], 'DELETE':[]}; // {method, target, type}
export const putApi = {}; // target : array index

runButton.addEventListener('click', async (event) => {
  event.preventDefault();
  const loader = document.querySelector('.loader');
  loader.style.display = 'block';
  await postSimulate();
  loader.style.display = 'none';
});

const addProbe = async () => {
  const probes = circuitProbes;
  const probeVoltagePlus = []
  const probeVoltageMinus = []
  const probeCurrent = [] // 1차 배열
  const probeVout = {}
  probes.forEach((probe) => {
    const probeInfo = {num: probe.num, targetNum: probe.targetNum, targetType: probe.targetType}
    switch(probe.type) {
      case 'voltagePlus':
        probeVoltagePlus.push(probeInfo);
        break;
      case 'voltageMinus':
        probeVoltageMinus.push(probeInfo);
        break;
      case 'current':
        probeCurrent.push({num: probe.num, targetName: probe.targetName});
        break;
      case 'voutPlus':
        probeVout.plus = probeInfo;
      case 'voutMinus':
        probeVout.minus = probeInfo;
    }
  });
  return {probeVoltagePlus, probeVoltageMinus, probeCurrent, probeVoutPlus: probeVout.plus, probeVoutMinus: probeVout.minus};
}

const addAnalysis = async () => {
  const modeFieldSets = document.querySelectorAll('fieldset');
  const fieldsetElement = {};
  modeFieldSets.forEach((fieldset) => {
    if (!fieldset.disabled) Array.from(fieldset.elements).forEach(input => {fieldsetElement[input.name] = input.value;});
  });

  switch(fieldsetElement.mode) {
    case 'op':
      return `.${fieldsetElement.mode}`;
    case 'dc':
      return `.${fieldsetElement.mode} ${fieldsetElement.name} ${fieldsetElement.start} ${fieldsetElement.stop} ${fieldsetElement.step}`;
    case 'ac':
      return `.${fieldsetElement.mode} ${fieldsetElement.type} ${fieldsetElement.points} ${fieldsetElement.start} ${fieldsetElement.stop}`;
    case 'tran':
      return `.${fieldsetElement.mode} ${fieldsetElement.step} ${fieldsetElement.stop}`;
  }
}

const postSimulate = async () => {
  try {
    await sendDataApi('POST');
    await sendDataApi('PUT');
    await sendDataApi('DELETE');
    const analysis = await addAnalysis();
    const probes = await addProbe();
    const data = await getSimulate(window.boardId, analysis, JSON.stringify(probes));

    const opResult = document.querySelector('.result');
    opResult.style.display = 'none';
    
    displayNode(data.com2node);

    switch (data['analysis_type']) {
      case '.op':
        generateOpResult(data.result);
        break;
      case '.dc':
        generateDcResult(probes, data.probeVoltage, data.probeCurrent, data.result);
        break;
      case '.ac':
        generateAcResult(probes, data.result);
        break;
      case '.tran':
        generateTranResult(probes, data.probeVoltage, data.probeCurrent, data.result);
        break;
    }
  } catch (error) {
    console.error('Error in postSimulate:', error);
    const errorContainer = document.querySelector('.error');
    const errorMessage = errorContainer.querySelector('.error_message');
    errorMessage.textContent = error;
    errorContainer.style.display = 'flex';
  }
}

const sendDataApi = async (method) => {
  const tasks = [];
  for (const api of apis[method]) {
    switch (api.type) {
      case 'component':
        tasks.push(sendComponent(api.target, api.method));
        break;
      case 'wire':
        tasks.push(sendWire(api.target, api.method));
        break;
    }
  };
  await Promise.all(tasks);
  apis[method] = [];
}

const sendComponent = async (component, method) => {
  const data = component.getData(window.boardId);
  switch (method) {
    case 'POST':
      await requestAPI('POST', '/api/component/', data);
      break;
    case 'PUT':
      await requestAPI('PUT', `/api/component/${data.num}/?`+ new URLSearchParams({boardId}).toString(), data);
      break;
    case 'DELETE':
      await requestAPI('DELETE', `/api/component/${component.num}/?`+ new URLSearchParams({boardId}).toString());
      break;
  }
}

const sendWire = async (wire, method) => {
  const data = {...JSON.parse(JSON.stringify(wire)), board: window.boardId}
  switch (method) {
    case 'POST':
      await requestAPI('POST', '/api/wire/', data);
      break;
    case 'PUT':
      await requestAPI('PUT', `/api/wire/${data.num}/?`+ new URLSearchParams({boardId}).toString(), data);
      break;
    case 'DELETE':
      await requestAPI('DELETE', `/api/wire/${wire.num}/?`+ new URLSearchParams({boardId}).toString());
      break;
  }
}

const displayNode = (com2node) => {
  Object.values(circuitComponents).forEach((component) => {
    const node = [];
    switch (component.type) {
      case 'ground':
        node.push(com2node[`${component.num}T`]);
        break;
      case 'voltage-source-voltage-controlled':
      case 'current-source-voltage-controlled':
        node.push(com2node[`${component.num}I`]);
        node.push(com2node[`${component.num}M`]);
        node.push(com2node[`${component.num}T`]);
        node.push(com2node[`${component.num}B`]);
      case 'voltage-source-current-controlled':
      case 'current-source-current-controlled':
        node.push(com2node[`${component.num}T`]);
        node.push(com2node[`${component.num}B`]);
      default:
        node.push(com2node[`${component.num}R`]);
        node.push(com2node[`${component.num}L`]);
        break;
    }
    component.displayNode(component.type, node);
  })
}

const getSimulate = async (boardId, analysis, probes) => {
  const url = `/api/simulation?` + new URLSearchParams({boardId, analysis, probes}).toString();
  try {
    const data = await requestAPI('GET', url);
    console.log(data);
    return data;
  } catch (error) {
    throw error;
  }
}

export const requestAPI = async (method, url, data) => {
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

const closeButton = document.querySelector(".graph__button_close");
closeButton.addEventListener("click", () => {
  const graph = document.querySelector(".graph__container");
  graph.querySelector("#probe").innerHTML = '';
  const svgElement = graph.querySelector(".graph");
  while (svgElement.firstChild) {
    svgElement.removeChild(svgElement.firstChild);
  }
  graph.style.display = "none";
});

const closeErrorButton = document.querySelector(".error__button_close");
closeErrorButton.addEventListener("click", () => {
  const errorContainer = document.querySelector('.error');
  errorContainer.style.display = 'none';
});
