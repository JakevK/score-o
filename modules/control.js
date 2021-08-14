import config from "./config.js";

export default class Control {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.neighbours = [];
    this.optimalNeighbours = [];
    this.isStart = false;
    this.radius = config.controlRadius;
    this.hovered = false;
    this.clicked = false;
  }

  coordinates() {
    return [this.x, this.y];
  }

  drawCircle(path, radius = this.radius) {
    path.arc(this.x, this.y, radius, 0, 2 * Math.PI);
  }
  drawInnerCircle = (path) => this.drawCircle(path, this.radius * 0.8);
  drawTriangle(path) {
    const radius = this.radius * 1.4;
    const cornerCoords = (radius, cornerIndex) => {
      const angle = (1 / 3) * (2 * Math.PI) * cornerIndex + Math.PI / 6;
      return [
        radius * Math.cos(angle) + this.x,
        radius * Math.sin(angle) + this.y,
      ];
    };
    path.moveTo(...cornerCoords(radius, 0));
    [1, 2, 0].map((n) => path.lineTo(...cornerCoords(radius, n)));
  }

  path() {
    this.radius =
      config.controlRadius * (this.clicked || this.hovered ? 1.2 : 1);
    const path = new Path2D();
    this.drawCircle(path);
    if (this.isStart) {
      this.drawInnerCircle(path);
      this.drawTriangle(path);
    }
    return path;
  }

  render(context) {
    context.strokeStyle =
      this.clicked || this.hovered ? config.colors.red : config.colors.purple;
    context.lineWidth = config.lineWidth;
    context.fillStyle = config.colors.white;
    context.fill(this.path());
    context.stroke(this.path());
  }
}
