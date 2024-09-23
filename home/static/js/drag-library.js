import {getSVGCoordinates} from "./utils.js";
import {boardDragStart, startWire} from "./drag-board.js";
import {addElement} from "./data.js";

const board = document.querySelector(".board");
const elements = document.querySelectorAll(".library__element_item img");

let elementEvent;
let offsetX, offsetY;

const defaultValue = {'voltage-source': '1V', 'current-source': '1A', 'resistor': '100Ω', 'inductor': '1uH', 'capacitor': '1uF'};
const elementCnt = {'voltage-source': 0, 'current-source': 0, 'resistor': 0, 'inductor': 0, 'capacitor': 0, 'ground': 0};

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
  const elementName = `${elementType[0].toUpperCase()}${elementCnt[elementType]}`;
  const element = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  element.setAttribute('draggable', `true`);
  element.setAttribute('transform', `translate(${position.x-15}, ${position.y})`);
  // element.setAttribute('x', position.x-15);
  // element.setAttribute('y', position.y);
  element.setAttribute('class', "board__element_item");
  element.setAttribute('data-id', elementName);
  element.setAttribute('data-type', elementType);
  addElement(elementName, elementType, defaultValue[elementType]);
  
  elementCnt[elementType] += 1;

  const wires = appendWire(elementType, elementName);
  const img = appendImg(elementEvent.target.src);
  const [value, name] = appendText(elementType, elementName);
  
  element.draggable = 'true';
  element.append(img, value, name, ...wires);
  event.target.appendChild(element);
  
  img.addEventListener("mousedown", boardDragStart);
  wires.forEach((wire) => {
    wire.addEventListener('mousedown', startWire);
  })

  elementEvent = null;
}

const appendWire = (elementType, elementName) => {
  if (elementType == 'ground') {
    const wire = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    wire.setAttribute('stroke', 'red');
    wire.setAttribute('stroke-width', '2.5');
    wire.setAttribute('draggable', false);
    wire.setAttribute('class', "board__element_wire");
    wire.setAttribute('x1', 40);
    wire.setAttribute('x2', 40);
    wire.setAttribute('y1', 0);
    wire.setAttribute('y2', 15);
    wire.setAttribute('wireNum', `${elementName}T`);
    // wire.setAttribute('y', -55);
    // wire.setAttribute('x', -50);
    return [wire];
  }

  const wireL = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  wireL.setAttribute('stroke', 'red');
  wireL.setAttribute('stroke-width', '2.5');
  wireL.setAttribute('wireNum', `${elementName}L`);
  wireL.setAttribute('y1', 19);
  wireL.setAttribute('y2', 19);
  // wireL.setAttribute('href', '/static/images/wire.svg');
  wireL.setAttribute('draggable', false);
  wireL.setAttribute('class', "board__element_wire");

  const wireR = wireL.cloneNode(true);
  wireR.setAttribute('x', 60);
  wireR.setAttribute('wireNum', `${elementName}R`);
  
  wireL.setAttribute('x1', 0);
  wireL.setAttribute('x2', 20);
  wireR.setAttribute('x1', 60);
  wireR.setAttribute('x2', 80);
  return [wireL, wireR];
}

const appendImg = (src) => {
  const img = document.createElementNS('http://www.w3.org/2000/svg', 'image');
  img.setAttribute('href', src);
  img.style.height = "40px";
  img.setAttribute('draggable', false);
  img.setAttribute('x', 20);
  return img;
}

const appendText = (elementType, elementName) => {
  const value = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  value.setAttribute('x', '78');
  value.setAttribute('y', '12');
  value.setAttribute('font-size', '12');
  value.setAttribute('font-weight', 'bold');
  value.setAttribute('text-anchor', 'end');
  value.setAttribute('fill', '#000000');

  const name = value.cloneNode(true);
  name.setAttribute('x', '2');
  name.setAttribute('text-anchor', 'start');
  if (elementType == 'ground') {
    name.setAttribute('x', '20');
  }
  
  value.textContent = defaultValue[elementType];
  name.textContent = elementName;
  return [value, name];
}
