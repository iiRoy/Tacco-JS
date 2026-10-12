"use strict"
function ProcessInput(inputData) {
  const parsedValues = inputData.trim().split(' ').map(Number);
  const [alpha, beta, gamma, zeta, eta] = parsedValues;

  // Calculate the cost if all required items are purchased individually.
  const directAcquisitionCost = alpha * zeta + beta * eta;

  // Calculate the cost by purchasing a number of combined (AB) pairs
  // equal to the minimum of the required A and B items,
  // then buying any remaining items individually.
  const commonQuantity = Math.min(zeta, eta);
  const remainingZeta = Math.max(0, zeta - commonQuantity);
  const remainingEta = Math.max(0, eta - commonQuantity);
  const partialPairCost = (2 * gamma * commonQuantity) + (alpha * remainingZeta) + (beta * remainingEta);

  // Calculate the cost by purchasing enough combined (AB) pairs
  // to satisfy the maximum of the required A and B items.
  // This implies any excess of the smaller item from the pairs is effectively free.
  const fullCoveragePairCost = 2 * gamma * Math.max(zeta, eta);

  // The minimum of these three distinct purchasing strategies yields the optimal cost.
  const ultimateCost = Math.min(directAcquisitionCost, partialPairCost, fullCoveragePairCost);

  console.log(ultimateCost);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
