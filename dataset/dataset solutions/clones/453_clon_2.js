process.stdin.resume();
process.stdin.setEncoding('utf8');

let accumulatedContent = '';

process.stdin.on('data', (dataSegment) => {
    accumulatedContent += dataSegment;
});

process.stdin.on('end', () => {
    const contentRows = accumulatedContent.split('\n');
    let currentRowIndex = 0;

    while (true) {
        const principalValue = Number(contentRows[currentRowIndex++]);

        if (principalValue === 0) {
            break;
        }

        let solutionMonth = 'NA';

        for (let cycleCounter = 0; cycleCounter < 12; cycleCounter++) {
            const periodFigures = contentRows[currentRowIndex++].split(' ');
            
            const initialBalance = Number(periodFigures[0]);
            const paymentAmount = Number(periodFigures[1]);

            principalValue -= (initialBalance - paymentAmount);

            if (solutionMonth === 'NA' && principalValue <= 0) {
                solutionMonth = cycleCounter + 1;
            }
        }

        console.log(solutionMonth);
    }
});