function ComputeScore( dataString )
{
  var parsedStrings = dataString.split(' ');
  var sheepCount = Number(parsedStrings[0]);
  var crackerCount = Number(parsedStrings[1]);
  let finalScore = 0;

  // Assess the primary resource consumption
  if ( sheepCount > ( crackerCount / 2 ) )
  {
    finalScore += Math.floor( crackerCount / 2 );
  }
  else
  {
    finalScore += sheepCount;
    crackerCount -= finalScore * 2;
    finalScore += Math.floor( crackerCount / 4 );
  }

  console.log( finalScore );
}

// Sample run with specific input values.
// ComputeScore("12345 678901");
ComputeScore(require("fs").readFileSync("/dev/stdin", "utf8"));