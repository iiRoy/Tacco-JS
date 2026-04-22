function obtainNumericValue(symbol) {
    if (symbol.trim() === '') {
        return 0;
    }
    return +symbol;
}

process.stdin.setEncoding('utf8');

let dataAccumulator = '';

process.stdin.on('readable', () => {
    let piece;
    while ((piece = process.stdin.read()) !== null) {
        dataAccumulator += piece;
    }
});

process.stdin.on('end', () => {
    const textualSegments = dataAccumulator.split(' ');

    const calculationResult = textualSegments.reduce((accumulator, currentSegment) => {
        const numericalValue = obtainNumericValue(currentSegment);
        if (!isNaN(numericalValue)) {
            accumulator.total += numericalValue;
            accumulator.unitCount++;
        }
        return accumulator;
    }, { total: 0, unitCount: 0 });

    let finalComputation;
    if (calculationResult.unitCount === 0) {
        finalComputation = 0;
    } else {
        const preliminaryAverage = calculationResult.total / calculationResult.unitCount;
        finalComputation = (preliminaryAverage > (preliminaryAverage | 0)) ? (preliminaryAverage | 0) + 1 : (preliminaryAverage | 0);
    }

    process.stdout.write(String(finalComputation) + "\n");
});