import { selectSource } from "./sidebar.js";

const firstName = {'voltage-source': 'V', 'voltage-signal-source': 'V', 'voltage-source-voltage-controlled': 'E', 'voltage-source-current-controlled': 'G', 'current-source': 'I', 'current-signal-source': 'I', 'current-source-voltage-controlled': 'F', 'current-source-current-controlled': 'H', 'resistor': 'R', 'inductor': 'L', 'capacitor': 'C', 'ground': 'G'};
const defaultValue = {'voltage-source': 'V', 'voltage-signal-source': '', 'voltage-source-voltage-controlled': '', 'voltage-source-current-controlled': '', 'current-source': 'A', 'current-signal-source': '', 'current-source-voltage-controlled': '', 'current-source-current-controlled': '', 'resistor': 'Ω', 'inductor': 'H', 'capacitor': 'F'};
const elementCnt = {'voltage': 0, 'current': 0, 'resistor': 0, 'inductor': 0, 'capacitor': 0, 'ground': 0};
let idNum = 1;

const board = document.querySelector('.board');

export const circuitComponents = {};

export class CircuitComponent {
  constructor(type, position) {
      this.num = idNum++;
      this.type = type;
      this.value;
      this.options = {};
      this.connections = {};
      this.name = this.addName();
      this.position = position; // { x: 0, y: 0 }
      this.wires = [];
      this.img;
      this.svgElement = this.createSVGElement();
      circuitComponents[this.num] = this;
      this.addOption(); // sidebar option
  }
  
  addOption() {
    selectSource(this.name);
  }

  setValue(name, value) {
    if (name=='value') {
      this.value = value;
      const text = this.svgElement.querySelector('.component__text_value');
      text.textContent = `${this.value}${defaultValue[this.type]}`;
    }
    else if (/^[tv]\d+$/.test(name)) {
      this.options.tv[name] = value;
    }
    else  {
      this.options[name] = value;
      const text = this.svgElement.querySelector(`.component__option_${name}`);
      text.textContent = `${name}: ${value}`;
    }
    
  }
  addName() {
    const name = `${firstName[this.type]}${elementCnt[this.type.split('-')[0]]++}`;
    // elementCnt[this.type] += 1;
    return name;
  }

  createSVGElement() {
      const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      svgElement.setAttribute('transform', `translate(${this.position.x-15}, ${this.position.y})`);
      svgElement.setAttribute('draggable', `true`);
      svgElement.setAttribute('class', "board__element_item");
      svgElement.setAttribute('data-id', this.num);
      
      this.wires = this.appendWire();
      this.img = this.appendImg();
      const [value, name, options] = this.appendText();

      svgElement.draggable = 'true';
      svgElement.append(this.img, value, name, ...options, ...this.wires);
      board.appendChild(svgElement);
      
      return svgElement;
  }

  appendWire() {
    switch (this.type) {
      case 'ground':
        const wire = this.createLineElement({'x1': 40, 'x2': 40, 'y1': 0, 'y2': 15}, 'T');
        return [wire];
      case 'voltage-source-voltage-controlled':
      case 'current-source-voltage-controlled': {
        const wireI = this.createLineElement({'x1': 0, 'x2': 20, 'y1': 5, 'y2': 5}, 'I');
        const wireM = this.createLineElement({'x1': 0, 'x2': 20, 'y1': 34, 'y2': 34}, 'M');
        const wireT = this.createLineElement({'x1': 46, 'x2': 46, 'y1': -15, 'y2': 1}, 'T');
        const wireB = this.createLineElement({'x1': 46, 'x2': 46, 'y1': 39, 'y2': 55}, 'B');
        return [wireI, wireM, wireT, wireB];
      }
      case 'voltage-source-current-controlled':
      case 'current-source-current-controlled': {
        const wireT = this.createLineElement({'x1': 32.5, 'x2': 32.5, 'y1': -15, 'y2': 1}, 'T');
        const wireB = this.createLineElement({'x1': 32.5, 'x2': 32.5, 'y1': 39, 'y2': 55}, 'B');
        return [wireT, wireB];
      }
      default:
        const wireL = this.createLineElement({'x1': 0, 'x2': 19, 'y1': 20, 'y2': 20}, 'L');
        const wireR = this.createLineElement({'x1': 60, 'x2': 80, 'y1': 20, 'y2': 20}, 'R');
        return [wireL, wireR];
    }
  }

  createLineElement = (position, direction) => {
    const wire = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    wire.setAttribute('stroke', 'red');
    wire.setAttribute('stroke-width', '2.5');
    wire.setAttribute('draggable', false);
    wire.setAttribute('class', "board__element_wire");
    wire.setAttribute('x1', position.x1);
    wire.setAttribute('x2', position.x2);
    wire.setAttribute('y1', position.y1);
    wire.setAttribute('y2', position.y2);
    wire.setAttribute('lineNum', `${this.name}${direction}`);
    this.connections[`${this.num}${direction}`] = [];
    return wire;
  }

  appendImg = () => {
    const img = document.createElementNS('http://www.w3.org/2000/svg', 'image');
    img.setAttribute('href', `/static/images/${this.type}.svg`);
    img.style.height = "40px";
    img.setAttribute('draggable', false);
    img.setAttribute('x', 20);
    
    return img;
  }

  appendText = () => {
    const name = this.createTextElement({'x': 14, 'y': 12}, this.name);
    switch (this.type) {
      case 'ground':
        name.setAttribute('x', '20');
        return [null, name, []];
      case 'voltage-signal-source':
      case 'current-signal-source': {
        const magnitude = this.setOptionsText('ac')[0];
        return [null, name, [magnitude]];
      }
      case 'voltage-source-current-controlled':
      case 'current-source-current-controlled':
        const value = this.createTextElement({'x': 78, 'y': 12}, `1${defaultValue[this.type]}`);
        value.setAttribute('class', 'component__text_value');
        this.value = 1;
        const sense = this.createTextElement({'x': 70, 'y': 2}, `SELECT YOUR SENSE`);
        sense.setAttribute('text-anchor', 'start');
        sense.setAttribute('class', 'component__option_sense');
        return [value, name, [sense]]
      default: {
        const value = this.createTextElement({'x': 78, 'y': 12}, `1${defaultValue[this.type]}`);
        value.setAttribute('class', 'component__text_value');
        this.value = 1;
        return [value, name, []];
      }
    }
  }
  
  setOptions(option) {
    if (option == this.options.type.toLowerCase()) return;
    const elements = document.querySelectorAll('[class^="component__option_"]');
    elements.forEach((element) => {
      element.remove();
    })

    const texts = this.setOptionsText(option);
    this.svgElement.append(...texts);
  }

  setOptionsText(option) {
    switch (option) {
      case 'ac': {
        this.options = {'type': 'AC', 'magnitude': 1};
        const magnitude = this.createTextElement({'x': 70, 'y': 2}, `magnitude: ${this.options.magnitude}`);
        magnitude.setAttribute('text-anchor', 'start');
        magnitude.setAttribute('class', 'component__option_magnitude');
        return [magnitude];
      }
      case 'sine': {
        this.options = {'type': 'SINE', 'offset': 0, 'amplitude': 1, 'frequency': '1k'};
        const offset = this.createTextElement({'x': 70, 'y': 2}, `offset: ${this.options.offset}`);
        offset.setAttribute('text-anchor', 'start');
        offset.setAttribute('class', 'component__option_offset');
        const amplitude = this.createTextElement({'x': 70, 'y': 12}, `amplitude: ${this.options.amplitude}`);
        amplitude.setAttribute('text-anchor', 'start');
        amplitude.setAttribute('class', 'component__option_amplitude');
        const frequency = this.createTextElement({'x': 70, 'y': 32}, `frequency: ${this.options.frequency}`);
        frequency.setAttribute('text-anchor', 'start');
        frequency.setAttribute('class', 'component__option_frequency');
        return [offset, amplitude, frequency];
      }
      case 'pulse': {
        this.options = {'type': 'PULSE', 'amplitude': 1, 'period': 1, 'tmax': '5', 'option': 1};
        const amplitude = this.createTextElement({'x': 70, 'y': 2}, `amplitude: ${this.options.amplitude}`);
        amplitude.setAttribute('text-anchor', 'start');
        amplitude.setAttribute('class', 'component__option_amplitude');
        const period = this.createTextElement({'x': 70, 'y': 12}, `period: ${this.options.period}`);
        period.setAttribute('text-anchor', 'start');
        period.setAttribute('class', 'component__option_period');
        const tmax = this.createTextElement({'x': 70, 'y': 32}, `tmax: ${this.options.tmax}`);
        tmax.setAttribute('text-anchor', 'start');
        tmax.setAttribute('class', 'component__option_tmax');
        const option = this.createTextElement({'x': 70, 'y': 42}, `option: ${this.options.option}`);
        option.setAttribute('text-anchor', 'start');
        option.setAttribute('class', 'component__option_option');
        return [amplitude, period, tmax, option];
      }
      case 'unit': {
        this.options = {'type': 'UNIT', 'offset': 0, 'amplitude': 1, 'trise': '0.1m'};
        const offset = this.createTextElement({'x': 70, 'y': 2}, `offset: ${this.options.offset}`);
        offset.setAttribute('text-anchor', 'start');
        offset.setAttribute('class', 'component__option_offset');
        const amplitude = this.createTextElement({'x': 70, 'y': 12}, `amplitude: ${this.options.amplitude}`);
        amplitude.setAttribute('text-anchor', 'start');
        amplitude.setAttribute('class', 'component__option_amplitude');
        const trise = this.createTextElement({'x': 70, 'y': 32}, `trise: ${this.options.trise}`);
        trise.setAttribute('text-anchor', 'start');
        trise.setAttribute('class', 'component__option_trise');
        return [offset, amplitude, trise];
      }
      case 'pwl': {
        this.options = {'type': 'PWL', 'tv':{'t1': 0, 'v1': 1}, 'trise': '0.1m'};
        const tv = this.createTextElement({'x': 70, 'y': 2}, `(t,v)`);
        tv.setAttribute('text-anchor', 'start');
        tv.setAttribute('class', 'component__option_tv');
        return [tv];
      }
    }
  }
  
  createTextElement(position, content) {
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', position.x);
    text.setAttribute('y', position.y);
    text.setAttribute('text-anchor', 'start');
    text.setAttribute('font-size', '12');
    text.setAttribute('font-weight', 'bold');
    text.setAttribute('text-anchor', 'end');
    text.setAttribute('fill', '#000000');
    text.textContent = content;
    return text;
  }

  addTnVOption(cnt) {
    this.options.tv[`t${cnt}`] = 0;
    this.options.tv[`v${cnt}`] = 1;
  }

  removeTnVOption(cnt) {
    delete this.options.tv[`t${cnt}`];
    delete this.options.tv[`v${cnt}`];
  }

  //TODO controlled source node 표시
  displayNode(type, nodes) {
    nodes.forEach((node, idx) => {
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', idx == 0 ? '75':'14');
      text.setAttribute('y', '30');
      text.setAttribute('text-anchor', 'start');
      text.setAttribute('font-size', '10');
      text.setAttribute('font-weight', 'bold');
      text.setAttribute('text-anchor', 'end');
      text.setAttribute('fill', '#3498db');
      text.textContent = node;
      this.svgElement.appendChild(text);
    })
  }
  
  addWire(wire) {
      this.wires.push(wire);
  }
  
  deleteComponent() {
    this.svgElement.remove();
    delete circuitComponents[this.num];
  }

  rotateComponent() {
    const transformInfo = this.svgElement.getAttribute('transform');
    const bbox = this.svgElement.getBBox();
    this.svgElement.setAttribute('transform', `${transformInfo} rotate(90, ${bbox.x+bbox.width/2}, ${bbox.y+bbox.height/2})`);
    
    const texts = this.svgElement.querySelectorAll('text');
    texts.forEach((text) => {
      const textTransformInfo = text.getAttribute('transform');
      if (textTransformInfo)
        text.setAttribute('transform', `${textTransformInfo} rotate(-90 ${bbox.x+bbox.width/2} ${bbox.y+bbox.height/2})`);
      else
        text.setAttribute('transform', `rotate(-90 ${bbox.x+bbox.width/2} ${bbox.y+bbox.height/2})`);
    })
  }

  diverseComponent() {
    const transformInfo = this.svgElement.getAttribute('transform');
    const bbox = this.svgElement.getBBox();
    const cx = bbox.x+bbox.width/2;
    const cy = bbox.y+bbox.height/2;
    this.svgElement.setAttribute('transform', `${transformInfo} translate(${cx}, ${cy}) scale(-1, 1) translate(${-cx}, ${-cy})`);
    
    const texts = this.svgElement.querySelectorAll('text');
    texts.forEach((text) => {
      const textTransformInfo = text.getAttribute('transform');
      if (textTransformInfo)
        text.setAttribute('transform', `${textTransformInfo} translate(${cx}, ${cy}) scale(-1, 1) translate(${-cx}, ${-cy})`);
      else
        text.setAttribute('transform', `translate(${cx}, ${cy}) scale(-1, 1) translate(${-cx}, ${-cy})`);
    })
  }

  setConnection(pos, comp) {
    this.connections[`${this.num}${pos}`].push(comp);
  }

  getData(board) {
    return {num: this.num, name: this.name, type: this.type, value: this.value, options: this.options, connections: this.connections, board};
  }
}