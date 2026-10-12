function processDataBlocks(inputContent) {
    let currentInputLines = inputContent.split('\n');

    const handleNextBlock = (remainingLines) => {
        if (remainingLines.length === 0) {
            return;
        }

        const blockRowCount = Number(remainingLines.shift());

        if (blockRowCount === 0) {
            return;
        }

        const currentBlockRows = remainingLines.splice(0, blockRowCount);

        let blockColumnAggregates = Array(blockRowCount + 1).fill(0);

        currentBlockRows.forEach(rowString => {
            const rowNumericValues = rowString.split(' ').map(val => Number(val));

            const rowTotalSum = rowNumericValues.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

            const completeRowData = [...rowNumericValues, rowTotalSum];

            console.log(completeRowData.map(num => String(num).slice(-5).padStart(5, ' ')).join(''));

            blockColumnAggregates = blockColumnAggregates.map((aggregate, index) => aggregate + completeRowData[index]);
        });

        console.log(blockColumnAggregates.map(num => String(num).slice(-5).padStart(5, ' ')).join(''));

        handleNextBlock(remainingLines);
    };

    handleNextBlock(currentInputLines);
}

processDataBlocks(require("fs").readFileSync("input.txt", "utf8"));
