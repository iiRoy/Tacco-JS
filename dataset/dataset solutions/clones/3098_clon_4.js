function computeLongestNucleotideSegment(rawText) {
    const processedText = rawText.split('\n')[0];
    const nucleotideBlocks = processedText.match(/([ACGT]+)/g);
    
    if (!nucleotideBlocks) {
        console.log(0);
        return;
    }

    const peakLength = nucleotideBlocks.reduce((maximumSoFar, currentSequence) => Math.max(maximumSoFar, currentSequence.length), 0);
    
    console.log(peakLength);
}

computeLongestNucleotideSegment(require('fs').readFileSync('/dev/stdin', 'utf8'));