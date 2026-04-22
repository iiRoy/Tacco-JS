const calculationModule = {
    conversionConstant: 3.305785,
    performConversion: (valA, valB) => (valA * valB) / calculationModule.conversionConstant
};

async function processInputData() {
    let allReceivedChunks = '';

    for await (const dataPiece of process.stdin) {
        allReceivedChunks += dataPiece.toString('utf8');
    }

    const valueComponents = allReceivedChunks.split(' ');
    const firstOperand = valueComponents[0];
    const secondOperand = valueComponents[1];

    const finalCalculationResult = calculationModule.performConversion(firstOperand, secondOperand);

    process.stdout.write(finalCalculationResult.toString() + '\n');
}

processInputData();