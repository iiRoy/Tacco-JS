function processInput(initialDivisor) {
    var targetDivisor = initialDivisor;
    var currentSevenSequence = 0;
    var sequenceLength = null;
  
    for (var digitIndex = 0; digitIndex <= initialDivisor; digitIndex++){
        if (sequenceLength !== null) {
            break;
        }

        currentSevenSequence = currentSevenSequence * 10 + 7;
      	
        if (currentSevenSequence <= targetDivisor){
        	continue;
        }
      	
        if (currentSevenSequence % targetDivisor === 0) {
            sequenceLength = digitIndex + 1;
        }
    }
  
  	if (sequenceLength !== null){
    	console.log(sequenceLength);
    } else {
    	console.log('-1');
    }
}
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
