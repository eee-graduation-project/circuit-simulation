import {getSVGCoordinates} from "./utils.js";
import {addNode, addConnection} from "./data.js";

let mouseLines = null;
let startPoint = null;
let startWireInfo = null;
let endWireNum = null;
let isDragging;
let offsetX, offsetY;

let boardEvent = null;
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
  const num = boardEvent.getAttribute('data-id');
  const wireSgroup = document.querySelector(`g[data-start="${num}"]`);
  const wireEgroup = document.querySelector(`g[data-end="${num}"]`);
  wireS = wireSgroup ? Array.from(wireSgroup.children) : [];
  wireE = wireEgroup ? Array.from(wireEgroup.children) : [];
  console.log(wireS);
  console.log(wireE);
}

const boardDrag = (event) => {
  if (!isDragging) return;
  event.preventDefault();

  const x = event.clientX - offsetX;
  const y = event.clientY - offsetY;
  const position = getSVGCoordinates(x, y);
  boardEvent.setAttribute('transform', `translate(${position.x}, ${position.y})`);
  const {height, width} = boardEvent.getBoundingClientRect();
  const elementType = boardEvent.getAttribute('data-type');
  
  const pointL = getSVGCoordinates(x, y+height/2);
  const pointR = getSVGCoordinates(x+width, y+height/2);
  // element를 옮길 때 양옆에 연결된 wire를 찾아서 같이 이동시킴
  wireS.forEach((line) => {
    const dir = line.getAttribute('data-start-dir');
    const point = (elementType == 'ground') ? getSVGCoordinates(x+width/2, y) : ((dir=="true") ? pointL : pointR);
    updateLine(line, point, null);
  })

  wireE.forEach((line) => {
    const dir = line.getAttribute('data-end-dir');
    const point = (elementType == 'ground') ? getSVGCoordinates(x+width/2, y) : ((dir=="true") ? pointL : pointR);
    updateLine(line, null, point);
  })
}

const boardDrop = () => {
  isDragging = false;
  boardEvent = null;
}
// wire를 처음 연결
export const startWire = (event) => {
  const [direction, point] = getLinePosition(event.target.parentNode);
  
  const dataId = event.target.parentNode.getAttribute('data-id');
  const dataType = event.target.parentNode.getAttribute('data-type');
  if (!startPoint) {
    // if (event.target.hasAttribute('node'))
    const startWireNum = event.target.getAttribute('wireNum');
    mouseLines = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    mouseLines.setAttribute('data-start', dataId);
    mouseLines.setAttribute('data-start-dir', direction);
    
    const mouseHorizonLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    mouseHorizonLine.setAttribute('stroke', 'black');
    mouseHorizonLine.setAttribute('stroke-width', '2.5');
    mouseHorizonLine.setAttribute('class', 'board__wire');

    const mouseVerticalLine = mouseHorizonLine.cloneNode(true);

    startWireInfo = {startWireNum, dataId, direction};
    mouseLines.append(mouseHorizonLine, mouseVerticalLine);
    board.appendChild(mouseLines);
    
    startPoint = point;
    updateLine(mouseLines, startPoint, startPoint);
    event.target.setAttribute('wire', wireNum);
  }
  else {
    mouseLines.setAttribute('data-end', dataId);
    mouseLines.setAttribute('data-end-dir', direction);
    mouseLines.setAttribute('wireNum', wireNum);
    updateLine(mouseLines, startPoint, point);
    startPoint = null;
    
    endWireNum = event.target.getAttribute('wireNum');
    
    addNode(wireNum, startWireInfo.startWireNum, endWireNum);
    addConnection(wireNum, dataId, direction);
    addConnection(wireNum, startWireInfo.dataId, startWireInfo.direction);

    endWireNum = null;
    startWireInfo = null;

    event.target.setAttribute('wire', wireNum);
    wireNum += 1;

    mouseLines.addEventListener("click", (event) => {
      setVoltageProbe(event)
    });
  }
};

const getLinePosition = (node) => {
  const {top, left, width, height} = node.getBoundingClientRect();
  const elementType = node.getAttribute('data-type');
  // 1이면 왼쪽, 0이면 오른쪽
  if (elementType == 'ground') {
    const point = getSVGCoordinates(left+width/2, top+1.5);
    return [2, point];
  }
  const direction = (event.clientX < left + width/2);
  const x = left + (direction ? 0 : width);
  const y = top + 20.25;
  const point = getSVGCoordinates(x, y);
  return [direction, point]
}
const drawWire = (event) => {
  if (startPoint) {
    const endPoint = getSVGCoordinates(event.clientX + 5, event.clientY + 5);
    updateLine(mouseLines, startPoint, endPoint);
  }
}

const updateLine = (lineGroup, startPoint, endPoint) => {
  const lines = lineGroup.children;
  const horizon = lines[0];
  const vertical = lines[1];
  if (startPoint) {
    horizon.setAttribute('x1', startPoint.x);
    horizon.setAttribute('y1', startPoint.y);
    vertical.setAttribute('y1', startPoint.y);
    horizon.setAttribute('y2', startPoint.y);
  }
  if (endPoint) {
    horizon.setAttribute('x2', endPoint.x);
    vertical.setAttribute('x2', endPoint.x);
    vertical.setAttribute('y2', endPoint.y);
    vertical.setAttribute('x1', endPoint.x);
  }
}

const voltageButton = document.querySelector('img[alt="voltage-circle"]');
const currentButton = document.querySelector('img[alt="current-circle"]');
const cursorButton = document.querySelector('img[alt="cursor"]');

voltageButton.addEventListener("click", (event) => {
  addVoltageProbe();
})
currentButton.addEventListener("click", (event) => {
  addCurrentProbe();
})
cursorButton.addEventListener("click", (event) => {
  changeCursor();
})

const addVoltageProbe = () => {
  board.classList.remove('probe_current');
  board.classList.add('probe_voltage');
}
const addCurrentProbe = () => {
  board.classList.remove('probe_voltage');
  board.classList.add('probe_current');
}
const changeCursor = () => {
  board.classList.remove('probe_voltage');
  board.classList.remove('probe_current');
}

const setVoltageProbe = (event) => {
  if (board.classList.contains('probe_voltage')) {
    const position = getSVGCoordinates(event.pageX, event.pageY);
    const wireNum = event.target.getAttribute('wireNum');
    const img = document.createElementNS('http://www.w3.org/2000/svg', 'image');
    img.setAttribute('href', '/static/images/probe-voltage.svg');
    img.setAttribute('connectedWireNum', wireNum);
    img.setAttribute('x', position.x);
    img.setAttribute('y', position.y);
    img.setAttribute('class', 'line__probe_voltage');
    board.appendChild(img);
  }
}
