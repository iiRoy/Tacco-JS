const processInputData = () => {
    const rawContent = require("fs").readFileSync("/dev/stdin", "utf8");
    const sourceLines = rawContent.split(/\r?\n/).filter(Boolean);
    const numericSource = Number(sourceLines[sourceLines.length - 1]);

    const countOfRelevantElements = Math.trunc((numericSource + 1) / 2);

    const proportionResult = countOfRelevantElements / numericSource;

    const decimalFormatter = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 11,
        maximumFractionDigits: 11,
        useGrouping: false
    });

    const formattedString = decimalFormatter.format(proportionResult);
    
    console.log(formattedString + '\n');
};

processInputData();