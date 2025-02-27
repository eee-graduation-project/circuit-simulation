import * as Plot from 'https://cdn.jsdelivr.net/npm/@observablehq/plot@0.6.16/+esm';

export const generateOpResult = (result) => {
    const opResult = document.querySelector('.result');
    opResult.style.display = 'block';

    const voltageList = document.querySelector('.result__voltage_list');
    const currentList = document.querySelector('.result__current_list');
    voltageList.innerHTML = '';
    currentList.innerHTML = '';

    Object.entries(result.voltage).forEach(([key, value]) => {
        const listItem = document.createElement('li');
        listItem.textContent = `node${key}: ${JSON.stringify(value)}V`;
        voltageList.appendChild(listItem);
    });

    Object.entries(result.current).forEach(([key, value]) => {
        const listItem = document.createElement('li');
        listItem.textContent = `${key}: ${JSON.stringify(value)}A`;
        currentList.appendChild(listItem);
    });
};

export const generateDcResult = (probes, probeVoltage, probeCurrent, data) => {
    const graphContainer = document.querySelector('.graph__container');
    graphContainer.style.display = 'flex';

    probeVoltage.forEach((probeV, idx) => {
        const name = `probeV${probes.probeVoltagePlus[idx].num}`;
        const key = `(${probeV[0]},${probeV[1]})`;

        const vData = data.Vvalue[key]?.map((y, idx) => ({
            x: data.value[idx],
            y,
        }));

        drawGraph(`${name}_${key}`, vData, 'Value', 'Voltage');
    });

    probeCurrent.forEach((probeI, idx) => {
        const name = `probeI${probes.probeCurrent[idx].num}`;
        const key = probeI;

        const iData = data.Ivalue[key]?.map((y, idx) => ({
            x: data.value[idx],
            y,
        }));

        drawGraph(`${name}_${key}`, iData, 'Value', 'Current');
    });

    if (probeVoltage.length) {
        const probeV = probeVoltage[0];
        const name = `probeV${probes.probeVoltagePlus[0].num}`;
        const key = `(${probeV[0]},${probeV[1]})`;
        const graph = document.getElementById(`graph__figure_${name}_${key}`);
        graph.style.display = 'flex';
    } else if (probeCurrent.length) {
        const probeI = probeCurrent[0];
        const name = `probeI${probes.probeCurrent[0].num}`;
        const graph = document.getElementById(
            `graph__figure_${name}_${probeI}`,
        );
        graph.style.display = 'flex';
    }

    selectGraph();
};

export const generateAcResult = (probes, data) => {
    const graphContainer = document.querySelector('.graph__container');
    graphContainer.style.display = 'flex';

    const mData = data.magnitude.map((y, idx) => ({
        x: data.freq[idx],
        y,
    }));
    drawGraph('magnitude', mData, 'freq', 'magnitude');

    const pData = data.phase.map((y, idx) => ({
        x: data.freq[idx],
        y,
    }));
    drawGraph('phase', pData, 'freq', 'phase');

    if (data.magnitude.length) {
        const key = `magnitude`;
        const graph = document.getElementById(`graph__figure_${key}`);
        graph.style.display = 'flex';
    }

    selectGraph();
};

export const generateTranResult = (
    probes,
    probeVoltage,
    probeCurrent,
    data,
) => {
    const graphContainer = document.querySelector('.graph__container');
    graphContainer.style.display = 'flex';

    probeVoltage.forEach((probeV, idx) => {
        const name = `probeV${probes.probeVoltagePlus[idx].num}`;
        const key = `(${probeV[0]},${probeV[1]})`;

        const vData = data.Vvalue[key]?.map((y, idx) => ({
            x: data.tvalue[idx],
            y,
        }));

        drawGraph(`${name}_${key}`, vData, 'tValue', 'Voltage');
    });

    probeCurrent.forEach((probeI, idx) => {
        const name = `probeI${probes.probeCurrent[idx].num}`;
        const key = probeI;

        const iData = data.Ivalue[key]?.map((y, idx) => ({
            x: data.tvalue[idx],
            y,
        }));

        drawGraph(`${name}_${key}`, iData, 'tValue', 'Current');
    });

    if (probeVoltage.length) {
        const probeV = probeVoltage[0];
        const name = `probeV${probes.probeVoltagePlus[0].num}`;
        const key = `(${probeV[0]},${probeV[1]})`;
        const graph = document.getElementById(`graph__figure_${name}_${key}`);
        graph.style.display = 'flex';
    } else if (probeCurrent.length) {
        const probeI = probeCurrent[0];
        const name = `probeI${probes.probeCurrent[0].num}`;
        const graph = document.getElementById(
            `graph__figure_${name}_${probeI}`,
        );
        graph.style.display = 'flex';
    }

    selectGraph();
};

const drawGraph = (key, data, xLabel, yLabel) => {
    if (!data) return;

    const graph = document.querySelector('.graph');

    const selectElement = document.getElementById('probe');
    const newOption = document.createElement('option');
    newOption.value = key;
    newOption.text = key;
    selectElement.appendChild(newOption);

    const plot = Plot.plot({
        marks: [
            Plot.ruleY([0]),
            Plot.ruleX([0]),
            Plot.line(data, {
                x: 'x',
                y: 'y',
                curve: 'catmull-rom',
                tension: 0.5,
                stroke: 'blue',
                strokeWidth: 2,
                channels: { x: 'x', y: 'y' },
                tooltip: (d) => `(${d.x}, ${d.y})`,
            }),
            // Plot.tip(data, Plot.pointerX({x: "x", y: "y", format: {x: (d) => d, y: (d) => d}})),
            Plot.dot(data, {
                x: 'x',
                y: 'y',
                fill: 'blue',
                r: 3,
                channels: { x: 'x', y: 'y' },
                tip: { format: { x: (d) => d, y: (d) => d } },
            }),
            Plot.crosshair(data, { x: 'x', y: 'y' }),
        ],
        x: { label: xLabel, grid: true },
        y: { label: yLabel, grid: true },
    });
    plot.setAttribute('height', '95%');
    plot.setAttribute('width', '95%');
    plot.style.display = 'none';
    plot.id = `graph__figure_${key}`;
    graph.appendChild(plot);
};

const selectGraph = () => {
    const selectElement = document.getElementById('probe');

    selectElement.addEventListener('change', () => {
        const selectValue = this.value;

        document.querySelectorAll('.graph svg').forEach((graphElement) => {
            const graph = graphElement;
            graph.style.display = 'none';
        });

        if (selectValue) {
            const graph = document.getElementById(
                `graph__figure_${selectValue}`,
            );
            graph.style.display = 'flex';
        }
    });
};
