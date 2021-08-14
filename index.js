import Game from "./modules/game.js";

let game = new Game();
setInterval(() => {
  game.newCourse(10);
  game.render();
}, 1000);
