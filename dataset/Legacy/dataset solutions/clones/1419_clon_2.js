var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

var dataRows = rawData.split('\n');

while (true) {
    var currentValues = dataRows.shift().split(' ');

    var scoreMidterm = +currentValues[0];
    var scoreFinal = +currentValues[1];
    var scoreRetake = +currentValues[2];

    if (scoreMidterm + scoreFinal + scoreRetake === -3) {
        break;
    }

    if (scoreMidterm === -1 || scoreFinal === -1) {
        console.log('F');
    } else if (scoreMidterm + scoreFinal >= 80) {
        console.log('A');
    } else if (scoreMidterm + scoreFinal >= 65) {
        console.log('B');
    } else if (scoreMidterm + scoreFinal >= 50) {
        console.log('C');
    } else if (scoreMidterm + scoreFinal >= 30 && scoreRetake >= 50) {
        console.log('C');
    } else if (scoreMidterm + scoreFinal >= 30) {
        console.log('D');
    } else {
        console.log('F');
    }
}
