function processInput(rawData) {
  // Remove leading/trailing whitespace from the raw input string
  rawData = rawData.trim();

  // Split the input string by space to get individual values
  const parsedValues = rawData.split(' ');

  // Parse the first value as the initial position (x)
  let initialPosition = parseInt(parsedValues[0]);

  // Parse the second value as the total number of moves allowed (k)
  let totalMoves = parseInt(parsedValues[1]);

  // Parse the third value as the distance moved per step (d)
  let moveDistance = parseInt(parsedValues[2]);

  // Calculate the maximum number of full 'd' steps that can be taken from 'initialPosition' towards zero
  let optimalMoves = Math.floor(initialPosition / moveDistance);

  // Determine the number of moves remaining after taking 'optimalMoves' steps
  let remainingMoves = totalMoves - optimalMoves;

  // Adjust 'optimalMoves' based on the total allowed moves and remaining moves parity
  if (optimalMoves > totalMoves) {
    // If the calculated optimal moves exceed the total allowed moves, cap it at totalMoves
    optimalMoves = totalMoves;
  } else if (remainingMoves % 2 === 0) {
    // If the remaining moves are an even number, no further adjustment is needed for 'optimalMoves'
    // The final position will be the same whether we move back and forth an even number of times
  } else if (remainingMoves % 2 === 1) {
    // If the remaining moves are an odd number, we need to make one more adjustment
    // to minimize the absolute distance from zero.
    if (0 < moveDistance * remainingMoves) {
      // If moving one more step in the current direction (away from zero) would be beneficial
      // (i.e., if the current position is positive and we're moving towards positive, or negative towards negative)
      // This condition `0 < moveDistance * remainingMoves` is a bit misleading.
      // It effectively checks if `d` is positive and `remainingMoves` is positive,
      // which means we are considering moving one more step.
      // The original logic `if(0<d*nokoriKaisuu)` implies that if `d*nokoriKaisuu` is positive,
      // we increment `kaisuu`. This means if `d` is positive, and `nokoriKaisuu` is positive,
      // we increment. This is equivalent to moving one more step in the direction of `x`.
      optimalMoves += 1;
    } else {
      // Otherwise, moving one less step (i.e., changing direction for the last odd move)
      // would be better to get closer to zero.
      optimalMoves -= 1;
    }
  }

  // Calculate the final absolute distance from zero after all moves
  const finalResult = Math.abs(initialPosition - moveDistance * optimalMoves);

  // Output the final result to the console
  console.log(finalResult);
}

// Read input from standard input, decode as UTF-8, and pass to the processing function
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
