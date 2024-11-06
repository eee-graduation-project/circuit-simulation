import * as Plot from "https://cdn.jsdelivr.net/npm/@observablehq/plot@0.6.16/+esm";

export const generateOpResult = (result) => {
  const voltageList = document.querySelector('.result__voltage_list');
  const currentList = document.querySelector('.result__current_list');

  Object.entries(result.voltage).forEach(([key, value]) => {
    const listItem = document.createElement('li');
    listItem.textContent = `node${key}: ${value}V`;
    voltageList.appendChild(listItem);
  });

  Object.entries(result.current).forEach(([key, value]) => {
    const listItem = document.createElement('li');
    listItem.textContent = `${key}: ${value}A`;
    currentList.appendChild(listItem);
  });
}

export const generateDcResult = (probeVoltage, probeCurrent, data) => {
  const graphContainer = document.querySelector('.graph__container');
  graphContainer.style.display = 'flex';

  probeVoltage.forEach((probeV) => {
    const key = `(${probeV[0]},${probeV[1]})`;
    
    const vData = data.Vvalue[key]?.map((y, idx) => ({
      x: data.value[idx], y: y
    }));

    drawGraph(key, vData, 'Value', 'Voltage');
  });

  probeCurrent.forEach((probeI) => {
    const key = probeI;
    
    const iData = data.Ivalue[key]?.map((y, idx) => ({
      x: data.value[idx], y: y
    }));

    drawGraph(key, iData, 'Value', 'Current');
  });

  if (probeVoltage.length) {
    const probeV = probeVoltage[0];
    const key = `(${probeV[0]},${probeV[1]})`;
    const graph = document.getElementById(`graph__figure_${key}`);
    graph.style.display = "flex";
  }
  else if (probeCurrent.length) {
    const probeI = probeCurrent[0];
    const graph = document.getElementById(`graph__figure_${probeI}`);
    graph.style.display = "flex";
  }

  selectGraph();
}

export const generateAcResult = (data) => {
  const graphContainer = document.querySelector('.graph__container');
  graphContainer.style.display = 'flex';

  const mData = data.magnitude.map((y, idx) => ({
    x: data.freq[idx], y: y
  }));
  drawGraph('magnitude', mData, 'freq', 'magnitude');

  const pData = data.phase.map((y, idx) => ({
    x: data.freq[idx], y: y
  }));
  drawGraph('phase',pData, 'freq', 'phase');
  
  if (data.magnitude.length) {
    const key = `magnitude`;
    const graph = document.getElementById(`graph__figure_${key}`);
    graph.style.display = "flex";
  }

  selectGraph();
}

export const generateTranResult = (probeVoltage, probeCurrent, data) => {
  const graphContainer = document.querySelector('.graph__container');
  graphContainer.style.display = 'flex';

  probeVoltage.forEach((probeV) => {
    const key = `(${probeV[0]},${probeV[1]})`;
    
    const vData = data.Vvalue[key]?.map((y, idx) => ({
      x: data.tvalue[idx], y: y
    }));

    drawGraph(key, vData, 'tValue', 'Voltage');
  });

  probeCurrent.forEach((probeI) => {
    const key = probeI;
    
    const iData = data.Ivalue[key]?.map((y, idx) => ({
      x: data.tvalue[idx], y: y
    }));

    drawGraph(key, iData, 'tValue', 'Current');
  });

  if (probeVoltage.length) {
    const probeV = probeVoltage[0];
    const key = `(${probeV[0]},${probeV[1]})`;
    const graph = document.getElementById(`graph__figure_${key}`);
    graph.style.display = "flex";
  }
  else if (probeCurrent.length) {
    const probeI = probeCurrent[0];
    const graph = document.getElementById(`graph__figure_${probeI}`);
    graph.style.display = "flex";
  }

  selectGraph();
}

const drawGraph = (key, data, xLabel, yLabel) => {
  if (!data) return;
  
  const graph = document.querySelector('.graph');
  
  const selectElement = document.getElementById("probe");
  const newOption = document.createElement("option");
  newOption.value = key;
  newOption.text = key;
  selectElement.appendChild(newOption);

  const plot = Plot.plot({
    marks: [
      Plot.ruleY([0]),
      Plot.ruleX([0]),
      Plot.line(data, { x: "x", y: "y", curve: "catmull-rom", tension: 0.5, stroke: "blue", strokeWidth: 2, channels: {x: "x", y: "y"}, tooltip: d => `(${d.x}, ${d.y})` }),
      Plot.dot(data, { x: "x", y: "y", fill: "blue", r: 3, channels: {x: "x", y: "y"}, tip: true }),
      Plot.crosshair(data, {x: "x", y: "y"}),
    ],
    x: { label: xLabel },
    y: { label: yLabel }
  })
  plot.setAttribute("height", "95%");
  plot.setAttribute("width", "95%");
  plot.style.display = "none";
  plot.id = `graph__figure_${key}`;
  graph.appendChild(plot);
  console.log(plot);
}

const selectGraph = () => {
  const selectElement = document.getElementById("probe");
  
  selectElement.addEventListener("change", function() {
    const selectValue = this.value;
    
    document.querySelectorAll(".graph svg").forEach(graph => {
        graph.style.display = "none";
    });

    if (selectValue) {
      const graph = document.getElementById(`graph__figure_${selectValue}`);
      graph.style.display = "flex";
    }
  });
}
