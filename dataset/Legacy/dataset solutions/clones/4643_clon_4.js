const processInputAndDetermineProgression = () => {
    const rawInputContent = require('node:fs').readFileSync(0, 'utf8');
    const parsedNumericSequence = rawInputContent.trim().split(/\s+/).map(parseFloat);

    const [firstElement, middleElement, lastElement] = parsedNumericSequence;

    const isArithmeticProgression = (middleElement * 2 === firstElement + lastElement);

    console.log(isArithmeticProgression ? 'YES' : 'NO');
};

processInputAndDetermineProgression();
