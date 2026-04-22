function evaluateInputSet(sourceMaterial) {
  const extractedNumbers = sourceMaterial.trim().match(/-?\d+/g);

  const primaryValue = Number(extractedNumbers[0]);
  const secondaryValue = Number(extractedNumbers[1]);
  const tertiaryValue = Number(extractedNumbers[2]);

  let finalVerdict = "No";

  if (primaryValue !== 0) {
    if (primaryValue === secondaryValue) {
      if (primaryValue === tertiaryValue) {
        finalVerdict = "Yes";
      }
    }
  }
  
  process.stdout.write(finalVerdict + "\n");
}

const fileContent = require("node:fs").readFileSync("/dev/stdin", "utf8");
evaluateInputSet(fileContent);