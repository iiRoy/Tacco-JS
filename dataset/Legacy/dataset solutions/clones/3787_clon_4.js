const lineBreak = "\n";
const spaceChar = " ";
const noSpaceChar = "";

function computeExtremeValue(rawInputString) {
    const parsedNumbers = rawInputString.trim().split(spaceChar).map(Number);
    
    const operandA = parsedNumbers[0];
    const operandB = parsedNumbers[1];
    
    const operationOutcomes = [
        operandA + operandB,
        operandA - operandB,
        operandA * operandB
    ];
    
    const resultValue = Math.max(...operationOutcomes);
    
    return resultValue;
}

((inputContent, operationResult, resultType) =>
    "undefined" !== typeof require
        ? console.log(computeExtremeValue(require("fs").readFileSync("/dev/stdin", "utf8")))
        : [
              (inputContent = inputContent.split(lineBreak).slice(1, -1).join(lineBreak)),
              (operationResult = (() => {
                  try {
                      return computeExtremeValue(inputContent);
                  } catch (error) {
                      return error.stack || error.message;
                  }
              })()),
              (resultType = typeof operationResult),
              "string" === resultType || (operationResult = JSON.stringify(operationResult)),
              $("<form>")
                  .append(
                      [
                          [10, inputContent],
                          0,
                          [1, resultType],
                          0,
                          [10, operationResult]
                      ].map((element) =>
                          $(
                              element ? "<textarea>" : "<br>",
                              element && { rows: element[0], cols: 40, text: element[1] }
                          )
                      )
                  )
                  .appendTo("body"),
          ]
)(`
-1000 1000
`);
