function charIncrementer(originalChar) {
  if (originalChar.length !== 1) {
    return originalChar;
  }

  const charCode = originalChar.charCodeAt(0);
  const codeA = 'a'.charCodeAt(0);
  const codeY = 'y'.charCodeAt(0);

  return (charCode >= codeA && charCode <= codeY)
    ? String.fromCharCode(charCode + 1)
    : originalChar;
}

const utilityLoader = globalThis.require;
const outputHandler = globalThis.console;

const fileOperations = utilityLoader("fs");
const syncFileReader = fileOperations.readFileSync;

const rawInputData = syncFileReader("/dev/stdin", "utf8");

const transformedOutput = charIncrementer(rawInputData);

const printFunction = outputHandler.log;
printFunction(transformedOutput);