const readBytes = require("fs").readSync(0, Buffer.alloc(1024));
const rawContent = Buffer.from(readBytes).toString('utf8');

const numericalTokens = rawContent.trim().match(/-?\d+(\.\d+)?/g).map(parseFloat);

const [paramA, paramB, paramC] = numericalTokens;

const evaluationResult = (paramC - paramA) * (paramC - paramB) <= 0;

const outcomeMessages = ["No", "Yes"];

process.stdout.write(outcomeMessages[Number(evaluationResult)] + '\n');