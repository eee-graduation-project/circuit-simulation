import { circuitComponents } from "./component.js";

export const selectElement = (event) => {
  const element = event.target;
  if (element.classList.contains('clicked_element')) {
    element.classList.remove('clicked_element');
  }
  else {
    const prevSelectedElement = document.querySelector('.clicked_element');
    prevSelectedElement?.classList.remove('clicked_element');
    element.classList.add('clicked_element');
  }
}

export const deleteElement = () => {
  const selectedElement = document.querySelector('.clicked_element');
  if (selectedElement.tagName == 'line') {
    selectedElement.remove();
  }
  else {
    selectedElement.parentElement.remove();
  }
}
//TODO 누적 회전
export const rotateElement = () => {
  const dataId = document.querySelector('.clicked_element').parentElement.getAttribute('data-id');
  const component = circuitComponents[dataId];
  component.rotateComponent();
}

export const diverseElement = () => {
  const dataId = document.querySelector('.clicked_element').parentElement.getAttribute('data-id');
  const component = circuitComponents[dataId];
  component.diverseComponent();
}

// export const inputElement = () => {
//   const board = document.querySelector(".board");
//   const inputWindow = document.createElement("div");
  
//   board.appendChild()
// }
