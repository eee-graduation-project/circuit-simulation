import {getSVGCoordinates} from "./utils.js";

let mouseLine = null;
let startPoint = null;
let isDragging;
let offsetX, offsetY;

let boardEvent = null;
let wireS = null;
let wireE = null;

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

  const pointL = getSVGCoordinates(x, y+height/2);
  const pointR = getSVGCoordinates(x+width, y+height/2);
}

const boardDrop = () => {
  isDragging = false;
  boardEvent = null;
}

export const startWire = (event) => {
  const {top, left, width, height} = event.target.parentNode.getBoundingClientRect();
  // 1이면 왼쪽, 0이면 오른쪽
  const direction = (event.clientX < left + width/2);
  const x = left + (direction ? 0 : width);
  const y = top + height/2;
  const point = getSVGCoordinates(x, y);

  if (!startPoint) {
    mouseLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    mouseLine.setAttribute('stroke', 'black');
    mouseLine.setAttribute('stroke-width', '2');
    board.appendChild(mouseLine);
    
    startPoint = point;
    updateLine(mouseLine, startPoint, startPoint);
  }
  else {
    updateLine(mouseLine, startPoint, point);
    startPoint = null;
  }
};

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
