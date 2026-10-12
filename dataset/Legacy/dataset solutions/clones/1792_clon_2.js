function processInputData(rawText) {
  // Extract initial positions and velocities from the input string.
  // The first line contains position A and velocity A.
  let posA = rawText.split("\n")[0].split(" ")[0];
  let velA = rawText.split("\n")[0].split(" ")[1];

  // The second line contains position B and velocity B.
  let posB = rawText.split("\n")[1].split(" ")[0];
  let velB = rawText.split("\n")[1].split(" ")[1];

  // The third line specifies the maximum time for observation.
  let maxTime = rawText.split("\n")[2];

  // Calculate the initial absolute separation between the two points.
  let currentSeparation = 0;
  if (posA > posB) {
    currentSeparation = posA - posB;
  } else {
    currentSeparation = posB - posA;
  }

  // Determine the rate at which the separation changes.
  // This is the difference in their velocities.
  let relativeVelocity = velA - velB;

  // Iterate through each time step up to the maximum allowed time.
  for (let timeStep = 0; timeStep <= maxTime; timeStep++) {
    // After the very first moment (timeStep 0), update the separation.
    if (timeStep !== 0) {
      currentSeparation -= relativeVelocity;
    }
    // If the separation becomes exactly zero, they have met.
    if (currentSeparation == 0) {
      break; // Exit the loop early as the condition is met.
    }
  }

  // Check the final separation status to determine the outcome.
  if (currentSeparation == 0) {
    console.log("YES"); // Output "YES" if they met.
  } else {
    console.log("NO"); // Output "NO" otherwise.
  }
}

// Read the entire content from standard input synchronously and pass it to the main processing function.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
