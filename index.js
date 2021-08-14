import Game from "./modules/game.js";

let game = new Game();

function newCourse() {
  game.newCourse(20);
  game.render();
}
function clearCourse() {
  game.clearCourse();
  game.render();
}

newCourse();
document.getElementById("next-btn").addEventListener("click", newCourse);
document.getElementById("clear-btn").addEventListener("click", clearCourse);
