const processInput = (rawData) => {
  // This function processes the raw input string to determine if a journey is possible.

  // Parse the input string into distance, time limit, and speed values.
  // The input is expected to be space-separated.
  const [distance, timeLimit, speed] = rawData.split(" ");

  // Check if the time limit is sufficient to cover the distance at the given speed.
  // The condition is: timeLimit >= (distance / speed)
  if (timeLimit >= (distance / speed)) {
    // If the condition is met, the journey is possible.
    console.log("Yes");
  } else {
    // Otherwise, the journey is not possible within the given time.
    console.log("No");
  }
};

// Read the input from standard input and pass it to the processing function.
// The 'fs' module is used to read the file synchronously.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
