let allInputContent = '';

const exponentiate = (base, power) => {
    if (power === 0) return 1;
    if (power === 1) return base;
    if (power < 0) return 1 / exponentiate(base, -power);
    
    const halfPower = exponentiate(base, Math.floor(power / 2));
    if (power % 2 === 0) {
        return halfPower * halfPower;
    } else {
        return base * halfPower * halfPower;
    }
};

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', (incomingSegment) => {
    allInputContent += incomingSegment;
});

process.stdin.on('end', () => {
    const contentLines = allInputContent.trim().split('\n');

    const primaryMagnitude = parseInt(contentLines[0].trim(), 10);

    const integerCollection = contentLines[1].trim().split(/\s+/).map(Number);

    const pairCount = integerCollection.reduce((accumulator, item) => {
        return accumulator + (item % 2 === 0 ? 1 : 0);
    }, 0);

    const firstTerm = exponentiate(3, primaryMagnitude);
    const secondTerm = exponentiate(2, pairCount);
    const finalOutcome = firstTerm - secondTerm;

    process.stdout.write(finalOutcome.toString() + '\n');
});