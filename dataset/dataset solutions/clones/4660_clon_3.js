function generateHanoiMoves(
  diskCount,
  origin,
  temporary,
  destination
) {
  if (diskCount < 1) {
    return [];
  }

  const firstStage = generateHanoiMoves(
    diskCount - 1,
    origin,
    destination,
    temporary
  );

  const centralMovement = [
    origin + " -> " + destination
  ];

  const secondStage = generateHanoiMoves(
    diskCount - 1,
    temporary,
    origin,
    destination
  );

  return firstStage.concat(
    centralMovement,
    secondStage
  );
}

const fs = require("fs");
const source = fs.readFileSync("/dev/stdin", "utf8");
const diskCount = parseInt(source.trim(), 10);

const movements = generateHanoiMoves(
  diskCount,
  "A",
  "B",
  "C"
);

let output = "";
let position = 0;

while (position < movements.length) {
  if (position > 0) {
    output += "\n";
  }

  output += movements[position];
  position += 1;
}

console.log(output);