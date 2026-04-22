'use strict';

function  computeGameResult(  gameInputStr  )  {
  gameInputStr = gameInputStr.trim().split('\n');
  
  const  initialVals  =  gameInputStr[0].split(' ').map(  strNum  =>  parseInt(strNum, 10)  );
  const  totalRounds  =  initialVals[0];
  const  delayPenalty  =  initialVals[1];
  
  const  movePoints  =  gameInputStr[1].split(' ').map(  val  =>  parseInt(val, 10)  );
  const  pointsRock  =  movePoints[0];
  const  pointsScissors  =  movePoints[1];
  const  pointsPaper  =  movePoints[2];
  
  const  enemySequence  =  gameInputStr[2];

  let  scoreLog  =  [];

  // Iterate through each round to calculate points based on opponent's moves and previous penalties.
  for  (let  roundIdx  =  0;  roundIdx  <  totalRounds;  ++roundIdx  )  {
    let  currentEnemyMove  =  enemySequence[roundIdx];

    /*
     * Check if the current move is penalized due to a recent win on the same move type.
     * A penalty occurs if the same winning move was made 'delayPenalty' rounds ago
     * and resulted in points.
     */
    if  (  roundIdx  >=  delayPenalty  &&  enemySequence[roundIdx  -  delayPenalty]  ===  currentEnemyMove  &&  scoreLog[roundIdx  -  delayPenalty]  >  0  )  {
      scoreLog.push(0); // Add zero points for a penalized round.
      continue; // Skip further point calculation for this round.
    }


    if  (  currentEnemyMove  ===  'r'  )  { // If opponent plays rock
      scoreLog.push(pointsPaper); // Player wins with paper, gets paper points.
    } 

    if  (  currentEnemyMove  ===  's'  )  { // If opponent plays scissors
      scoreLog.push(pointsRock); // Player wins with rock, gets rock points.
    }

    if  (  currentEnemyMove  ===  'p'  )  { // If opponent plays paper
      scoreLog.push(pointsScissors); // Player wins with scissors, gets scissors points.
    }    
  } // End of round iteration.
  
  // Calculate the grand total of all accumulated scores from the game.
  console.log(  scoreLog.reduce(  (  accumulatedSum,  currentScore  )  =>  accumulatedSum  +  currentScore  )  );
} // End of function definition.

computeGameResult(  require("fs").readFileSync("/dev/stdin", "utf8")  );