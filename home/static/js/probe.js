import {circuitWires} from './wire.js'
import {circuitComponents} from './component.js'
import { CircuitProbe, probeNum } from './probes.js';
import { getSVGCoordinates } from './utils.js';
import { diverseElement, rotateElement } from './element-manipulations.js';

const voltagePlusButton = document.querySelector('img[alt="voltage-circle-plus"]');
const voltageMinusButton = document.querySelector('img[alt="voltage-circle-minus"]');
const currentButton = document.querySelector('img[alt="current-circle"]');
const cursorButton = document.querySelector('img[alt="cursor"]');
const voutPlusButton = document.querySelector('img[alt="vout-plus"]');
const voutMinusButton = document.querySelector('img[alt="vout-minus"]');

const board = document.querySelector('.board');

voltagePlusButton.addEventListener("click", (event) => {
  addProbe('probe_voltage_plus');
});
voltageMinusButton.addEventListener("click", (event) => {
  addProbe('probe_voltage_minus');
});
currentButton.addEventListener("click", (event) => {
  addProbe('probe_current');
});
cursorButton.addEventListener("click", (event) => {
  addProbe('');
});
voutPlusButton.addEventListener("click", (event) => {
  addProbe('probe_vout_plus');
});
voutMinusButton.addEventListener("click", (event) => {
  addProbe('probe_vout_minus');
});

const addProbe = (name) => {
  const probes = ['probe_current', 'probe_voltage_plus', 'probe_voltage_minus', 'probe_vout_plus', 'probe_vout_minus'];
  probes.forEach((probe) => {
    if (probe == name) board.classList.add(probe);
    else board.classList.remove(probe);
  })
}

export const setProbe = (event, className, probeType) => {
  if (board.classList.contains(className)) {
    if (probeNum.voutPlus && probeType == 'voutPlus' || probeNum.voutMinus && probeType=='voutMinus') return;
    const position = getSVGCoordinates(event.pageX, event.pageY);
    new CircuitProbe(probeType, position, event.target);
  }
}

const deleteButton = document.querySelector('img[alt="trash"]');
deleteButton.addEventListener("click", () => {
  const clickedElement = document.querySelector('.clicked_element');
  const dataId = clickedElement.parentNode.getAttribute('data-id');
  const component = (clickedElement.tagName == 'line') ? circuitWires[dataId] : circuitComponents[dataId];
  component.deleteComponent();
});

const rotateButton = document.querySelector('img[alt="rotate"]');
rotateButton.addEventListener("click", () => {
  rotateElement();
})

const flipButton = document.querySelector('img[alt="flip"]');
flipButton.addEventListener("click", () => {
  diverseElement();
})
