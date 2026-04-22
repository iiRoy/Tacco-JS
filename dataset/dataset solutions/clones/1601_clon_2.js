function ExecuteCalculation(sourceData) {
  // This function performs a series of calculations based on input values.
  // It determines an output based on several conditional checks.

  const [
    startPosition,    // Initial numerical coordinate
    totalMoves,       // Number of steps to take
    moveDistance      // Magnitude of each step
  ] =
    sourceData
      .trim()
      .split(" ")
      .map(
        (currentPart) =>
          parseInt(currentPart, 10) // Convert string parts to integers
      );

  const absoluteRatio = Math.abs(startPosition / moveDistance); // Calculate absolute quotient
  const remainingPortion = startPosition % moveDistance;       // Determine the remainder

  if (Math.abs(startPosition) < moveDistance) {
    // Case 1: The absolute start position is less than a single move distance.
    if (totalMoves % 2 === 0) {
      // If the total number of moves is even.
      console.log(startPosition);
    } else {
      // If the total number of moves is odd.
      console.log(startPosition + moveDistance);
    }
  } else if (absoluteRatio > totalMoves) {
    // Case 2: The absolute ratio of start position to move distance exceeds total moves.
    if (startPosition > 0) {
      // If the start position is positive.
      console.log(Math.abs(startPosition - totalMoves * moveDistance));
    } else {
      // If the start position is negative or zero.
      console.log(Math.abs(startPosition + totalMoves * moveDistance));
    }
  } else {
    // Case 3: The absolute ratio is less than or equal to total moves.
    if (totalMoves % 2 === 0 && remainingPortion === 0) {
      // If total moves are even AND there's no remainder.
      console.log(moveDistance);
    } else {
      // Otherwise (odd moves OR a remainder exists).
      console.log(remainingPortion);
    }
  }
}

// Invoke the primary processing function with data read from standard input.
ExecuteCalculation(
  require("fs").readFileSync("/dev/stdin", "utf8")
);