const romanSymbolLookup = ".IVXLCDM";

require("fs").readFileSync("/dev/stdin", "utf8")
  .split('\n')
  .map(function(inputLineEntry) {
    if (inputLineEntry) {
      let currentNumericValueHolder;
      let runningTotal = 0;
      let previousNumericValue = 0;

      inputLineEntry.split('').map(function(romanCharacter) {
        currentNumericValueHolder = romanSymbolLookup.indexOf(romanCharacter);
        
        currentNumericValueHolder = Math.pow(10, Math.floor(currentNumericValueHolder / 2)) / (2 - (currentNumericValueHolder % 2));

        if (currentNumericValueHolder > previousNumericValue) {
          runningTotal -= previousNumericValue * 2;
        }

        runningTotal += currentNumericValueHolder;

        previousNumericValue = currentNumericValueHolder;
      });

      console.log(runningTotal);
    } else {
      void 0;
    }
  });
