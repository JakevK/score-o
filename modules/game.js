import config from "./config.js";
import Course from "./course.js";

export default class Game {
  constructor() {
    this.setUpCanvas();
  }

  newCourse(n) {
    this.course = new Course(n, this.context);
  }

  setUpCanvas() {
    this.canvas = document.getElementById(config.canvasID);
    this.canvas.width = config.canvasWidth;
    this.canvas.height = config.canvasHeight;

    if (this.canvas.getContext) {
      this.context = this.canvas.getContext("2d");
    } else {
      console.log("canvas unsupported");
    }
  }

  render() {
    this.context.clearRect(0, 0, config.canvasWidth, config.canvasHeight);
    for (const control of this.course.controls) {
      control.render(this.context);
    }
  }
}
