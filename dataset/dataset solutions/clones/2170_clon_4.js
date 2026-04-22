"use strict";

(function() {
    // Stage 1: Obtain raw input data (divergent from require("fs").readFileSync)
    // Access 'fs' module via global.process.mainModule.require to avoid direct 'require' identifier
    const fileSystemOperator = globalThis.process.mainModule.require("fs");
    // Allocate a buffer to read stdin contents, avoiding direct 'Buffer' identifier (using globalThis.Buffer)
    const inputMemoryBlock = globalThis.Buffer.alloc(1024 * 1024); // Sufficiently large buffer
    // Synchronously read from stdin (file descriptor 0), avoiding 'readFileSync'
    const bytesAcquired = fileSystemOperator.readSync(
        0, // Standard input file descriptor
        inputMemoryBlock,
        0, // Offset within the buffer
        inputMemoryBlock.byteLength // Maximum bytes to read
    );
    // Convert buffer to string, specifying UTF-8 encoding
    const fullSourceContent = inputMemoryBlock.toString('utf8', 0, bytesAcquired);

    // Stage 2: Custom trim functionality (divergent from .trim())
    const processEdgesOfText = (sourceString) => {
        let currentFront = 0;
        // Calculate string length without using the '.length' property
        let currentStringMeasure = 0;
        for (const characterUnit of sourceString) {
            currentStringMeasure = currentStringMeasure + 1;
        }
        let currentRear = currentStringMeasure - 1;

        // Characters considered whitespace
        const blankSpaceElements = [' ', '\t', '\n', '\r'];
        
        // Advance 'currentFront' past leading whitespace
        while (currentFront <= currentRear && blankSpaceElements.some(item => sourceString[currentFront] === item)) {
            currentFront = currentFront + 1;
        }
        // Retreat 'currentRear' past trailing whitespace
        while (currentRear >= currentFront && blankSpaceElements.some(item => sourceString[currentRear] === item)) {
            currentRear = currentRear - 1;
        }
        // Extract the trimmed portion using 'substring' (different from 'slice')
        return sourceString.substring(currentFront, currentRear + 1);
    };
    const contentAfterEdgeProcessing = processEdgesOfText(fullSourceContent);

    // Stage 3: Custom split functionality by newline (divergent from .split("\n"))
    const sectionByLineBreak = (targetString) => {
        const collectedSegments = [];
        let buildingSegment = '';
        // Calculate string length without using the '.length' property
        let targetStringMeasure = 0;
        for (const singleCharacter of targetString) {
            targetStringMeasure = targetStringMeasure + 1;
        }

        for (let positionIndex = 0; positionIndex < targetStringMeasure; positionIndex = positionIndex + 1) {
            const charAtCurrentPosition = targetString[positionIndex];
            if (charAtCurrentPosition === '\n') {
                collectedSegments.push(buildingSegment); // Add current segment
                buildingSegment = ''; // Reset for next segment
            } else {
                buildingSegment = buildingSegment + charAtCurrentPosition; // Append character to current segment
            }
        }
        collectedSegments.push(buildingSegment); // Add the final segment
        return collectedSegments;
    };
    const brokenIntoLines = sectionByLineBreak(contentAfterEdgeProcessing);

    // Stage 4: Determine length of the first line (divergent from input[0].length)
    const primaryDataLine = brokenIntoLines[0];
    let characterCountForLine = 0;
    // Iterate and count characters to find length
    for (const individualChar of primaryDataLine) {
        characterCountForLine = characterCountForLine + 1;
    }

    // Stage 5: Construct repeated 'x' string (divergent from "x".repeat(N))
    const generateRepeatedCharacterSequence = (repetitionAmount, characterUnit) => {
        let finalSequence = '';
        for (let repetitionIteration = 0; repetitionIteration < repetitionAmount; repetitionIteration = repetitionIteration + 1) {
            finalSequence = finalSequence + characterUnit; // Concatenate character 'repetitionAmount' times
        }
        return finalSequence;
    };
    const resultForDisplay = generateRepeatedCharacterSequence(characterCountForLine, 'x');

    // Stage 6: Output the result (divergent from console.log)
    // Use global.process.stdout.write to avoid 'console' and 'log' identifiers
    globalThis.process.stdout.write(resultForDisplay + '\n');
})();