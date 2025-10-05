const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');

form.addEventListener('submit', async function (e) {
  e.preventDefault();

  const userMessage = input.value.trim();
  if (!userMessage) return;

  appendMessage('user', userMessage);
  input.value = '';

  const typingIndicator = showTypingIndicator();

  try {
    // ✅ Panggil backend kamu
    const response = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: userMessage }]
      })
    });

    const data = await response.json();
    removeTypingIndicator(typingIndicator);

    if (data.success) {
      appendMessage('bot', data.reply);
    } else {
      appendMessage('bot', '⚠️ Terjadi kesalahan pada server.');
    }
  } catch (error) {
    removeTypingIndicator(typingIndicator);
    console.error('Error:', error);
    appendMessage('bot', '🚫 Gagal terhubung ke server.');
  }
});

function appendMessage(sender, text) {
  const msg = document.createElement('div');
  msg.classList.add('message', sender);
  msg.textContent = text;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function showTypingIndicator() {
  const typingDiv = document.createElement('div');
  typingDiv.id = 'typing-indicator';
  typingDiv.classList.add('message', 'bot', 'typing');

  const typingText = document.createElement('div');
  typingText.textContent = 'Gemini sedang mengetik...';
  typingText.classList.add('typing-text');

  const dots = document.createElement('div');
  dots.classList.add('typing-dots');
  for (let i = 0; i < 3; i++) {
    const dot = document.createElement('span');
    dots.appendChild(dot);
  }

  typingDiv.appendChild(typingText);
  typingDiv.appendChild(dots);
  chatBox.appendChild(typingDiv);
  chatBox.scrollTop = chatBox.scrollHeight;

  return typingDiv;
}

function removeTypingIndicator(typingElement) {
  if (typingElement && typingElement.parentNode) {
    typingElement.parentNode.removeChild(typingElement);
  }
}

// Tekan Enter untuk kirim
input.addEventListener('keypress', function (e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    form.dispatchEvent(new Event('submit'));
  }
});
