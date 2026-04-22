var dataSource = require('fs').readFileSync('/dev/stdin', 'utf8');
var parsedLines = dataSource.trim().split("\n");

while (true)
{
    var dims = parsedLines.shift().split(" ").map(Number);
    if (dims.join(" ") === "0 0")
        break;

    var numRows = dims[0];
    var numCols = dims[1];

    var heightMap = [];

    for (var rowIndex = 0; rowIndex < numRows; rowIndex++)
    {
        var charArray = parsedLines.shift().split("");
        heightMap[rowIndex] = [];

        charArray.forEach(function (charValue, colIndex)
        {
            if (rowIndex === 0 && charValue === ".")
                heightMap[rowIndex][colIndex] = 1.0;
            else if (rowIndex === 0 && charValue !== ".")
                heightMap[rowIndex][colIndex] = 0.0;
            else if (rowIndex !== 0 && charValue === ".")
                heightMap[rowIndex][colIndex] = heightMap[rowIndex - 1][colIndex] + 1.0;
            else if (rowIndex !== 0 && charValue !== ".")
                heightMap[rowIndex][colIndex] = 0.0;
        });
    }

    var maximumArea = 0.0;

    for (var currentR = 0; currentR < numRows; currentR++)
    {
        var barStack = [];
        heightMap[currentR][numCols] = 0.0;

        for (var colIndex = 0; colIndex <= numCols; colIndex++)
        {
            var barHeight = heightMap[currentR][colIndex];

            if (barStack.length === 0)
            {
                barStack.push([barHeight, colIndex]);
                continue;
            }

            if (barStack[barStack.length - 1][0] < barHeight)
                barStack.push([barHeight, colIndex]);
            else if (barStack[barStack.length - 1][0] === barHeight)
                continue;
            else if (barStack[barStack.length - 1][0] > barHeight)
            {
                var lastPopIndex;
                while (true)
                {
                    if (barStack.length === 0)
                    {
                        barStack.push([barHeight, lastPopIndex]);
                        break;
                    }
                    var poppedItem = barStack.pop();
                    if (barHeight > poppedItem[0])
                    {
                        barStack.push([barHeight, lastPopIndex]);
                        break;
                    }
                    lastPopIndex = poppedItem[1];
                    if (barHeight === poppedItem[0])
                        break;
                    else if (barHeight <= poppedItem[0])
                    {
                        maximumArea = Math.max(maximumArea, poppedItem[0] * (colIndex - poppedItem[1]));
                    }
                }
            }
        }
    }
    console.log(maximumArea);
}