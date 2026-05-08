// Define a function to orchestrate the display of numerical products.
function displayProductGrid() {
  // Define the upper limit for our factors. The loop will run up to (but not including) this value.
  const upperLimit = 10;
  // Initialize an array to store all computed expressions and their results as strings.
  const outputLines = [];

  // Add a descriptive header to our output to set context.
  outputLines.push("--- Comprehensive Multiplication Table (1 to 9) ---");
  outputLines.push(" "); // Insert a blank line for better visual separation.

  // Iterate through the primary factor, starting from 1.
  // This loop controls the 'rows' or the first number in the multiplication.
  for (let primaryFactor = 1; primaryFactor < upperLimit; primaryFactor++) {
    // Add a visual separator to delineate sections for each primary factor.
    outputLines.push("--------------------------------------------------");
    outputLines.push(`  Products for ${primaryFactor}:`);

    // Nested loop to iterate through the secondary factor, also starting from 1.
    // This loop controls the 'columns' or the second number in the multiplication.
    for (let secondaryFactor = 1; secondaryFactor < upperLimit; secondaryFactor++) {
      // Calculate the product of the current primary and secondary factors.
      const currentProduct = primaryFactor * secondaryFactor;

      // Construct a detailed string representation of the multiplication.
      const formattedResult = `    ${primaryFactor} multiplied by ${secondaryFactor} yields ${currentProduct}.`;

      // Add the formatted string to our collection of output lines.
      outputLines.push(formattedResult);
    }
    outputLines.push("--------------------------------------------------");
    outputLines.push(" "); // Another blank line for spacing after each primary factor's section.
  }

  // Add a concluding footer to signify the end of the table.
  outputLines.push("--- End of Table Generation ---");

  // Finally, iterate through the collected lines and print each one to the console.
  outputLines.forEach(lineEntry => console.log(lineEntry));
}

// Invoke the function to generate and display the complete product grid.
displayProductGrid();