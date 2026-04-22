const processStream = (sourceContent) => {
    const contentLines = sourceContent.split('\n');
    const characterLimit = Number(contentLines[0]);
    const targetSequence = contentLines[1];

    const designatedSegment = targetSequence.slice(0, characterLimit);

    const gatherStatistics = (segment, currentIndex, accumulatorObject) => {
        if (currentIndex >= segment.length) {
            return accumulatorObject;
        }

        const currentGlyph = segment[currentIndex];
        if (currentGlyph === '.') {
            accumulatorObject.fullStop++;
        } else if (currentGlyph === '#') {
            accumulatorObject.hashSymbol++;
        }

        return gatherStatistics(segment, currentIndex + 1, accumulatorObject);
    };

    const initialAccumulators = { fullStop: 0, hashSymbol: 0 };
    const finalAccumulation = gatherStatistics(designatedSegment, 0, initialAccumulators);

    console.log(Math.min(finalAccumulation.fullStop, finalAccumulation.hashSymbol));
};

processStream(require("fs").readFileSync("/dev/stdin", "UTF-8"));