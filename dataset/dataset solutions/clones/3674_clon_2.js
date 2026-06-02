let inputLines = ( "" + require("fs").readFileSync(0) ).split`\n`;

let segmentLength = +inputLines[0];

let sourceString = inputLines[1];

let patternCounts = {};

for ( let bitmask = (1 << segmentLength); bitmask--; ) {
    let currentPattern = "";
    for ( let idx = segmentLength; idx--; ) {
        currentPattern = bitmask & (1 << idx) ? sourceString[idx] + currentPattern : currentPattern + sourceString[idx];
    }
    patternCounts[currentPattern] = -~patternCounts[currentPattern];
}

let totalMatches = 0;

for ( let bitmask = (1 << segmentLength); bitmask--; ) {
    let currentPattern = "";
    for ( let idx = segmentLength; idx--; ) {
        currentPattern = bitmask & (1 << idx) ? sourceString[2 * segmentLength + ~idx] + currentPattern : currentPattern + sourceString[2 * segmentLength + ~idx];
    }
    totalMatches += ~~patternCounts[currentPattern];
}

console.log(totalMatches);
