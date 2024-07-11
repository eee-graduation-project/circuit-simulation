const board = document.querySelector(".board");

export const getSVGCoordinates = (x, y) => {
  const point = board.createSVGPoint();
  point.x = x;
  point.y = y;
  return point.matrixTransform(board.getScreenCTM().inverse());
}

export const getCookie = (name) => {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
          const cookie = cookies[i].trim();
          if (cookie.substring(0, name.length + 1) === (name + '=')) {
              cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
              break;
          }
      }
  }
  return cookieValue;
}
