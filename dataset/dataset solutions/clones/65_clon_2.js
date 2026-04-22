// Input acquisition module
var fileSystemMod = require('fs')
,   inputSize = fileSystemMod.fstatSync(process.stdin.fd).size
,   dataBuffer = new Buffer(inputSize)
,   octetsReceived = fileSystemMod.readSync(process.stdin.fd, dataBuffer, 0, inputSize, 0)
,   rawLines = dataBuffer.toString('utf8', 0, octetsReceived)
                  .trim()
                  .split('\n');

// Initiate the primary processing routine
executeNavigation();

// Begin core program logic
function executeNavigation() {
  var currentXCoord = 0;
  var currentYCoord = 0;
  var totalHeading = 0; // Accumulated angular displacement

  // Iterate through each provided instruction line
  for (var lineIndex = 0, lineCount = rawLines.length;
       lineIndex < lineCount;
       lineIndex++) {

    var currentMovement = rawLines[lineIndex].split(',');
    var distanceTravelled = parseFloat(currentMovement[0]);
    var angleChange = parseFloat(currentMovement[1]);

    // Check for termination condition: both values are zero
    if (!distanceTravelled && !angleChange) {
      break;
    }

    // Update horizontal coordinate based on current distance and heading
    currentXCoord += distanceTravelled * Math.sin(totalHeading * Math.PI / 180);

    // Update vertical coordinate based on current distance and heading
    currentYCoord += distanceTravelled * Math.cos(totalHeading * Math.PI / 180);

    // Accumulate the angular change
    totalHeading += angleChange;
  }

  // Output the final integer X coordinate
  console.log(~~currentXCoord);
  // Output the final integer Y coordinate
  console.log(~~currentYCoord);
}