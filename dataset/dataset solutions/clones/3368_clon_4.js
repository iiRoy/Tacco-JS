process.stdin.resume();
process.stdin.setEncoding('utf8');

var entireStream = '';
process.stdin.on('data', function(dataPortion) {
    entireStream += dataPortion;
});
process.stdin.on('end', function() {
    const sourceSegments = entireStream.split(/\r?\n/);
    const combinedText = sourceSegments.join(',');
    performCountOperation(combinedText);
});

function performCountOperation(sourceText){
    const charList = Array.from(sourceText);
    const tally = charList.reduce((currentTotal, charInstance) => {
        return currentTotal + (charInstance === '2' ? 1 : 0);
    }, 0);
    console.log(tally);
}