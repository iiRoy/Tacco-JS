"use strict";
var input = require("fs").readFileSync("/dev/stdin", "utf8");
var cin = input.split(/ |\n/),
  cid = 0;

function next() {
  return +cin[cid++];
}

function nextstr() {
  return cin[cid++];
}

function nextbig() {
  return BigInt(cin[cid++]);
}

function nexts(n, a) {
  return a ? cin.slice(cid, (cid += n)) : cin.slice(cid, (cid += n)).map((a) => +a);
}

function nextm(h, w, a) {
  var r = [],
    i = 0;
  if (a)
    for (; i < h; i++) r.push(cin.slice(cid, (cid += w)));
  else
    for (; i < h; i++) r.push(cin.slice(cid, (cid += w)).map((a) => +a));
  return r;
}

// The custom xArray utility function from the original code has been removed.
// Its functionality for array initialization is replaced directly within the main function
// using standard JavaScript Array methods.

var myOut = main();
if (myOut !== undefined) console.log(String(myOut));

function main() {
  const infinityVal = 1e9;
  // Direction vectors for (Up, Right, Down, Left)
  const deltaY = [-1, 0, 1, 0];
  const deltaX = [0, 1, 0, -1];
  const directionCount = deltaX.length;

  const [gridHeight, gridWidth, maxSteps] = nexts(3);
  const [startY, startX, goalY, goalX] = nexts(4);

  const mapGrid = [];
  // Initialize mapGrid with padding, replacing xArray usage
  mapGrid.push(Array(gridWidth + 2).fill('@').join('')); // Top border row
  for (let rowIdx = 0; rowIdx < gridHeight; rowIdx++) {
    mapGrid.push('@' + nextstr() + '@'); // Padded input row
  }
  mapGrid.push(Array(gridWidth + 2).fill('@').join('')); // Bottom border row

  // Initialize minMoves 2D array with infinity, replacing xArray usage
  const minMoves = Array.from({ length: gridHeight + 2 }, () =>
    Array(gridWidth + 2).fill(infinityVal)
  );

  minMoves[startY][startX] = 0;
  // Using a single queue for BFS, storing objects with coordinates and current move count
  const bfsQueue = [{ y: startY, x: startX, moves: 0 }];
  let queuePointer = 0; // Acts as a head pointer for efficient dequeue (simulating shift())

  while (queuePointer < bfsQueue.length) {
    const { y: currentY, x: currentX, moves: currentMoveCount } = bfsQueue[queuePointer++];

    // If a shorter path to this cell has already been discovered and processed,
    // skip this entry as it represents a suboptimal path.
    if (currentMoveCount > minMoves[currentY][currentX]) {
      continue;
    }

    // Explore all four cardinal directions
    for (let dirIdx = 0; dirIdx < directionCount; dirIdx++) {
      let traverseY = currentY;
      let traverseX = currentX;

      // Attempt to move up to maxSteps in the current direction
      for (let stepCount = 1; stepCount <= maxSteps; stepCount++) {
        traverseY += deltaY[dirIdx];
        traverseX += deltaX[dirIdx];

        // If an obstacle ('@') is encountered, stop moving further in this direction
        if (mapGrid[traverseY][traverseX] === '@') {
          break;
        }

        // If a path to this cell has already been found that is shorter than
        // or equal to the current path's level (currentMoveCount + 1),
        // then we cannot improve by extending further through this cell.
        // This is a critical optimization for multi-step BFS, preventing redundant exploration.
        if (minMoves[traverseY][traverseX] < currentMoveCount + 1) {
          break;
        }

        // If we found a new shortest path to this cell (i.e., minMoves is currently infinityVal or a longer path)
        if (minMoves[traverseY][traverseX] > currentMoveCount + 1) {
          minMoves[traverseY][traverseX] = currentMoveCount + 1;
          bfsQueue.push({ y: traverseY, x: traverseX, moves: currentMoveCount + 1 });
        }
        // If minMoves[traverseY][traverseX] === currentMoveCount + 1,
        // it means this cell is already part of the current frontier (already added to queue
        // or processed for this level). We do not add it again, but we *continue*
        // extending *past* it in the same direction, as per the multi-step BFS logic.
      }
    }
  }

  // Return the minimum moves to the goal, or -1 if unreachable
  return minMoves[goalY][goalX] === infinityVal ? -1 : minMoves[goalY][goalX];
}
