const board = document.querySelector(".board");

export const getSVGCoordinates = (x, y) => {
  const point = board.createSVGPoint();
  point.x = x;
  point.y = y;
  return point.matrixTransform(board.getScreenCTM().inverse());
}
