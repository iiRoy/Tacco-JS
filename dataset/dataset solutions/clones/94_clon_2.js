(function(rawData) {
  // This function processes input data to determine the relationship between pairs of circles.

  // First, clean the raw input string by removing any trailing newline character.
  // Then, split the cleaned string into an array of individual lines.
  var linesArray = rawData.replace(/\n$/, '').split('\n');

  // The very first line of the input specifies the total number of test cases to process.
  var numCases = Number(linesArray.shift());

  // Begin iterating through each of the provided test cases.
  for (var caseIndex = 0; caseIndex < numCases; caseIndex++) {
    // For the current test case, retrieve the next line from the array.
    // This line contains space-separated parameters for the two circles.
    // Split these parameters by space and convert each resulting string to a number.
    var currentCaseParams = linesArray.shift().split(' ').map(Number);

    // Extract the coordinates (x, y) and radius (r) for the first circle (Circle A).
    var circleAX = currentCaseParams.shift();
    var circleAY = currentCaseParams.shift();
    var radiusA = currentCaseParams.shift();

    // Extract the coordinates (x, y) and radius (r) for the second circle (Circle B).
    var circleBX = currentCaseParams.shift();
    var circleBY = currentCaseParams.shift();
    var radiusB = currentCaseParams.shift();

    // Calculate the Euclidean distance between the centers of Circle A and Circle B.
    // The formula used is: distance = sqrt((x2 - x1)^2 + (y2 - y1)^2).
    var distanceBetweenCenters = Math.sqrt(
      Math.pow(circleBX - circleAX, 2) +
      Math.pow(circleBY - circleAY, 2)
    );

    // Now, determine the relationship between the two circles based on their distance and radii.

    // Condition 1: Check if the circles intersect or touch at all.
    // This occurs if the distance between centers is less than or equal to the sum of their radii.
    if (distanceBetweenCenters <= radiusA + radiusB) {
      // Sub-condition 1.1: Check if Circle A is completely contained within Circle B.
      // This happens if the distance is less than the absolute difference of their radii (specifically, radiusB - radiusA).
      if (distanceBetweenCenters < radiusB - radiusA) {
        console.log(-2); // Output -2 indicating Circle A is inside Circle B.
      }
      // Sub-condition 1.2: Check if Circle B is completely contained within Circle A.
      // This happens if the distance is less than the absolute difference of their radii (specifically, radiusA - radiusB).
      else if (distanceBetweenCenters < radiusA - radiusB) {
        console.log(2); // Output 2 indicating Circle B is inside Circle A.
      }
      // Sub-condition 1.3: If neither is fully contained, but they still intersect or touch.
      // This covers cases where they intersect at two points, touch externally, or touch internally.
      else {
        console.log(1); // Output 1 indicating they intersect or touch.
      }
    }
    // Condition 2: If the circles do not intersect or touch at all.
    // This means the distance between centers is greater than the sum of their radii.
    else {
      console.log(0); // Output 0 indicating they are separate.
    }
  }
})(
  // This part reads the entire content of standard input as a UTF-8 string.
  require('fs').readFileSync('/dev/stdin', 'utf8')
);
