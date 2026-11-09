export class RetroRadar {
  constructor(canvas, world) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.world = world;
    this.size = 110;
    this.canvas.width = this.size;
    this.canvas.height = this.size;
  }

  render() {
    const ctx = this.ctx;
    const center = this.size / 2;
    const scale = 1.2;

    ctx.clearRect(0, 0, this.size, this.size);

    // Pixel box background
    ctx.fillStyle = '#181425';
    ctx.fillRect(0, 0, this.size, this.size);

    // Crossy grid lines
    ctx.strokeStyle = '#262b44';
    ctx.lineWidth = 1;
    ctx.strokeRect(4, 4, this.size - 8, this.size - 8);
    ctx.beginPath();
    ctx.moveTo(center, 4);
    ctx.lineTo(center, this.size - 4);
    ctx.moveTo(4, center);
    ctx.lineTo(this.size - 4, center);
    ctx.stroke();

    const pPos = this.world.avatar.position;

    // Draw Stations as little square pixels
    for (const st of this.world.worldZones) {
      const rx = (st.pos.x - pPos.x) * scale;
      const rz = (st.pos.z - pPos.z) * scale;
      const sx = center + rx;
      const sy = center + rz;

      if (sx >= 4 && sx <= this.size - 8 && sy >= 4 && sy <= this.size - 8) {
        ctx.fillStyle = st.color;
        ctx.fillRect(sx - 2, sy - 2, 5, 5);
      }
    }

    // Player marker (Yellow pixel square)
    ctx.fillStyle = '#fee761';
    ctx.fillRect(center - 2, center - 2, 5, 5);

    // Outer border
    ctx.strokeStyle = '#5a6988';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, this.size - 2, this.size - 2);
  }
}
