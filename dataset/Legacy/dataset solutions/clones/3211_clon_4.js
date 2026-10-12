"use strict";

function processSequence(rawData) {
  const lineSegments = rawData.split("\n");
  const sequenceLength = Number(lineSegments[0]);

  const numericSequence = lineSegments.slice(1, 1 + sequenceLength).map(Number);

  const initialCosts = [0, 0, 0, 0, 0];

  const finalCosts = numericSequence.reduce((previousCosts, currentElement) => {
    const evenOperationCost = currentElement === 0 ? 2 : currentElement % 2;
    const oddOperationCost = (currentElement + 1) % 2;

    const nextCost0 = previousCosts[0] + currentElement;
    const nextCost1 = Math.min(previousCosts[0], previousCosts[1]) + evenOperationCost;
    const nextCost2 = Math.min(...previousCosts.slice(0, 3)) + oddOperationCost;
    const nextCost3 = Math.min(previousCosts[2], previousCosts[3]) + evenOperationCost;
    const nextCost4 = Math.min(...previousCosts) + currentElement;

    return [nextCost0, nextCost1, nextCost2, nextCost3, nextCost4];
  }, initialCosts);

  console.log(Math.min(...finalCosts));
}

processSequence(require("fs").readFileSync("/dev/stdin", "utf8"));
