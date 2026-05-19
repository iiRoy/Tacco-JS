function Main(input) {
    const [firstLineContent, secondLineContent] = input.trim().split('\n');
    const sourceChars = firstLineContent.split(' ')[0].split('');
    const targetChars = secondLineContent.split(' ')[0].split('');

    const sourceLength = sourceChars.length;
    const targetLength = targetChars.length;

    const lcsMatrix = Array.from({ length: targetLength + 1 }).reduce((accumulator, _, currentTargetIndex) => {
        if (currentTargetIndex === 0) {
            accumulator.push(Array(sourceLength + 1).fill(0));
            return accumulator;
        }

        const previousRow = accumulator[currentTargetIndex - 1];
        const currentRow = Array.from({ length: sourceLength + 1 }).reduce((rowAccumulator, __, currentSourceIndex) => {
            if (currentSourceIndex === 0) {
                rowAccumulator.push(0);
                return rowAccumulator;
            }

            if (sourceChars[currentSourceIndex - 1] === targetChars[currentTargetIndex - 1]) {
                rowAccumulator.push(previousRow[currentSourceIndex - 1] + 1);
            } else {
                rowAccumulator.push(Math.max(previousRow[currentSourceIndex], rowAccumulator[currentSourceIndex - 1]));
            }
            return rowAccumulator;
        }, []);

        accumulator.push(currentRow);
        return accumulator;
    }, []);

    const extractLCS = (rowPointer, colPointer) => {
        if (rowPointer === 0 || colPointer === 0) {
            return "";
        }

        if (sourceChars[colPointer - 1] === targetChars[rowPointer - 1]) {
            return extractLCS(rowPointer - 1, colPointer - 1) + sourceChars[colPointer - 1];
        } else {
            if (lcsMatrix[rowPointer - 1][colPointer] > lcsMatrix[rowPointer][colPointer - 1]) {
                return extractLCS(rowPointer - 1, colPointer);
            } else {
                return extractLCS(rowPointer, colPointer - 1);
            }
        }
    };

    const finalLCSResult = extractLCS(targetLength, sourceLength);
    console.log(finalLCSResult);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
