const createLineStream = function* () {
    const rawContent = require("fs").readFileSync("/dev/stdin", "utf8").trim();
    const lines = rawContent.split("\n");
    let currentLineIndex = 0;
    while (currentLineIndex < lines.length) {
        yield lines[currentLineIndex++];
    }
};

const inputLineGenerator = createLineStream();

const fetchNumericLine = () => {
    const lineResult = inputLineGenerator.next();
    if (lineResult.done) {
        throw "NoSuchElementException:次に要素は無いよ";
    }
    return lineResult.value.split(" ").map(Number);
};

const emitResult = (outputContent) => console.log(outputContent);

const calculateFinalState = (initialValues, iterationCount) => {
    const iterationSequence = Array.from({ length: iterationCount }, (_, idx) => idx);

    const finalValues = iterationSequence.reduce(([currentFirst, currentSecond], currentIterationIndex) => {
        const isEvenTurn = currentIterationIndex % 2 === 0;

        const [nextFirst, nextSecond] = isEvenTurn
            ? (() => {
                const modifiedFirst = currentFirst - (currentFirst % 2);
                return [modifiedFirst / 2, currentSecond + (modifiedFirst / 2)];
            })()
            : (() => {
                const modifiedSecond = currentSecond - (currentSecond % 2);
                return [currentFirst + (modifiedSecond / 2), modifiedSecond / 2];
            })();

        return [nextFirst, nextSecond];
    }, initialValues);

    return finalValues;
};

const executeTransformation = () => {
    const initialParameters = fetchNumericLine();
    const [firstVal, secondVal, iterationCount] = initialParameters;

    const [finalFirst, finalSecond] = calculateFinalState([firstVal, secondVal], iterationCount);

    emitResult(`${finalFirst} ${finalSecond}`);
};

executeTransformation();
