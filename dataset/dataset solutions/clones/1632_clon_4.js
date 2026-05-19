(async () => {
    let rawInput = '';
    for await (const dataChunk of process.stdin) rawInput += dataChunk;
    const parsedValues = rawInput.split(/\s/);
    const limit = +parsedValues.shift();
    const charSequence = parsedValues[0].split('').slice(0, limit);

    const redCount = charSequence.filter(symbol => symbol === 'R').length;

    const exchangeTally = charSequence
        .slice(0, redCount)
        .filter(symbol => symbol === 'W')
        .length;

    console.log(exchangeTally);
})();
