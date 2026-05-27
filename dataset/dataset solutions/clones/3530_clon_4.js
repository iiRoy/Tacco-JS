var inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
var inputProcessor;
var rawInputLines = [];
inputReader.on('line', function(input){rawInputLines.push(input);});
inputReader.on('close', function(){
  inputProcessor = initializeInputProcessor(rawInputLines);
  debugLog("-----start-----");
  var start = new Date();
  executeSolution();
  var end = new Date() - start;
  debugLog("----- end -----");
  debugLog("time : " + (end) + "ms");
  debugLog("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});
function getNextInt(){return dataConverter(getNextLine(),1);} function getNextStrArray(){return dataConverter(getNextLine(),2);}
function getNextIntArray(){return dataConverter(getNextLine(),4);} function getNextCharArray(){return dataConverter(getNextLine(),6);}
function getNextLine(){return inputProcessor.getNextLine();} function hasMoreLines(){return inputProcessor.hasMoreLines();}
function initializeInputProcessor(input){  
  var returnProcessor = {
    lineList : input, currentIdx : 0, maxLines : input.length,
    hasMoreLines : function(){return (this.currentIdx < this.maxLines);},
    getNextLine : function(){if(!this.hasMoreLines()){throw "ArrayIndexOutOfBoundsException これ以上ないよ";}else{var currentInput = this.lineList[this.currentIdx];this.currentIdx++;return currentInput;}}
  };
  return returnProcessor;
}
function outputResult(s){console.log(s);}
function debugLog(s){console.error("debug:" + require("util").inspect(s,false,null));}
function dataConverter(i,typeNum){try{switch(typeNum){case 1:return parseInt(i);case 2:return i.split(" ");case 4:return i.split(" ").map(Number);case 6:return i.split("");case 7:return i.split("").map(Number);case 8:return i.join(" ");case 9:return i.join("\n");case 0:return i.join("");default:return i;}}catch(e){return i;}}

function executeSolution(){
	var sourceString = getNextLine();
	var targetString = getNextLine();

    const alphabetSize = 26;
    const charACharCode = 'a'.charCodeAt(0);

    // charMapFwd[original_char_index] stores the charCode it maps to.
    // charMapBwd[mapped_char_index] stores the original_char_index that maps to it.
    // Both arrays represent a permutation of character indices (0-25).
    let charMapFwd = new Array(alphabetSize);
    let charMapBwd = new Array(alphabetSize);

    // Initialize as identity permutation: 'a' maps to 'a', 'b' to 'b', etc.
    for (let k = 0; k < alphabetSize; k++) {
        charMapFwd[k] = charACharCode + k; // e.g., index 0 ('a') maps to charCode for 'a'
        charMapBwd[k] = k;                 // e.g., charCode for 'a' (index 0) is mapped from index 0 ('a')
    }

    // Determine the character permutation by iterating through the strings
    for (let i = 0; i < sourceString.length; i++) {
        let sCharCode = sourceString.charCodeAt(i);
        let tCharCode = targetString.charCodeAt(i);

        let sCharIndex = sCharCode - charACharCode;
        let tCharIndex = tCharCode - charACharCode;

        // Get the character code that s[i] currently maps to
        let currentMappedSCharCode = charMapFwd[sCharIndex];

        if (currentMappedSCharCode === tCharCode) {
            // The character at sourceString[i] already maps to targetString[i]
            continue;
        }

        // Mismatch: sCharCode (original char at s[i]) currently maps to currentMappedSCharCode.
        // We need sCharCode to map to tCharCode.
        // This implies a swap in the permutation:
        // The character that currently maps to tCharCode (let's call its original index `origIdxForT`)
        // should now map to currentMappedSCharCode.
        // And sCharCode should now map to tCharCode.

        // Find the original character index that currently maps to tCharCode.
        let origIdxForT = charMapBwd[tCharIndex];

        // Find the original character index that currently maps to currentMappedSCharCode.
        let origIdxForCurrentMappedS = charMapBwd[currentMappedSCharCode - charACharCode];

        // Update the forward mapping:
        // The original character at `origIdxForT` now maps to `currentMappedSCharCode`.
        charMapFwd[origIdxForT] = currentMappedSCharCode;
        // The original character at `origIdxForCurrentMappedS` now maps to `tCharCode`.
        charMapFwd[origIdxForCurrentMappedS] = tCharCode;

        // Update the reverse mapping to reflect these changes:
        // `currentMappedSCharCode` is now mapped from `origIdxForT`.
        charMapBwd[currentMappedSCharCode - charACharCode] = origIdxForT;
        // `tCharCode` is now mapped from `origIdxForCurrentMappedS`.
        charMapBwd[tCharIndex] = origIdxForCurrentMappedS;
    }

    // Apply the determined permutation to the source string to build the result
    let finalTransformedChars = new Array(sourceString.length);
    for (let i = 0; i < sourceString.length; i++) {
        let originalCharIndex = sourceString.charCodeAt(i) - charACharCode;
        let mappedCharCode = charMapFwd[originalCharIndex];
        finalTransformedChars[i] = String.fromCharCode(mappedCharCode);
    }

    let finalOutputString = finalTransformedChars.join("");

	debugLog(targetString);
	debugLog(finalOutputString);
	if(finalOutputString === targetString){
		outputResult("Yes");
	}else{
		outputResult("No");
	}
}
