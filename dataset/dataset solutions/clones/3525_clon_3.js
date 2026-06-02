let inputDataLines = [];
let inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

inputReader.on('line', function(currentLine){
  inputDataLines.push(currentLine.split(" "));
});

inputReader.on('close', function(){
  if(determineConflictStatus(inputDataLines)) {
    console.log("War");
  } else {
    console.log("No War");
  }
});

function parseConfigLine(configStrings) {
  const currentCoordA = Number(configStrings[2]);
  const currentCoordB = Number(configStrings[3]);
  return { currentCoordA, currentCoordB };
}

function determineConflictStatus(inputCoordinateSets){
  const INITIAL_MAX_COORD_A = -Infinity;
  const INITIAL_MIN_COORD_B = Infinity;

  let empireAMaxDesiredCoord = INITIAL_MAX_COORD_A;
  let empireBMinDesiredCoord = INITIAL_MIN_COORD_B;

  const { currentCoordA, currentCoordB } = parseConfigLine(inputCoordinateSets[0]);

  inputCoordinateSets[1].forEach((coordStr) => {
    const parsedCoordX = Number(coordStr);
    empireAMaxDesiredCoord = Math.max(empireAMaxDesiredCoord, parsedCoordX);
  });

  inputCoordinateSets[2].forEach((coordStr) => {
    const parsedCoordY = Number(coordStr);
    empireBMinDesiredCoord = Math.min(empireBMinDesiredCoord, parsedCoordY);
  });

  const conditionOne = empireAMaxDesiredCoord >= currentCoordB;
  const conditionTwo = empireAMaxDesiredCoord >= empireBMinDesiredCoord;
  const conditionThree = empireBMinDesiredCoord <= currentCoordA;
  const conditionFour = empireBMinDesiredCoord <= empireAMaxDesiredCoord;

  const conflictDetected = (conditionOne || conditionTwo) || (conditionThree || conditionFour);

  return conflictDetected;
}
