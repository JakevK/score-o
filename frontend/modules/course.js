import Control from "./control.js";

export default class Course {
  constructor(n, canvas, colors, controlRadius, lineWidth) {
    this.canvas = canvas;
    this.colors = colors;
    this.lineWidth = lineWidth;
    this.controlRadius = controlRadius;
    this.generateControls(n);
    this.findOptimalRoute();
  }

  axisCollision(s1, s2) {
    const margin = this.controlRadius * 4;
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
      parseInt(Math.random() * (bounds - 4 * this.controlRadius)) +
      this.controlRadius * 2;
    const controlX = coordinate(this.canvas.width);
    const controlY = coordinate(this.canvas.height);
    return new Control(
      controlX,
      controlY,
      this.controlRadius,
      this.canvas,
      this.colors,
      this.lineWidth
    );
  }
  generateControls(n) {
    this.controls = [];
    for (let i = 0; i < n; i++) {
      let control;
      while (true) {
        control = this.randomControl();
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
      control.selected = false;
    }
  }

  routeIsComplete() {
    return this.controls.every((control) => control.neighbours.length === 2);
  }

  controlDistance(a, b) {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
  }
  routeDistance() {
    let distance = 0;
    for (const control of this.controls) {
      for (const neighbour of control.neighbours) {
        distance += this.controlDistance(neighbour, control);
      }
    }
    return distance / 2;
  }
  measureRoute(controls) {
    let distance = 0;
    for (let i = 0; i < controls.length; i++) {
      distance += this.controlDistance(
        controls[i],
        controls[(i + 1) % controls.length]
      );
    }
    return distance;
  }
  optimalRouteDistance() {
    let distance = 0;
    for (let i = 0; i < this.controls.length; i++) {
      distance += this.controlDistance(
        this.controls[i],
        this.controls[(i + 1) % this.controls.length]
      );
    }
    return distance;
  }

  control(i) {
    i = i % this.controls.length;
    if (i < 0) {
      i += this.controls.length;
    }
    return this.controls[i];
  }

  simulatedAnnealing() {
    let temperature = 1000;
    while (temperature > 0.1) {
      for (let n = 0; n < 100; n++) {
        const i = parseInt(Math.random() * (this.controls.length - 1));
        const j = parseInt(Math.random() * (this.controls.length - i - 2)) + i;

        const costDiff =
          this.controlDistance(this.control(i), this.control(i - 1)) +
          this.controlDistance(this.control(j), this.control(j + 1)) -
          (this.controlDistance(this.control(i), this.control(j + 1)) +
            this.controlDistance(this.control(j), this.control(i - 1)));

        if (
          costDiff >= 0 ||
          Math.random() <= Math.E ** (costDiff / temperature)
        ) {
          let section = this.controls.splice(i, j - i + 1);
          this.controls.splice(i, 0, ...section.reverse());
        }
      }
      temperature = temperature * 0.99;
    }
  }
  twoOpt() {
    while (true) {
      let improved = false;

      for (let i = 0; i < this.controls.length - 2; i++) {
        for (let j = i + 1; j < this.controls.length - 1; j++) {
          let currDistance =
            this.controlDistance(this.control(i), this.control(i - 1)) +
            this.controlDistance(this.control(j), this.control(j + 1));
          let newDistance =
            this.controlDistance(this.control(i), this.control(j + 1)) +
            this.controlDistance(this.control(j), this.control(i - 1));

          if (newDistance < currDistance) {
            let section = this.controls.splice(i, j - i + 1);
            this.controls.splice(i, 0, ...section.reverse());
            improved = true;
          }
        }
      }

      if (!improved) return;
    }
  }
  findOptimalRoute() {
    this.simulatedAnnealing();
    this.twoOpt();
  }

  render(mouseCoords) {
    // leg lines
    for (const control of this.controls) {
      for (const neighbour of control.neighbours) {
        this.canvas.context.strokeStyle = this.colors.purple;
        this.canvas.context.lineWidth = this.lineWidth;
        this.canvas.context.beginPath();
        this.canvas.context.moveTo(...control.coordinates());
        this.canvas.context.lineTo(...neighbour.coordinates());
        this.canvas.context.stroke();
      }
      if (control.selected) {
        this.canvas.context.strokeStyle = this.colors.red;
        this.canvas.context.lineWidth = this.lineWidth;
        this.canvas.context.beginPath();
        this.canvas.context.moveTo(...control.coordinates());
        this.canvas.context.lineTo(...mouseCoords);
        this.canvas.context.stroke();
      }
    }
    // selection line

    // render controls
    for (const control of this.controls) {
      control.render();
    }
  }
  renderOptimalRoute() {
    this.canvas.context.strokeStyle = this.colors.green;
    this.canvas.context.lineWidth = this.lineWidth * 10;
    for (let i = 0; i < this.controls.length; i++) {
      this.canvas.context.beginPath();
      this.canvas.context.moveTo(...this.controls[i].coordinates());
      this.canvas.context.lineTo(
        ...this.controls[(i + 1) % this.controls.length].coordinates()
      );
      this.canvas.context.stroke();
    }
  }
}
