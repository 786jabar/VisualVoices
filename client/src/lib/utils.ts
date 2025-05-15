import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Function to download data as a file
export function downloadFile(data: string, filename: string, type: string) {
  const blob = new Blob([data], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

// Function to download canvas as image
export function downloadCanvasAsImage(canvas: HTMLCanvasElement, filename: string = "vocal-earth-landscape.png") {
  // Convert canvas to data URL and download
  try {
    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = filename;
    link.click();
  } catch (error) {
    console.error("Error downloading canvas:", error);
    throw new Error("Failed to download image");
  }
}

// Function to analyze text sentiment
// Returns a score between -1 (negative) and 1 (positive)
export function analyzeSentiment(text: string): number {
  // This is a simple placeholder. In production, we would use a proper
  // sentiment analysis library like sentiment.js or call a sentiment API
  const positiveWords = [
    "happy", "good", "great", "excellent", "wonderful", "amazing", "love",
    "beautiful", "joy", "peaceful", "calm", "bright", "delight"
  ];
  
  const negativeWords = [
    "sad", "bad", "terrible", "awful", "horrible", "hate", "angry",
    "upset", "dark", "gloomy", "depressing", "fear", "scary"
  ];
  
  const words = text.toLowerCase().match(/\b(\w+)\b/g) || [];
  let score = 0;
  
  words.forEach(word => {
    if (positiveWords.includes(word)) score += 1;
    if (negativeWords.includes(word)) score -= 1;
  });
  
  // Normalize score to be between -1 and 1
  return words.length ? score / Math.sqrt(score * score + words.length) : 0;
}

// Function to get sentiment label from score
export function getSentimentLabel(score: number): "Negative" | "Neutral" | "Positive" {
  if (score < -0.2) return "Negative";
  if (score > 0.2) return "Positive";
  return "Neutral";
}

// Function to get sentiment color class
export function getSentimentColorClass(sentiment: "Negative" | "Neutral" | "Positive"): string {
  switch (sentiment) {
    case "Negative":
      return "bg-accent text-white";
    case "Positive":
      return "bg-secondary text-white";
    case "Neutral":
    default:
      return "bg-dark-200 text-dark-500";
  }
}
