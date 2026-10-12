const processInput = (inputData) => {
  // Split the incoming data string by spaces to get individual values.
  const parsedValues = inputData.split(" ");

  // Extract the required distance from the first element.
  const distanceRequired = parsedValues[0];
  // Extract the available time from the second element.
  const timeAvailable = parsedValues[1];
  // Extract the achievable speed from the third element.
  const speedAchievable = parsedValues[2];

  // Calculate the maximum distance that can be covered.
  // If the product of speed and time is greater than or equal to the required distance,
  // then it's possible to cover the distance.
  if (speedAchievable * timeAvailable >= distanceRequired) {
    console.log('YES'); // Output 'YES' if the condition is met.
  } else {
    console.log('NO');  // Otherwise, output 'NO'.
  }
};

// Read the entire content of standard input synchronously and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
