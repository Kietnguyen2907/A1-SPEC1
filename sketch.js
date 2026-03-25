let flowers = [];
let currentCircleDim = 20, baseCircleDim = 20, fullScreenDim;
let detectionRadius = 60;

class Flower {
  constructor(x, y, startX, startY, colorObj, petals) {
    this.x = x; this.y = y;
    this.startX = startX; this.startY = startY;
    this.colors = colorObj;
    this.petals = petals;
  }

  drawStem() {
    push();
    noFill();
    let grad = drawingContext.createLinearGradient(this.x, this.y, this.startX, this.startY);
    grad.addColorStop(0, '#9CF0E1'); grad.addColorStop(1, '#1A3333');
    drawingContext.strokeStyle = grad;
    strokeWeight(2.5);
    drawingContext.beginPath();
    drawingContext.moveTo(this.x, this.y);
    
    let cp1x = this.x, cp1y = this.y + 100, cp2x, cp2y;
    if (this.startX === 0 || this.startX === width) {
      cp2x = this.startX === 0 ? this.startX + 250 : this.startX - 250;
      cp2y = this.y + (this.startY - this.y) * 0.5;
    } else {
      cp2x = this.x + (this.startX - this.x) * 0.2 + (this.startX > this.x ? 150 : -150);
      cp2y = this.startY - 200;
    }
    drawingContext.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, this.startX, this.startY);
    drawingContext.stroke();
    pop();
  }

  drawFlower() {
    let d = dist(this.x, this.y, mouseX, mouseY);
    let radius = currentCircleDim / 2;
    let destructIntensity = d < radius ? map(d, 0, radius, 1, 0) : 0;

    push();
    translate(this.x, this.y);

    let grad = drawingContext.createRadialGradient(0, 0, 0, 0, 0, 90);
    if (this.colors.type === 'normal') {
      grad.addColorStop(0, this.colors.center);
      grad.addColorStop(0.3, this.colors.center); 
      grad.addColorStop(1, this.colors.edge);
    } else {
      grad.addColorStop(0, this.colors.center);
      grad.addColorStop(0.8, this.colors.edge); 
      grad.addColorStop(1, this.colors.edge);
    }

    drawingContext.fillStyle = grad;
    noStroke();

    this.petals.forEach((p, index) => {
      push();
      
      if (destructIntensity > 0) {
        let scatterX = (noise(index, frameCount * 0.001) - 0.5) * 10 * destructIntensity;
        let scatterY = (noise(index + 50, frameCount * 0.001) - 0.5) * 10 * destructIntensity;
        translate(scatterX, scatterY);
        rotate(p.angle + noise(index) * TWO_PI * 0.3 * destructIntensity);
        let stretch = 1 + destructIntensity * 1.5;
        let thin = 1 - destructIntensity * 0.2;
        scale(stretch, thin);
      } else {
        rotate(p.angle);
      }
      ellipse(p.len / 3, 0, p.len, p.wid);
      pop();
    });
    pop();
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  fullScreenDim = sqrt(sq(width) + sq(height)) * 1.5;

  let normalColors = [
    { center: '#F5412B', edge: '#E4DA7A' }, { center: '#4A20E2', edge: '#9CF0E1' },
    { center: '#2D3BD3', edge: '#F137A6' }, { center: '#7CD769', edge: '#0231D3' },
    { center: '#015D27', edge: '#9CF0E1' }, { center: '#E2D052', edge: '#9CF0E1' },
    { center: '#9CF0E1', edge: '#E2D052' }, { center: '#9CF0E1', edge: '#4A20E2' }
  ].map(c => ({...c, type: 'normal'}));

  let reverseColors = [
    { center: '#E4DA7A', edge: '#F5412B' }, { center: '#9CF0E1', edge: '#4A20E2' },
    { center: '#F137A6', edge: '#2D3BD3' }, { center: '#0231D3', edge: '#7CD769' },
    { center: '#9CF0E1', edge: '#015D27' }, { center: '#9CF0E1', edge: '#E2D052' },
    { center: '#E2D052', edge: '#9CF0E1' }, { center: '#4A20E2', edge: '#9CF0E1' }
  ].map(c => ({...c, type: 'reverse'}));

  let colorPool = [...normalColors, ...reverseColors].sort(() => random() - 0.5);

  let attempts = 0;
  while (flowers.length < 25 && attempts < 5000) { 
    let x, y, startX, startY, side = random(1);
    if (side < 0.2) { 
      x = random(width * 0.05, width * 0.4); y = random(height * 0.1, height * 0.65);
      startX = 0; startY = random(height * 0.2, height * 0.95);
    } else if (side < 0.4) { 
      x = random(width * 0.6, width * 0.95); y = random(height * 0.1, height * 0.75);
      startX = width; startY = random(height * 0.2, height * 0.95);
    } else { 
      x = random(width * 0.1, width * 0.9); y = random(height * 0.2, height * 0.8);
      startX = x + random(-200, 200); startY = height;
    }

    if (!flowers.some(f => dist(x, y, f.x, f.y) < 170)) {
      let petals = [];
      for(let j=0; j<45; j++) { 
        petals.push({ angle: random(TWO_PI), len: random(50, 110), wid: random(4, 10) }); 
      }
      flowers.push(new Flower(x, y, startX, startY, colorPool[flowers.length % colorPool.length], petals));
    }
    attempts++;
  }
}

function draw() {
  background(0);
  blendMode(BLEND);

  let isTouching = flowers.some(f => dist(mouseX, mouseY, f.x, f.y) < detectionRadius);
  let targetDim = isTouching ? fullScreenDim : baseCircleDim;
  let lerpSpeed = (targetDim > currentCircleDim) ? 0.003 : 0.15;
  currentCircleDim = lerp(currentCircleDim, targetDim, lerpSpeed);

  flowers.forEach(f => f.drawStem());
  flowers.forEach(f => f.drawFlower());

  push();
  blendMode(DODGE); noStroke(); fill(255);
  ellipse(mouseX, mouseY, currentCircleDim, currentCircleDim);
  pop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  fullScreenDim = sqrt(sq(width) + sq(height)) * 1.5;
}
