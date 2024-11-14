import {requestAPI} from "./api.js";
import { CircuitComponent, circuitComponents } from "./component.js";
import { getLinePosition } from "./drag-board.js";
import { CircuitWire } from "./wire.js";

const getComponents = async (boardId) => {
  const url = `/api/component/?` + new URLSearchParams({boardId}).toString();
  const data = await requestAPI('GET', url);
  return data;
}

const getWires = async (boardId) => {
  const url = `/api/wire/?` + new URLSearchParams({boardId}).toString();
  const data = await requestAPI('GET', url);
  return data;
}

const getInitialData = async () => {
  const boardId = window.boardId;

  const components = await getComponents(boardId);
  const wires = await getWires(boardId);
  
  components.forEach((comp) => {
    const component = new CircuitComponent(comp.type, comp.position);
    component.setInitialCondition(comp.value, comp.options, comp.rotation, comp.diverse);
  })
  console.log(circuitComponents);
  wires.forEach((w) => {
    const wire = new CircuitWire(w.start, w.startDir);
    const startLine = document.querySelector(`[lineNum="${wire.start}${wire.startDir}"]`);
    const startComponent = circuitComponents[wire.start];
    const [startDirection, startPoint] = getLinePosition(startLine, startComponent);

    const endLine = document.querySelector(`[lineNum="${w.end}${w.endDir}"]`);
    const endComponent = circuitComponents[w.end];
    const [endDirection, endPoint] = getLinePosition(endLine, endComponent);

    wire.updateWire(startPoint, endPoint);
    wire.setEndWire(w.end, w.endDir);
  })
}

getInitialData();
