const fileSystem = require('fs');
const rawData = fileSystem.readFileSync('/dev/stdin', 'utf8');
const processedString = rawData.trim();

const oCounts = [0];
const pattern = /(J*)(O*)(I*)/g;
const allMatches = processedString.matchAll(pattern);

for (const currentMatch of allMatches) {
    const jSequence = currentMatch[1] || '';
    const oSequence = currentMatch[2] || '';
    const iSequence = currentMatch[3] || '';

    const jLen = jSequence.length;
    const oLen = oSequence.length;
    const iLen = iSequence.length;

    const isValidSequence = (jLen >= oLen && iLen >= oLen);

    if (isValidSequence) {
        oCounts.push(oLen);
    }
}

console.log(Math.max.apply(null, oCounts));
