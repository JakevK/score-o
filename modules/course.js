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
      parseInt(Math.random() * (bounds - 2 * this.controlRadius)) +
      this.controlRadius;
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

  distanceBetweenControls(a, b) {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
  }
  calculateRouteDistance(neighbourType) {
    let distance = 0;
    for (const control of this.controls) {
      for (const neighbour of control[neighbourType]) {
        distance += this.distanceBetweenControls(neighbour, control);
      }
    }
    return distance / 2;
  }
  routeDistance() {
    return this.calculateRouteDistance("neighbours");
  }
  optimalRouteDistance() {
    return this.calculateRouteDistance("optimalNeighbours");
  }

  findRandomRoute() {
    let unVisited = this.controls.slice(1);
    let current = this.controls[0];
    while (unVisited.length) {
      let next = unVisited.splice(
        parseInt(Math.random * unVisited.length),
        1
      )[0];
      current.optimalNeighbours.push(next);
      next.optimalNeighbours.push(current);
      current = next;
    }
    current.optimalNeighbours.push(this.controls[0]);
    this.controls[0].optimalNeighbours.unshift(current);
  }
  twoOpt() {
    while (true) {
      let improved = false;

      for (let i = 0; i < this.controls.length - 1; i++) {
        for (let j = i; j < this.controls.length; j++) {
          let control1 = this.controls[i];
          let control2 = this.controls[j];

          if (control1.next() === control2 || control2.next() === control1)
            continue;

          let currentDistance =
            this.distanceBetweenControls(control1, control1.next()) +
            this.distanceBetweenControls(control2, control2.next());

          let improvedDistance =
            this.distanceBetweenControls(control1, control2) +
            this.distanceBetweenControls(control2.next(), control1.next());

          if (improvedDistance < currentDistance) {
            const temp = this.controls[i].next();
            console.log(temp);
            this.controls[i].next().optimalNeighbours[0] = this.controls[j];
            this.controls[j].next().optimalNeighbours[0] = this.controls[i];
            this.controls[i].optimalNeighbours[1] = this.controls[j].next();
            this.controls[j].optimalNeighbours[1] = temp;
          }
        }
      }

      if (!improved) return;
    }
  }
  findOptimalRoute() {
    this.findRandomRoute();
    console.log(this.controls.map((control) => control.optimalNeighbours));
    this.twoOpt();
    console.log(this.controls.map((control) => control.optimalNeighbours));
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
    this.canvas.context.strokeStyle = "#00FF00";
    this.canvas.context.lineWidth = this.lineWidth * 10;
    for (const control of this.controls) {
      for (const neighbour of control.optimalNeighbours) {
        this.canvas.context.beginPath();
        this.canvas.context.moveTo(...control.coordinates());
        this.canvas.context.lineTo(...neighbour.coordinates());
        this.canvas.context.stroke();
      }
    }
  }
}
