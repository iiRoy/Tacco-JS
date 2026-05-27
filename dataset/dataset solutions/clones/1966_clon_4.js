'use strict';
const p = s => console.log(s);

function Main(inputContent) {
  const processedLines = inputContent.trim().split('\n');

  const [limitString] = processedLines[0].split(' ');
  const upperBoundary = Number(limitString);

  const numericElements = processedLines[1].split(' ').map(Number);

  // Create an array to store the frequency of each number from 1 to upperBoundary.
  // The element at index `k` will store the count for the number `k + 1`.
  const tallyCounts = Array.from({ length: upperBoundary }, () => 0);

  // Iterate through the input numbers and increment their corresponding counts.
  numericElements.forEach(currentValue => {
    // Only count numbers that fall within the specified range [1, upperBoundary].
    if (currentValue >= 1 && currentValue <= upperBoundary) {
      tallyCounts[currentValue - 1]++;
    }
  });

  // Output the frequency for each number from 1 to upperBoundary, one per line.
  tallyCounts.forEach(countEntry => {
    p(countEntry);
  });
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
