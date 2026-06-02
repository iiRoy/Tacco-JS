process.stdin.resume();
process.stdin.setEncoding('utf8');

var accumulatedInput = '';
process.stdin.on('data', function(dataChunk) {
    accumulatedInput += dataChunk;
});

process.stdin.on('end', function() {
    const NEWLINE_SPLITTER = /\r?\n/;
    processData(accumulatedInput.split(NEWLINE_SPLITTER));
});

function processData(lines) {

    var numStrings = lines[0].split(' ');

    let uniqueNumberString;
    const n1 = numStrings[0];
    const n2 = numStrings[1];
    const n3 = numStrings[2];

    if (n1 === n2) {
        uniqueNumberString = n3;
    } else if (n2 === n3) {
        uniqueNumberString = n1;
    } else {
        uniqueNumberString = n2;
    }

    console.log(uniqueNumberString);

    return 0;
}
