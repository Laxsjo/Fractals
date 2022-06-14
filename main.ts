const canvas = document.querySelector("#mainCanvas") as HTMLCanvasElement;

console.log(canvas);

const context = canvas.getContext("2d");

context.fillStyle = "rgb(200, 0, 0)";
context.fillRect(10, 10, 200, 200);
