import {getSVGCoordinates} from "./utils.js";
import { circuitComponents } from "./component.js";
import { CircuitWire, circuitWires } from "./wire.js";
import {setProbe} from "./probe.js";

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
  const [direction, point] = getLinePosition(event.target);
  
  if (!startPoint) {
    // if (event.target.hasAttribute('node'))
    mouseLines = new CircuitWire(event.target.getAttribute('wireNum'), dataId, direction);
    startPoint = point;
    mouseLines.updateWire(startPoint, startPoint);
    event.target.setAttribute('wire', wireNum);
  }
  else {
    mouseLines.setEndWire(dataId, direction, wireNum);
    mouseLines.updateWire(startPoint, point);
    startPoint = null;
    
    // endWireNum = event.target.getAttribute('wireNum');
    
    // endWireNum = null;

    event.target.setAttribute('wire', wireNum);
    wireNum += 1;

    mouseLines.wires.addEventListener("click", (event) => {
      setProbe(event, 'probe_voltage_plus', 'voltagePlus');
      setProbe(event, 'probe_voltage_minus', 'voltageMinus');
      setProbe(event, 'probe_vout_plus', 'voutPlus');
      setProbe(event, 'probe_vout_minus', 'voutMinus');
      // setCurrentProbe(event)
    });
  }
};

const getLinePosition = (line) => {
  const {top, bottom, left, width, height} = line.getBoundingClientRect();
  let point;
  const direction = line.getAttribute('lineNum').slice(-1);
  switch (direction) {
    case 'L':
    case 'I':
    case 'M':
      point = getSVGCoordinates(left, top+height/2);
      break;
    case 'R':
      point = getSVGCoordinates(left + width, top+height/2);
      break;
    case 'T':
      point = getSVGCoordinates(left+width/2, top+1.5);
      break;
    case 'B':
      point = getSVGCoordinates(left+width/2, bottom);
      break;
  }
  return [direction, point]
}

const drawWire = (event) => {
  if (startPoint) {
    const endPoint = getSVGCoordinates(event.clientX + 5, event.clientY + 5);
    mouseLines.updateWire(startPoint, endPoint);
  }
}
