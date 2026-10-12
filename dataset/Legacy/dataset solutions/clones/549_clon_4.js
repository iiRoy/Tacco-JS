const processInput = (lines, currentLineIndex = 0, collectedOutputs = []) => {
    if (currentLineIndex >= lines.length) {
        return collectedOutputs;
    }

    const currentBlockHeader = lines[currentLineIndex].trim();

    if (currentBlockHeader === "0") {
        return collectedOutputs;
    }

    const dictionaryEntryCount = Number(currentBlockHeader);
    let nextIndex = currentLineIndex + 1;

    const translationMap = new Map(
        Array.from({ length: dictionaryEntryCount }, (_, offset) => {
            const line = lines[nextIndex + offset].trim();
            const [source, target] = line.split(" ");
            return [source, target];
        })
    );
    nextIndex += dictionaryEntryCount;

    const transformationWordCount = Number(lines[nextIndex].trim());
    nextIndex++;

    const transformedSegment = Array.from({ length: transformationWordCount }, (_, offset) => {
        const wordToTransform = lines[nextIndex + offset].trim();
        return translationMap.get(wordToTransform) || wordToTransform;
    }).join('');
    nextIndex += transformationWordCount;

    return processInput(lines, nextIndex, [...collectedOutputs, transformedSegment]);
};

const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const allInputLines = fileContent.trim().split("\n");

const finalResults = processInput(allInputLines);

finalResults.forEach(resultLine => console.log(resultLine));
