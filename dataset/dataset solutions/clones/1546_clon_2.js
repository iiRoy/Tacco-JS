function ProcessInput(rawData) {
  // This function processes a raw input string to determine if a journey is feasible.
  // The input string contains three space-separated values:
  // 1. The total distance to be covered.
  // 2. The maximum allowed time for the journey.
  // 3. The constant speed at which the journey will be undertaken.

  // Destructure the parsed input into distinct variables for clarity.
  const [distance, timeLimit, speed] = rawData.split(' ');

  // Calculate the actual time required to travel the given distance at the specified speed.
  // Then, compare this calculated time with the provided time limit.
  // If the actual time is less than or equal to the time limit, output 'Yes'.
  // Otherwise, if the actual time exceeds the limit, output 'No'.
  console.log(distance / speed <= timeLimit ? 'Yes' : 'No');
}

// The program starts by reading data from standard input.
// It uses Node.js's 'fs' module to synchronously read the file at '/dev/stdin'.
// The content is decoded as UTF-8 and any leading/trailing whitespace is removed.
// Finally, this prepared string is passed to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());
