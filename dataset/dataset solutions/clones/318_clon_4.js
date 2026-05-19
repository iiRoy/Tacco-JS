process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function(rawInputData) {
    const inputLines = rawInputData.trim().split("\n");
    let lineIndex = 0;

    while (lineIndex < inputLines.length) {
        const batchSize = parseInt(inputLines[lineIndex].trim());
        lineIndex++;

        if (batchSize === 0) {
            break;
        }

        const clientRevenueMap = new Map();

        for (let transactionCounter = 0; transactionCounter < batchSize; transactionCounter++) {
            const clientData = inputLines[lineIndex].trim().split(" ");
            lineIndex++;

            const currentClientIdentifier = parseInt(clientData[0]);
            const transactionValue1 = parseInt(clientData[1]);
            const transactionValue2 = parseInt(clientData[2]);

            const transactionResult = transactionValue1 * transactionValue2;

            clientRevenueMap.set(
                currentClientIdentifier,
                (clientRevenueMap.get(currentClientIdentifier) || 0) + transactionResult
            );
        }

        const qualifyingClients = Array.from(clientRevenueMap.entries())
            .filter(([clientId, totalRevenue]) => totalRevenue >= 1000000)
            .map(([clientId, totalRevenue]) => clientId);

        if (qualifyingClients.length === 0) {
            console.log("NA");
        } else {
            qualifyingClients.forEach(clientId => {
                console.log(clientId);
            });
        }
    }
});
