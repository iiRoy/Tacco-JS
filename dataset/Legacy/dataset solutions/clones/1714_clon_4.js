function processInputAndCompute(rawInputLines) {
    let lineCursor = 0;
    const advanceLine = () => rawInputLines[lineCursor++];

    const totalDays = Number(advanceLine());
    const initialConfiguration = advanceLine().split(' ').map(Number);

    const dailyOptionSets = Array.from({ length: totalDays }, () =>
        advanceLine().split(' ').map(Number)
    );

    const dailySelections = Array.from({ length: totalDays }, () =>
        Number(advanceLine())
    );

    dailyOptionSets.reduce((accumulator, optionsForDay, dayIndex) => {
        const chosenIndex = dailySelections[dayIndex];
        const scoreForCurrentDay = optionsForDay[chosenIndex];
        const newAggregate = accumulator + scoreForCurrentDay;
        console.log(newAggregate);
        return newAggregate;
    }, 0);
}

var incomingDataBuffer = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(dataSegment) {
  incomingDataBuffer += dataSegment;
});
process.stdin.on('end', function() {
  const parsedLines = incomingDataBuffer.split('\n');
  processInputAndCompute(parsedLines);
});
