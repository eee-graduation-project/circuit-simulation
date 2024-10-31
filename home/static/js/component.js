import { selectSource } from "./sidebar.js";

const firstName = {'voltage-source': 'V', 'voltage-signal-source': 'V', 'current-source': 'I', 'current-signal-source': 'I', 'resistor': 'R', 'inductor': 'L', 'capacitor': 'C', 'ground': 'G'};
const defaultValue = {'voltage-source': 'V', 'voltage-signal-source': '', 'current-source': 'A', 'resistor': 'Ω', 'inductor': 'H', 'capacitor': 'F'};
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
      // console.log(this.svgElement);
      this.value = value;
      const text = this.svgElement.querySelector('.component__text_value');
      text.textContent = `${this.value}${defaultValue[this.type]}`;
    }
    else {
      // console.log(this.options);
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
      
      // svgElement.addEventListener('dblclick', () => {
      //     this.handleDoubleClick();
      // });

      return svgElement;
  }

  appendWire() {
    if (this.type == 'ground') {
      const wire = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      wire.setAttribute('stroke', 'red');
      wire.setAttribute('stroke-width', '2.5');
      wire.setAttribute('draggable', false);
      wire.setAttribute('class', "board__element_wire");
      wire.setAttribute('x1', 40);
      wire.setAttribute('x2', 40);
      wire.setAttribute('y1', 0);
      wire.setAttribute('y2', 15);
      wire.setAttribute('lineNum', `${this.name}T`);
      this.connections[`${this.num}T`] = [];
      return [wire];
    }

    const wireL = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    wireL.setAttribute('stroke', 'red');
    wireL.setAttribute('stroke-width', '2.5');
    wireL.setAttribute('lineNum', `${this.name}L`);
    wireL.setAttribute('y1', 19);
    wireL.setAttribute('y2', 19);
    wireL.setAttribute('draggable', false);
    wireL.setAttribute('class', "board__element_wire");
    this.connections[`${this.num}L`] = [];

    const wireR = wireL.cloneNode(true);
    wireR.setAttribute('x', 60);
    wireR.setAttribute('lineNum', `${this.name}R`);
    
    wireL.setAttribute('x1', 0);
    wireL.setAttribute('x2', 20);
    wireR.setAttribute('x1', 60);
    wireR.setAttribute('x2', 80);
    this.connections[`${this.num}R`] = [];
    return [wireL, wireR];
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
    const name = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    name.setAttribute('x', '14');
    name.setAttribute('y', '12');
    name.setAttribute('text-anchor', 'start');
    name.setAttribute('font-size', '12');
    name.setAttribute('font-weight', 'bold');
    name.setAttribute('text-anchor', 'end');
    name.setAttribute('fill', '#000000');
    name.textContent = this.name;
    switch (this.type) {
      case 'ground':
        name.setAttribute('x', '20');
        return [null, name, []];
      case 'voltage-signal-source':
      case 'current-signal-source':
        this.options = {'type': 'AC', 'magnitude': 1}
        const magnitude = name.cloneNode(true);
        magnitude.setAttribute('x', '70');
        magnitude.setAttribute('y', '2');
        magnitude.textContent = `magnitude: ${this.options.magnitude}`
        magnitude.setAttribute('text-anchor', 'start');
        magnitude.setAttribute('class', 'component__option_magnitude');

        return [null, name, [magnitude]];
    }
    
    const value = name.cloneNode(true);
    value.setAttribute('x', '78');
    value.setAttribute('class', 'component__text_value');
    
    value.textContent = `1${defaultValue[this.type]}`;
    this.value = 1;
    
    return [value, name, []];
  }
  
  displayNode(nodes) {
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
  // handleDoubleClick() {
  //     // 더블 클릭 시 실행할 로직
  //     console.log(`Component ${this.num} double-clicked!`);
  //     // 예를 들어, 값을 수정하는 모달을 띄우는 코드 추가
  // }

  setPosition(x, y) {
      this.position.x = x;
      this.position.y = y;
      this.updateSVG();
  }

  updateSVG() {
      // SVG 업데이트 로직
      this.svgElement.setAttribute('transform', `translate(${this.position.x}, ${this.position.y})`);
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