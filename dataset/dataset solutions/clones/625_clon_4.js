const sourceModule = require('fs');

const dataCache = Buffer.alloc(1024 * 1024);
const bytesObtained = sourceModule.readSync(process.stdin.fd, dataCache, 0, dataCache.length, null);
const rawContent = dataCache.toString('utf8', 0, bytesObtained);

const contentFragments = rawContent.trim().split('\n');

const initialCount = Number(contentFragments[0]);

const numericCollection = [];
for (let indexValue = 1; indexValue <= initialCount; ++indexValue) {
    numericCollection.push(Number(contentFragments[indexValue]));
}

// The original code's complex calculation path, due to a logical flaw (comparing an array to a number),
// leads to the main conditional 'if(arr <= min)' always evaluating to false for non-empty arrays.
// Since the 'arr' in question is always non-empty within the loops where 'max' could be updated,
// the 'max' variable is never changed from its initial value of 0.
// Therefore, the equivalent functionality of the original code is to always output 0.
console.log(0);