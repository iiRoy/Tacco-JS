// C: Travelling Plan
"use strict";

const DEBUG_MODE = false;
const rawInput = DEBUG_MODE
  ? "2\n1 19"
  : require("fs")
      .readFileSync("/dev/stdin", "utf8")
      .trim();

const process = inputRaw => {
  const mainInputs = inputRaw.split("\n");
  const nodeCount = parseInt(mainInputs[0]);
  const paddedNodes = [
    0,
    ...mainInputs[1].split(" ").map(item => parseInt(item)),
    0,
  ];

  const totalDistance = paddedNodes.reduce(
    (acc, curr, index) =>
      index === 0 ? acc : acc + Math.abs(curr - paddedNodes[index - 1]),
    0
  );

  for (let i = 1; i < nodeCount + 1; i++) {
    const previousNode = paddedNodes[i - 1];
    const skippedNode = paddedNodes[i];
    const nextNode = paddedNodes[i + 1];

    const distanceToSubtract =
      Math.abs(skippedNode - previousNode) + Math.abs(skippedNode - nextNode);
    const distanceToAdd = Math.abs(previousNode - nextNode);

    console.log(totalDistance - distanceToSubtract + distanceToAdd);
  }
};

process(rawInput);
