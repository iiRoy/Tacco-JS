const conductAnalysis = (inputContent) => {
    const contentLines = inputContent.split('\n');
    const valueSequence = contentLines[1].split(' ').map(Number);

    const initialMetric = {
        lowestSeen: valueSequence[0],
        greatestSpread: 0,
        spreadOccurrences: 0
    };

    const finalMetric = valueSequence.slice(1).reduce((accumulator, currentFigure) => {
        const potentialSpread = currentFigure - accumulator.lowestSeen;

        let updatedGreatestSpread = accumulator.greatestSpread;
        let updatedSpreadOccurrences = accumulator.spreadOccurrences;

        if (potentialSpread > accumulator.greatestSpread) {
            updatedGreatestSpread = potentialSpread;
            updatedSpreadOccurrences = 1;
        } else if (potentialSpread === accumulator.greatestSpread) {
            updatedSpreadOccurrences++;
        }

        const updatedLowestSeen = Math.min(accumulator.lowestSeen, currentFigure);

        return {
            lowestSeen: updatedLowestSeen,
            greatestSpread: updatedGreatestSpread,
            spreadOccurrences: updatedSpreadOccurrences
        };
    }, initialMetric);

    console.log(finalMetric.spreadOccurrences);
};

conductAnalysis(require('node:fs').readFileSync(0, 'utf8'));