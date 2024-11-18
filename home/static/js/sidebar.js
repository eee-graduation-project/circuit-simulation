const board = document.querySelector('.board');
const libraryButton = document.querySelector('.button__library');
const analysisButton = document.querySelector('.button__analysis');

libraryButton.addEventListener("click", () => {
  const analysis = document.querySelector(".analysis");
  analysis.style.display = "none";
  const library = document.querySelector(".library");
  library.style.display = "flex";
});

analysisButton.addEventListener("click", () => {
  const analysis = document.querySelector(".analysis");
  analysis.style.display = "flex";
  const library = document.querySelector(".library");
  library.style.display = "none";
});

const opModeButton = document.querySelector('.button__mode_op');
const dcModeButton = document.querySelector('.button__mode_dc');
const acModeButton = document.querySelector('.button__mode_ac');
const tranModeButton = document.querySelector('.button__mode_tran');

opModeButton.addEventListener("click", () => {
  changeMode("op");
});

dcModeButton.addEventListener("click", () => {
  changeMode("dc");
});

acModeButton.addEventListener("click", () => {
  changeMode("ac");
});

tranModeButton.addEventListener("click", () => {
  changeMode("tran");
});

const changeMode = (mode) => {
  const modeFieldSets = document.querySelectorAll('fieldset');
  modeFieldSets.forEach((fieldset) => {
    fieldset.disabled = fieldset.dataset.mode !== mode;
    fieldset.style.display = (fieldset.dataset.mode == mode) ? "block" : "none";
  })
}

const selectElement = document.getElementById("name");
export const selectSource = (value) => {
  const newOption = document.createElement("option");
  newOption.value = value;
  newOption.text = value;
  selectElement.appendChild(newOption);
}
