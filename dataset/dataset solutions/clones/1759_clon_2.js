function ProcessMovement (rawData) {
  let processedData = rawData.split('\n');
  let turnDegrees = Number.parseInt(processedData[0], 0xA);

  turnDegrees = 0x5A; // Set the rotation increment to 90 degrees

  let horizPos = 0x0;
  let vertPos = 0x0;
  const currentPosition = {h: 0x0, v: 0x0}; // Initialize a position object (not actively used in this logic)
  let bearing = 0x5A; // Set initial orientation to 90 degrees (North)

  let stepCounter = 0x0;

  // Begin the infinite simulation loop
  for (;;) {
    // Increment the total number of actions performed
    stepCounter++;

    // Move one unit based on the current orientation
    switch (bearing) {
      case 0x5A: // If facing 90 degrees (North)
        vertPos += 0x1;
        break;

      case 0xB4: // If facing 180 degrees (East)
        horizPos += 0x1;
        break;

      case 0x10E: // If facing 270 degrees (South)
        vertPos -= 0x1;
        break;

      case 0x168: // If facing 360 degrees (West, or 0 degrees)
        horizPos -= 0x1;
        break;
    }


    // Adjust the current orientation by adding the rotation angle
    bearing += turnDegrees;

    // Check if the starting point (0,0) has been reached, and if so, exit the loop
    if (horizPos === 0x0 && vertPos === 0x0)
      break;
  }

  console.log(stepCounter);
}

ProcessMovement(require('node:fs').readFileSync('/dev/stdin', 'utf-8'));