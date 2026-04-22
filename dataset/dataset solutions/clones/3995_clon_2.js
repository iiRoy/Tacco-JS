// The entire dataset is provided as incoming_data
function calculateOutcome(sourceData)
{
  var dataRows = sourceData.split('\n');

  var initialParameters = dataRows[0].split(' ');

  var upperLimit = Number(initialParameters[0]);
  var requiredRemainder = Number(initialParameters[1]);

  var finalCount = 0;

  for ( var outerNum = requiredRemainder || 1; outerNum <= upperLimit; outerNum++ ) {
    for ( var innerNum = requiredRemainder || 1; innerNum <= upperLimit; innerNum++ ) {
      if ( outerNum < innerNum ) {
        finalCount++;
      } else {
        if ( outerNum % innerNum >= requiredRemainder ) {
          finalCount++;
        }
      }
    }
  }

  console.log( finalCount );
}

// This section should not be altered (reads from stdio and calls the main processing function)
calculateOutcome( require("fs").readFileSync("/dev/stdin", "utf8") );