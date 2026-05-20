# AI Customer Support Agent for Commerce (featuring SASHA) 🛍️✨

An intelligent e-commerce support concierge built for the **Kasparro Agentic Commerce Hackathon**. 

This project features "SASHA" (Smart Automated Shopping & Help Assistant), an interactive AI agent powered by the Google Gemini API. It is designed to elevate the online shopping experience by providing instant, context-aware support for order tracking, returns, product recommendations, and store policies within a luxurious, dark-themed UI.

---

## 🌟 Key Features

* **Intelligent Support Chat:** Powered by the `gemini-2.0-flash` model, SASHA understands natural language and assists users with realistic e-commerce scenarios.
* **Smart Fallback Mode:** If API rate limits are hit or the API key is missing, the application gracefully degrades into an "Offline Mock Mode," ensuring the user experience remains uninterrupted.
* **Multi-Section E-commerce Dashboard:**
    * **Support Chat:** The main interface for AI interactions, complete with typing indicators and animated message bubbles.
    * **My Orders:** Visual tracking of past and current orders with color-coded status badges (Processing, Shipped, Delivered).
    * **Returns & Refunds:** Clear, accessible policy information and quick-action buttons to initiate returns via the AI.
    * **Wishlist:** A gallery of saved items with integrated "Add to Cart" functionality routed through the chat interface.
    * **Profile:** A mockup of user statistics, lifetime spend, and account settings.
* **Responsive & Elegant UI:** Built from scratch with custom CSS, featuring a dark luxury aesthetic, glassmorphism effects, fluid animations, and mobile-first responsiveness.
* **Quick Actions:** Pre-configured suggestion chips allow users to instantly ask common questions (e.g., "Track my order", "Show trending products") with a single click.

---

## 🛠️ Tech Stack

This project is lightweight, dependency-free, and runs entirely in the browser:

* **HTML5:** Semantic structure and layout styling.
* **CSS3:** Custom variables, flexbox/grid layouts, keyframe animations, and media queries for mobile responsiveness.
* **Vanilla JavaScript (ES6+):** State management, DOM manipulation, chat history tracking, and asynchronous API calls.
* **Google Gemini API:** Core LLM engine driving the conversational intelligence.

---

## 📂 File Structure

* `index.html`: The main application shell, including the sidebar navigation, chat interface, and hidden e-commerce sections.
* `style.css`: Contains all styling, animations, and the dark/gold color palette.
* `script.js`: Handles the application logic, Gemini API POST requests, markdown formatting for chat bubbles, and the offline mock fallback system.

---

## 🚀 Setup & Installation

Since this is a static frontend project, no complex build tools or package managers (like npm) are required. 

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/Ayandip244/Agentic-Commerce-Hackathon.git](https://github.com/Ayandip244/Agentic-Commerce-Hackathon.git))
    cd Agentic-Commerce-Hackathon
    ```

2.  **Add your Gemini API Key:**
    * Open `script.js` in your code editor.
    * Locate line 1: `const GEMINI_API_KEY = 'PASTE_YOUR_GEMINI_API_KEY_HERE';`
    * Replace the placeholder text with your actual Gemini API key obtained from [Google AI Studio](https://aistudio.google.com/).

3.  **Run the application:**
    * Simply double-click the `index.html` file to open it in any modern web browser.
    * *Alternatively*, for a better experience, run it through a local development server (like the VS Code Live Server extension).

---

## 💡 Usage Highlights

* **Try typing:** *"Where is order #ORD-48291?"* to see SASHA fetch tracking information.
* **Try typing:** *"What is your return policy?"* to test the agent's knowledge of the store's rules.
* **Navigate:** Click through the sidebar to explore the simulated e-commerce environment. Clicking action buttons in the Wishlist or Orders tab will automatically switch you back to the chat and prompt SASHA on your behalf.

---

*Built with ❤️ for the Kasparro Agentic Commerce Hackathon.*
