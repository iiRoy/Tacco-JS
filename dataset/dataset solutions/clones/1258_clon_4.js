process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', (inputSegment) => {
    const [rowDimension, colDimension] = String(inputSegment).trim().split(' ').map(Number);

    if (rowDimension === 0 && colDimension === 0) {
        process.exit(0);
    }

    const hashPattern = Array.from({ length: colDimension }, () => '#').join('\n');

    Array.from({ length: rowDimension }).forEach(() => {
        console.log(hashPattern);
        console.log('\n');
    });

    console.log('\n');
});
