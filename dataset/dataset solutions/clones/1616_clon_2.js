function ProcessInput(rawData) {
  // Split the raw input string by newline characters.
  // The first line is assigned to 'initialValue', and the rest go into 'numericValues'.
  let [initialValue, ...numericValues] = rawData.split('\n');

  // Convert all elements in 'numericValues' to floating-point numbers
  // and then sort them in ascending order.
  numericValues = numericValues.map(item => parseFloat(item)).sort(function(valA, valB) {
    // Standard comparison function for numeric sort.
    return valA - valB;
  });

  // This array will store elements that satisfy the condition.
  let integerProducts = [];

  // A simple index to manage the slicing of the array in the loop.
  let loopIndex = 0;

  // Iterate through each number in the sorted list.
  for (let currentNum of numericValues) {
    // Create a sub-array starting from the next element after 'currentNum'.
    // The 'loopIndex' is pre-incremented to ensure we don't compare an element with itself
    // and to avoid redundant comparisons (e.g., if (a,b) is checked, (b,a) is not needed).
    let remainingNumbers = numericValues.slice(++loopIndex, numericValues.length);

    // Filter the 'remainingNumbers' to find elements whose product with 'currentNum' is an integer.
    // The modulo operator `% 1` checks if a number has a fractional part.
    let matchingElements = remainingNumbers.filter(candidate => (candidate * currentNum) % 1 === 0);

    // If any matching elements are found, add them to our 'integerProducts' array.
    if (matchingElements.length) {
      integerProducts = [...integerProducts, ...matchingElements];
    }
  }

  // Output the total count of elements found that satisfy the condition.
  console.log(integerProducts.length);
}

// Read input from standard input and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
