const fileSystem = require("fs");

const processInput = () => {
    const inputContent = fileSystem.readFileSync("/dev/stdin", "utf8");
    const linesOfData = inputContent.split(/\r?\n/);

    for (const currentEntry of linesOfData) {
        const [heightString, widthString] = currentEntry.split(' ');
        const numRows = parseInt(heightString, 10);
        const numCols = parseInt(widthString, 10);

        if (numRows === 0 && numCols === 0) {
            break;
        }

        const generatedGrid = Array.from({ length: numRows }, (_, rowIndex) =>
            Array.from({ length: numCols }, (_, colIndex) =>
                (rowIndex + colIndex) % 2 === 0 ? '#' : '.'
            ).join('')
        ).join('\n');

        console.log(generatedGrid + '\n');
    }
};

processInput();
