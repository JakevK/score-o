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

  nearestNeighbourIndex(control, neighbours) {
    let nnIndex = null;
    let nearestDistance = this.canvas.height + this.canvas.width;
    for (let i = 0; i < neighbours.length; i++) {
      const distance = this.distanceBetweenControls(control, neighbours[i]);
      if (distance < nearestDistance) {
        nnIndex = i;
        nearestDistance = distance;
      }
    }
    return nnIndex;
  }
  findOptimalRoute() {
    let unVisited = this.controls.slice(1);
    let current = this.controls[0];
    while (unVisited.length) {
      let nnIndex = this.nearestNeighbourIndex(current, unVisited);
      let next = unVisited.splice(nnIndex, 1)[0];
      current.optimalNeighbours.push(next);
      next.optimalNeighbours.push(current);
      current = next;
    }
    current.optimalNeighbours.push(this.controls[0]);
    this.controls[0].optimalNeighbours.push(current);
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
