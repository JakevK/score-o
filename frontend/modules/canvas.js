export default class Canvas {
  constructor(elementId, width = 500, height = 707) {
    this.canvas = document.getElementById(elementId);

    this.height = height;
    this.width = width;
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    if (this.canvas.getContext) {
      this.context = this.canvas.getContext("2d");
    } else {
      console.log("canvas unsupported");
    }

    this.onMouseMove = () => {};
    this.onClick = () => {};
    this.onMouseOut = () => {};

    this.canvas.addEventListener("mousemove", (e) => {
      this.onMouseMove(e.offsetX, e.offsetY);
    });
    this.canvas.addEventListener("click", (e) => {
      this.onClick(e.offsetX, e.offsetY);
    });
    this.canvas.addEventListener("mouseleave", (e) => {
      this.onMouseOut(e.offsetX, e.offsetY);
    });
  }
}
