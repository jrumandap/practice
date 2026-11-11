
let countdownInterval;
let floatingInterval;

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });

    document.getElementById(screenId).classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (floatingInterval) {
        clearInterval(floatingInterval);
        floatingInterval = null;
    }

    if (['birthdayScreen', 'messageScreen', 'finalScreen'].includes(screenId)) {
        startFloatingEmojis();
    }
}

function checkPassword() {
    const password = document.getElementById('passwordInput').value;
    const message = document.getElementById('passwordMessage');

    if (password === '1228') {
        message.textContent = '';
        showScreen('loadingScreen');
        startLoading();
    } else {
        message.textContent = 'Incorrect password. Try again! 💗';
        document.getElementById('passwordInput').value = '';
        document.getElementById('passwordInput').focus();
    }
}

document.getElementById('passwordInput').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        checkPassword();
    }
});

function startLoading() {
    const loadingBar = document.getElementById('loadingBar');
    let progress = 0;

    const interval = setInterval(() => {
        progress += 2;
        loadingBar.style.width = progress + '%';

        if (progress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
                showScreen('questionScreen');
            }, 500);
        }
    }, 60);
}

function shrinkNo() {
    const noButton = document.getElementById('noButton');
    const currentSize = parseFloat(window.getComputedStyle(noButton).fontSize);
    const currentWidth = parseFloat(window.getComputedStyle(noButton).width);

    noButton.style.fontSize = Math.max(8, currentSize - 2) + 'px';
    noButton.style.minWidth = Math.max(35, currentWidth - 12) + 'px';
    noButton.style.padding = '8px 12px';

    if (currentSize <= 10) {
        noButton.style.display = 'none';
    }
}

function sayYes() {
    showScreen('jokeScreen');
    createBurst();

    let seconds = 10;
    document.getElementById('countdown').textContent = seconds;

    clearInterval(countdownInterval);

    countdownInterval = setInterval(() => {
        seconds--;
        document.getElementById('countdown').textContent = seconds;

        if (seconds <= 0) {
            clearInterval(countdownInterval);
            showScreen('birthdayScreen');
        }
    }, 1000);
}

function showMessage() {
    showScreen('messageScreen');
}

function showFinal() {
    showScreen('finalScreen');
    createBurst();
}

function backToMainEvent() {
    showScreen('birthdayScreen');
}

function showImage(imageSource) {
    document.getElementById('modalImage').src = imageSource;

    const modal = new bootstrap.Modal(document.getElementById('photoModal'));
    modal.show();
}

function startFloatingEmojis() {
    const container = document.getElementById('floatingEmojis');
    const emojis = ['💗', '🌸', '🌷', '💕', '✨', '💖'];

    if (floatingInterval) {
        clearInterval(floatingInterval);
    }

    floatingInterval = setInterval(() => {
        const emoji = document.createElement('span');
        emoji.classList.add('floating-emoji');
        emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        emoji.style.left = Math.random() * 100 + 'vw';
        emoji.style.fontSize = (Math.random() * 18 + 14) + 'px';
        emoji.style.animationDuration = (Math.random() * 4 + 5) + 's';

        container.appendChild(emoji);

        setTimeout(() => {
            emoji.remove();
        }, 9000);
    }, 700);
}

function createBurst() {
    const container = document.getElementById('floatingEmojis');
    const emojis = ['💗', '💕', '💖', '🌸', '🌷', '✨', '🎉', '🥳'];

    for (let i = 0; i < 35; i++) {
        const emoji = document.createElement('span');
        emoji.classList.add('floating-emoji');
        emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        emoji.style.left = Math.random() * 100 + 'vw';
        emoji.style.fontSize = (Math.random() * 20 + 15) + 'px';
        emoji.style.animationDuration = (Math.random() * 3 + 3) + 's';

        container.appendChild(emoji);

        setTimeout(() => {
            emoji.remove();
        }, 6500);
    }
}
