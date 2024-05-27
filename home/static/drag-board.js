import {getSVGCoordinates} from "./utils.js";

let isDragging;
let offsetX, offsetY;

let boardEvent = null;

const board = document.querySelector(".board");

board.addEventListener('mousemove', (event) => {
  boardDrag(event)
});
board.addEventListener('mouseup', (event) => {
  boardDrop(event)
});

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

  const pointL = getSVGCoordinates(x, y+height/2);
  const pointR = getSVGCoordinates(x+width, y+height/2);
  
  wireS.forEach((line) => {
    const dir = line.getAttribute('data-start-dir');
    const point = (dir=="true") ? pointL : pointR;
    updateLine(line, point, null);
  })

  wireE.forEach((line) => {
    const dir = line.getAttribute('data-end-dir');
    const point = (dir=="true") ? pointL : pointR;
    updateLine(line, null, point);
  })
}

const boardDrop = () => {
  isDragging = false;
  boardEvent = null;
}
