process.stdin.resume();
process.stdin.setEncoding('ascii');

var input_stdin_buffer = "";
var input_stdin_lines = [];
var current_line_index = 0;

process.stdin.on('data', function (data) {
    input_stdin_buffer += data;
});

process.on('SIGINT', function(){
    input_stdin_lines = input_stdin_buffer.split("\n");
    executeProcessing();
    process.exit();
});

process.stdin.on('end', function () {
    input_stdin_lines = input_stdin_buffer.split("\n");
    executeProcessing();    
});

function obtainLine() {
    return input_stdin_lines[current_line_index++];
}

/////////////// ignore above this line ////////////////////

function executeProcessing() {
    const dimensionsAndCount = obtainLine().split(" ").map(Number);
    const gridHeight = dimensionsAndCount[0];
    const gridWidth = dimensionsAndCount[1];
    const numInputPoints = dimensionsAndCount[2];
    
    const overlapTally = new Map();

    Array.from({ length: numInputPoints }, (_, pointIndex) => {
        const pointCoords = obtainLine().split(" ").map(Number);
        const currentPointRow = pointCoords[0];
        const currentPointCol = pointCoords[1];

        const affectedGridCells = Array.from({ length: 3 }, (_, rOffset) => rOffset - 2)
            .flatMap(rOffset => 
                Array.from({ length: 3 }, (_, cOffset) => cOffset - 2)
                    .map(cOffset => {
                        const cellTopRow = currentPointRow + rOffset;
                        const cellTopCol = currentPointCol + cOffset;
                        return [cellTopRow, cellTopCol];
                    })
            )
            .filter(([r, c]) => 
                r >= 1 && r <= gridHeight - 2 && 
                c >= 1 && c <= gridWidth - 2
            );

        affectedGridCells.forEach(([r, c]) => {
            const cellIdentifier = `${r}_${c}`;
            overlapTally.set(cellIdentifier, (overlapTally.get(cellIdentifier) || 0) + 1);
        });
    });
    
    const finalCounts = new Array(10).fill(0);
    const totalPossibleThreeByThree = (gridHeight - 2) * (gridWidth - 2);
    
    let distinctCoveredCells = 0;

    for (const countValue of overlapTally.values()) {
        if (countValue >= 1 && countValue <= 9) {
            finalCounts[countValue]++;
        }
        distinctCoveredCells++;
    }

    finalCounts[0] = totalPossibleThreeByThree - distinctCoveredCells;
    
    finalCounts.forEach(val => console.log(val.toString()));
}
