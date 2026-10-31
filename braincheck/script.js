var quizForm = document.getElementById('quizForm');
var setupForm = document.getElementById('setupForm');
var loadingText = document.getElementById('loadingText');
var resultBox = document.getElementById('resultBox');
var displayType = document.getElementById('displayType');
var displayItems = document.getElementById('displayItems');
var changeBtn = document.getElementById('changeBtn');

quizForm.addEventListener('submit', function(e) {
  e.preventDefault();

  var type = document.getElementById('examType').value;
  var items = document.getElementById('itemCount').value;

  setupForm.style.display = 'none';
  loadingText.style.display = 'block';

  setTimeout(function() {
    loadingText.style.display = 'none';
    
    displayType.textContent = type;
    displayItems.textContent = items;
    
    resultBox.style.display = 'block';
  }, 1500);
});

changeBtn.addEventListener('click', function() {
  resultBox.style.display = 'none';
  setupForm.style.display = 'block';
});