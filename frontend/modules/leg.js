export default class Leg {
  constructor(start, finish, colors, width, canvas) {
    this.start = start;
    this.finish = finish;
    this.colors = colors;
    this.width = width;
    this.canvas = canvas;
    this.hovered = false;
    this.path;
    this.createPath();
  }

  createPath() {
    this.path = new Path2D();
    this.path.moveTo(...this.start.coordinates());
    this.path.lineTo(...this.finish.coordinates());
  }

  render() {
    this.canvas.context.strokeStyle = this.hovered
      ? this.colors.red
      : this.colors.purple;
    this.canvas.context.lineWidth = this.width;
    this.canvas.context.stroke(this.path);
  }
}
