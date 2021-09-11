import Canvas from "../modules/canvas.js";
import Course from "../modules/course.js";
import Control from "../modules/control.js";

class Tsp {
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
      green: "#00FF00",
    };
  }
  setDefaults() {
    this.controlRadius = 15;
    this.lineWidth = this.controlRadius / 10;
  }
  initializeGame() {
    this.canvas = new Canvas("game-canvas");
    this.course = new Course(
      0,
      this.canvas,
      this.colors,
      this.controlRadius,
      this.lineWidth
    );
    this.canvas.onClick = (x, y) => this.handleClick(x, y);
    this.canvas.onMouseMove = (x, y) => this.handleMouseMove(x, y);
    this.canvas.onMouseOut = (x, y) => this.handleMouseOut(x, y);
    this.canvas.canvas.style.cursor = "none";
  }
  setInput(id, event, onEvent) {
    const element = document.getElementById(id);
    element.addEventListener(event, (e) => onEvent(e));
  }
  setInputs() {
    this.setInput("clear-btn", "click", (e) => {
      this.course.controls = [];
      this.render();
    });
    this.setInput("gen-btn", "click", (e) => {
      const courseSize = document.getElementById("num-inpt").value;
      this.course.generateControls(courseSize);
      this.course.findOptimalRoute();
      this.render();
    });
  }

  /* -------------- mouse actions -------------- */
  handleClick(x, y) {
    this.course.controls.push(
      new Control(
        x,
        y,
        this.controlRadius,
        this.canvas,
        this.colors,
        this.lineWidth
      )
    );
    this.course.findOptimalRoute();
    this.render();
  }
  handleMouseMove(x, y) {
    this.hoverControl = new Control(
      x,
      y,
      this.controlRadius,
      this.canvas,
      this.colors,
      this.lineWidth
    );
    this.hoverControl.color = this.colors.red;
    this.render();
  }
  handleMouseOut(x, y) {
    this.hoverControl = null;
    this.render();
  }

  /* -------------- render -------------- */
  render() {
    // clear the canvas
    this.canvas.context.fillStyle = this.colors.white;
    this.canvas.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.course.renderOptimalRoute(false);
    this.course.renderControls();

    if (this.hoverControl) {
      this.hoverControl.render();
    }

    document.getElementById("distance").innerHTML = parseInt(
      this.course.optimalRouteDistance()
    );
  }
}

let tsp = new Tsp();
