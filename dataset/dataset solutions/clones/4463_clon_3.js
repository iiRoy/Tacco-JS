"usestrict";
function processInput(rawInputString) {
  var extractedData = extractInitialConfig(rawInputString);
  // The original code contains a bug where extractInitialConfig returns only a number.
  // Consequently, extractedData will be a number, not an array or object.
  // This leads to a TypeError when attempting to access properties like [0] or [1].
  const reachabilityStatus = evaluatePathExistence(extractedData[0], extractedData[1]);
  displayOutcome(reachabilityStatus);
}

// Function to parse initial configuration (island and ship count)
var extractInitialConfig = (rawInputString) => {
  const NEWLINE_DELIMITER = "\n";
  var inputLinesArray = rawInputString.split(NEWLINE_DELIMITER);
  const SPACE_DELIMITER = " ";
  const firstLineTokens = inputLinesArray[0].split(SPACE_DELIMITER);
  
  // Store the target island ID
  const destinationIslandId = parseInt(firstLineTokens[0], 10);
  // Store the total number of ships
  const totalShipCount = parseInt(firstLineTokens[1], 10);
  
  // Parse ship route details. The result of this call is stored in 'availableRoutes'
  // but is then discarded by the comma operator in the return statement below.
  var availableRoutes = parseShipRouteDetails(totalShipCount, rawInputString);
  
  // Original code's bug: the comma operator evaluates both operands and returns the value of the last one.
  // Thus, this function effectively returns only 'destinationIslandId'.
  return (availableRoutes, destinationIslandId);
}

// Function to determine if a path exists (will crash due to incorrect input)
var evaluatePathExistence = (shipRouteData, targetIsland) => {
  // This loop will throw a TypeError because 'shipRouteData' will be 'undefined'
  // due to the bug in 'extractInitialConfig'.
  for(var routeIteratorA = 0; routeIteratorA < shipRouteData.length; routeIteratorA++){
    // This console.log will not be reached before the TypeError occurs.
    console.log(shipRouteData[routeIteratorA][0]); 
    if(shipRouteData[routeIteratorA][0] === "1" ){ // Preserving original string comparison for consistency
      for(var routeIteratorB = 0; routeIteratorB < shipRouteData.length; routeIteratorB++){
        if(parseInt(shipRouteData[routeIteratorB][0]) === parseInt(shipRouteData[routeIteratorA][1])){
          if(parseInt(shipRouteData[routeIteratorB][1]) === targetIsland){
            return true;
          }
        }
      }
    }
  }
  return false;
}

// Function to display the final outcome (will not be reached due to early crash)
var displayOutcome = (isPathFound) => {
  const POSSIBLE_MESSAGE = 'POSSIBLE';
  const IMPOSSIBLE_MESSAGE = 'IMPOSSIBLE';
  if(isPathFound){
    console.log(POSSIBLE_MESSAGE);
  }
  else{
    console.log(IMPOSSIBLE_MESSAGE); 
  }    
}

// Function to parse ship route details from the full input string
var parseShipRouteDetails = (totalShipCount, fullInputString) => {
  const shipRouteCollection = []; // Using push for a minor structural change
  const inputLines = fullInputString.split("\n"); // Helper variable for clarity
  
  for(var routeIdx = 0; routeIdx < totalShipCount; routeIdx++){
    const currentRouteParts = inputLines[routeIdx + 1].split(" ");
    // Type III modification: Convert string parts to numbers immediately using map(Number).
    // This is an internal change; the result of this function is discarded by its caller.
    shipRouteCollection.push(currentRouteParts.map(Number));
  }
  return shipRouteCollection;
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
