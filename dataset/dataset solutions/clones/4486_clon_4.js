const processInput = (textualData) => {
    const segments = textualData.trim().split(/\s*\n\s*/);
    
    const [_, constraintValue] = segments[0].split(/\s+/).map(Number);

    const numericSequence = segments[1].split(/\s+/).map(Number);

    const { evenParityItems, oddParityItems } = numericSequence.reduce(
        (accumulator, currentItem) => {
            if (currentItem % 2 === 0) {
                accumulator.evenParityItems.push(currentItem);
            } else {
                accumulator.oddParityItems.push(currentItem);
            }
            return accumulator;
        },
        { evenParityItems: [], oddParityItems: [] }
    );

    const quantityEven = evenParityItems.length;
    const quantityOdd = oddParityItems.length;

    const evenItemContribution = 1 << quantityEven;

    let oddItemContribution;
    if (quantityOdd === 0) {
        oddItemContribution = (constraintValue === 0) ? 1 : 0;
    } else {
        oddItemContribution = 1 << (quantityOdd - 1);
    }
    
    return evenItemContribution * oddItemContribution;
};

console.log(processInput(require("fs").readFileSync("/dev/stdin", "utf8")));