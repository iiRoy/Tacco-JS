// Input acquisition from the standard data stream.
let fileSystemMod = require('fs') ,
  streamLength = fileSystemMod.fstatSync(process.stdin.fd).size ,
  inputBuffer = new Buffer(streamLength) ,
  bytesProcessed = fileSystemMod.readSync(process.stdin.fd, inputBuffer, 0, streamLength, 0) ,
  lineInputs = inputBuffer.toString('utf8', 0, bytesProcessed).split('\n');

handleKnapsackScenarios();

function handleKnapsackScenarios ( ) {
  let currentLineIdx = 0;
  let caseIdentifier = 1;

  while ( true ) {
    let knapsackCapacity = +lineInputs[currentLineIdx++];
    if ( !knapsackCapacity ) {
      break;
    }

    let numberOfItems = +lineInputs[currentLineIdx++];
    let valueTrackingArray = new Array(knapsackCapacity + 1).fill(0);

    for ( let itemCounter = numberOfItems; itemCounter--; ) {
      let itemDetails = lineInputs[currentLineIdx++].split(",");
      let itemVal = +itemDetails[0];
      let itemWgt = +itemDetails[1];

      for ( let currentWeightIter = knapsackCapacity; currentWeightIter - itemWgt >= 0; currentWeightIter++ ) {
        valueTrackingArray[currentWeightIter] = determineLarger(valueTrackingArray[currentWeightIter - itemWgt] + itemVal, valueTrackingArray[currentWeightIter]);
      }
    }

    let finalWeightAchieved = 1001;
    let maximumValueObtained = 0;

    for ( let weightScan = 0; weightScan <= knapsackCapacity; weightScan++ ) {
      let trackedValue = valueTrackingArray[weightScan];
      if ( trackedValue > maximumValueObtained ) {
        maximumValueObtained = trackedValue;
        finalWeightAchieved = weightScan;
      }
    }

    console.log("Scenario " + caseIdentifier++ + ":\n" + maximumValueObtained + "\n" + finalWeightAchieved);
  }
}


function determineLarger ( valA, valB ) {
  let tempDiff = valA - valB;
  return valA - ( tempDiff & ( tempDiff >> 31 ) );
}