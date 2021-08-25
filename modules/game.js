import Canvas from "./canvas.js";
import Course from "./course.js";

export default class Game {
  constructor() {
    this.setColors();
    this.setDefaults();
    this.setInputs();
    this.initializeGame();
  }

  /* -------------- setup -------------- */
  setColors() {
    this.colors = {
      purple: "#A626FF",
      red: "#e00b41",
      white: "#FFFFFF",
    };
  }
  setDefaults() {
    this.numberOfControls = 20;
    this.controlRadius = 15;
    this.lineWidth = this.controlRadius / 10;
    this.showOptimal = false;
  }
  initializeGame() {
    this.canvas = new Canvas("game-canvas");
    this.newCourse();
    this.canvas.onMouseMove = (x, y) => this.handleMouseMove(x, y);
    this.canvas.onClick = (x, y) => this.handleClick(x, y);
  }
  setInput(id, event, onEvent) {
    const element = document.getElementById(id);
    element.addEventListener(event, (e) => onEvent(e));
  }
  setInputs() {
    this.setInput("clear-btn", "click", (e) => {
      this.course.clearRoute();
      document.getElementById("submit-btn").style.display = "none";
      document.getElementById("text-box").innerHTML = "Go ahead. Plan a route";
      this.render();
    });
    this.setInput("submit-btn", "click", (e) => {
      if (!this.course.routeIsComplete()) {
        return;
      }
      document.getElementById("clear-btn").style.display = "none";
      document.getElementById("submit-btn").style.display = "none";
      document.getElementById("next-btn").style.display = "block";
      const routeDistance = parseInt(this.course.routeDistance());
      const optimalRouteDistance = parseInt(this.course.optimalRouteDistance());
      let message;
      if (routeDistance > optimalRouteDistance) {
        const percentage = parseInt(
          100 - (optimalRouteDistance / routeDistance) * 100
        );
        this.showOptimal = true;
        message = `I found a route ${percentage}% shorter than yours.  Have a look.`;
      } else {
        message =
          "Far out!  That's a good route.  I couldn't think of a better one myself.";
      }
      message += `\noptimal: ${optimalRouteDistance}\nyours: ${routeDistance}`;
      document.getElementById("text-box").innerHTML = message;
      this.render();
    });
    this.setInput("next-btn", "click", (e) => {
      this.newCourse();
    });
  }

  /* -------------- mouse actions -------------- */
  handleMouseMove(x, y) {
    this.course.controls.map((control) => {
      control.hovered =
        this.canvas.context.isPointInPath(control.path(), x, y) &&
        control.neighbours.length < 2;
    });
    this.render([x, y]);
  }
  handleClick(x, y) {
    let clickedOnControl = false;
    for (const control of this.course.controls) {
      if (
        this.canvas.context.isPointInPath(control.path(), x, y) &&
        control.neighbours.length < 2
      ) {
        clickedOnControl = true;
        const previousControl = this.course.controls.filter(
          (c) => c.selected && c !== control
        )[0];

        if (previousControl) {
          previousControl.selected = false;
          previousControl.neighbours.push(control);
          control.neighbours.push(previousControl);
          if (this.course.routeIsComplete()) {
            document.getElementById("submit-btn").style.display = "block";
            document.getElementById("text-box").innerHTML = "Are you done?";
          }
        }
        if (control.neighbours.length < 2) {
          control.selected = true;
        } else {
          control.hovered = false;
        }
      }
    }
    if (!clickedOnControl) {
      this.course.controls.map((c) => {
        c.selected = false;
      });
    }
    this.render([x, y]);
  }

  /* -------------- specific actions -------------- */
  newCourse() {
    this.course = new Course(
      this.numberOfControls,
      this.canvas,
      this.colors,
      this.controlRadius,
      this.lineWidth
    );
    document.getElementById("clear-btn").style.display = "block";
    document.getElementById("submit-btn").style.display = "none";
    document.getElementById("next-btn").style.display = "none";
    document.getElementById("text-box").innerHTML = "Go ahead. Plan a route!";
    this.showOptimal = false;
    this.render();
  }

  /* -------------- render -------------- */
  render(mouseCoords) {
    // clear the canvas
    this.canvas.context.fillStyle = this.colors.white;
    this.canvas.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

    //this.showOptimal = true;
    if (this.showOptimal) this.course.renderOptimalRoute();
    this.course.render(mouseCoords);
  }
}
