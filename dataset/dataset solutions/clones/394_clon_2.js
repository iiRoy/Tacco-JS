var filesystemModule = require('fs')
  , dataSize = filesystemModule.fstatSync(process.stdin.fd).size
  , readBuffer = new Buffer(dataSize)
  , octetsCount = filesystemModule.readSync(process.stdin.fd, readBuffer, 0, dataSize, 0)
  , dataLines = readBuffer.toString('utf8', 0, octetsCount).split('\n');

executeProcessing();

function executeProcessing()
{
  var delayPeriods = simulateEvents();

  for ( var idx = 0, maxIdx = dataLines.length - 1; idx < maxIdx; idx++ )
  {
    console.log(delayPeriods[parseInt(dataLines[idx], 10)]);
  }
}

function simulateEvents()
{
  // Initialize seating status for all 17 spots
  var seatOccupancy = new Int32Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  // Define the number of people in each party type
  var partySizes = new Int32Array([2, 5, 2, 2, 2]);
  // Set the duration each party occupies a seat
  var occupancyDurations = new Int32Array([19, 39, 25, 36, 22, 42]);

  var currentPartyIndex = -1;
  var elapsedMinutes = 0;
  // Array to store the waiting time for each party
  var partyWaitTimes = new Int32Array(100);
  var remainingParties = 100; // Total number of parties to be seated

  while ( true )
  {
    // Process seat availability at the start of each minute
    var loopCounter;
    for ( loopCounter = 17; loopCounter--; )
    {
      seatOccupancy[loopCounter] = findMaximum(--seatOccupancy[loopCounter], 0);
    }

    // Check for new party arrival every 5 minutes
    if ( currentPartyIndex == -1 && elapsedMinutes % 5 == 0 )
    {
      currentPartyIndex = elapsedMinutes / 5;
    }

    // Attempt to seat parties if there's an incoming party and available seats
    while ( currentPartyIndex != -1 && loopCounter != 17 )
    {
      var requiredConsecutiveSeats = partySizes[currentPartyIndex % 5];
      var availableConsecutive = 0;
      var firstSeatIndex = -1;

      for ( loopCounter = 0; loopCounter < 17; loopCounter++ )
      {
        availableConsecutive = (seatOccupancy[loopCounter] == 0) ? availableConsecutive + 1 : 0;

        if ( availableConsecutive == requiredConsecutiveSeats )
        {
          var currentPartyDuration = occupancyDurations[currentPartyIndex % 6];

          firstSeatIndex = loopCounter - (requiredConsecutiveSeats - 1);
          // Calculate and record waiting time for the current party
          partyWaitTimes[currentPartyIndex] = elapsedMinutes - (currentPartyIndex * 5);
          for ( var seatIdx = firstSeatIndex, endSeatIdx = (requiredConsecutiveSeats + firstSeatIndex); seatIdx < endSeatIdx; seatIdx++ )
          {
            seatOccupancy[seatIdx] = currentPartyDuration;
          }

          currentPartyIndex = (((currentPartyIndex + 1) * 5) <= elapsedMinutes) ? currentPartyIndex + 1 : -1;
          if ( !(--remainingParties) )
          {
            // All 100 parties have been seated
            return partyWaitTimes;
          }
          break; // Exit inner loop, party seated
        }
      }
    }

    elapsedMinutes++; // Advance time by one minute
  }
}

function findMaximum(valA, valB)
{
  var tempDiff = (valA - valB);

  return valA - (tempDiff & (tempDiff >> 31));
}