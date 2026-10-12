"use strict";

// This function calculates the minimum cost to acquire a certain number of pizzas.
// It considers buying full pizzas or combinations involving half-pizzas.
function ProcessInput(rawData) {
  // Parse the input string into an array of numbers.
  // Input format: A B C X Y (costs of A, B, C pizzas, and required X, Y pizzas)
  const numericValues = rawData.trim().split(' ').map(Number);

  // Extract individual cost and requirement values.
  let costA = numericValues[0]; // Cost of a full A pizza
  let costB = numericValues[1]; // Cost of a full B pizza
  let costC = numericValues[2]; // Cost of a half A/half B pizza (AB pizza)
  let reqX = numericValues[3];  // Required number of A pizzas
  let reqY = numericValues[4];  // Required number of B pizzas

  // Initialize the minimum cost with the strategy of buying only full A and B pizzas.
  let minCost = costA * reqX + costB * reqY;

  // Optimization: If buying two AB pizzas is cheaper than one A and one B,
  // then it's always optimal to buy AB pizzas instead of full A and B.
  // In this specific case, no further calculation is needed as AB pizzas are not
  // cheaper than individual A+B, so the initial minCost is already the answer.
  if (costA + costB < 2 * costC) {
    console.log(minCost);
    return; // Exit early if full pizzas are cheaper than two half-pizzas.
  }

  // Calculate the maximum possible number of half-pizzas (AB pizzas) we might buy
  // to cover the required X or Y pizzas.
  // Each AB pizza provides 0.5 of A and 0.5 of B.
  // So, to cover X A-pizzas, we might buy up to 2*X AB-pizzas.
  const maxHalfPizzasX = reqX * 2;
  const maxHalfPizzasY = reqY * 2;

  // First loop: Iterate through possible numbers of AB pizzas to cover X.
  // We only consider even numbers of half-pizzas because each AB pizza is 2 halves.
  for (let numHalfPizzas = 1; numHalfPizzas <= maxHalfPizzasX; numHalfPizzas++) {
    if (numHalfPizzas % 2 !== 0) {
      continue; // Skip odd numbers, as we buy AB pizzas in pairs of halves.
    }

    // Calculate remaining A pizzas needed after buying 'numHalfPizzas' AB pizzas.
    // Each AB pizza contributes 0.5 A, so 'numHalfPizzas' contributes 'numHalfPizzas / 2' A pizzas.
    let remainingX = reqX - numHalfPizzas / 2;
    if (remainingX < 0) {
      remainingX = 0; // Cannot need less than zero pizzas.
    }

    // Calculate remaining B pizzas needed.
    // If we buy 'numHalfPizzas' AB pizzas, we also get 'numHalfPizzas / 2' B pizzas.
    let remainingY = reqY - numHalfPizzas / 2;
    if (remainingY < 0) {
      remainingY = 0; // Cannot need less than zero pizzas.
    }

    // Calculate the current total cost for this combination:
    // (cost of AB pizzas) + (cost of remaining A pizzas) + (cost of remaining B pizzas)
    let currentCalcCost = costC * numHalfPizzas + remainingX * costA + remainingY * costB;

    // Update the minimum cost if this combination is cheaper.
    if (minCost > currentCalcCost) {
      minCost = currentCalcCost;
    }
  }

  // Second loop: Iterate through possible numbers of AB pizzas to cover Y.
  // This is similar to the first loop but focuses on covering Y requirements.
  for (let halfPizzasCount = 1; halfPizzasCount <= maxHalfPizzasY; halfPizzasCount++) {
    if (halfPizzasCount % 2 !== 0) {
      continue; // Skip odd numbers.
    }

    // Calculate remaining A pizzas needed.
    let neededX = reqX - halfPizzasCount / 2;
    if (neededX < 0) {
      neededX = 0;
    }

    // Calculate remaining B pizzas needed.
    let neededY = reqY - halfPizzasCount / 2;
    if (neededY < 0) {
      neededY = 0;
    }

    // Calculate the current total cost for this combination.
    let currentTotalCost = costC * halfPizzasCount + neededX * costA + neededY * costB;

    // Update the minimum cost if this combination is cheaper.
    if (minCost > currentTotalCost) {
      minCost = currentTotalCost;
    }
  }

  // Output the final minimum calculated cost.
  console.log(minCost);
}

// Read input from standard input and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
