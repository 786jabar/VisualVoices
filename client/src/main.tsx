import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Add Remix Icon CSS for icons 
const remixIconLink = document.createElement('link');
remixIconLink.href = "https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css";
remixIconLink.rel = "stylesheet";
document.head.appendChild(remixIconLink);

// Add required fonts
const fontsLink = document.createElement('link');
fontsLink.href = "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Poppins:wght@500;600;700&display=swap";
fontsLink.rel = "stylesheet";
document.head.appendChild(fontsLink);

// Add title
const titleElement = document.createElement('title');
titleElement.textContent = "Vocal Earth - Turn Your Voice Into Surreal Landscapes";
document.head.appendChild(titleElement);

createRoot(document.getElementById("root")!).render(<App />);
