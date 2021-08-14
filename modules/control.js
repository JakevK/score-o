import config from "./config.js";

export default class Control {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.next = null;
    this.previous = null;
    this.isStart = false;
    this.radius = config.controlRadius;
    // this.path = this.setPath();
  }

  drawCircle(context, radius = this.radius) {
    context.beginPath();
    context.arc(this.x, this.y, radius, 0, 2 * Math.PI);
    context.stroke();
  }
  drawInnerCircle = (context) => this.drawCircle(context, this.radius * 0.8);
  drawTriangle(context) {
    const radius = this.radius * 1.4;
    const cornerCoords = (radius, cornerIndex) => {
      const angle = (1 / 3) * (2 * Math.PI) * cornerIndex + Math.PI / 6;
      return [
        radius * Math.cos(angle) + this.x,
        radius * Math.sin(angle) + this.y,
      ];
    };
    context.beginPath();
    context.moveTo(...cornerCoords(radius, 0));
    [1, 2, 0].map((n) => context.lineTo(...cornerCoords(radius, n)));
    context.stroke();
  }

  setPath() {
    const path = new Path2D();
    this.drawCircle(path);
  }

  render(context) {
    context.strokeStyle = config.colors.purple;
    context.lineWidth = config.lineWidth;
    this.drawCircle(context);
    if (this.isStart) {
      this.drawInnerCircle(context);
      this.drawTriangle(context);
    }
  }
}
