globalInput.resume();
globalInput.setEncoding('utf8');
globalInput.on('data',
  // Listener for incoming data segments
  function (inputSegment) {

    // Split the received string by spaces to get individual numeric parts
    let valueParts = inputSegment.split(" ");

    // Convert the first part to an integer, representing the first dimension
    let firstDimension = Number.parseInt(valueParts[0], 10);

    // Convert the second part to an integer, representing the second dimension
    let secondDimension = Number.parseInt(valueParts[1], 10);

    // Calculate the area using the two dimensions
    let calculatedArea = firstDimension * secondDimension;

    // Calculate the perimeter based on the dimensions
    let perimeterValue = 2 * (firstDimension + secondDimension);

    // Output the calculated area and perimeter, separated by a space
    console.log(calculatedArea + " " + perimeterValue);
  }
);