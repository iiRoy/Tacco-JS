let incomingDataStream = require('fs').readFileSync('/dev/stdin', 'UTF-8');

let formattedInputLines = incomingDataStream.trim().split("\n");

formattedInputLines.shift();

formattedInputLines.forEach(function (currentLineSegment) {
    let distanceMeasurements = [];
    let charSequenceArray = currentLineSegment.split('');

    let proximityCounter = -1;

    for (let charIndexPosition = 0; charIndexPosition < charSequenceArray.length; charIndexPosition++) {
        if (charSequenceArray[charIndexPosition] === 'c') {
            distanceMeasurements.push(0);
            proximityCounter = 1;
        } else if (charSequenceArray[charIndexPosition] === '.' && proximityCounter === -1) {
            distanceMeasurements.push(proximityCounter);
        } else if (charSequenceArray[charIndexPosition] === '.' && proximityCounter !== -1) {
            distanceMeasurements.push(proximityCounter);
            proximityCounter++;
        }
    }
    console.log(distanceMeasurements.join(' '));
});