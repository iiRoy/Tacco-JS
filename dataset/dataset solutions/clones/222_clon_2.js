var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

var numericInputs = ( rawData.trim() )
                           .split("\n")
                           .map(Number);

numericInputs.forEach(
  function(currentNumber)
  {
    var computedSeries = [ 0, currentNumber ];

    for
      (
        var loopIndex = 2;
        loopIndex <= 10;
        loopIndex++
      )
    {
      computedSeries[loopIndex]
          =
            ( loopIndex % 2 == 0 )
              ? computedSeries[loopIndex - 1] * 2
              : computedSeries[loopIndex - 1] / 3;
    }

    var cumulativeTotal = computedSeries.reduce(
      function
        ( currentAccumulation, nextValue )
      {
        return currentAccumulation + nextValue;
      }
    );

    console.log( cumulativeTotal.toFixed(8) );
  }
);