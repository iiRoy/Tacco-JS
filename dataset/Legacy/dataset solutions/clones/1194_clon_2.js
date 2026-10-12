function Cube(valuesArray) {
  // Initialize the faces of the cube with provided values
  this.upperFace   = valuesArray[0];
  this.forwardFace = valuesArray[1];
  this.rightSide   = valuesArray[2];
  this.leftSide    = valuesArray[3];
  this.rearFace    = valuesArray[4];
  this.lowerFace   = valuesArray[5];

  // Method to rotate the cube in a specified direction
  this.rotate = function(moveDirection) {
    let temporaryValue; // A temporary variable for swapping face values
    switch (moveDirection) {
      case 'E': // Rotate East
        temporaryValue    = this.upperFace;
        this.upperFace    = this.leftSide;
        this.leftSide     = this.lowerFace;
        this.lowerFace    = this.rightSide;
        this.rightSide    = temporaryValue;
        break;
      case 'N': // Rotate North
        temporaryValue    = this.upperFace;
        this.upperFace    = this.forwardFace;
        this.forwardFace  = this.lowerFace;
        this.lowerFace    = this.rearFace;
        this.rearFace     = temporaryValue;
        break;
      case 'S': // Rotate South
        temporaryValue    = this.upperFace;
        this.upperFace    = this.rearFace;
        this.rearFace     = this.lowerFace;
        this.lowerFace    = this.forwardFace;
        this.forwardFace  = temporaryValue;
        break;
      case 'W': // Rotate West
        temporaryValue    = this.upperFace;
        this.upperFace    = this.rightSide;
        this.rightSide    = this.lowerFace;
        this.lowerFace    = this.leftSide;
        this.leftSide     = temporaryValue;
        break;
    }
  };

  // Method to spin the cube around its vertical axis
  this.spin = function(spinDirection) {
    let temporaryValue;
    switch (spinDirection) {
      case 'R': // Spin Right (clockwise)
        temporaryValue    = this.forwardFace;
        this.forwardFace  = this.rightSide;
        this.rightSide    = this.rearFace;
        this.rearFace     = this.leftSide;
        this.leftSide     = temporaryValue;
        break;
      case 'L': // Spin Left (counter-clockwise)
        temporaryValue    = this.forwardFace;
        this.forwardFace  = this.leftSide;
        this.leftSide     = this.rearFace;
        this.rearFace     = this.rightSide;
        this.rightSide    = temporaryValue;
        break;
    }
  };

  // Method to adjust the cube so a specific value is on the top face
  this.alignTop = function(desiredTopValue) {
    switch (desiredTopValue) {
      case this.upperFace:
        // Already on top, no action needed
        break;
      case this.forwardFace:
        this.rotate('N'); // Roll North to bring front to top
        break;
      case this.rightSide:
        this.rotate('W'); // Roll West to bring right to top
        break;
      case this.leftSide:
        this.rotate('E'); // Roll East to bring left to top
        break;
      case this.rearFace:
        this.rotate('S'); // Roll South to bring back to top
        break;
      case this.lowerFace:
        this.rotate('N'); // Roll North twice to bring bottom to top
        this.rotate('N');
        break;
    }
  };

  // Method to adjust the cube so a specific value is on the front face
  this.alignFront = function(desiredFrontValue) {
    switch (desiredFrontValue) {
      case this.upperFace:
        // This case should ideally not be reachable if alignTop was called first
        break;
      case this.forwardFace:
        // Already on front, no action needed
        break;
      case this.rightSide:
        this.spin('R'); // Spin Right to bring right to front
        break;
      case this.leftSide:
        this.spin('L'); // Spin Left to bring left to front
        break;
      case this.rearFace:
        this.spin('R'); // Spin Right twice to bring back to front
        this.spin('R');
        break;
      case this.lowerFace:
        // This case should ideally not be reachable if alignTop was called first
        break;
    }
  };
}


let rawData = ""; // Accumulates all input data
process.stdin.resume(); // Keep the process alive for input
process.stdin.setEncoding('utf-8'); // Set encoding for input stream

// Event listener for incoming data chunks
process.stdin.on('data', function(dataChunk) {
  rawData += dataChunk; // Append chunk to rawData
});
 
// Event listener for end of input stream
process.stdin.on('end', function() {
  // Split input into lines and process
  rawData = rawData.split("\n");

  // Create the initial cube from the first line of input
  const initialCube = new Cube(rawData[0].split(' ').map(Number));
  // Create the comparison cube from the second line of input
  const comparisonCube = new Cube(rawData[1].split(' ').map(Number));
  let matchOutcome = 'No'; // Default outcome

  // Iterate through all possible orientations of the comparison cube
  // Outer loop: 8 rotations (4 N/S rolls, 4 W/E rolls)
  for (let outerLoopIndex = 0; outerLoopIndex < 8; outerLoopIndex++) {
    // Inner loop: 4 spins around the vertical axis
    for (let innerLoopIndex = 0; innerLoopIndex < 4; innerLoopIndex++) {
      comparisonCube.spin('R'); // Spin the comparison cube right
      // Check if all faces match between the two cubes
      if (initialCube.upperFace   === comparisonCube.upperFace   &&
          initialCube.forwardFace === comparisonCube.forwardFace &&
          initialCube.rightSide   === comparisonCube.rightSide   &&
          initialCube.leftSide    === comparisonCube.leftSide    &&
          initialCube.rearFace    === comparisonCube.rearFace    &&
          initialCube.lowerFace   === comparisonCube.lowerFace) {
        matchOutcome = 'Yes'; // If all faces match, set outcome to 'Yes'
      }
    }
    // After 4 spins, perform a roll to change the top/front faces
    if (outerLoopIndex < 4) {
      comparisonCube.rotate('N'); // Roll North for the first 4 outer loop iterations
    } else {
      comparisonCube.rotate('W'); // Roll West for the remaining 4 outer loop iterations
    }
  }
  // Output the final result
  console.log(matchOutcome);
});
