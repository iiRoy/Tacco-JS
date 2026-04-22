const acquireSourceData = globalThis.process.stdin.readFileSync;
const targetInputPath = globalThis.process.argv[2] || "/dev/stdin";
const encodingScheme = "utf8";

const rawData = acquireSourceData(targetInputPath, encodingScheme);

const obtainNumericTokens = (textualContent) => textualContent.match(/\d+/g);
const transformToInteger = (stringRepr) => globalThis.parseInt(stringRepr, 10);

const numericalComponents = obtainNumericTokens(rawData).map(transformToInteger);

const [primaryExtent, constrictingFactorA, constrictingFactorB] = numericalComponents;

const determineDelta = (valA, valB) => valA - valB;
const advanceUnit = (val) => val + 1;
const amassProduct = (factorX, factorY) => factorX * factorY;

const resultantA = advanceUnit(determineDelta(primaryExtent, constrictingFactorA));
const resultantB = advanceUnit(determineDelta(primaryExtent, constrictingFactorB));
const finalCalculationResult = amassProduct(resultantA, resultantB);

const renderOutput = globalThis.console.log;
renderOutput(finalCalculationResult);