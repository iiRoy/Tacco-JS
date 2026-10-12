function main(inputData) {
    const [initialLine, countLine] = inputData.split('\n');
    const [firstVal, secondVal, thirdVal] = initialLine.split(' ').map(Number);
    const loopIterations = Number(countLine);

    const processedValues = Array.from({ length: loopIterations }).reduce(
        (currentSet) => {
            let [valX, valY, valZ] = currentSet;

            if (valY >= valZ) {
                valZ *= 2;
            } else if (valX >= valY) {
                valY *= 2;
            }
            return [valX, valY, valZ];
        },
        [firstVal, secondVal, thirdVal]
    );

    const [finalX, finalY, finalZ] = processedValues;

    const outputCondition = (finalY <= finalZ && finalX <= finalY) ? 'yes' : 'no';
    console.log(outputCondition);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
