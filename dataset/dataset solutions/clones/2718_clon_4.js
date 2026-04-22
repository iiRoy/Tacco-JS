async function performCalculation() {
    let collectedStreamData = '';
    process.stdin.setEncoding('utf8');

    for await (const incomingChunk of process.stdin) {
        collectedStreamData += incomingChunk;
        const newlinePosition = collectedStreamData.indexOf('\n');
        if (newlinePosition !== -1) {
            collectedStreamData = collectedStreamData.substring(0, newlinePosition);
            break;
        }
    }

    const initialSegment = collectedStreamData.trim().split(" ")[0];
    const numericalInterpretation = +initialSegment;

    const displayElements = ["0", "0", "1", "0", "0", numericalInterpretation.toString()];
    const finalOutput = displayElements.join(" ");

    process.stdout.write(finalOutput + "\n");
    process.exit(0);
}

performCalculation();