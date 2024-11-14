import {getSVGCoordinates} from "./utils.js";
import {boardDragStart, startWire} from "./drag-board.js";
import { selectElement } from "./element-manipulations.js";
import {CircuitComponent} from "./component.js"
import {setProbe} from "./probe.js";
import { addInputModal, saveInput } from "./modal.js";

const board = document.querySelector(".board");
const elements = document.querySelectorAll(".library__element_item img");

let elementEvent;
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
  // const position = {'x': event.clientX - offsetX, 'y': event.clientY - offsetY};
  const elementType = elementEvent.target.alt;
  
  const component = new CircuitComponent(elementType, position);
  
  elementEvent = null;
}


const saveButton = document.querySelector(".button__modal_save");
saveButton.addEventListener("click", saveInput);
