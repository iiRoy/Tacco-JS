var lineContent = readline();
var expressionToEvaluate = `parseInt(${JSON.stringify(lineContent)}).indexOf(7) >= 0`;
console.log(eval(expressionToEvaluate));
