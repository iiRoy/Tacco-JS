const fs = require("fs");

const lines = fs.readFileSync(0, "utf8").split("\n");
const total = parseInt(lines[0], 10);

const pending = [];
for (let i = 0; i < total; i++) {
  pending.push(parseInt(lines[i + 1], 10));
}

pending.sort();

function edgeDistance(sequence, value) {
  return {
    left: Math.abs(sequence[0] - value),
    right: Math.abs(sequence[sequence.length - 1] - value)
  };
}

function putSmallest(sequence, values, totalCount) {
  const value = values.shift();

  if (sequence.length === 0) {
    sequence.push(value);
    return;
  }

  const distance = edgeDistance(sequence, value);

  if (distance.left > distance.right) {
    sequence.unshift(value);
    if (sequence.length !== totalCount) {
      sequence.push(values.shift());
    }
  } else {
    sequence.push(value);
    if (sequence.length !== totalCount) {
      sequence.unshift(values.shift());
    }
  }
}

function putLargest(sequence, values, totalCount) {
  const value = values.pop();
  const distance = edgeDistance(sequence, value);

  if (distance.left > distance.right) {
    sequence.unshift(value);
    if (sequence.length !== totalCount) {
      sequence.push(values.pop());
    }
  } else {
    sequence.push(value);
    if (sequence.length !== totalCount) {
      sequence.unshift(values.pop());
    }
  }
}

function adjacentSum(sequence) {
  let totalDistance = 0;

  for (let i = 0; i + 1 < sequence.length; i++) {
    totalDistance += Math.abs(sequence[i] - sequence[i + 1]);
  }

  return totalDistance;
}

const arranged = [];
let takeSmall = true;

while (arranged.length < total) {
  if (takeSmall) {
    putSmallest(arranged, pending, total);
  } else {
    putLargest(arranged, pending, total);
  }

  takeSmall = !takeSmall;
}

console.log(adjacentSum(arranged));