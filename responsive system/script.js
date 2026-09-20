document.getElementById('loginForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const user = document.getElementById('username').value;
  const pass = document.getElementById('password').value;

  const encodedUser = btoa(user);
  const encodedPass = btoa(pass);

  if (encodedUser === "YWRtaW4=" && encodedPass === "MTIzNDU=") {
    window.location.href = "main.html";
  } else {
    document.getElementById('errorMsg').style.display = "block";
  }
});

window.onload = function () {
  loadLink();
};

function loadLink() {
  let inputVal = document.getElementById('urlInput').value.trim();
  let frame = document.getElementById('previewFrame');

  if (inputVal) {
    if (inputVal.startsWith('file:///')) {
      console.warn("Direct file:/// loading inside iframes is often blocked by browser security (CORS).");
      frame.src = inputVal;
    } else if (!inputVal.startsWith('http://') && !inputVal.startsWith('https://')) {
      frame.src = 'https://' + inputVal;
    } else {
      frame.src = inputVal;
    }
  }
}

function changeSize(w, h) {
  let frame = document.getElementById('previewFrame');
  frame.style.width = w;
  frame.style.height = h;
}