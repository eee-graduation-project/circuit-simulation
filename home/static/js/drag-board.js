import {getSVGCoordinates} from "./utils.js";
import {addNode, addConnection} from "./data.js";

let mouseLine = null;
let startPoint = null;
let isDragging;
let offsetX, offsetY;

let boardEvent = null;
let wireS = null;
let wireE = null;

let nodeNum = 0;

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
  wireS = document.querySelectorAll(`line[data-start="${num}"]`);
  wireE = document.querySelectorAll(`line[data-end="${num}"]`);
}

const boardDrag = (event) => {
  if (!isDragging) return;
  event.preventDefault();

  const x = event.clientX - offsetX;
  const y = event.clientY - offsetY;
  const position = getSVGCoordinates(x, y);
  boardEvent.setAttribute('x', position.x);
  boardEvent.setAttribute('y', position.y);
  const {height, width} = boardEvent.getBoundingClientRect();
  const elementType = boardEvent.getAttribute('data-type');
  
  const pointL = getSVGCoordinates(x, y+height/2);
  const pointR = getSVGCoordinates(x+width, y+height/2);
  
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

export const startWire = (event) => {
  const [direction, point] = getLinePosition(event.target.parentNode);
  
  const dataId = event.target.parentNode.getAttribute('data-id');
  if (!startPoint) {
    mouseLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    mouseLine.setAttribute('stroke', 'black');
    mouseLine.setAttribute('stroke-width', '2');
    mouseLine.setAttribute('data-start', dataId);
    mouseLine.setAttribute('data-start-dir', direction);

    board.appendChild(mouseLine);
    
    startPoint = point;
    updateLine(mouseLine, startPoint, startPoint);
    
    addNode(nodeNum);
    addConnection(nodeNum, dataId, direction);
  }
  else {
    mouseLine.setAttribute('data-end', dataId);
    mouseLine.setAttribute('data-end-dir', direction);
    mouseLine.setAttribute('nodeNum', nodeNum);
    updateLine(mouseLine, startPoint, point);
    startPoint = null;

    addConnection(nodeNum, dataId, direction)
    nodeNum += 1;
  }
};

const getLinePosition = (node) => {
  const {top, left, width, height} = node.getBoundingClientRect();
  const elementType = node.getAttribute('data-type');
  // 1이면 왼쪽, 0이면 오른쪽
  if (elementType == 'ground') {
    const point = getSVGCoordinates(left+width/2, top);
    return [2, point];
  }
  const direction = (event.clientX < left + width/2);
  const x = left + (direction ? 0 : width);
  const y = top + height/2;
  const point = getSVGCoordinates(x, y);
  return [direction, point]
}
const drawWire = (event) => {
  if (startPoint) {
    const endPoint = getSVGCoordinates(event.clientX + 5, event.clientY + 5);
    updateLine(mouseLine, startPoint, endPoint);
  }
}

const updateLine = (line, startPoint, endPoint) => {
  if (startPoint) {
    line.setAttribute('x1', startPoint.x);
    line.setAttribute('y1', startPoint.y);
  }
  if (endPoint) {
    line.setAttribute('x2', endPoint.x);
    line.setAttribute('y2', endPoint.y);
  }
}
