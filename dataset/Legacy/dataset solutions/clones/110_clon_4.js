function* generateDayNames(inputContent) {
    const lineSegments = inputContent.trim().split('\n');
    const targetYear = 2004;

    for (const currentLine of lineSegments) {
        const dateComponents = currentLine.split(' ');
        const monthIdentifier = Number(dateComponents[0]);

        if (!monthIdentifier) {
            return;
        }

        const dayIdentifier = Number(dateComponents[1]);
        const specificMoment = new Date(targetYear, monthIdentifier - 1, dayIdentifier);
        
        yield specificMoment.toLocaleString('en-US', { weekday: 'long' });
    }
}

process.stdin.on("data", function(inputChunk) {
    for (const dayNameOutput of generateDayNames(inputChunk.toString())) {
        console.log(dayNameOutput);
    }
}).resume();
