"use strict";

function Main(input) {
    const lines = input.split('\n');
    const elementCount = parseInt(lines[0]);
    const numberSequence = lines[1].split(' ').map(Number);

    let totalSubarrays = 0;
    let windowStart = 0;
    let currentWindowBitwiseOR = 0;

    for (let windowEnd = 0; windowEnd < elementCount; windowEnd++) {
        while ((currentWindowBitwiseOR & numberSequence[windowEnd]) !== 0) {
            currentWindowBitwiseOR ^= numberSequence[windowStart];
            windowStart++;
        }
        currentWindowBitwiseOR |= numberSequence[windowEnd];
        totalSubarrays += (windowEnd - windowStart + 1);
    }

    console.log(totalSubarrays);
}

if (typeof window == "undefined") Main(require("fs").readFileSync("/dev/stdin", "utf8"));
