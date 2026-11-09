import { ZONES, MUTATION_DATA } from './gameData.js';

export class ThrowSimulator {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    
    this.isThrowing = false;
    this.throwProgress = 0; // 0 to 1
    this.maxDistance = 100;
    this.currentDistance = 0;
    this.targetZone = null;
    this.foodItem = null;
    this.caughtAnimal = null;
    this.onFinishCallback = null;

    this.particles = [];
    this.cameraX = 0;

    // Responsive resize
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    const parent = this.canvas.parentElement;
    if (parent) {
      this.width = parent.clientWidth;
      this.height = Math.max(340, parent.clientHeight || 360);
      this.canvas.width = this.width;
      this.canvas.height = this.height;
    }
  }

  startThrow({ food, power, timingScore, onFinish }) {
    this.isThrowing = true;
    this.throwProgress = 0;
    this.foodItem = food;
    this.onFinishCallback = onFinish;

    // Distance calculation formula: Power * (TimingScore / 20)^1.35 * 45
    const timingFactor = Math.pow(Math.max(1, timingScore) / 20, 1.35);
    this.maxDistance = Math.max(50, Math.floor(power * timingFactor * 45));

    // Determine target zone
    this.targetZone = ZONES[0];
    for (let i = ZONES.length - 1; i >= 0; i--) {
      if (this.maxDistance >= ZONES[i].minDist) {
        this.targetZone = ZONES[i];
        break;
      }
    }

    // Determine animal roll
    this.caughtAnimal = this.rollAnimal(this.targetZone, food.luckBonus);
  }

  rollAnimal(zone, luckBonus) {
    // Weighted selection of animal
    const totalWeight = zone.animals.reduce((acc, a) => acc + a.weight, 0);
    // Luck gives bias to higher index animals (more rare)
    let randomVal = Math.random() * totalWeight;
    let chosen = zone.animals[0];
    
    // Sort so rarer is picked if luck roll favors
    const sorted = [...zone.animals].reverse();
    for (const an of sorted) {
      const adjustedThreshold = (an.weight * luckBonus);
      if (Math.random() * 100 < (adjustedThreshold / totalWeight) * 100) {
        chosen = an;
        break;
      }
    }

    // Roll Mutation
    let mutation = 'Normal';
    const mutRoll = Math.random() * 100;
    // Luck bonus slightly boosts mutation roll
    const effLuck = Math.min(3, Math.sqrt(luckBonus));
    
    if (mutRoll < (MUTATION_DATA.Rainbow.chance * effLuck)) {
      mutation = 'Rainbow';
    } else if (mutRoll < (MUTATION_DATA.Emerald.chance * effLuck)) {
      mutation = 'Emerald';
    } else if (mutRoll < (MUTATION_DATA.Diamond.chance * effLuck)) {
      mutation = 'Diamond';
    } else if (mutRoll < (MUTATION_DATA.Gold.chance * effLuck)) {
      mutation = 'Gold';
    }

    return {
      id: chosen.id,
      name: chosen.name,
      icon: chosen.icon,
      rarity: chosen.rarity,
      baseCps: chosen.baseCps,
      zoneName: zone.name,
      mutation
    };
  }

  update(dt) {
    if (this.isThrowing) {
      // Flight duration takes 1.8 seconds
      this.throwProgress += dt / 1.8;
      this.currentDistance = Math.floor(this.maxDistance * Math.min(1, this.throwProgress));

      // Particle sparks behind food
      if (Math.random() < 0.6) {
        const throwY = this.height - 110 - Math.sin(this.throwProgress * Math.PI) * 160;
        this.particles.push({
          x: this.width * 0.45,
          y: throwY,
          vx: (Math.random() - 0.5) * 50 - 40,
          vy: (Math.random() - 0.5) * 40,
          life: 0.4,
          maxLife: 0.4,
          color: '#facc15'
        });
      }

      if (this.throwProgress >= 1) {
        this.isThrowing = false;
        if (this.onFinishCallback) {
          this.onFinishCallback(this.caughtAnimal, this.maxDistance, this.targetZone);
        }
      }
    } else {
      this.currentDistance = 0;
    }

    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  render(pullUpTraining = false) {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    // Current zone background
    const activeZone = this.isThrowing ? this.targetZone : ZONES[0];
    const grad = ctx.createLinearGradient(0, 0, 0, this.height);
    grad.addColorStop(0, activeZone.skyColor);
    grad.addColorStop(0.7, activeZone.bgGradient[1]);
    grad.addColorStop(1, activeZone.groundColor);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.width, this.height);

    // Render distant mountains & trees parallax
    this.renderEnvironment(activeZone);

    // Render track studs line
    this.renderTrack();

    // Render Character & Pull-up Bar or Thrower
    this.renderPlayer(pullUpTraining);

    // Render Flying Food
    if (this.isThrowing && this.foodItem) {
      this.renderFoodFlight();
    }

    // Render Particles
    for (const p of this.particles) {
      ctx.save();
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.life / p.maxLife;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Render Distance HUD in Canvas
    this.renderCanvasHud();
  }

  renderEnvironment(zone) {
    const ctx = this.ctx;
    const horizon = this.height - 90;

    // Distant Hills
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.moveTo(0, horizon);
    for (let x = 0; x <= this.width; x += 80) {
      const hillH = Math.sin((x + (this.currentDistance * 0.1)) * 0.015) * 35;
      ctx.lineTo(x, horizon - 30 + hillH);
    }
    ctx.lineTo(this.width, horizon);
    ctx.closePath();
    ctx.fill();

    // Ground Plane
    ctx.fillStyle = zone.groundColor;
    ctx.fillRect(0, horizon, this.width, 90);

    // Ground grass/dust dots
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    for (let i = 0; i < this.width; i += 40) {
      const offsetX = (i - (this.currentDistance % 40));
      ctx.fillRect(offsetX, horizon + 20, 15, 3);
      ctx.fillRect(offsetX + 15, horizon + 45, 25, 4);
    }
  }

  renderTrack() {
    const ctx = this.ctx;
    const horizon = this.height - 90;

    // Lane border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, horizon);
    ctx.lineTo(this.width, horizon);
    ctx.stroke();

    // Distance markers on track
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    for (let mark = 0; mark < this.width; mark += 120) {
      const distLabel = Math.floor(this.currentDistance + mark * 1.5);
      ctx.fillText(`⚑ ${distLabel}m`, mark + 60, horizon + 30);
    }
  }

  renderPlayer(isTraining) {
    const ctx = this.ctx;
    const baseY = this.height - 90;
    const charX = 80;

    ctx.save();
    if (isTraining) {
      // Pull-Up Stand
      ctx.fillStyle = '#64748b';
      // Poles
      ctx.fillRect(charX - 25, baseY - 130, 8, 130);
      ctx.fillRect(charX + 25, baseY - 130, 8, 130);
      // Top Bar
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(charX - 35, baseY - 135, 78, 10);

      // Character doing pull-up animation
      const animOffset = Math.sin(Date.now() * 0.008) * 16;
      const charY = baseY - 70 + animOffset;

      // Body (Roblox blocky style)
      ctx.fillStyle = '#3b82f6'; // Blue Torso
      ctx.fillRect(charX - 14, charY - 24, 28, 30);

      // Head
      ctx.fillStyle = '#fef08a'; // Yellow head
      ctx.beginPath();
      ctx.arc(charX, charY - 36, 12, 0, Math.PI * 2);
      ctx.fill();

      // Arms up to bar
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(charX - 10, charY - 20);
      ctx.lineTo(charX - 20, baseY - 130);
      ctx.moveTo(charX + 10, charY - 20);
      ctx.lineTo(charX + 20, baseY - 130);
      ctx.stroke();

      // Legs
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(charX - 12, charY + 6, 10, 22);
      ctx.fillRect(charX + 2, charY + 6, 10, 22);

      // Sweat / Effort particle
      ctx.fillStyle = '#38bdf8';
      ctx.font = '14px sans-serif';
      ctx.fillText('💪', charX + 28, charY - 25);
    } else {
      // Standing ready to throw
      const charY = baseY - 28;

      // Body
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(charX - 14, charY - 24, 28, 32);

      // Head
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(charX, charY - 38, 13, 0, Math.PI * 2);
      ctx.fill();

      // Legs
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(charX - 12, charY + 8, 10, 22);
      ctx.fillRect(charX + 2, charY + 8, 10, 22);

      // Arm holding food or posing
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(charX + 10, charY - 18, 18, 8);

      if (!this.isThrowing && this.foodItem) {
        ctx.font = '22px sans-serif';
        ctx.fillText(this.foodItem.icon, charX + 28, charY - 14);
      }
    }
    ctx.restore();
  }

  renderFoodFlight() {
    const ctx = this.ctx;
    // Parabolic arc
    const startX = 110;
    const endX = this.width * 0.75;
    const currentX = startX + (endX - startX) * Math.min(1, this.throwProgress * 1.1);

    const arcHeight = 170;
    const currentY = (this.height - 110) - Math.sin(this.throwProgress * Math.PI) * arcHeight;

    ctx.save();
    ctx.translate(currentX, currentY);
    ctx.rotate(this.throwProgress * Math.PI * 6); // Spinning food
    ctx.font = '36px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.foodItem.icon, 0, 0);
    ctx.restore();

    // Target landing shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(currentX, this.height - 85, 20, 6, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  renderCanvasHud() {
    const ctx = this.ctx;
    if (this.isThrowing) {
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 18px Inter, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 6;
      ctx.fillText(`🚀 Meluncur ke: ${this.targetZone.name} (${this.currentDistance} studs)`, this.width / 2, 45);
      ctx.shadowBlur = 0;
    }
  }
}

