const board = document.querySelector(".board");
const elements = document.querySelectorAll(".library__element_item img");

let offsetX, offsetY, state;
let e;

board.addEventListener("drop", drop);
board.addEventListener("dragover", dragOver);

elements.forEach((element) => {
  element.addEventListener("dragstart", dragStart);
})

function dragOver(event) {
  event.preventDefault();
}

function dragStart(event) {
  e = event;
  event.dataTransfer.setData("src", event.target.src);
  state = "library";
}

function boardDrag(event) {
  e = event;
  event.dataTransfer.setData("src", event.target.src);
  state = "board";
}

function drop(event) {
  event.preventDefault();
  if (!state) return;

  const rect = e.target.getBoundingClientRect();
  offsetX = e.clientX - rect.left;
  offsetY = e.clientY - rect.top;

  const relativeX = event.pageX - board.offsetLeft - offsetX;
  const relativeY = event.pageY - board.offsetTop - offsetY;
  
  if (state=="board") {
    e.target.style.left = `${relativeX}px`;
    e.target.style.top = `${relativeY}px`;
    state = false;
    return;
  }

  const img = document.createElement("img");
  const src = event.dataTransfer.getData("src");
  img.src = src;
  img.className = "board__element_item";
  
  img.style.left = `${relativeX}px`;
  img.style.top = `${relativeY}px`;

  event.target.appendChild(img);
  img.addEventListener("dragstart", boardDrag);
  state = false;
}
