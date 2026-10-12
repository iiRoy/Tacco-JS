var fileSystem = require('fs');
var rawData = fileSystem.readFileSync('/dev/stdin', 'utf8');

function processLineForDistances(inputLine) {
    const targetCharacter = "c";
    let currentDistances = [];
    let charArray = inputLine.split("");
    let distanceCounter = -1;

    for (let charIndex = 0; charIndex < charArray.length; charIndex++) {
        let characterAtCurrentIndex = charArray[charIndex];
        if (characterAtCurrentIndex === targetCharacter) {
            distanceCounter = 0;
        }
        currentDistances.push(distanceCounter);
        if (distanceCounter !== -1) {
            distanceCounter++;
        }
    }
    return currentDistances.join(" ");
}

var allInputLines = rawData.trim().split("\n");
var linesToProcess = allInputLines.slice(1);

linesToProcess.forEach(function(currentLineContent){
   var outputString = processLineForDistances(currentLineContent);
   console.log(outputString);
});
