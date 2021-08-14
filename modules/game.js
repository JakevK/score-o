import config from "./config.js";
import Course from "./course.js";

export default class Game {
  constructor() {
    this.setUpCanvas();
    this.canvas.addEventListener("mousemove", (e) => this.onMouseMove(e));
    this.canvas.addEventListener("click", (e) => this.onClick(e));
    this.showOptimal = false;
  }

  onMouseMove(e) {
    for (const control of this.course.controls) {
      if (
        this.context.isPointInPath(control.path(), e.offsetX, e.offsetY) &&
        control.neighbours.length < 2
      ) {
        control.hovered = true;
      } else {
        control.hovered = false;
      }
    }
    this.render([e.offsetX, e.offsetY]);
  }
  onClick(e) {
    let clickedOnControl = false;
    for (const control of this.course.controls) {
      if (
        this.context.isPointInPath(control.path(), e.offsetX, e.offsetY) &&
        control.neighbours.length < 2
      ) {
        clickedOnControl = true;
        const previousControl = this.course.controls.filter(
          (c) => c.clicked && c !== control
        )[0];

        if (previousControl) {
          previousControl.clicked = false;
          previousControl.neighbours.push(control);
          control.neighbours.push(previousControl);
          let results = document.getElementById("results-box");
          if (this.course.routeIsComplete()) {
            results.innerHTML =
              "Your route is " +
              parseInt(this.course.routeDistance()) +
              " meters long";
          } else {
            results.innerHTML = "";
          }
        }
        if (control.neighbours.length < 2) {
          control.clicked = true;
        } else {
          control.hovered = false;
        }
      }
    }
    if (!clickedOnControl) {
      this.course.controls.map((c) => {
        c.clicked = false;
      });
    }
    this.render([e.offsetX, e.offsetY]);
  }

  newCourse(n) {
    this.course = new Course(n, this.context);
  }
  clearCourse() {
    this.course.clearRoute();
    document.getElementById("results-box").innerHTML = "";
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

  render(mouseCoords) {
    // clear the canvas
    this.context.fillStyle = config.colors.white;
    this.context.fillRect(0, 0, config.canvasWidth, config.canvasHeight);
    // render line for selection
    for (const control of this.course.controls) {
      if (control.clicked) {
        this.context.strokeStyle = config.colors.red;
        this.context.lineWidth = config.lineWidth;
        this.context.beginPath();
        this.context.moveTo(...control.coordinates());
        this.context.lineTo(...mouseCoords);
        this.context.stroke();
      }
    }
    // show results
    document.getElementById("optimal-results-box").innerHTML = this.showOptimal
      ? "The optimal route is " +
        parseInt(this.course.routeDistance(true)) +
        " meters long"
      : "";
    // render the course
    this.course.render(this.context, this.showOptimal);
  }
}
