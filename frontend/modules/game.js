import Canvas from "./canvas.js";
import Course from "./course.js";
import Leg from "./leg.js";

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
      green: "#00FF00",
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
      document.getElementById("text-box").innerHTML = "Go ahead. Plan a route!";
      this.render();
    });
    this.setInput("submit-btn", "click", (e) => {
      if (!this.course.routeIsComplete()) {
        return;
      }
      this.submitted = true;
      document.getElementById("clear-btn").style.display = "none";
      document.getElementById("submit-btn").style.display = "none";
      document.getElementById("next-btn").style.display = "inline-block";
      const routeDistance = parseInt(this.course.routeDistance());
      const optimalRouteDistance = parseInt(this.course.optimalRouteDistance());
      let message;
      if (routeDistance > optimalRouteDistance) {
        let percentage = 100 - (optimalRouteDistance / routeDistance) * 100;
        percentage =
          percentage > 1
            ? parseInt(percentage)
            : parseFloat(percentage).toPrecision(1);
        this.showOptimal = true;
        message =
          percentage <= 1
            ? `Very impressive!  The route I found is only ${percentage}% shorter than yours.  Have a look.`
            : percentage <= 5
            ? `Your route is good, but I still managed to find one ${percentage}% shorter.  Here it is!`
            : percentage <= 10
            ? `Not too bad!  Here's a route I found.  It's ${percentage}% shorter than the one you planned.`
            : percentage <= 20
            ? `Better luck next time!  I found a route ${percentage}% shorter than yours.`
            : percentage <= 50
            ? `It looks like you have some work to do.  The route I found is ${percentage}% shorter than yours`
            : `Are you even trying?!  I found a route ${percentage}% shorter than yours.`;
      } else {
        message =
          "Far out!  That's a good route.  I couldn't think of a better one myself.";
      }
      document.getElementById("text-box").innerHTML = message;
      this.render();
    });
    this.setInput("next-btn", "click", (e) => {
      this.newCourse();
    });
  }

  /* -------------- mouse actions -------------- */
  handleMouseMove(x, y) {
    let hoveredOnControl = false;
    let clickedOnControl = false;
    let hoveredOnLeg = false;

    if (!this.submitted) {
      this.course.controls.map((control) => {
        control.hovered =
          this.canvas.context.isPointInPath(control.path(), x, y) &&
          control.neighbours.length < 2;
        if (control.hovered) {
          hoveredOnControl = true;
        }
        if (control.selected) {
          clickedOnControl = true;
        }
      });

      this.course.legs.map((leg) => {
        leg.hovered =
          this.canvas.context.isPointInStroke(leg.path, x, y) &&
          !hoveredOnControl &&
          !clickedOnControl;
        if (leg.hovered) {
          hoveredOnLeg = true;
        }
      });
    }

    this.canvas.canvas.style.cursor = this.submitted
      ? "default"
      : hoveredOnControl
      ? "pointer"
      : clickedOnControl
      ? "grabbing"
      : hoveredOnLeg
      ? "not-allowed"
      : "default";
    this.render([x, y]);
  }
  handleClick(x, y) {
    let clickedOnControl = false;
    let mouseOverControl = false;
    for (const control of this.course.controls) {
      if (this.canvas.context.isPointInPath(control.path(), x, y)) {
        mouseOverControl = true;
        if (control.neighbours.length >= 2) break;
        clickedOnControl = true;
        const previousControl = this.course.controls.filter(
          (c) => c.selected && c !== control
        )[0];

        if (previousControl) {
          previousControl.selected = false;
          previousControl.neighbours.push(control);
          control.neighbours.push(previousControl);
          this.course.legs.push(
            new Leg(
              previousControl,
              control,
              this.colors,
              this.lineWidth,
              this.canvas
            )
          );
          if (this.course.routeIsComplete()) {
            document.getElementById("submit-btn").style.display =
              "inline-block";
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
    let controlWasSelected = false;
    if (!clickedOnControl) {
      this.course.controls.map((c) => {
        if (c.selected) controlWasSelected = true;
        c.selected = false;
      });
      if (!mouseOverControl && !controlWasSelected) {
        if (this.submitted) return;

        for (const leg of this.course.legs) {
          if (this.canvas.context.isPointInStroke(leg.path, x, y)) {
            leg.start.neighbours.splice(
              leg.start.neighbours.indexOf(leg.finish),
              1
            );
            leg.finish.neighbours.splice(
              leg.finish.neighbours.indexOf(leg.start),
              1
            );
            this.course.legs.splice(this.course.legs.indexOf(leg), 1);
            this.handleMouseMove();
            break;
          }
        }
      }
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
    document.getElementById("clear-btn").style.display = "inline-block";
    document.getElementById("submit-btn").style.display = "none";
    document.getElementById("next-btn").style.display = "none";
    document.getElementById("text-box").innerHTML = "Go ahead. Plan a route!";
    this.submitted = false;
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
