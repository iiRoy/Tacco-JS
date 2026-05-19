function Main(input) {
    const lines = input.split('\n');
    const countValue = Number(lines[0].trim());
    const sourceSequence = lines[1].split(' ').map(Number);

    const finalOrder = sourceSequence.reduce((accumulator, currentElement, currentIndex) => {
        accumulator[currentElement - 1] = currentIndex + 1;
        return accumulator;
    }, Array(countValue).fill(0));

    console.log(finalOrder.join(' '));
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
