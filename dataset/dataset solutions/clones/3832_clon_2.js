var inputRecords = [ ]; var outcomeValue = 0;
  var inputProcessor = require('readline');

var readerInterface = inputProcessor.createInterface(
  {
    input: process.stdin,
    output: process.stdout,
  }
);

readerInterface.on(
  'line',
  function (receivedString)
  {
    inputRecords.push(receivedString);
  }
);

readerInterface.on('close',
  function () {
    // Obtain character array from the initial input line
    var sourceSequence = inputRecords[0].split("");
    // Convert the second input line to a numerical rank
    var desiredRank = Number(inputRecords[1]);

    // Initialize a 2D array to store potential substrings
    var fragmentGrid = Array(sourceSequence.length).fill(null).map(
      _ => Array(sourceSequence.length).fill("")
    );
    var lexiconStore = [];

    // Loop through all possible starting positions for substrings
    for (
      var beginPos = 0;
      beginPos < sourceSequence.length;
      beginPos++
    ) {
      // Loop through all possible ending positions for substrings
      for (
        var finishPos = beginPos;
        finishPos < sourceSequence.length;
        finishPos++
      ) {
        // If the current substring length exceeds the desired rank, no need to continue for this start position
        if (desiredRank <= fragmentGrid[beginPos][finishPos].length) {
          break;
        }
        else {
          // Build the next substring by appending the current character
          fragmentGrid[beginPos][finishPos + 1] = fragmentGrid[beginPos][finishPos] + sourceSequence[finishPos];
          // Add the newly formed substring to our collection
          lexiconStore.push(fragmentGrid[beginPos][finishPos + 1]);
        }
      }
    }

    // Filter out duplicate substrings to ensure uniqueness
    lexiconStore = lexiconStore.filter(
      (currentFragment, currentIdx, allFragments) =>
      {
        return (allFragments.indexOf(currentFragment) === currentIdx);
      }
    );

    // Sort the unique substrings alphabetically
    lexiconStore.sort();
    // Output the substring at the (desiredRank - 1) index (0-based)
    console.log(lexiconStore[desiredRank - 1]);
  }
);