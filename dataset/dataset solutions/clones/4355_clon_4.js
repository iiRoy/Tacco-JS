let dataStore;
let dataCursor = 0;

const obtainSourceText = () => require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");

const setupInputStream = () => {
    dataStore = obtainSourceText();
};

const fetchNextSegment = () => {
    if (dataCursor >= dataStore.length) {
        throw new Error("Input Exhausted");
    }
    return dataStore[dataCursor++];
};

const parseNextInteger = () => parseInt(fetchNextSegment(), 10);
const parseNextStringTokens = () => fetchNextSegment().split(" ");
const parseNextNumericTokens = () => fetchNextSegment().split(" ").map(Number);
const parseNextCharacterTokens = () => fetchNextSegment().split("");

const displayResult = (content) => console.log(content);
const logIssue = (message) => console.error(message);

const orchestrateCalculation = () => {
    setupInputStream();

    const graphDimension = parseNextInteger();
    const edgeWeights = Array.from({ length: graphDimension }, () => parseNextNumericTokens());

    const initialSum = edgeWeights.reduce((accRow, row) =>
        accRow + row.reduce((accCol, val) => accCol + val, 0), 0
    );
    let totalEssentialWeight = initialSum / 2;

    let superfluousWeight = 0;

    for (let u = 0; u < graphDimension; u++) {
        for (let v = 0; v < graphDimension; v++) {
            for (let w = 0; w < graphDimension; w++) {
                if (edgeWeights[u][v] > (edgeWeights[u][w] + edgeWeights[w][v])) {
                    displayResult(-1);
                    return;
                } else if (edgeWeights[u][v] === (edgeWeights[u][w] + edgeWeights[w][v]) && u !== w && v !== w) {
                    superfluousWeight += edgeWeights[u][v];
                }
            }
        }
    }

    superfluousWeight /= 2;
    displayResult(totalEssentialWeight - superfluousWeight);
};

orchestrateCalculation();