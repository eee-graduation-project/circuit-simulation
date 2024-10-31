import { circuitComponents } from "./component.js";

const board = document.querySelector('.board');

export const probeNum = {'voltagePlus': 0, 'voltageMinus': 0, 'current': 0, 'voutPlus': 0, 'voutMinus': 0};

export const circuitProbes = [];

export class CircuitProbe {
  constructor(type, position, target) {
      this.type = type; // voltagePlus, voltageMinus, current
      this.num = probeNum[this.type]++;
      circuitProbes.push(this);
      this.targetNum;
      this.targetType;
      this.targetName;
      this.setPosition(position);
      this.setTarget(target);
      console.log(circuitProbes);
      console.log(probeNum);
  }
  
  setPosition (position) {
    console.log(this.type);
    const img = document.createElementNS('http://www.w3.org/2000/svg', 'image');
    switch (this.type) {
      case 'voltagePlus':
        img.setAttribute('href', '/static/images/probe-voltage.svg');
        break;
      case 'voltageMinus':
        img.setAttribute('href', '/static/images/probe-voltage.svg');
        break;
      case 'current':
        img.setAttribute('href', '/static/images/probe-current.svg');
        break;
      case 'voutPlus':
        img.setAttribute('href', '/static/images/probe-vout.svg');
        break;
      case 'voutMinus':
        img.setAttribute('href', '/static/images/probe-vout.svg');
    }
    img.setAttribute('x', position.x);
    img.setAttribute('y', position.y);
    img.setAttribute('data-id', probeNum);
    board.appendChild(img);
  }

  setTarget(target) {
    const type = target.getAttribute('class');
    const targetDataId = target.parentNode.getAttribute('data-id');
    const targetComponent = circuitComponents[targetDataId];
    switch (type) {
      case 'board__element_wire':
        this.targetType = 'component';
        // console.log(`lineNum: ${target.getAttribute('lineNum')}`);
        switch (target.getAttribute('lineNum').slice(-1)) {
          case 'L':
            this.targetNum = `${targetDataId}-1`;
            break;
          case 'R':
          case 'T':
            this.targetNum = `${targetDataId}-0`;
            break;
        }
        break;
      case 'board__wire':
        this.targetType = 'wire';
        this.targetNum = target.parentNode.getAttribute('data-id');
        break;
    }
    this.targetName = targetComponent.name;
  }
}
