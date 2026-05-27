(async () => {
    const readAllStdinContent = async () => {
        let accumulatedData = '';
        for await (const dataSegment of process.stdin) {
            accumulatedData += dataSegment;
        }
        return accumulatedData;
    };

    const rawContent = await readAllStdinContent();

    const splitParts = rawContent.split(/\s/);
    const targetString = splitParts[0];

    const numericValue = Number(targetString);

    const baseValue = 1;

    const computeDifference = (operand) => {
        return baseValue - operand;
    };

    const finalOutputValue = computeDifference(numericValue);

    console.log(finalOutputValue);
})();
