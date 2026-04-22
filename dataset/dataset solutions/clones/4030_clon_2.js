var textualInputs =
[]; var lineReaderModule
= require('readline');

var interfaceHandler = lineReaderModule.createInterface(
    {
        input: process.stdin,
        output: process.stdout
    }
);

interfaceHandler.on('line',
    function (inputSegment) {
        textualInputs.push(inputSegment);
    }
);

interfaceHandler.on('close',
    function () {
        var numericalGrid = textualInputs.map(
            singleRowText => singleRowText.split(" ").map(
                numberString => Number(numberString)
            )
        );

        for (var firstColumnProbe = 0; firstColumnProbe <= 100; firstColumnProbe++) {
            var colB_row1_val = numericalGrid[0][0] - firstColumnProbe;
            var colB_row2_val = numericalGrid[1][0] - firstColumnProbe;
            var colB_row3_val = numericalGrid[2][0] - firstColumnProbe;

            for (var secondColumnProbe = 0; secondColumnProbe <= 100; secondColumnProbe++) {
                if (secondColumnProbe + colB_row1_val !== numericalGrid[0][1]) {
                    continue;
                }
                if (secondColumnProbe + colB_row2_val !== numericalGrid[1][1]) {
                    continue;
                }
                if (secondColumnProbe + colB_row3_val !== numericalGrid[2][1]) {
                    continue;
                }

                for (var thirdColumnProbe = 0; thirdColumnProbe <= 100; thirdColumnProbe++) {
                    if (thirdColumnProbe + colB_row1_val !== numericalGrid[0][2]) {
                        continue;
                    }
                    if (thirdColumnProbe + colB_row2_val !== numericalGrid[1][2]) {
                        continue;
                    }
                    if (thirdColumnProbe + colB_row3_val !== numericalGrid[2][2]) {
                        continue;
                    }

                    console.log("Yes");
                    return (0);
                }
            }
        }
        console.log("No");
    }
);