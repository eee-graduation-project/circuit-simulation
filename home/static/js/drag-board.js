import {getSVGCoordinates} from "./utils.js";
import { circuitComponents } from "./component.js";
import { CircuitWire, circuitWires } from "./wire.js";

let mouseLines = null;
let startPoint = null;
// let endWireNum = null;
let isDragging;
let offsetX, offsetY;

let boardEvent = null;
let currComponent = null;
let wireS = null;
let wireE = null;

let wireNum = 0;

const board = document.querySelector(".board");

board.addEventListener('mousemove', (event) => {
  onMouseMove(event)
});
board.addEventListener('mouseup', (event) => {
  boardDrop(event)
});

const onMouseMove = (event) => {
  if (startPoint) drawWire(event);
  else boardDrag(event);
}

export const boardDragStart = (event) => {
  boardEvent = event.target.parentNode;
  isDragging = true;
  offsetX = event.clientX - boardEvent.getBoundingClientRect().left;
  offsetY = event.clientY - boardEvent.getBoundingClientRect().top;
  const dataId = boardEvent.getAttribute('data-id');
  currComponent = circuitComponents[dataId];
  
  wireS = Object.values(circuitWires).filter(circuitWire => circuitWire.start == dataId);
  wireE = Object.values(circuitWires).filter(circuitWire => circuitWire.end == dataId);
}

const boardDrag = (event) => {
  if (!isDragging) return;
  event.preventDefault();

  const x = event.clientX - offsetX;
  const y = event.clientY - offsetY;
  const position = getSVGCoordinates(x, y);
  const transformInfo = boardEvent.getAttribute('transform').replace(/\btranslate\(([^,]+),\s*([^)]+)\)/, `translate(${position.x}, ${position.y})`);
  boardEvent.setAttribute('transform', transformInfo);
  
  currComponent.moveConnectedWires(wireS, wireE);
  currComponent.position = {'x': position.x, 'y': position.y};
}

const boardDrop = () => {
  isDragging = false;
  boardEvent = null;
}
// wire를 처음 연결
export const startWire = (event) => {
  if (board.classList.contains('probe_voltage_plus') || board.classList.contains('probe_voltage_minus') || board.classList.contains('probe_current') || board.classList.contains('probe_vout_plus') || board.classList.contains('probe_vout_minus')) {
    return;
  }
  
  const dataId = event.target.parentNode.getAttribute('data-id');
  const component = circuitComponents[dataId];
  const [direction, point] = getLinePosition(event.target, component);
  
  if (!startPoint) {
    // if (event.target.hasAttribute('node'))
    mouseLines = new CircuitWire(dataId, direction);
    mouseLines.makeAPI('POST');
    startPoint = point;
    mouseLines.updateWire(startPoint, startPoint);
    // event.target.setAttribute('wire', wireNum);
  }
  else {
    mouseLines.setEndWire(dataId, direction);
    mouseLines.updateWire(startPoint, point);
    startPoint = null;
    
    // endWireNum = event.target.getAttribute('wireNum');
    
    // endWireNum = null;

    // event.target.setAttribute('wire', wireNum);
    // wireNum += 1;
  }
};

export const getLinePosition = (line, component) => {
  const {pointL, pointR, pointT, pointB, pointI, pointM} = component.getLinePoint();
  let point;
  const direction = line.getAttribute('lineNum').slice(-1);
  switch (direction) {
    case 'L':
      return ['L', pointL];
    case 'I':
      return ['I', pointI];
    case 'M':
      return ['M', pointM];
    case 'R':
      return ['R', pointR];
    case 'T':
      return ['T', pointT];
    case 'B':
      return ['B', pointB];
  }
}

const drawWire = (event) => {
  if (startPoint) {
    const endPoint = getSVGCoordinates(event.clientX + 5, event.clientY + 5);
    mouseLines.updateWire(startPoint, endPoint);
  }
}
