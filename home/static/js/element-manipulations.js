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

const targetElements = document.querySelectorAll(".board__element_item");
const modal = document.querySelector(".modal");
const modalContent = document.querySelector(".modal__content");
const toggle = document.querySelector(".modal__content_toggle");
const closeBtn = document.querySelector(".button__modal_close");

const createInputHtml = (label) => {
  const fieldDiv = document.createElement('div');
  fieldDiv.classList.add('modal__field');

  const labelElement = document.createElement('label');
  labelElement.textContent = label;
  fieldDiv.appendChild(labelElement);

  const inputElement = document.createElement('input');
  inputElement.type = 'text';
  inputElement.name = label;
  fieldDiv.appendChild(inputElement);

  modalContent.appendChild(fieldDiv);

  return inputElement;
}
export const addInputModal = (event) => {
  const dataId = event.target.parentNode.getAttribute("data-id");
  const component = circuitComponents[dataId];
  const name = document.querySelector(".modal__element_name");
  name.textContent = component.name;

  switch(component.type) {
    case 'voltage-source':
    case 'inductor':
    case 'capacitor':
    case 'resistor':
    case 'current-source':
      const input = createInputHtml('value');
      input.value = component.value;
      break;
    case 'voltage-signal-source': // ac
    case 'current-signal-source':
      toggle.style.display = "block";
      const magnitudeInput = createInputHtml('magnitude');
      magnitudeInput.value = component.options.magnitude;
      break;
  }
  // modalInput.value = ""; // 입력 필드 초기화
  modal.style.display = "block";
  saveInput(component);
}

const saveInput = (component) => {
  const saveButton = document.querySelector(".button__modal_save");
  const inputForm = document.querySelector(".modal__content");
  
  saveButton.addEventListener("click", (event) => {
    event.preventDefault();
    Array.from(inputForm.elements).forEach((element) => {
      component.setValue(element.name, element.value);
    })
  });
  // closeModal();
}

closeBtn.addEventListener("click", () => {
 closeModal();
});

const closeModal = () => {
  modal.style.display = "none";
  modalContent.innerHTML = '';
  toggle.style.display = "none";
}
// export const inputElement = () => {
//   const board = document.querySelector(".board");
//   const inputWindow = document.createElement("div");
  
//   board.appendChild()
// }
