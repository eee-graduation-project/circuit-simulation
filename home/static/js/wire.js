import { apis, putApi } from "./api.js";
import { circuitComponents } from "./component.js";
import { selectElement } from "./element-manipulations.js";
import { setProbe } from "./probe.js";

const board = document.querySelector('.board');
let num = 0;

export const circuitWires = {};

export class CircuitWire {
  constructor(start, startDir, n) {
      // this.position = position;
      this.start = start; // component data-id
      this.startDir = startDir; // component의 방향 T L R
      this.end;
      this.endDir;
      this.wires;
      this.drawWire();
      this.setNum(Number(n));
      circuitWires[this.num]=this;
  }
  
  setNum(n) {
    if (n) {
      this.num = n;
      if (num <= n) num = n+1;
    }
    else {
      this.num = num++;
    }
  }

  makeAPI(method) {
    const info = {method, target: this, type: 'wire'};
    if (method == 'PUT') {
      const key = `w${this.num}`;
      if (key in putApi) {apis[method][putApi[key]] = info;}
      else {
        putApi[key] = apis[method].length;
        apis[method].push(info);
      }
    }
    else {
      apis[method].push(info);
    }
  }

  drawWire() {
    this.wires = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.wires.setAttribute('data-id', num);
    const mouseHorizonLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    mouseHorizonLine.setAttribute('stroke', 'black');
    mouseHorizonLine.setAttribute('stroke-width', '2.5');
    mouseHorizonLine.setAttribute('class', 'board__wire');
    // mouseHorizonLine.addEventListener('click', selectElement);

    const mouseVerticalLine = mouseHorizonLine.cloneNode(true);
    // mouseVerticalLine.addEventListener('click', selectElement);
    this.wires.append(mouseHorizonLine, mouseVerticalLine);
    this.wires.addEventListener('click', selectElement);
    board.appendChild(this.wires);
  }
  
  handleWireClick() {
    this.wires.addEventListener("click", (event) => {
      setProbe(event, 'probe_voltage_plus', 'voltagePlus');
      setProbe(event, 'probe_voltage_minus', 'voltageMinus');
      setProbe(event, 'probe_vout_plus', 'voutPlus');
      setProbe(event, 'probe_vout_minus', 'voutMinus');
      // setCurrentProbe(event)
    });
  }

  updateWire = (startPoint, endPoint) => {
    const horizon = this.wires.children[0];
    const vertical = this.wires.children[1];
    if (startPoint) {
      horizon.setAttribute('x1', startPoint.x);
      horizon.setAttribute('y1', startPoint.y);
      vertical.setAttribute('y1', startPoint.y);
      horizon.setAttribute('y2', startPoint.y);
    }
    if (endPoint) {
      horizon.setAttribute('x2', endPoint.x);
      vertical.setAttribute('x2', endPoint.x);
      vertical.setAttribute('y2', endPoint.y);
      vertical.setAttribute('x1', endPoint.x);
    }
  }

  setEndWire(dataId, direction) {
    this.end = dataId;
    this.endDir = direction;
    // this.wireNum = wireNum;

    const startComponent = circuitComponents[this.start];
    const endComponent = circuitComponents[this.end];
    startComponent.setConnection(this.startDir, `${endComponent.num}${this.endDir}`);
    endComponent.setConnection(this.endDir, `${startComponent.num}${this.startDir}`);
  }
  
  deleteWire() {
    this.wires.remove();
    delete circuitWires[this.num];

    const startComponent = circuitComponents[this.start];
    const endComponent = circuitComponents[this.end];
    startComponent?.removeConnection(this.startDir, `${this.end}${this.endDir}`);
    endComponent?.removeConnection(this.endDir, `${this.start}${this.startDir}`);
    this.makeAPI('DELETE');
  }
}
