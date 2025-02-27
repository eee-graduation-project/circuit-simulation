import { circuitComponents } from './component.js';

const modal = document.querySelector('.modal');
const modalContent = document.querySelector('.modal__content');
const toggle = document.querySelector('.modal__content_toggle');

const addButton = document.querySelector('.pwl__button_add');
const deleteButton = document.querySelector('.pwl__button_remove');
let pwlSelected;

export const addInputModal = (event) => {
    const dataId = event.target.parentNode.getAttribute('data-id');
    const component = circuitComponents[dataId];
    const name = document.querySelector('.modal__element_name');
    name.textContent = component.name;

    component.svgElement.classList.add('modify-input');

    switch (component.type) {
        case 'voltage-signal-source': // ac
        case 'current-signal-source':
            toggle.style.display = 'block';
            modalButtonEvent(component.options.type.toLowerCase());
            break;
        case 'voltage-source-current-controlled':
        case 'current-source-current-controlled': {
            const input = createInputHtml('value');
            input.value = component.value;
            createSelectHtml('sense');
            break;
        }
        default: {
            const input = createInputHtml('value');
            input.value = component.value;
            break;
        }
    }
    // modalInput.value = ""; // 입력 필드 초기화
    modal.style.display = 'block';
    // saveInput(component);
};

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
};

const createSelectHtml = (label) => {
    const fieldDiv = document.createElement('div');
    fieldDiv.classList.add('modal__field');

    const labelElement = document.createElement('label');
    labelElement.textContent = label;
    labelElement.setAttribute('for', 'all_components');
    fieldDiv.appendChild(labelElement);

    const selectElement = document.createElement('select');
    selectElement.id = 'all_components';
    selectElement.name = label;
    fieldDiv.appendChild(selectElement);

    const components = circuitComponents;
    Object.values(components).forEach((component) => {
        const newOption = document.createElement('option');
        newOption.value = component.name;
        newOption.text = component.name;
        selectElement.appendChild(newOption);
    });

    modalContent.appendChild(fieldDiv);
};

export const saveInput = () => {
    const component =
        circuitComponents[
            document.querySelector('.modify-input').getAttribute('data-id')
        ];
    const inputForm = document.querySelector('.modal__content');

    Array.from(inputForm.elements).forEach((element) => {
        component.setValue(element.name, element.value);
    });

    component.svgElement.classList.remove('modify-input');
    // closeModal();

    modal.style.display = 'none';
    modalContent.innerHTML = '';
    toggle.style.display = 'none';
};

const types = ['ac', 'sine', 'pulse', 'unit', 'pwl'];
types.forEach((type) => {
    const button = document.querySelector(`.modal__button_${type}`);
    button.addEventListener('click', () => {
        modalButtonEvent(type);
    });
});

const modalButtonEvent = (type) => {
    modal.style.display = 'block';
    addButton.style.display = 'none';
    deleteButton.style.display = 'none';

    const component =
        circuitComponents[
            document.querySelector('.modify-input').getAttribute('data-id')
        ];
    modalContent.innerHTML = '';
    component.setOptions(type);

    switch (type) {
        case 'ac': {
            const magnitudeInput = createInputHtml('magnitude');
            magnitudeInput.value = component.options.magnitude;
            break;
        }
        case 'sine': {
            const offsetInput = createInputHtml('offset');
            offsetInput.value = component.options.offset;
            const amplitudeInput = createInputHtml('amplitude');
            amplitudeInput.value = component.options.amplitude;
            const frequencyInput = createInputHtml('frequency');
            frequencyInput.value = component.options.frequency;
            break;
        }
        case 'pulse': {
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
            addButton.style.display = 'block';
            deleteButton.style.display = 'block';
            pwlSelected = component;
            break;
        }
        default:
            break;
    }

    modal.style.display = 'block';
    component.svgElement.classList.add('modify-input');
};

const addTnV = (event) => {
    event.preventDefault();
    const modalField = document.querySelectorAll('.modal__field');
    const cnt = modalField.length / 2;
    const tInput = createInputHtml(`t${cnt + 1}`);
    const vInput = createInputHtml(`v${cnt + 1}`);
    pwlSelected.addTnVOption(cnt + 1);
    tInput.value = pwlSelected.options.tv[`t${cnt + 1}`];
    vInput.value = pwlSelected.options.tv[`v${cnt + 1}`];
};

const removeTnV = (event) => {
    event.preventDefault();
    const modalField = document.querySelectorAll('.modal__field');
    const cnt = modalField.length / 2;
    pwlSelected.removeTnVOption(cnt);
    modalField.forEach((field) => {
        const input = field.querySelector('input');
        if ([`t${cnt}`, `v${cnt}`].includes(input.name)) {
            field.remove();
        }
    });
};

addButton.addEventListener('click', addTnV);
deleteButton.addEventListener('click', removeTnV);
