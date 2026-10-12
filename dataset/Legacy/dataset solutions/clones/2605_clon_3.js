var read = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
var obj;
var inLine = [];
read.on('line', function(input){inLine.push(input);});
read.on('close', function(){
  obj = init(inLine);
  console.error("\n");
  var start = Date.now();
  executeMainLogic();
  var end = Date.now() - start;
  myerr("time : " + (end) + "ms");
  myerr("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});
function makeClone(obj){return JSON.parse(JSON.stringify(obj));}
function nextInt(){return myconv(next(),1);} function nextStrArray(){return myconv(next(),2);}
function nextIntArray(){return myconv(next(),4);} function nextCharArray(){return myconv(next(),6);}
function next(){return obj.next();} function hasNext(){return obj.hasNext();}
function init(input){  
  var returnObj = {
    list : input, index : 0, max : input.length,
    hasNext : function(){return (this.index < this.max);},
    next : function(){if(!this.hasNext()){throw "ArrayIndexOutOfBoundsException これ以上ないよ";}else{var returnInput = this.list[this.index];this.index++;return returnInput;}}
  };
  return returnObj;
}
function myout(s){console.log(s);}
function myerr(s){console.error("debug:" + require("util").inspect(s,false,null));}
function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(" ");case 4:return i.split(" ").map(Number);case 6:return i.split("");case 7:return i.split("").map(Number);case 8:return i.join(" ");case 9:return i.join("\n");case 0:return i.join("");default:return i;}}catch(e){return i;}}

function checkPlayerCompletionStatus(playerDataRecord, requiredMatchesCount) {
    return playerDataRecord.currentMatchIndex >= requiredMatchesCount;
}

function processSuccessfulMatch(playerOneRecord, playerTwoRecord, dailyBattledSet, finishedPlayersSet, totalMatchesExpected) {
    playerOneRecord.currentMatchIndex++;
    playerTwoRecord.currentMatchIndex++;
    
    dailyBattledSet.add(playerOneRecord.id);
    dailyBattledSet.add(playerTwoRecord.id);

    if (checkPlayerCompletionStatus(playerOneRecord, totalMatchesExpected)) {
        finishedPlayersSet.add(playerOneRecord.id);
    }
    if (checkPlayerCompletionStatus(playerTwoRecord, totalMatchesExpected)) {
        finishedPlayersSet.add(playerTwoRecord.id);
    }
    return true;
}


function executeMainLogic(){
	var totalPlayers = nextInt();
	var playerMatchSchedule = new Array(totalPlayers + 1);

	for(var playerIndex = 1; playerIndex <= totalPlayers; playerIndex++){
		playerMatchSchedule[playerIndex] = {
            id: playerIndex,
			scheduledOpponents : nextIntArray(),
			currentMatchIndex : 0
		};
	}

	var daysCounter = 0;
	var completedPlayers = new Set();
    var matchesPerPlayer = totalPlayers - 1;

	while(true){
		var playersBattledToday = new Set();
		var anyMatchHappened = false;

		for(var currentIterationPlayerId = 1; currentIterationPlayerId <= totalPlayers; currentIterationPlayerId++){
			if(completedPlayers.has(currentIterationPlayerId) || playersBattledToday.has(currentIterationPlayerId)){
				continue;
			}

            var currentPlayerRecord = playerMatchSchedule[currentIterationPlayerId];
            
            if (checkPlayerCompletionStatus(currentPlayerRecord, matchesPerPlayer)) {
                completedPlayers.add(currentIterationPlayerId);
                continue;
            }

			var potentialOpponentId = currentPlayerRecord.scheduledOpponents[currentPlayerRecord.currentMatchIndex];

			if(playersBattledToday.has(potentialOpponentId) || completedPlayers.has(potentialOpponentId)){
				continue;
			}

            var potentialOpponentRecord = playerMatchSchedule[potentialOpponentId];
            
            if (checkPlayerCompletionStatus(potentialOpponentRecord, matchesPerPlayer)) {
                completedPlayers.add(potentialOpponentId);
                continue;
            }

            var opponentExpectedNextMatch = potentialOpponentRecord.scheduledOpponents[potentialOpponentRecord.currentMatchIndex];
			if(opponentExpectedNextMatch === currentIterationPlayerId){
                anyMatchHappened = processSuccessfulMatch(
                    currentPlayerRecord,
                    potentialOpponentRecord,
                    playersBattledToday,
                    completedPlayers,
                    matchesPerPlayer
                );
			}
		}

		if(!anyMatchHappened){
			if(completedPlayers.size === totalPlayers){
				myout(daysCounter);
			}else{
				myout(-1);
			}
			return;
		}
		daysCounter++;
	}
}
