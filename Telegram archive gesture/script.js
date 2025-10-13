const chatList = document.querySelector('.chat-list');
const cover = document.querySelector('.cover');
const coverText = cover.querySelector('p');
const bar = cover.querySelector('.bar');
const arrowImg = cover.querySelector('.archive-icon img');

let scrollY = 0;
let startY = 0;
let isInteracting = false;
let currentText = 'Pull to see archive';

// Mouse wheel
chatList.addEventListener('wheel', (e) => {
  e.preventDefault();
  isInteracting = true;
  cover.style.opacity = '1';
  scrollY = Math.min(64, Math.max(0, scrollY + e.deltaY * 0.1));
  chatList.style.transform = `translateY(${scrollY}px)`;
  cover.style.height = `${scrollY}px`;
  cover.style.backgroundColor = scrollY >= 64 ? '#60a2df' : 'var(--archive-bg)';
  const availableBarHeightWheel = Math.max(0, scrollY - 16); // 12px top + 12px bottom padding
  bar.style.height = `${Math.max(20, availableBarHeightWheel)}px`;
  arrowImg.style.transform = scrollY >= 64 ? 'rotate(180deg)' : 'rotate(0deg)';
  const newText = scrollY >= 64 ? 'Release for archive' : 'Swipe down for archive';
  
  if (newText !== currentText) {
    coverText.style.opacity = '0';
    coverText.style.transform = 'translateY(6px)';
    setTimeout(() => {
      coverText.textContent = newText;
      coverText.style.opacity = scrollY >= 10 ? '1' : '0';
      coverText.style.transform = scrollY >= 10 ? 'translateY(0)' : 'translateY(6px)';
      currentText = newText;
    }, 200); // Match CSS transition duration
  } else {
    coverText.style.opacity = scrollY >= 10 ? '1' : '0';
    coverText.style.transform = scrollY >= 10 ? 'translateY(0)' : 'translateY(6px)';
  }
});

// Start drag
chatList.addEventListener('mousedown', (e) => {
  e.preventDefault();
  startY = e.clientY;
  isInteracting = true;
  cover.style.opacity = '1';
});

// Drag move
chatList.addEventListener('mousemove', (e) => {
  if (!isInteracting) return;
//   scrollY = Math.min(64, Math.max(0, e.clientY - startY));
  let dragDistance = e.clientY - startY;
    if (dragDistance < 0) dragDistance = 0;

    // Apply resistance once you pull beyond 64px
    if (dragDistance <= 64) {
    scrollY = dragDistance;
    } else {
    const extra = dragDistance - 64;
    scrollY = 64 + extra * 0.5; // resistance factor (0.5× beyond limit)
    }
    scrollY = Math.min(scrollY, 96); // optional hard cap to prevent infinite drag
// here
  bar.style.backgroundColor = scrollY >=64 ? '#9dc6eb':'#8692a2';
  chatList.style.transform = `translateY(${scrollY}px)`;
  cover.style.height = `${scrollY}px`;
  cover.style.backgroundColor = scrollY >= 64 ? '#60a2df' : 'var(--archive-bg)';
  const availableBarHeightDrag = Math.max(0, scrollY - 16); // 12px top + 12px bottom padding
  bar.style.height = `${Math.max(20, availableBarHeightDrag)}px`;
  arrowImg.style.transform = scrollY >= 64 ? 'rotate(180deg)' : 'rotate(0deg)';
  const newText = scrollY >= 64 ? 'Release for archive' : 'Swipe down for archive';

  if (newText !== currentText) {
    coverText.style.opacity = '0';
    coverText.style.transform = 'translateY(6px)';
    setTimeout(() => {
      coverText.textContent = newText;
      coverText.style.opacity = scrollY >= 10 ? '1' : '0';
      coverText.style.transform = scrollY >= 10 ? 'translateY(0)' : 'translateY(12px)';
      currentText = newText;
    }, 200);
  } else {
    coverText.style.opacity = scrollY >= 10 ? '1' : '0';
    coverText.style.transform = scrollY >= 10 ? 'translateY(0)' : 'translateY(-12px)';
  }
});

// Stop interaction
document.addEventListener('mouseup', () => {
  if (!isInteracting) return;
  isInteracting = false;
  cover.style.opacity = '0';
  cover.style.height = '0';
  if (scrollY >= 64) {
    chatList.style.transform = 'translateY(64px)';
    scrollY = 64;
  } else {
    chatList.style.transform = 'translateY(0)';
    scrollY = 0;
  }
  cover.style.backgroundColor = 'var(--archive-bg)';
  const availableBarHeightEnd = Math.max(0, scrollY - 16);
  bar.style.height = `${Math.max(20, availableBarHeightEnd)}px`;
  arrowImg.style.transform = scrollY >= 64 ? 'rotate(180deg)' : 'rotate(0deg)';
  coverText.textContent = 'Pull to see archive';
  coverText.style.opacity = scrollY >= 10 ? '1' : '0';
  coverText.style.transform = scrollY >= 10 ? 'translateY(0)' : 'translateY(6px)';
  currentText = 'Pull to see archive';

});



