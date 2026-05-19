const parseInputValues = (inputString) => {
    return inputString.split(' ').map(Number);
};

const calculateWeightedSum = (currentCol, totalRows, currentRow, totalCols) => {
    return currentCol * (totalRows - currentRow) + currentRow * (totalCols - currentCol);
};

const processInput = function(rawData) {
    const parsedValues = parseInputValues(rawData);
    const totalRows = parsedValues[0];
    const totalCols = parsedValues[1];
    const requiredSum = parsedValues[2];

    let finalOutcome = 'No';
    let matchFound = false;

    for (let currentRow = 0; currentRow <= totalRows; currentRow++) {
        for (let currentCol = 0; currentCol <= totalCols; currentCol++) {
            if (calculateWeightedSum(currentCol, totalRows, currentRow, totalCols) === requiredSum) {
                finalOutcome = 'Yes';
                matchFound = true;
                break;
            }
        }
        if (matchFound) {
            break;
        }
    }

    if (matchFound) {
        console.log(finalOutcome);
    } else {
        console.log('Ans');
    }
    
    return 0;
};

processInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());
