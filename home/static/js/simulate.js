const getCookie = (name) => {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
          const cookie = cookies[i].trim();
          // Does this cookie string begin with the name we want?
          if (cookie.substring(0, name.length + 1) === (name + '=')) {
              cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
              break;
          }
      }
  }
  return cookieValue;
}

const csrftoken = getCookie('csrftoken');

const data = {"test": 1}

const sendCircuitNodes = () => {
  fetch(`${window.location.href}test/`, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'X-CSRFToken': csrftoken
    }
  })
  .then(console.log)
  .catch(console.log);
}