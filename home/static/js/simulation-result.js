const a = 1;
const numPoints = 100;
const sValues = Array.from({ length: numPoints }, (_, i) => i * 0.1);
const fValues = sValues.map(s => 1 / (s + a));

const svg = d3.select(".board");
svg.attr("width", 600)
  .attr("height", 400);
const width = +svg.attr("width");
const height = +svg.attr("height");

const xScale = d3.scaleLinear()
    .domain([0, d3.max(sValues)])
    .range([0, width]);

const yScale = d3.scaleLinear()
    .domain([0, d3.max(fValues)])
    .range([height, 0]);

const line = d3.line()
    .x((d, i) => xScale(sValues[i]))
    .y((d, i) => yScale(fValues[i]));

svg.append("path")
    .datum(fValues)
    .attr("fill", "none")
    .attr("stroke", "blue")
    .attr("stroke-width", 2)
    .attr("d", line(fValues));