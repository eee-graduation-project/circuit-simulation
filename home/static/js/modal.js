import { circuitComponents } from "./component.js";

const targetElements = document.querySelectorAll(".board__element_item");
const modal = document.querySelector(".modal");
const modalContent = document.querySelector(".modal__content");
const toggle = document.querySelector(".modal__content_toggle");

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
const createSelectHtml = (label) => {
  const fieldDiv = document.createElement('div');
  fieldDiv.classList.add('modal__field');

  const labelElement = document.createElement('label');
  labelElement.textContent = label;
  labelElement.setAttribute("for", "all_components");
  fieldDiv.appendChild(labelElement);

  const selectElement = document.createElement('select');
  selectElement.id = "all_components";
  selectElement.name = label;
  fieldDiv.appendChild(selectElement);

  const components = circuitComponents;
  Object.values(components).forEach((component) => {
    const newOption = document.createElement("option");
    newOption.value = component.name;
    newOption.text = component.name;
    selectElement.appendChild(newOption);
  })

  modalContent.appendChild(fieldDiv);
}
export const addInputModal = (event) => {
  const dataId = event.target.parentNode.getAttribute("data-id");
  const component = circuitComponents[dataId];
  const name = document.querySelector(".modal__element_name");
  name.textContent = component.name;

  component.svgElement.classList.add("modify-input");

  switch(component.type) {
    case 'voltage-source':
    case 'inductor':
    case 'capacitor':
    case 'resistor':
    case 'current-source':
    case 'voltage-source-voltage-controlled':
    case 'current-source-voltage-controlled': {
      const input = createInputHtml('value');
      input.value = component.value;
      break;
    }
    case 'voltage-signal-source': // ac
    case 'current-signal-source':
      toggle.style.display = "block";
      modalButtonEvent(component.options.type.toLowerCase());
      break;
    case 'voltage-source-current-controlled':
    case 'current-source-current-controlled':
      const input = createInputHtml('value');
      input.value = component.value;
      createSelectHtml('sense');
      break;
  }
  // modalInput.value = ""; // 입력 필드 초기화
  modal.style.display = "block";
  // saveInput(component);
}

export const saveInput = () => {
  event.preventDefault();
  const component = circuitComponents[document.querySelector(".modify-input").getAttribute('data-id')];
  const inputForm = document.querySelector(".modal__content");
  
  Array.from(inputForm.elements).forEach((element) => {
    component.setValue(element.name, element.value);
  })
  
  component.svgElement.classList.remove("modify-input");
  document.querySelector(".pwl__button_add")?.remove();
  // closeModal();

  modal.style.display = "none";
  modalContent.innerHTML = '';
  toggle.style.display = "none";
}

const types = ['ac', 'sine', 'pulse', 'unit', 'pwl'];
types.forEach((type) => {
  const button = document.querySelector(`.modal__button_${type}`);
  button.addEventListener('click', () => {modalButtonEvent(type)});
});

const modalButtonEvent = (type) => {
  modal.style.display = "block";
  const component = circuitComponents[document.querySelector(".modify-input").getAttribute('data-id')];
  modalContent.innerHTML = '';
  component.setOptions(type);
  switch (type) {
    case 'ac': {
      document.querySelector(".pwl__button_add")?.remove();
      const magnitudeInput = createInputHtml('magnitude');
      magnitudeInput.value = component.options.magnitude;
      break;
    }
    case 'sine': {
      document.querySelector(".pwl__button_add")?.remove();
      const offsetInput = createInputHtml('offset');
      offsetInput.value = component.options.offset;
      const amplitudeInput = createInputHtml('amplitude');
      amplitudeInput.value = component.options.amplitude;
      const frequencyInput = createInputHtml('frequency');
      frequencyInput.value = component.options.frequency;
      break;
    }
    case 'pulse': {
      document.querySelector(".pwl__button_add")?.remove();
      const amplitudeInput = createInputHtml('amplitude');
      amplitudeInput.value = component.options.amplitude;
      const periodInput = createInputHtml('period');
      periodInput.value = component.options.period;
      const tmaxInput = createInputHtml('tmax');
      tmaxInput.value = component.options.tmax;
      const optionInput = createInputHtml('option');
      optionInput.value = component.options.option;
      break;
    }
    case 'unit': {
      document.querySelector(".pwl__button_add")?.remove();
      const offsetInput = createInputHtml('offset');
      offsetInput.value = component.options.offset;
      const amplitudeInput = createInputHtml('amplitude');
      amplitudeInput.value = component.options.amplitude;
      const triseInput = createInputHtml('trise');
      triseInput.value = component.options.trise;
      break;
    }
    case 'pwl': {
      Object.entries(component.options.tv).forEach(([key, value]) => {
        const input = createInputHtml(key);
        input.value = value;
      });
      if (!document.querySelector('.pwl__button_add')) {
        const addButton = document.createElement('button');
        addButton.classList.add("pwl__button_add");
        addButton.textContent = "add (t, v)";
        addButton.type = "button";

        const deleteButton = addButton.cloneNode(true);
        deleteButton.textContent = "remove (t, v)";
        
        addButton.addEventListener("click", (event) => {addTnV(event, component)});
        modal.insertBefore(addButton, modal.lastElementChild);
        deleteButton.addEventListener("click", (event) => {removeTnV(event, component)});
        modal.insertBefore(deleteButton, modal.lastElementChild);
      }
      break;
    }
  }
  
  modal.style.display = "block";
  component.svgElement.classList.add("modify-input");
}

const addTnV = (event, component) => {
  event.preventDefault();
  const modalField = document.querySelectorAll(".modal__field");
  const cnt = modalField.length/2;
  const tInput = createInputHtml(`t${cnt+1}`);
  const vInput = createInputHtml(`v${cnt+1}`);
  component.addTnVOption(cnt+1);
  tInput.value = component.options.tv[`t${cnt+1}`];
  vInput.value = component.options.tv[`v${cnt+1}`];
}

const removeTnV = (event, component) => {
  event.preventDefault();
  const modalField = document.querySelectorAll(".modal__field");
  const cnt = modalField.length/2;
  component.removeTnVOption(cnt);
  modalField.forEach((field) => {
    const input = field.querySelector("input");
    if ([`t${cnt}`, `v${cnt}`].includes(input.name)) {
      field.remove();
    }
  })
}
