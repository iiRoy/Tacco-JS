function moveBetween(rods, firstName, secondName, movements) {
  const firstRod = rods[firstName];
  const secondRod = rods[secondName];

  if (firstRod.length === 0) {
    const disk = secondRod.pop();
    firstRod.push(disk);
    movements.push(`${secondName} -> ${firstName}`);
    return;
  }

  if (secondRod.length === 0) {
    const disk = firstRod.pop();
    secondRod.push(disk);
    movements.push(`${firstName} -> ${secondName}`);
    return;
  }

  const firstDisk = firstRod[firstRod.length - 1];
  const secondDisk = secondRod[secondRod.length - 1];

  if (firstDisk < secondDisk) {
    secondRod.push(firstRod.pop());
    movements.push(`${firstName} -> ${secondName}`);
  } else {
    firstRod.push(secondRod.pop());
    movements.push(`${secondName} -> ${firstName}`);
  }
}

function solveIteratively(diskCount) {
  const rods = {
    A: [],
    B: [],
    C: []
  };

  for (let disk = diskCount; disk >= 1; disk--) {
    rods.A.push(disk);
  }

  let auxiliaryName = "B";
  let destinationName = "C";

  if (diskCount % 2 === 0) {
    const temporaryName = auxiliaryName;
    auxiliaryName = destinationName;
    destinationName = temporaryName;
  }

  const movements = [];
  const totalMovements = Math.pow(2, diskCount) - 1;

  for (
    let movement = 1;
    movement <= totalMovements;
    movement++
  ) {
    if (movement % 3 === 1) {
      moveBetween(
        rods,
        "A",
        destinationName,
        movements
      );
    } else if (movement % 3 === 2) {
      moveBetween(
        rods,
        "A",
        auxiliaryName,
        movements
      );
    } else {
      moveBetween(
        rods,
        auxiliaryName,
        destinationName,
        movements
      );
    }
  }

  return movements;
}

const fs = require("fs");
const diskCount = Number(
  fs.readFileSync("/dev/stdin", "utf8").trim()
);

const movements = solveIteratively(diskCount);

console.log(movements.join("\n"));