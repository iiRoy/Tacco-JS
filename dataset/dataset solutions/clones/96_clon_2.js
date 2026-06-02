(function(rawData) {
  // This function processes input to determine the relationship between two circles.

  // Split the raw input string into an array of lines, removing any trailing newline.
  let linesArray = rawData.replace(/\n$/, '').split('\n');

  // The first line contains the total number of test cases.
  const testCaseCount = Number(linesArray.shift());

  // Iterate through each test case.
  for (let idx = 0; idx < testCaseCount; idx++) {
    // Parse the current line of arguments for the two circles.
    let currentArgs = linesArray.shift().split(' ').map(Number);

    // Extract coordinates and radius for the first circle (Circle A).
    const circleAX = currentArgs.shift();
    const circleAY = currentArgs.shift();
    const circleARadius = currentArgs.shift();

    // Extract coordinates and radius for the second circle (Circle B).
    const circleBX = currentArgs.shift();
    const circleBY = currentArgs.shift();
    const circleBRadius = currentArgs.shift();

    // Calculate the Euclidean distance between the centers of the two circles.
    // Formula: d = sqrt((xb - xa)^2 + (yb - ya)^2)
    const distanceBetweenCenters = Math.sqrt(
      Math.pow(circleBX - circleAX, 2) +
      Math.pow(circleBY - circleAY, 2)
    );

    // Determine the relationship between the two circles based on their radii and the distance between their centers.
    // Case 1: Circle A completely encloses Circle B (or they are concentric and A is larger).
    if (circleARadius >= distanceBetweenCenters + circleBRadius) {
      console.log(2);
    }
    // Case 2: Circle B completely encloses Circle A (or they are concentric and B is larger).
    else if (circleBRadius >= distanceBetweenCenters + circleARadius) {
      console.log(-2);
    }
    // Case 3: The circles intersect or touch externally.
    else if (distanceBetweenCenters <= circleARadius + circleBRadius) {
      console.log(1);
    }
    // Case 4: The circles are separate and do not touch.
    else {
      console.log(0);
    }
  }
})(require('fs').readFileSync('/dev/stdin', 'utf8'));
