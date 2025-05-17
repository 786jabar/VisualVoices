import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Get a random element from an array
 */
export function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// Function to download data as a file
export function downloadFile(data: string, filename: string, type: string) {
  const blob = new Blob([data], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link); // Append to body for Firefox compatibility
  link.click();
  document.body.removeChild(link); // Clean up
  setTimeout(() => URL.revokeObjectURL(url), 100); // Delay to ensure download begins
}

// Function to download an image from a data URL
export function downloadImage(dataUrl: string, filename: string = "vocal-earth-landscape") {
  try {
    // Add timestamp to filename for uniqueness
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
    const nameWithTimestamp = `${filename}-${timestamp}.png`;
    
    // Create and trigger download link
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = nameWithTimestamp;
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    }, 100);
    
    return true;
  } catch (error) {
    console.error("Error downloading image:", error);
    throw new Error("Failed to download image");
  }
}

// Function to download canvas as image with timestamp
export function downloadCanvasAsImage(canvas: HTMLCanvasElement, filename: string = "vocal-earth-landscape") {
  try {
    // Create high-quality image from canvas
    const dataUrl = canvas.toDataURL("image/png", 1.0);
    return downloadImage(dataUrl, filename);
  } catch (error) {
    console.error("Error downloading canvas:", error);
    throw new Error("Failed to download image");
  }
}

// Enhanced sentiment analysis with more comprehensive word lists
export function analyzeSentiment(text: string): number {
  if (!text || text.length < 2) return 0;
  
  // Expanded word lists for better sentiment detection
  const positiveWords = [
    "happy", "good", "great", "excellent", "wonderful", "amazing", "love",
    "beautiful", "joy", "peaceful", "calm", "bright", "delight", "fantastic",
    "superb", "terrific", "outstanding", "brilliant", "splendid", "perfect",
    "nice", "pleasant", "awesome", "marvelous", "spectacular", "paradise",
    "glorious", "triumph", "success", "succeed", "victory", "win", "winning",
    "celebrate", "celebration", "bliss", "ecstatic", "euphoric", "thrilled",
    "excited", "exciting", "enthusiastic", "vibrant", "vivid", "radiant",
    "sublime", "inspiring", "inspired", "hope", "hopeful", "optimistic",
    "positive", "cheerful", "glad", "pleased", "grateful", "thankful"
  ];
  
  const negativeWords = [
    "sad", "bad", "terrible", "awful", "horrible", "hate", "angry",
    "upset", "dark", "gloomy", "depressing", "fear", "scary", "lonely",
    "anxious", "anxiety", "worried", "worry", "afraid", "frightened",
    "terrified", "terror", "horrific", "dreadful", "dire", "disaster",
    "tragic", "tragedy", "sorrow", "sorrowful", "grief", "grieving",
    "miserable", "unhappy", "unfortunate", "regret", "regretful", "pain",
    "painful", "suffering", "suffer", "agony", "agonizing", "nightmare",
    "horrifying", "devastating", "devastated", "ruin", "ruined", "destroyed",
    "destruction", "catastrophe", "catastrophic", "terrible", "despair"
  ];
  
  // Negation words that flip sentiment
  const negationWords = ["not", "no", "never", "none", "neither", "nor", "barely", "hardly"];
  
  // Amplifier words that strengthen sentiment
  const amplifierWords = ["very", "extremely", "incredibly", "absolutely", "completely", "totally"];
  
  // Extract words using better regex (handles punctuation better)
  const words = text.toLowerCase().match(/\b(\w+)\b/g) || [];
  let score = 0;
  let wordCount = 0;
  let negationActive = false;
  let amplifierActive = false;
  
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    
    // Check for negation
    if (negationWords.includes(word)) {
      negationActive = true;
      continue;
    }
    
    // Check for amplifiers
    if (amplifierWords.includes(word)) {
      amplifierActive = true;
      continue;
    }
    
    // Determine base sentiment value
    let sentimentValue = 0;
    if (positiveWords.includes(word)) {
      sentimentValue = 1;
      wordCount++;
    } else if (negativeWords.includes(word)) {
      sentimentValue = -1;
      wordCount++;
    }
    
    // Apply negation if active (flips the sentiment)
    if (negationActive && sentimentValue !== 0) {
      sentimentValue *= -0.9; // Slightly reduced impact for negated terms
      negationActive = false;
    }
    
    // Apply amplifier if active (strengthens the sentiment)
    if (amplifierActive && sentimentValue !== 0) {
      sentimentValue *= 1.5;
      amplifierActive = false;
    }
    
    score += sentimentValue;
    
    // Reset negation after 3 words if not used
    if (negationActive && i > 0 && i % 3 === 0) {
      negationActive = false;
    }
  }
  
  // Normalize score to be between -1 and 1 using a better formula
  // that preserves more of the sentiment intensity
  if (wordCount > 0) {
    const normalizedScore = score / Math.sqrt(Math.abs(score) + wordCount);
    return Math.max(-1, Math.min(1, normalizedScore)); // Clamp between -1 and 1
  }
  
  return 0;
}

// Function to get sentiment label from score with more sensitivity
export function getSentimentLabel(score: number): "Negative" | "Neutral" | "Positive" {
  if (score < -0.15) return "Negative";
  if (score > 0.15) return "Positive";
  return "Neutral";
}

// Enhanced function to get sentiment color class with more distinctive colors
export function getSentimentColorClass(sentiment: "Negative" | "Neutral" | "Positive"): string {
  switch (sentiment) {
    case "Negative":
      return "bg-rose-600 text-white";
    case "Positive":
      return "bg-emerald-600 text-white";
    case "Neutral":
    default:
      return "bg-indigo-600 text-white";
  }
}

// Get sentiment emoji for visual indicators
export function getSentimentEmoji(sentiment: "Negative" | "Neutral" | "Positive" | string): string {
  if (sentiment === "Negative") return "😔";
  if (sentiment === "Positive") return "😊";
  return "😐"; // Neutral or unknown
}

// Get descriptive text for sentiment
export function getSentimentDescription(sentiment: "Negative" | "Neutral" | "Positive" | string): string {
  if (sentiment === "Negative") return "Negative / Somber";
  if (sentiment === "Positive") return "Positive / Joyful";
  return "Neutral / Balanced"; // Neutral or unknown
}