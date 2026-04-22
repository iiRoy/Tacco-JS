const streamData = require('node:fs').readFileSync('/dev/stdin', { encoding: 'utf8' });

const rawLines = streamData.trim().split('\n');

const initialCount = parseInt(rawLines[0], 10);

const sourceElementsAsString = rawLines[1].split(' ');
const collectionOfSources = [];
for (let i = 0; i < sourceElementsAsString.length; i++) {
    collectionOfSources.push(parseInt(sourceElementsAsString[i], 10));
}

// rawLines[2] (equivalent to N2) is not used in the original logic either, so we skip it.

const targetElementsAsString = rawLines[3].split(' ');
const collectionOfTargets = [];
for (let i = 0; i < targetElementsAsString.length; i++) {
    collectionOfTargets.push(parseInt(targetElementsAsString[i], 10));
}

const uniqueSourceSet = new Set(collectionOfSources);

let totalMatches = 0;
for (const soughtValue of collectionOfTargets) {
    if (uniqueSourceSet.has(soughtValue)) {
        totalMatches = totalMatches + 1;
    }
}

process.stdout.write(totalMatches.toString() + '\n');