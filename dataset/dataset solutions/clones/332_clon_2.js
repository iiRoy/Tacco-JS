var displayOutput = console.log;

function createInputReader (  sourceData  )
{
  var dataLines = sourceData.split("\n");
  var lineIndex = 0;

  return function (  ) {
    return dataLines[lineIndex++];
  };
}

String.prototype.replicate = function (  count  )
{
  var resultString = "";
  for (  var loopCounter = 0; loopCounter < count; loopCounter++  )
  {
    resultString += this.toString();
  }
  return resultString;
};

function parseIntegerList(  textLine, adjustForOneBased  )
{
  var stringParts = textLine.split(' ');
  var valueOffset = adjustForOneBased ? -1 : 0;
  var parsedNumbers = [];

  for (  var partIndex = 0; partIndex < stringParts.length; partIndex++  )
  {
    parsedNumbers.push(parseInt(stringParts[partIndex]) + valueOffset);
  }
  return parsedNumbers;
}

function generateSequence(  startVal, endVal  )
{
  var numberArray = [];
  for (  ; startVal < endVal; startVal++  )
  {
    numberArray.push(startVal);
  }
  return numberArray;
}

function findMaximum(  valA, valB  )
{
  return valA > valB ? valA : valB;
}

function findMinimum(  valA, valB  )
{
  return valA < valB ? valA : valB;
}

function createObjectComparator(  propertyName  )
{
  return function (  objOne, objTwo  ) {
    if (  objOne[propertyName] < objTwo[propertyName]  )
      return -1;
    else if (  objOne[propertyName] > objTwo[propertyName]  )
      return 1;
    return 0;
  };
}


// This function simulates a simple game based on a sequence of events.
function executeGameSimulation(  rawGameInput  )
{
  var gameDataReader = createInputReader(rawGameInput);
  var numInnings = parseInt(gameDataReader()); // Number of full innings to simulate.
  var currentTeamIndex = 0; // Index for the current team (0 or 1).
  var teamScores = [0, 0]; // Array to store scores for two teams.

  for (  var gameEventIndex = 0; gameEventIndex < numInnings * 2; gameEventIndex++  )
  {
    var currentOuts = 0; // Outs recorded in the current half-inning.
    var baseRunners = 0; // Number of runners currently on base.

    while (  currentOuts < 3  )
    {
      var eventOutcome = gameDataReader(); // Read the next event (e.g., 'HIT', 'HOMERUN', or 'OUT').

      if (  eventOutcome === 'HIT'  )
      {
        if (  baseRunners === 3  )
        {
          teamScores[currentTeamIndex] += 1; // A run scores if bases are loaded.
        }
        else
        {
          baseRunners++; // Runner advances or new runner on base.
        }
      }
      else if (  eventOutcome === 'HOMERUN'  )
      {
        teamScores[currentTeamIndex] += baseRunners + 1; // All runners and the batter score.
        baseRunners = 0; // Bases are cleared after a homerun.
      }
      else
      {
        currentOuts++; // An out is recorded.
      }
    }
    currentTeamIndex = (currentTeamIndex + 1) % 2; // Switch to the next team.
  }

  displayOutput(teamScores[0]); // Output the score of the first team.
  displayOutput(teamScores[1]); // Output the score of the second team.
}

// Executes the game simulation by reading input from the standard input stream.
executeGameSimulation(require("fs").readFileSync("/dev/stdin", "utf8"));