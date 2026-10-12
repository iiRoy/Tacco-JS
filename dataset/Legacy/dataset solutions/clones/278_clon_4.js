const collectedWords = [];

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function(chunkData) {
    const processedSegment = chunkData.replace(/[.,]/g, ' ');
    
    processedSegment
        .split(/\s+/)
        .filter(currentLexeme => currentLexeme.length > 2 && currentLexeme.length < 7)
        .forEach(qualifiedLexeme => {
            collectedWords.push(qualifiedLexeme);
        });
});

process.stdin.on('end', function() {
    console.log(collectedWords.join(" "));
});
