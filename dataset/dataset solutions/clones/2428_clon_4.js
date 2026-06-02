function Main(inputContent) {
    const dataLines = inputContent.split("\n");
    const stringLength = parseInt(dataLines[0], 10);
    const sourceString = dataLines[1];

    if ((stringLength & 1) === 1) {
        console.log('No');
        return;
    }

    const halfLength = stringLength >> 1;

    const firstPart = sourceString.slice(0, halfLength);
    const secondPart = sourceString.slice(halfLength);

    console.log(firstPart === secondPart ? 'Yes' : 'No');
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
