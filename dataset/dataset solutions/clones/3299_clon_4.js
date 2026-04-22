let dataBuffer = '';

global.process.stdin.resume();
global.process.stdin.setEncoding('utf8');

global.process.stdin.on('data', (incomingData) => {
  dataBuffer += incomingData;
});

global.process.stdin.on('end', () => {
  const parsedData = dataBuffer.split('\n').filter(Boolean);
  evaluateProfit(parsedData);
});

function evaluateProfit(rawLines) {
    const totalItems = Number(rawLines[0]);
    const initialItemValues = rawLines[1].split(' ').map(Number);

    const remainingItemLines = rawLines.slice(2, totalItems + 1);

    const finalItemScores = remainingItemLines.reduce((priorItemScores, currentItemLine) => {
        const currentItemPrices = currentItemLine.split(' ').map(Number);
        const nextItemScores = new Array(3);

        for (let hueIdentifier = 0; hueIdentifier < 3; hueIdentifier++) {
            const alternativeHueA = (hueIdentifier + 1) % 3;
            const alternativeHueB = (hueIdentifier + 2) % 3;
            
            const bestPriorScore = Math.max(priorItemScores[alternativeHueA], priorItemScores[alternativeHueB]);
            
            nextItemScores[hueIdentifier] = currentItemPrices[hueIdentifier] + bestPriorScore;
        }
        return nextItemScores;
    }, initialItemValues);

    console.log(Math.max(...finalItemScores));
}