"use strict";

const processExternalContent = incomingStream => {
    const firstRelevantLine = incomingStream.trim().split("\n")[0];
    
    const desiredPrefixPattern = /^YAKI/;
    
    if (desiredPrefixPattern.test(firstRelevantLine)) {
        process.stdout.write("Yes\n");
    } else {
        process.stdout.write("No\n");
    }
};

const acquireSystemInput = () => {
    return require('node:fs').readFileSync('/dev/stdin', 'utf8');
};

processExternalContent(acquireSystemInput());