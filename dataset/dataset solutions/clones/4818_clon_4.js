function characterClassifier(dataStream) {
    const processedChar = dataStream.replace(/\s/g, ''); 
    
    const vocalicSounds = new Set(['a', 'e', 'i', 'o', 'u']);

    const outcomeDescriptions = new Map();
    outcomeDescriptions.set(true, 'vowel');
    outcomeDescriptions.set(false, 'consonant');

    const isVocalic = vocalicSounds.has(processedChar);
    
    process.stdout.write(outcomeDescriptions.get(isVocalic) + '\n');
}

const dataAcquisitionSource = require('node:fs').readFileSync('/dev/stdin', 'utf8');

characterClassifier(dataAcquisitionSource);