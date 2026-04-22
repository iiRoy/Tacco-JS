const dataRetriever = require('node:fs');

const rawContent = dataRetriever.readFileSync('/dev/stdin', 'utf8');
const processedContent = rawContent.trim();

const firstToken = 'apple';
const secondToken = 'peach';

const replacementMap = new Map();
replacementMap.set(firstToken, secondToken);
replacementMap.set(secondToken, firstToken);

const swapPattern = new RegExp(`(${firstToken}|${secondToken})`, 'g');

const finalContent = processedContent.replace(swapPattern, (capturedSegment) => {
    return replacementMap.get(capturedSegment);
});

process.stdout.write(finalContent + '\n');