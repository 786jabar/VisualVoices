// Visuals.js: Handles the dynamic surreal landscape using p5.js

let sentimentScore = 0;  // Tracks sentiment score from narration
let landscapeCanvas;

function setup() {
  const container = document.getElementById('landscape-container');
  landscapeCanvas = createCanvas(container.offsetWidth, container.offsetHeight);
  landscapeCanvas.parent('landscape-container');
  noLoop();
}

function windowResized() {
  const container = document.getElementById('landscape-container');
  resizeCanvas(container.offsetWidth, container.offsetHeight);
  redraw();
}

function draw() {
  // Clear background with color depending on sentiment
  if (sentimentScore > 2) {
    background(70, 130, 180); // calm blue for positive moods
    drawJoyfulLandscape();
  } else if (sentimentScore < -2) {
    background(40, 20, 30); // dark reds for negative moods
    drawStormyLandscape();
  } else {
    background(90, 90, 110); // neutral purple-gray
    drawMysteriousLandscape();
  }
}

// Joyful Landscape: rolling hills with sparkles
function drawJoyfulLandscape() {
  fill(150, 230, 150);
  noStroke();
  for (let x = 0; x < width; x += 50) {
    ellipse(x, height - 60 + sin(frameCount * 0.05 + x) * 10, 100, 40);
  }
  // sparkles
  for (let i = 0; i < 20; i++) {
    let x = random(width);
    let y = random(height - 100, height - 50);
    fill(255, 255, 180, random(100, 200));
    ellipse(x, y, 5, 5);
  }
}

// Stormy Landscape: jagged mountains and lightning flashes
function drawStormyLandscape() {
  fill(60, 20, 20);
  stroke(150, 0, 0);
  strokeWeight(3);
  beginShape();
  vertex(0, height);
  for (let x = 0; x <= width; x += 40) {
    vertex(x, height - random(50, 150));
  }
  vertex(width, height);
  endShape(CLOSE);

  // Lightning flash
  if (frameCount % 60 < 5) {
    stroke(255, 255, 200, 200);
    strokeWeight(5);
    line(random(width), 0, random(width), height / 2);
  }
}

// Mysterious Landscape: foggy lake with smooth hills
function drawMysteriousLandscape() {
  fill(60, 60, 80, 180);
  noStroke();
  rect(0, height - 100, width, 100); // lake

  fill(80, 80, 100);
  for (let x = 0; x < width; x += 60) {
    ellipse(x, height - 120, 120, 40);
  }

  // gentle fog effect
  fill(120, 120, 130, 50);
  for (let i = 0; i < 10; i++) {
    ellipse(random(width), random(height - 130, height - 80), 80, 40);
  }
}

// Update sentiment score from speech module
function updateSentiment(newScore) {
  sentimentScore = newScore;
  redraw();
}