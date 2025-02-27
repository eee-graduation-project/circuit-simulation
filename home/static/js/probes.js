import { circuitComponents } from './component.js';

const board = document.querySelector('.board');

export const probeNum = {
    voltagePlus: 0,
    voltageMinus: 0,
    current: 0,
    voutPlus: 0,
    voutMinus: 0,
};

export const circuitProbes = [];

export class CircuitProbe {
    constructor(type, position, target) {
        this.type = type; // voltagePlus, voltageMinus, current
        this.num = probeNum[this.type];
        probeNum[this.type] += 1;
        circuitProbes.push(this);
        this.setPosition(position);
        this.setTarget(target);
    }

    setPosition(position) {
        const text = this.setText(position);
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        const img = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'image',
        );
        switch (this.type) {
            case 'voltagePlus':
                img.setAttribute('href', '/static/images/probe-voltage.svg');
                text.setAttribute('fill', '#FF4C4C');
                text.textContent = `PV${this.num}+`;
                break;
            case 'voltageMinus':
                img.setAttribute('href', '/static/images/probe-voltage.svg');
                text.setAttribute('fill', '#FF4C4C');
                text.textContent = `PV${this.num}-`;
                break;
            case 'current':
                img.setAttribute('href', '/static/images/probe-current.svg');
                text.setAttribute('fill', '#4C9AFF');
                text.textContent = `PI${this.num}`;
                break;
            case 'voutPlus':
                img.setAttribute('href', '/static/images/probe-vout.svg');
                text.setAttribute('fill', '#4CAF50');
                text.textContent = `PO${this.num}+`;
                break;
            case 'voutMinus':
                img.setAttribute('href', '/static/images/probe-vout.svg');
                text.setAttribute('fill', '#4CAF50');
                text.textContent = `PO${this.num}-`;
                break;
            default:
                break;
        }
        img.setAttribute('x', position.x);
        img.setAttribute('y', position.y);
        img.setAttribute('data-id', probeNum);
        g.appendChild(img);
        g.appendChild(text);
        board.appendChild(g);
    }

    static setText(position) {
        const text = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'text',
        );
        text.setAttribute('x', position.x - 10);
        text.setAttribute('y', position.y + 30);
        text.setAttribute('text-anchor', 'start');
        text.setAttribute('font-size', '10');
        text.setAttribute('font-weight', 'bold');
        return text;
    }

    setTarget(target) {
        const type = target.getAttribute('class');
        const targetDataId = target.parentNode.getAttribute('data-id');
        switch (type) {
            case 'board__element_wire': {
                this.targetType = 'component';
                const targetComponent = circuitComponents[targetDataId];
                this.targetName = targetComponent.name;
                switch (target.getAttribute('lineNum').slice(-1)) {
                    case 'L':
                        this.targetNum = `${targetDataId}L`;
                        break;
                    case 'R':
                        this.targetNum = `${targetDataId}R`;
                        break;
                    case 'T':
                        this.targetNum = `${targetDataId}T`;
                        break;
                    default:
                        break;
                }
                break;
            }
            case 'board__wire':
                this.targetType = 'wire';
                this.targetNum = target.parentNode.getAttribute('data-id');
                break;
            default:
                break;
        }
    }
}
