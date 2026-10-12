const processInput = function(sourceText) {
    const reverseSequence = (textSegment) => Array.from(textSegment).reverse().join('');
    const checkSymmetry = (segment) => segment === reverseSequence(segment);

    const initialString = String(sourceText);
    const totalLength = initialString.length;

    console.log(reverseSequence(initialString));

    const isOverallPalindrome = checkSymmetry(initialString);

    const firstHalfLength = (totalLength - 1) / 2;
    const firstSubsegment = initialString.substring(0, firstHalfLength);
    const isFirstSubsegmentPalindrome = checkSymmetry(firstSubsegment);

    const secondSubsegmentStart = (totalLength + 3) / 2;
    const secondSubsegmentEnd = totalLength - 1;
    const secondSubsegment = initialString.substring(secondSubsegmentStart, secondSubsegmentEnd);
    const isSecondSubsegmentPalindrome = checkSymmetry(secondSubsegment);

    const finalResult = isOverallPalindrome && isFirstSubsegmentPalindrome && isSecondSubsegmentPalindrome;

    console.log(finalResult ? "Yes" : "No");
};

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
