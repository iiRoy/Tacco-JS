(() => {
    let collectedData = '';

    global.process.stdin.on('data', (portionBuffer) => {
        collectedData += portionBuffer.toString();
    });

    global.process.stdin.on('end', () => {
        let firstToken = '';
        const tokenSeeker = collectedData.match(/(\S+)/);

        if (tokenSeeker && tokenSeeker.length > 0) {
            firstToken = tokenSeeker[0];
        }

        const numericInterpretation = parseFloat(firstToken);
        
        const finalComputation = 1 - numericInterpretation;
        
        global.process.stdout.write(finalComputation + '\n');
    });

    global.process.stdin.on('error', (failure) => {
        global.process.stderr.write('IO issue: ' + failure.message + '\n');
        global.process.exit(1);
    });
})();