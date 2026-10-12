// inputに入力データ全体が入る
function processInputData(rawData) {
    const MODULO_VALUE = 1000003;
    let inputLines = rawData.split("\n");
    let numberOfQueries = parseInt(inputLines[0]);

    const parseQueryParameters = (lineString) => lineString.split(" ").map(valueString => parseInt(valueString));

    let queryConfigurations = inputLines.slice(1, numberOfQueries + 1).map(parseQueryParameters);

    let computedResults = new Array(numberOfQueries);
    computedResults.fill(0);

    for (let queryIndex = 0; queryIndex < queryConfigurations.length; queryIndex++) {
        let currentQueryDetails = queryConfigurations[queryIndex];
        let paramA = currentQueryDetails[0];
        let paramB = currentQueryDetails[1];
        let loopIterations = currentQueryDetails[2];

        let currentCalculatedValue = 0;

        for (let iterationStep = 0; iterationStep < loopIterations; iterationStep++) {
            if (iterationStep === 0) {
                currentCalculatedValue = paramA % MODULO_VALUE;
            } else {
                let termFactor = paramA + iterationStep * paramB;
                currentCalculatedValue = (currentCalculatedValue * termFactor) % MODULO_VALUE;
            }
        }
        computedResults[queryIndex] = currentCalculatedValue;
        console.log(computedResults[queryIndex]);
    }
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、processInputDataを呼び出します）
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
