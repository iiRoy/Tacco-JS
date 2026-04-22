function calculateMatchResult(playerOneScore, playerTwoScore) {
    if (playerOneScore === playerTwoScore) {
        return playerOneScore;
    } else {
        // Computes the absolute difference without using Math.abs explicitly,
        // diverging from the original's explicit if-else structure for subtraction.
        return Math.max(playerOneScore, playerTwoScore) - Math.min(playerOneScore, playerTwoScore);
    }
}

// Recursive function to simulate the tournament rounds
function conductRound(currentContestants) {
    // Base case: If only one contestant remains, they are the champion
    if (currentContestants.length === 1) {
        return currentContestants[0];
    }

    const nextRoundParticipants = [];
    // Process contestants in pairs from the current round
    for (let currentPosition = 0; currentPosition < currentContestants.length; currentPosition += 2) {
        const participantA = currentContestants[currentPosition];
        const participantB = currentContestants[currentPosition + 1];
        // Determine the winner of the match and add to the next round's list
        nextRoundParticipants.push(calculateMatchResult(participantA, participantB));
    }

    // Recursively call for the next round with the new set of participants
    return conductRound(nextRoundParticipants);
}

// Main entry point for the championship simulation
function Main(rawInputText) {
    // Initialize input system using the provided boilerplate function
    init(rawInputText);
    
    // Read the initial power value
    const initialPower = inI();
    // Calculate the total number of initial competitors (2 raised to the power of initialPower)
    const totalCompetitors = Math.pow(2, initialPower);
    
    const initialScores = [];
    // Read all initial scores into a list
    for (let currentIdx = 0; currentIdx < totalCompetitors; currentIdx++) {
        initialScores.push(inI());
    }

    // Conduct the tournament using the recursive function and retrieve the final champion's score
    const finalChampionScore = conductRound(initialScores);
    
    // Output the final result using the provided boilerplate function
    outln(finalChampionScore);
}


////////////////////////////////////////////////////////////////////////////////////
var input,inputCnt;

// "実行する"ボタンを押した時に実行される関数 (デバッグ用)
function debug(){
	Main(document.getElementById("input").value);
}

function init(inputData){
    //配列inputに順番に代入
	input = inputData.replace( /\n/g , " " );
	input = input.split(" ");
	inputCnt = 0;
}
//output
const out = (output) => { console.log(output) }
const outln = (output) => { console.log(output+"\n") }

//input
const inS = () => {return input[inputCnt++]};
const inI = () => {return parseInt(inS(), 10)};
const inF = () => {return parseFloat(inS())};

//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));