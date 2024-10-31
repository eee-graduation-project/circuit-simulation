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
  boardEvent.setAttribute('transform', `translate(${position.x}, ${position.y})`);
  // const {height, width} = boardEvent.getBoundingClientRect();
  const elementType = currComponent.type;
  
  const lines = currComponent.svgElement.querySelectorAll('.board__element_wire');
  const lineInfo = {}
  Array.from(lines).forEach((line) => {
    const direction = line.getAttribute('lineNum').slice(-1);
    if ( direction== 'L') {
      const {top, left, width} = line.getBoundingClientRect();
      lineInfo['top'] = top;
      lineInfo['left'] = left;
      lineInfo['width'] = width;
    }
    else if (direction=='R') {
      const {left} = line.getBoundingClientRect();
      lineInfo['right'] = left;
    }
    else if (direction=='T') {
      const {left, top} = line.getBoundingClientRect();
      lineInfo['tleft'] = left;
      lineInfo['ttop'] = top;
    }
  })
  const pointL = getSVGCoordinates(lineInfo.left, lineInfo.top);
  const pointR = getSVGCoordinates(lineInfo.right + lineInfo.width, lineInfo.top);
  
  // element를 옮길 때 양옆에 연결된 wire를 찾아서 같이 이동시킴
  wireS?.forEach((line) => {
    const dir = line.startDir;
    const point = (elementType == 'ground') ? getSVGCoordinates(lineInfo.tleft, lineInfo.ttop) : (dir=='L' ? pointL : pointR);
    line.updateWire(point, null);
  })

  wireE?.forEach((line) => {
    const dir = line.endDir;
    const point = (elementType == 'ground') ? getSVGCoordinates(lineInfo.tleft, lineInfo.ttop) : (dir=='L' ? pointL : pointR);
    line.updateWire(null, point);
  })
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
  // console.log(event.target);
  const dataId = event.target.parentNode.getAttribute('data-id');
  const component = circuitComponents[dataId];
  const [direction, point] = getLinePosition(component, event.target);

  const dataType = component.type;
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

const getLinePosition = (component, line) => {
  const {top, left, width, height} = line.getBoundingClientRect();
  const elementType = component.type;
  // 1이면 왼쪽, 0이면 오른쪽
  if (elementType == 'ground') {
    const point = getSVGCoordinates(left+width/2, top+1.5);
    return ['T', point];
  }
  const direction = line.getAttribute('lineNum').slice(-1);
  const x = left + (direction=='L' ? 0 : width);
  const y = top + height/2;
  const point = getSVGCoordinates(x, y);
  return [direction, point]
}

const drawWire = (event) => {
  if (startPoint) {
    const endPoint = getSVGCoordinates(event.clientX + 5, event.clientY + 5);
    mouseLines.updateWire(startPoint, endPoint);
  }
}
