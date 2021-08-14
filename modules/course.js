import config from "./config.js";
import Control from "./control.js";

export default class Course {
  constructor(n, context) {
    this.generateControls(n, context);
  }

  axisCollision(s1, s2) {
    const margin = config.controlRadius * 4;
    const s1Start = s1 - margin;
    const s1End = s1 + margin;
    return s1Start <= s2 && s2 <= s1End;
  }
  controlsDoCollide(a, b) {
    return this.axisCollision(a.x, b.x) && this.axisCollision(a.y, b.y);
  }
  collisionExists(control) {
    let collision = false;
    for (const existingControl of this.controls) {
      if (this.controlsDoCollide(control, existingControl)) {
        collision = true;
      }
    }
    return collision;
  }

  randomControl() {
    const coordinate = (bounds) =>
      parseInt(Math.random() * (bounds - 2 * config.controlRadius)) +
      config.controlRadius;
    const controlX = coordinate(config.canvasWidth);
    const controlY = coordinate(config.canvasHeight);
    return new Control(controlX, controlY);
  }
  generateControls(n, context) {
    this.controls = [];
    for (let i = 0; i < n; i++) {
      let control;
      while (true) {
        control = this.randomControl(context);
        if (!this.collisionExists(control)) break;
      }
      if (!this.controls.length) {
        control.isStart = true;
      }
      this.controls.push(control);
    }
  }

  clearRoute() {
    for (const control of this.controls) {
      control.neighbours = [];
      control.clicked = false;
    }
  }

  routeIsComplete() {
    return this.controls.every((control) => control.neighbours.length === 2);
  }

  distanceBetweenControls(a, b) {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
  }
  routeDistance() {
    let distance = 0;
    for (const control of this.controls) {
      for (const neighbour of control.neighbours) {
        distance += this.distanceBetweenControls(neighbour, control);
      }
    }
    return distance / 2;
  }

  render(context) {
    // leg lines
    for (const control of this.controls) {
      for (const neighbour of control.neighbours) {
        context.strokeStyle = config.colors.purple;
        context.lineWidth = config.lineWidth;
        context.beginPath();
        context.moveTo(...control.coordinates());
        context.lineTo(...neighbour.coordinates());
        context.stroke();
      }
    }
    // render controls
    for (const control of this.controls) {
      control.render(context);
    }
  }
}
