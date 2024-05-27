import {getSVGCoordinates} from "./utils.js";
import {boardDragStart, startWire} from "./drag-board.js";

const board = document.querySelector(".board");
const elements = document.querySelectorAll(".library__element_item img");

let elementEvent;
let elementNum = 0;
let offsetX, offsetY;

elements.forEach((element) => {
  element.addEventListener("dragstart", (event) => {
    dragStart(event)
  });
})
board.addEventListener("dragover", (event) => {
  dragOver(event)
});
board.addEventListener("drop", (event) => {
  drop(event)
});

const dragStart = (event) => {
  elementEvent = event;
}

const dragOver = (event) => {
  event.preventDefault();
}

const drop = (event) => {
  event.preventDefault();
  if (!elementEvent) return;

  const rect = elementEvent.target.getBoundingClientRect();
  offsetX = elementEvent.clientX - rect.left;
  offsetY = elementEvent.clientY - rect.top;

  const position = getSVGCoordinates(event.pageX - offsetX, event.pageY - offsetY);

  const element = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  element.setAttribute('x', position.x-15);
  element.setAttribute('y', position.y);
  element.setAttribute('class', "board__element_item");
  element.setAttribute('data-id', elementNum);
  elementNum += 1;

  const wireL = document.createElementNS('http://www.w3.org/2000/svg', 'image');
  wireL.setAttribute('href', '/static/images/wire.svg');
  wireL.setAttribute('draggable', false);
  wireL.setAttribute('class', "board__element_wire");

  const img = document.createElementNS('http://www.w3.org/2000/svg', 'image');
  const src = elementEvent.target.src;
  img.setAttribute('href', src);
  img.style.height = "40px";
  img.setAttribute('draggable', false);
  img.setAttribute('x', 15);

  const wireR = wireL.cloneNode(true);
  wireR.setAttribute('x', 55);
  
  element.draggable = 'true';
  element.append(wireL, img, wireR);
  event.target.appendChild(element);
  
  img.addEventListener("mousedown", boardDragStart);

  elementEvent = null;
}

