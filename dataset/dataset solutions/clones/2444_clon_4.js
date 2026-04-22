let characterAggregate = '';

process.stdin.on('data', (segment) => {
    characterAggregate += segment.toString();
});

process.stdin.on('end', () => {
    const cleansedRepresentation = characterAggregate.trim();
    const integerEquivalent = Number(cleansedRepresentation);

    // This calculation is equivalent to Math.ceil(X/2) - 1
    // For any integer X, it computes Math.floor((X - 1) / 2) using a bitwise right shift.
    const derivedOutcome = (integerEquivalent - 1) >> 1;

    process.stdout.write(String(derivedOutcome) + '\n');
});

process.stdin.on('error', (issue) => {
    process.stderr.write('Processing failure: ' + issue.message + '\n');
    process.exit(1);
});