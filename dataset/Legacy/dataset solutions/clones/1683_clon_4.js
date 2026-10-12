function ProcessDataStream(sourceContent) {
    const lineSegments = sourceContent.split("\n");

    const totalSections = Number(lineSegments.shift());

    const allSectionData = [];

    function processRemainingSections(remainingCount, currentSegments, dataAccumulator) {
        if (remainingCount === 0) {
            return dataAccumulator;
        }

        const sectionItemCount = Number(currentSegments.shift());
        
        const currentSectionEntries = Array.from({ length: sectionItemCount }, () => {
            const lineEntry = currentSegments.shift();
            return lineEntry.split(" ");
        });

        dataAccumulator.push(currentSectionEntries);

        return processRemainingSections(remainingCount - 1, currentSegments, dataAccumulator);
    }

    processRemainingSections(totalSections, lineSegments, allSectionData);
}

ProcessDataStream(require("fs").readFileSync("/dev/stdin", "utf8"));
