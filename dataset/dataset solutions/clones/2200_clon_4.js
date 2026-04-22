"use strict";

const transformQuantity = (val) => (val << 1) - 1;

let capturedData = '';

process.stdin.on('data', (chunk) => {
    capturedData += chunk;
});

process.stdin.on('end', () => {
    const processedInput = capturedData.trim();
    const numericInput = Number(processedInput);
    const finalOutcome = transformQuantity(numericInput);
    process.stdout.write(String(finalOutcome) + '\n');
});