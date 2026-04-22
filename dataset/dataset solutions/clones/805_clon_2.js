function launchProjectile(  verticalDirection,   horizontalDirection  ){
  // Initialize distance counter for projectile travel
  var stepCounter  =  0;


  while (true)  {
    stepCounter++;
    // Check if the projectile hits a wall
    if (  battlefieldLayout[  mainTankPos[0] + (verticalDirection * stepCounter)  ][  mainTankPos[1] + (horizontalDirection * stepCounter)  ]  ===  "#"  )  {
      break;
    }
    // Check if the projectile hits an enemy target
    else if (  battlefieldLayout[  mainTankPos[0] + (verticalDirection * stepCounter)  ][  mainTankPos[1] + (horizontalDirection * stepCounter)  ]  ===  "*"  )  {
      // Destroy the target and clear the spot
      battlefieldLayout[  mainTankPos[0] + (verticalDirection * stepCounter)  ][  mainTankPos[1] + (horizontalDirection * stepCounter)  ]  =  ".";
      break;
    }
  }
}

// Access the Node.js file system module for input operations
var fileSystemModule = require('fs');
// Define the path for reading standard input
var standardInputPath = '/dev/stdin';
// Specify the encoding format for the input data
var encodingFormat = 'utf8';

// Read the raw input data from stdin
var rawInputData = fileSystemModule.readFileSync(  standardInputPath,   encodingFormat  );

// Pre-process the input by replacing direction symbols with standardized characters
rawInputData = rawInputData
  .replace(/\^/g, "U") // Up arrow to 'U'
  .replace(/v/g, "D") // Down arrow to 'D'
  .replace(/\</g, "L") // Left arrow to 'L'
  .replace(/\>/g, "R"); // Right arrow to 'R'

// Trim whitespace and split the input into individual lines
var processedLines = rawInputData.trim().split("\n");

// Extract the number of test scenarios from the first line
var numScenarios = processedLines.shift() - 0; // Convert to number

// Iterate through each test scenario
for (  var scenarioIndex = 0;   scenarioIndex < numScenarios;   scenarioIndex++  )  {
  // Add an empty line between outputs of different scenarios, if not the first
  if (  scenarioIndex !== 0  )  {
    console.log("");
  }

  // Get map height and width from the next line, converting to numbers
  var gridDimensions = processedLines.shift().split(" ").map(Number);
  // Initialize the 2D array representing the game battlefield
  var battlefieldLayout = [];

  // Add a top border of walls to the battlefield
  battlefieldLayout.push(  "####################".split("")  );

  // Initialize player vehicle's position (row, column)
  var mainTankPos = [  0,   0  ];

  // Populate the battlefield grid based on input lines
  for (  var gridRowIndex = 0;   gridRowIndex < gridDimensions[0];   gridRowIndex++  )  {
    // Get the current row data and split into characters
    var currentRowData = processedLines.shift().split("");
    // Variable to store the initial column of the player vehicle
    var vehicleColumn = -1;

    // Iterate through the characters in the current row to find the player vehicle
    currentRowData.forEach(  function (  currentChar,   positionInRow  )  {
      if (  currentChar === "U"  ||  currentChar === "D"  ||  currentChar === "L"  ||  currentChar === "R"  )  {
        vehicleColumn = positionInRow;
      }
    });

    // If the player vehicle was found in this row, update its position
    if (  vehicleColumn !== -1  )  {
      mainTankPos = [  gridRowIndex + 1,   vehicleColumn + 1  ]; // Adjust for added borders
    }

    // Add left and right wall borders to the current row
    currentRowData.unshift("#");
    currentRowData.push("#");
    // Add the bordered row to the battlefield layout
    battlefieldLayout.push(  currentRowData  );
  }
  // Add a bottom border of walls to the battlefield
  battlefieldLayout.push(  "####################".split("")  );

  // Consume the empty line after the map definition (if any)
  processedLines.shift();

  // Get the sequence of player commands
  var commandSequence = processedLines.shift().split("");

  // Process each command in the sequence
  commandSequence.forEach(  function (  actionChar  )  {
    // Move Up
    if (  actionChar === "U"  &&  battlefieldLayout[  mainTankPos[0] - 1  ][  mainTankPos[1]  ]  ===  "."  )  {
      battlefieldLayout[  mainTankPos[0] - 1  ][  mainTankPos[1]  ]  =  "U"; // New position
      battlefieldLayout[  mainTankPos[0]  ][  mainTankPos[1]  ]  =  ".";     // Clear old position
      mainTankPos[0]--;                                                      // Update tank coordinates
    }
    // Rotate Up (if cannot move)
    else if (  actionChar === "U"  &&  battlefieldLayout[  mainTankPos[0] - 1  ][  mainTankPos[1]  ]  !==  "."  )  {
      battlefieldLayout[  mainTankPos[0]  ][  mainTankPos[1]  ]  =  "U";
    }
    // Move Down
    else if (  actionChar === "D"  &&  battlefieldLayout[  mainTankPos[0] + 1  ][  mainTankPos[1]  ]  ===  "."  )  {
      battlefieldLayout[  mainTankPos[0] + 1  ][  mainTankPos[1]  ]  =  "D";
      battlefieldLayout[  mainTankPos[0]  ][  mainTankPos[1]  ]  =  ".";
      mainTankPos[0]++;
    }
    // Rotate Down (if cannot move)
    else if (  actionChar === "D"  &&  battlefieldLayout[  mainTankPos[0] + 1  ][  mainTankPos[1]  ]  !==  "."  )  {
      battlefieldLayout[  mainTankPos[0]  ][  mainTankPos[1]  ]  =  "D";
    }
    // Move Left
    else if (  actionChar === "L"  &&  battlefieldLayout[  mainTankPos[0]  ][  mainTankPos[1] - 1  ]  ===  "."  )  {
      battlefieldLayout[  mainTankPos[0]  ][  mainTankPos[1] - 1  ]  =  "L";
      battlefieldLayout[  mainTankPos[0]  ][  mainTankPos[1]  ]  =  ".";
      mainTankPos[1]--;
    }
    // Rotate Left (if cannot move)
    else if (  actionChar === "L"  &&  battlefieldLayout[  mainTankPos[0]  ][  mainTankPos[1] - 1  ]  !==  "."  )  {
      battlefieldLayout[  mainTankPos[0]  ][  mainTankPos[1]  ]  =  "L";
    }
    // Move Right
    else if (  actionChar === "R"  &&  battlefieldLayout[  mainTankPos[0]  ][  mainTankPos[1] + 1  ]  ===  "."  )  {
      battlefieldLayout[  mainTankPos[0]  ][  mainTankPos[1] + 1  ]  =  "R";
      battlefieldLayout[  mainTankPos[0]  ][  mainTankPos[1]  ]  =  ".";
      mainTankPos[1]++;
    }
    // Rotate Right (if cannot move)
    else if (  actionChar === "R"  &&  battlefieldLayout[  mainTankPos[0]  ][  mainTankPos[1] + 1  ]  !==  "."  )  {
      battlefieldLayout[  mainTankPos[0]  ][  mainTankPos[1]  ]  =  "R";
    }
    // Fire Shot
    else if (  actionChar === "S"  )  {
      // Determine the current orientation of the player vehicle
      var tankDirection = battlefieldLayout[  mainTankPos[0]  ][  mainTankPos[1]  ];
      // Call the projectile function based on orientation
      if (  tankDirection === "U"  )  {
        launchProjectile(  -1,   0  ); // Fire Up
      }
      else if (  tankDirection === "D"  )  {
        launchProjectile(  1,   0  );  // Fire Down
      }
      else if (  tankDirection === "L"  )  {
        launchProjectile(  0,   -1  ); // Fire Left
      }
      else if (  tankDirection === "R"  )  {
        launchProjectile(  0,   1  );  // Fire Right
      }
    }
  });

  // Remove the temporary top and bottom border rows before output
  battlefieldLayout.shift();
  battlefieldLayout.pop();

  // Format the final battlefield state for output
  console.log(
    battlefieldLayout.join("\n")          // Join rows with newlines
      .replace(/^#/mg, "")                // Remove leading '#' (left border)
      .replace(/#$/mg, "")                // Remove trailing '#' (right border)
      .replace(/\,/g, "")                 // Remove commas from array joining
      .replace(/U/g, "^")                 // Convert 'U' back to '^'
      .replace(/D/g, "v")                 // Convert 'D' back to 'v'
      .replace(/L/g, "<")                 // Convert 'L' back to '<'
      .replace(/R/g, ">")                 // Convert 'R' back to '>'
  );
}