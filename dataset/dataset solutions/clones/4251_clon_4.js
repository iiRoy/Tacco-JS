const checkCharacters = (sourceText) => {
    const processedText = sourceText.trim();
    const lineSeparatorIndex = processedText.indexOf('\n');

    let firstLineContent;
    let secondLineContent;

    if (lineSeparatorIndex === -1) {
        firstLineContent = processedText;
        secondLineContent = undefined;
    } else {
        firstLineContent = processedText.substring(0, lineSeparatorIndex);
        secondLineContent = processedText.substring(lineSeparatorIndex + 1);
    }

    const firstLineChar0 = firstLineContent[0];
    const secondLineChar2 = secondLineContent[2];
    const secondLineChar0 = secondLineContent[0];
    const firstLineChar2 = firstLineContent[2];
    const firstLineChar1 = firstLineContent[1];
    const secondLineChar1 = secondLineContent[1];

    const condition1 = (firstLineChar0 == secondLineChar2);
    const condition2 = (secondLineChar0 == firstLineChar2);
    const condition3 = (firstLineChar1 == secondLineChar1);

    const totalMatches = (condition1 ? 1 : 0) + (condition2 ? 1 : 0) + (condition3 ? 1 : 0);

    if (totalMatches === 3) {
        console.log('YES');
    } else {
        console.log('NO');
    }
};

checkCharacters(require("fs").readFileSync("/dev/stdin","utf8"));