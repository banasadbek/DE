const chatList = document.querySelector('.chat-list');
let startY = 0;
let isDragging = false;

// Start dragging
chatList.addEventListener('mousedown', (e) => {
  startY = e.clientY;
  isDragging = true;
});

// Move while dragging
chatList.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  let deltaY = Math.max(0, e.clientY - startY); // Only pull down
  if (deltaY <= 64) { // Limit to archive height
    chatList.style.transform = `translateY(${deltaY}px)`;
  }
});

// Stop dragging
chatList.addEventListener('mouseup', () => {
  isDragging = false;
});