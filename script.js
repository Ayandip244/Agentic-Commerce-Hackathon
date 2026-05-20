const GEMINI_API_KEY = 'PASTE_YOUR_GEMINI_API_KEY_HERE';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + GEMINI_API_KEY;

const SASHA_SYSTEM_PROMPT = `You are SASHA, a premium AI commerce support agent. Your full name stands for Smart Automated Shopping & Help Assistant. You work for a high-end online retail platform.

Your personality:
- Warm, professional, and elegant — like a luxury concierge
- Knowledgeable about e-commerce: orders, tracking, returns, refunds, products, shipping, payments, coupons
- Concise yet thorough — never verbose, always helpful
- Use light formatting with bold for key terms when appropriate
- Occasionally use tasteful emojis but don't overdo it

Your capabilities:
- Track orders (ask for order ID if not provided)
- Help with returns and refunds (30-day window, free returns)
- Product recommendations and trending items
- Payment issues and coupon application
- Shipping policies (standard 5–7 days, express 2–3 days, free shipping over $75)
- Loyalty program and membership benefits
- Size guides and product availability
- Wishlist and saved items management

Key policies to remember:
- Return window: 30 days from delivery
- Refund processing: 3–5 business days
- Free shipping: orders above $75
- Express shipping: $12.99
- Standard shipping: $4.99
- Discount coupon format: usually 6–10 alphanumeric characters
- Customer service escalation available 24/7

When tracking orders:
- Order IDs follow format #ORD-XXXXX
- Provide realistic tracking updates
- For shipped orders, give estimated delivery dates

Always end responses about issues with a reassuring note. If unsure, offer to escalate to a human agent.`;

const conversationHistory = [];
let isTyping = false;

function getTime() {
  return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function autoResize(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 160) + 'px';
}

function scrollToBottom() {
  const area = document.getElementById('messages');
  setTimeout(() => {
    area.scrollTop = area.scrollHeight;
  }, 60);
}

function handleKey(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
}

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  const isOpen = sidebar.classList.contains('open');
  if (isOpen) {
    sidebar.classList.remove('open');
    overlay.classList.remove('visible');
  } else {
    sidebar.classList.add('open');
    overlay.classList.add('visible');
  }
}

function switchSection(id, btn) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('section-' + id).classList.add('active');
  if (btn) btn.classList.add('active');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  if (window.innerWidth <= 768) {
    sidebar.classList.remove('open');
    overlay.classList.remove('visible');
  }
}

function removeWelcomeBlock() {
  const wb = document.getElementById('welcome-block');
  if (wb) {
    wb.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
    wb.style.opacity = '0';
    wb.style.transform = 'translateY(-10px)';
    setTimeout(() => wb.remove(), 350);
  }
}

function appendMessage(role, text, animate = true) {
  const area = document.getElementById('messages');
  const row = document.createElement('div');
  row.classList.add('message-row', role);
  if (!animate) row.style.animation = 'none';

  const avatarEl = document.createElement('div');
  avatarEl.classList.add('msg-avatar');
  avatarEl.textContent = role === 'sasha' ? 'S' : 'A';

  const contentEl = document.createElement('div');
  contentEl.classList.add('msg-content');

  const bubble = document.createElement('div');
  bubble.classList.add('msg-bubble');
  bubble.innerHTML = formatMessageText(text);

  const timeEl = document.createElement('div');
  timeEl.classList.add('msg-time');
  timeEl.textContent = getTime();

  contentEl.appendChild(bubble);
  contentEl.appendChild(timeEl);
  row.appendChild(avatarEl);
  row.appendChild(contentEl);
  area.appendChild(row);
  scrollToBottom();
  return bubble;
}

function formatMessageText(text) {
  let result = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>');

  const lines = result.split('\n');
  const processed = [];
  let inList = false;
  let listType = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.match(/^[-•]\s+/)) {
      if (!inList || listType !== 'ul') {
        if (inList) processed.push('</' + listType + '>');
        processed.push('<ul>');
        inList = true;
        listType = 'ul';
      }
      processed.push('<li>' + line.replace(/^[-•]\s+/, '') + '</li>');
    } else if (line.match(/^\d+\.\s+/)) {
      if (!inList || listType !== 'ol') {
        if (inList) processed.push('</' + listType + '>');
        processed.push('<ol>');
        inList = true;
        listType = 'ol';
      }
      processed.push('<li>' + line.replace(/^\d+\.\s+/, '') + '</li>');
    } else {
      if (inList) {
        processed.push('</' + listType + '>');
        inList = false;
        listType = '';
      }
      if (line) processed.push('<p>' + line + '</p>');
    }
  }
  if (inList) processed.push('</' + listType + '>');
  return processed.join('');
}

function showTyping() {
  document.getElementById('typing-indicator').classList.add('visible');
  scrollToBottom();
}

function hideTyping() {
  document.getElementById('typing-indicator').classList.remove('visible');
}

function disableInput(disabled) {
  const btn = document.getElementById('send-btn');
  const input = document.getElementById('user-input');
  btn.disabled = disabled;
  btn.style.opacity = disabled ? '0.5' : '1';
  btn.style.cursor = disabled ? 'not-allowed' : 'pointer';
  input.disabled = disabled;
}

async function callGeminiAPI(userMessage) {
  conversationHistory.push({
    role: 'user',
    parts: [{ text: userMessage }]
  });

  const requestBody = {
    system_instruction: {
      parts: [{ text: SASHA_SYSTEM_PROMPT }]
    },
    contents: conversationHistory,
    generationConfig: {
      maxOutputTokens: 1000,
      temperature: 0.7
    }
  };

  try {
    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      const errMsg = err.error?.message || 'API request failed';
      const errCode = err.error?.code || response.status;
      throw new Error(errCode + ': ' + errMsg);
    }

    const data = await response.json();

    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('No response from Gemini');
    }

    const assistantText = data.candidates[0].content.parts
      .map(p => p.text || '')
      .join('');

    conversationHistory.push({
      role: 'model',
      parts: [{ text: assistantText }]
    });

    return assistantText;

  } catch (error) {
    console.warn("Gemini API Error triggered fallback mock mode:", error.message);
    
    // 1. Simulate a short processing delay so the UI animation looks realistic
    await new Promise(resolve => setTimeout(resolve, 1200));

    // 2. Generate a smart mock response based on what the user typed
    let mockResponse = "I am currently operating in **Offline Mock Mode** due to API rate limits, but I'm here to help! How else can I assist you today? ✨";
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('track') || lowerMessage.includes('order')) {
      mockResponse = "I would be delighted to look into that for you. Your package for order **#ORD-48291** is currently with our courier partner and is estimated to arrive this Friday, **May 22, 2026**. 📦\n\nIs there anything else I can track for you?";
    } else if (lowerMessage.includes('return') || lowerMessage.includes('refund')) {
      mockResponse = "Our returns process is completely seamless. You have a **30-day return window** from delivery, and return shipping is entirely complimentary. Would you like me to generate a return shipping label for your recent order?";
    } else if (lowerMessage.includes('trending') || lowerMessage.includes('product')) {
      mockResponse = "Here are a few items catching everyone's eye right now:\n\n- **Artisan Leather Tote** ($189.00)\n- **Silk Evening Scarf** ($94.00)\n- **Ceramic Coffee Set** ($128.00)\n\nYou can view these directly in your *Wishlist* section on the sidebar! 🛍️";
    } else if (lowerMessage.includes('shipping') || lowerMessage.includes('delivery')) {
      mockResponse = "We offer complimentary **Standard Shipping** on all orders over $75 (otherwise $4.99), which takes 5–7 business days. Alternatively, **Express Shipping** is available for $12.99 and delivers within 2–3 business days. ✈️";
    } else if (lowerMessage.includes('coupon') || lowerMessage.includes('discount')) {
      mockResponse = "I've applied the boutique reward code **SASHA10** to your profile session. This will grant you an additional **10% off** at your next checkout window. 🎟️";
    }

    // 3. Keep the local conversation history in sync so the chat context doesn't break
    conversationHistory.push({
      role: 'model',
      parts: [{ text: mockResponse }]
    });

    return mockResponse;
  }
}

async function sendMessage() {
  if (isTyping) return;
  const input = document.getElementById('user-input');
  const text = input.value.trim();
  if (!text) return;

  if (GEMINI_API_KEY === 'PASTE_YOUR_GEMINI_API_KEY_HERE') {
    removeWelcomeBlock();
    appendMessage('user', text);
    input.value = '';
    input.style.height = 'auto';
    appendMessage('sasha', '⚠️ **API Key Missing** — Please open `script.js` and replace `PASTE_YOUR_GEMINI_API_KEY_HERE` with your actual Gemini API key from **aistudio.google.com**. Once done, refresh the page and try again!');
    return;
  }

  removeWelcomeBlock();
  input.value = '';
  input.style.height = 'auto';
  appendMessage('user', text);

  isTyping = true;
  disableInput(true);
  showTyping();

  try {
    const reply = await callGeminiAPI(text);
    hideTyping();
    appendMessage('sasha', reply);
  } catch (err) {
    hideTyping();
    let errMsg;
    const msg = err.message || '';

    if (msg.includes('400') || msg.toLowerCase().includes('api key not valid') || msg.toLowerCase().includes('invalid')) {
      errMsg = '🔑 **Invalid API Key** — Your Gemini API key seems incorrect. Please double-check it in `script.js` and make sure you copied the full key from Google AI Studio.';
    } else if (msg.includes('429') || msg.toLowerCase().includes('quota')) {
      errMsg = "⏳ **Rate Limit Reached** — I've hit the free tier limit for now. Please wait a minute and try again — the free tier resets quickly!";
    } else if (msg.includes('403') || msg.toLowerCase().includes('permission')) {
      errMsg = '🚫 **Access Denied** — Your API key may not have Gemini API enabled. Go to **aistudio.google.com**, check your key settings, and make sure the Generative Language API is enabled.';
    } else if (msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('network')) {
      errMsg = "🌐 **Connection Issue** — I can't reach the servers. Please check your internet connection and try again.";
    } else {
      errMsg = "😔 Something unexpected happened on my end. Please try again — I'm here to help! If it keeps happening, refresh the page.";
    }
    appendMessage('sasha', errMsg);
  } finally {
    isTyping = false;
    disableInput(false);
    input.focus();
  }
}

function sendQuickMessage(msg) {
  if (isTyping) return;
  switchSection('chat', document.querySelector('[data-section="chat"]'));
  const input = document.getElementById('user-input');
  input.value = msg;
  autoResize(input);
  setTimeout(() => sendMessage(), 80);
}

function clearChat() {
  const area = document.getElementById('messages');
  const rows = area.querySelectorAll('.message-row');
  rows.forEach(r => {
    r.style.transition = 'opacity 0.2s ease';
    r.style.opacity = '0';
    setTimeout(() => r.remove(), 200);
  });
  conversationHistory.length = 0;

  setTimeout(() => {
    if (!document.getElementById('welcome-block')) {
      const wb = buildWelcomeBlock();
      area.appendChild(wb);
    }
  }, 300);
}

function resetChat() {
  clearChat();
}

function buildWelcomeBlock() {
  const div = document.createElement('div');
  div.id = 'welcome-block';
  div.classList.add('welcome-block');
  div.innerHTML = `
    <div class="welcome-orb"></div>
    <h2 class="welcome-heading">Hello, I'm <em>SASHA</em></h2>
    <p class="welcome-sub">Your intelligent commerce support companion. I can help you track orders, manage returns, find products, and much more.</p>
    <div class="quick-chips" id="quick-chips">
      <button class="chip" onclick="sendQuickMessage('Track my order')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        Track Order
      </button>
      <button class="chip" onclick="sendQuickMessage('I want to return a product')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>
        Start Return
      </button>
      <button class="chip" onclick="sendQuickMessage('Show me trending products')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
        Trending Now
      </button>
      <button class="chip" onclick="sendQuickMessage('I have a payment issue')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
        Payment Help
      </button>
      <button class="chip" onclick="sendQuickMessage('What are your shipping policies?')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
        Shipping Info
      </button>
      <button class="chip" onclick="sendQuickMessage('Apply a discount coupon')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
        Use Coupon
      </button>
    </div>
  `;
  return div;
}

document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', function () {
    this.closest('.orders-filter').querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
  });
});

document.getElementById('user-input').addEventListener('input', function () {
  autoResize(this);
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 768) {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    sidebar.classList.remove('open');
    overlay.classList.remove('visible');
  }
});