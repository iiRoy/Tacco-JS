process.stdin.resume();

process.stdin.setEncoding('utf8');

process.stdin.on('data', function (inputData) {
  // Split the incoming string by space to get individual coordinate values
  let coordinateParts = inputData.split(" ");

  // Parse the first two values as floating-point numbers for the initial point (P1)
  let pointOneX = parseFloat(coordinateParts[0]);
  let pointOneY = parseFloat(coordinateParts[1]);

  // Parse the next two values as floating-point numbers for the second point (P2)
  let pointTwoX = parseFloat(coordinateParts[2]);
  let pointTwoY = parseFloat(coordinateParts[3]);

  // Calculate the Euclidean distance between the two points using the distance formula:
  // sqrt((x2 - x1)^2 + (y2 - y1)^2)
  let calculatedDistance = Math.sqrt(
    Math.pow((pointOneX - pointTwoX), 2) + Math.pow((pointOneY - pointTwoY), 2)
  );

  // Output the computed distance to the standard console
  console.log(calculatedDistance);
});
