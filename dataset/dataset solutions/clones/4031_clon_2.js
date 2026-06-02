var inputDataRows = [];

var ioModule = require('readline');

var inputHandler = ioModule.createInterface({
    input: process.stdin,
    output: process.stdout,
});

inputHandler.on('line', function (currentLine) {
    inputDataRows.push(currentLine);
});

inputHandler.on('close', function () {
    var matrixData = inputDataRows.map(rowStr => rowStr.split(" ").map(numStr => Number(numStr)));
    
    // Assume values for b_i based on the first column
    for (var valA1 = 0x0; valA1 <= 1e2; valA1++) {
        var valB1 = matrixData[0][0] - valA1;
        var valB2 = matrixData[1][0] - valA1;
        var valB3 = matrixData[2][0] - valA1;

        // Validate the assumed b_i values using the second column
        for (var valA2 = 0x0; valA2 <= 1e2; valA2++) {
            if (valA2 + valB1 !== matrixData[0][1]) { continue; }
            if (valA2 + valB2 !== matrixData[1][1]) { continue; }
            if (valA2 + valB3 !== matrixData[2][1]) { continue; }
            
            // If consistent, validate using the third column
            for (var valA3 = 0x0; valA3 <= 1e2; valA3++) {
                if (valA3 + valB1 !== matrixData[0][2]) { continue; }
                if (valA3 + valB2 !== matrixData[1][2]) { continue; }
                if (valA3 + valB3 !== matrixData[2][2]) { continue; }
                
                // If all checks pass, output "Yes" and terminate
                console.log("Yes");
                return (0x0);
            }
        }
    }
    // If no valid combination is found after all iterations, output "No"
    console.log("No");

});
