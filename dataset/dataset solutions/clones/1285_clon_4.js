function ProcessMatrixData(dataStream) {
    const contentUnits = dataStream.split('\n').filter(Boolean);

    const sizeSpec = contentUnits[0].split(' ').map(s => +s);
    const rowCountA = sizeSpec[0];
    const colCountA = sizeSpec[1];

    const payloadUnits = contentUnits.slice(1);

    const matrixAData = payloadUnits.slice(0, rowCountA)
                                      .map(lineText => lineText.split(' ').map(s => +s));

    const vectorBData = payloadUnits.slice(rowCountA, rowCountA + colCountA)
                                         .map(lineText => +lineText.split(' ')[0]);

    const resultValues = matrixAData.map(currentRow =>
        currentRow.reduce((currentSum, elementA, elementIndex) =>
            currentSum + (elementA * vectorBData[elementIndex]),
            0
        )
    );

    resultValues.forEach(valueToPrint => console.log(valueToPrint));
}

ProcessMatrixData(require("fs").readFileSync("/dev/stdin", "utf8"));