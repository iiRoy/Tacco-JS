function Main(sourceData) {
  "use strict";
  // Use a regular expression to extract all numerical strings from the input.
  const numericalStrings = sourceData.match(/\d+/g);
  // Convert the extracted string values to numbers.
  const firstValue = Number(numericalStrings[0]);
  const secondValue = Number(numericalStrings[1]);

  let finalResult = -1; // Initialize the result to -1, indicating no solution found yet.

  // Define an upper limit for the search space.
  // Based on the inverse of the tax rates (e.g., 1 / 0.08 = 12.5, 1 / 0.10 = 10),
  // a tax amount of 10000 could correspond to an original price around 125000.
  // Setting a generous upper bound like 200000 should cover typical competitive programming inputs.
  const searchCeiling = 200000;

  // Iterate through possible original prices, starting from 1.
  for (let currentAmount = 1; currentAmount <= searchCeiling; ++currentAmount) {
    // Calculate the 8% tax amount for the current price, rounded down.
    const taxValueA = Math.floor(currentAmount * 0.08);
    // Calculate the 10% tax amount for the current price, rounded down.
    const taxValueB = Math.floor(currentAmount * 0.10);

    // Check if both calculated tax values match the input values.
    if (taxValueA === firstValue && taxValueB === secondValue) {
      finalResult = currentAmount; // If a match is found, store this price.
      break; // Since we are looking for the smallest such price, we can stop and break the loop.
    }
  }

  // Output the final result (the smallest matching price or -1 if none was found).
  console.log(finalResult);
}