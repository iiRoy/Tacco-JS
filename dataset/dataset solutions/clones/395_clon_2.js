// Parsing input from the standard input stream
var fileSystemUtil = require('fs');
    var  fileSize  = fileSystemUtil.fstatSync(process.stdin.fd).size;
var dataBuffer = new Buffer(fileSize);
var actualBytesRead = fileSystemUtil.readSync(process.stdin.fd, dataBuffer, 0, fileSize, 0);
var queryInputs = dataBuffer.toString('utf8', 0, actualBytesRead).split('\n');
processRestaurantSimulation();

  function processRestaurantSimulation(){
    var calculatedDelays = performSeatingLogic();
    for (  var currentQueryIndex = 0, totalQueries = queryInputs.length - 1 ;   currentQueryIndex < totalQueries  ;  currentQueryIndex++  ) {
      console.log(calculatedDelays[parseInt(queryInputs[currentQueryIndex], 10)]);
    }
  }

function performSeatingLogic ( ) {
  var tableOccupancy = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ];
  var partySizes = [ 2, 5, 2, 2, 2 ];
  var mealDurations = [ 19, 39, 25, 36, 22, 42 ];
  
  var currentPartyIndex = -1;
  var elapsedTime = 0;
  var partyArrivalDelays = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ];
  var remainingPartiesToSeat = 100;
  
  while ( true ) {
    // Decrement timers for currently occupied tables
    var seatIterationIndex;
    for ( seatIterationIndex = 17 ; seatIterationIndex-- ; ) {
      tableOccupancy[seatIterationIndex] = getGreaterValue(--tableOccupancy[seatIterationIndex], 0);
    }
    
    // Check for new party arrivals at the entrance
    if ( currentPartyIndex == -1 && elapsedTime % 5 == 0 ) {
      currentPartyIndex = elapsedTime / 5;
    }
    
    // Attempt to assign seats to waiting parties
    while ( currentPartyIndex != -1 && seatIterationIndex != 17 ) {
      var requiredConsecutiveSpots = partySizes[currentPartyIndex % 5];
      var consecutiveEmptySpots = 0;
      var firstAvailableSeat = -1;
      
      for ( seatIterationIndex = 0 ; seatIterationIndex < tableOccupancy.length ; seatIterationIndex++ ) {
        consecutiveEmptySpots = tableOccupancy[seatIterationIndex] == 0 ? consecutiveEmptySpots + 1 : 0;
        
        if ( consecutiveEmptySpots == requiredConsecutiveSpots ) {
          firstAvailableSeat = seatIterationIndex - (requiredConsecutiveSpots - 1);
          // Found enough contiguous empty seats for the current party
          partyArrivalDelays[currentPartyIndex] = elapsedTime - (currentPartyIndex * 5);
          for ( var fillIdx = firstAvailableSeat ; fillIdx < (requiredConsecutiveSpots + firstAvailableSeat) ; fillIdx++ ) {
            tableOccupancy[fillIdx] = mealDurations[currentPartyIndex % 6];
          }
          
          currentPartyIndex = (((currentPartyIndex + 1) * 5) <= elapsedTime) ? currentPartyIndex + 1 : -1;
          if ( !(--remainingPartiesToSeat) ) {
            // All one hundred parties have been seated; simulation complete
            return partyArrivalDelays;
          }
          break; // Exit the inner loop as the party has been seated
        }
      }
    }
    
    elapsedTime++;
  }
}

function getGreaterValue ( valA , valB ) {
  var difference = ( valA - valB );
  return valA - ( difference & ( difference >> 31 ) );
}