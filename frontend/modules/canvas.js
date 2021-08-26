export default class Canvas {
  constructor(elementId, width = 600, height = 600) {
    this.canvas = document.getElementById(elementId);

    this.canvas.width = width;
    this.canvas.height = height;
    this.width = width;
    this.height = height;

    if (this.canvas.getContext) {
      this.context = this.canvas.getContext("2d");
    } else {
      console.log("canvas unsupported");
    }

    this.onMouseMove;
    this.onClick;

    this.canvas.addEventListener("mousemove", (e) =>
      this.onMouseMove(e.offsetX, e.offsetY)
    );
    this.canvas.addEventListener("click", (e) =>
      this.onClick(e.offsetX, e.offsetY)
    );
  }
}
