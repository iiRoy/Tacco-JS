executeProgram();

function executeProgram() {
  const inputProcessor = require('readline');
  let interfaceHandler = inputProcessor.createInterface(
    {
      input: process.stdin,
      output: process.stdout
    }
  );

  let receivedInputs = [ ];

  interfaceHandler.on('line',
    function (currentInput) {
      receivedInputs.push(currentInput);
    }
  );

  interfaceHandler.on('close',
    function () {
      let countValue = parseInt(receivedInputs[0], 10);
      let itemLengths = receivedInputs[1].split(/\s+/);

      console.log(calculateAreaFromItems(countValue, itemLengths));
    }
  );
}


function calculateAreaFromItems(totalCount, itemLengths) {
  itemLengths.sort( function (firstElement, secondElement) {
    if (firstElement > secondElement) return -1;
    if (firstElement < secondElement) return 1;
    return 0;
  } );


  let dimensionOne = 0, dimensionTwo = 0;
  for (let indexCounter = 0; indexCounter < itemLengths.length - 1; ++indexCounter) {
    if (dimensionOne !== 0 && dimensionTwo !== 0) {
      break;
    }

    if (itemLengths[indexCounter] === itemLengths[indexCounter + 1]) {
      if (dimensionOne === 0) {
        dimensionOne = itemLengths[indexCounter];
      } else {
        dimensionTwo = itemLengths[indexCounter];
      }
      indexCounter++;
    }
  }

  return dimensionOne * dimensionTwo;
}