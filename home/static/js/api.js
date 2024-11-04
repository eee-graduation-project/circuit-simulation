import {getCookie} from "./utils.js";
import { circuitComponents } from "./component.js";
import { circuitWires } from "./wire.js";
import { circuitProbes } from "./probes.js";

const runButton = document.querySelector('.button__simulate');

let temp = 0;

runButton.addEventListener('click', (event) => {
  event.preventDefault();
  postSimulate();
});

const addProbe = async () => {
  const probes = circuitProbes;
  const probeVoltagePlus = []
  const probeVoltageMinus = []
  const probeCurrent = [] // 1차 배열
  const probeVout = {}
  probes.forEach((probe) => {
    // console.log(probe);
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
    if (!fieldset.disabled) Array.from(fieldset.elements).forEach(input => {fieldsetElement[input.name] = input.value;})
  });

  switch(fieldsetElement.mode) {
    case 'op':
      return `.${fieldsetElement.mode}`;
    case 'dc':
      return `.${fieldsetElement.mode} ${fieldsetElement.name} ${fieldsetElement.start} ${fieldsetElement.stop} ${fieldsetElement.step}`;
    case 'ac':
      return `.${fieldsetElement.mode} ${fieldsetElement.type} ${fieldsetElement.points} ${fieldsetElement.start} ${fieldsetElement.stop}`;
    case 'tran':
      return `.${fieldsetElement.mode} ${fieldsetElement.stop} ${fieldsetElement.step}`;
  }
}
const postSimulate = async () => {
  // const data = getData();
  try {
    if (temp==0)
      await Promise.all([postComponent(Object.values(circuitComponents)), postWire(Object.values(circuitWires))]);
    const analysis = await addAnalysis();
    const probes = await addProbe();
    // console.log(analysis);
    await getSimulate(window.boardId, analysis, JSON.stringify(probes));
    temp = 1;
  } catch (error) {
    console.error('Error in postSimulate:', error);
    temp = 1;
  }
}

const postComponent = async (components) => {
  const data = components.map((component) => {
    return component.getData(window.boardId);
  });
  const result = await requestAPI('POST', '/api/component/', data);
  // result.forEach((r) => {
  //   componentId[r.name] = r.num;
  // });
  console.log(result);
}

const postWire = async (wires) => {
  const data = wires.map((wire) => {
    return {num: wire.num, start: wire.start, startDir: wire.startDir, end: wire.end, endDir: wire.endDir, board: window.boardId}
  });
  const result = await requestAPI('POST', '/api/wire/', data);
  console.log(result);
}

const generateOpResult = (result) => {
  const voltageList = document.querySelector('.result__voltage_list');
  const currentList = document.querySelector('.result__current_list');
  Object.entries(result.voltage).forEach(([key, value]) => {
    const listItem = document.createElement('li');
    listItem.textContent = `node${key}: ${value}V`;
    voltageList.appendChild(listItem);
    console.log(listItem);
  });
  Object.entries(result.current).forEach(([key, value]) => {
    const listItem = document.createElement('li');
    listItem.textContent = `${key}: ${value}A`;
    currentList.appendChild(listItem);
  });
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
  const data = await requestAPI('GET', url);
  console.log(data);
  displayNode(data.com2node);
  switch (data['analysis_type']) {
    case '.op':
      generateOpResult(data.result);
      break;
    case '.dc':
      break;
    case '.ac':
      break;
    case '.tran':
      break;
  }
  // const voltageProbes = document.querySelectorAll('.line__probe_voltage');
  // voltageProbes.forEach((voltageProbe) => {
  //   const wireNum = voltageProbe.getAttribute('connectedWireNum');
  //   const nodeNum = getNodeNum(wireNum);
  //   const x = voltageProbe.getAttribute('x');
  //   const y = voltageProbe.getAttribute('y');

  //   const nodeName = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  //   nodeName.setAttribute('x', Number(x)+10);
  //   nodeName.setAttribute('y', Number(y)+40);
  //   nodeName.setAttribute('font-size', '12');
  //   nodeName.setAttribute('font-weight', 'bold');
  //   nodeName.setAttribute('fill', '#FF4C4C');
  //   nodeName.textContent = `node${nodeNum}: ${data.result_node[nodeNum]}V`;
  //   board.appendChild(nodeName);
  // })
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
