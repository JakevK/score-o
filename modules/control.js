export default class Control {
  constructor(x, y, radius, canvas, colors, lineWidth) {
    this.x = x;
    this.y = y;
    this.neighbours = [];
    this.optimalNeighbours = [];
    this.isStart = false;
    this.colors = colors;
    this.radius = radius;
    this.canvas = canvas;
    this.lineWidth = lineWidth;
    this.hovered = false;
    this.selected = false;
  }

  coordinates() {
    return [this.x, this.y];
  }
  next() {
    return this.optimalNeighbours[1];
  }
  prev() {
    return this.optimalNeighbours[0];
  }

  drawCircle(path, radius) {
    path.arc(this.x, this.y, radius, 0, 2 * Math.PI);
  }
  drawInnerCircle = (path, radius) => this.drawCircle(path, radius * 0.8);
  drawTriangle(path, radius) {
    radius = radius * 1.4;
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
    const radius = this.radius * (this.selected || this.hovered ? 1.2 : 1);
    const path = new Path2D();
    this.drawCircle(path, radius);
    if (this.isStart) {
      this.drawInnerCircle(path, radius);
      this.drawTriangle(path, radius);
    }
    return path;
  }

  render() {
    this.canvas.context.strokeStyle =
      this.selected || this.hovered ? this.colors.red : this.colors.purple;
    this.canvas.context.lineWidth = this.lineWidth;
    this.canvas.context.fillStyle = this.colors.white;
    this.canvas.context.fill(this.path());
    this.canvas.context.stroke(this.path());
  }
}
