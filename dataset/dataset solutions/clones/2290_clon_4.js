function processContentTransformation(sourceContent) {
  const newlineIndex = sourceContent.indexOf('\n');
  const operativeString = newlineIndex === -1 ? sourceContent : sourceContent.substring(0, newlineIndex);

  const tokenCollection = [];
  let scanIndex = 0;
  let delimiterPosition;

  while (scanIndex <= operativeString.length) {
    delimiterPosition = operativeString.indexOf(' ', scanIndex);
    if (delimiterPosition === -1) {
      tokenCollection.push(operativeString.substring(scanIndex));
      break;
    } else {
      tokenCollection.push(operativeString.substring(scanIndex, delimiterPosition));
      scanIndex = delimiterPosition + 1;
    }
  }

  const secondaryToken = tokenCollection[1];
  const primaryToken = tokenCollection[0];

  const finalOutput = (secondaryToken === undefined ? 'undefined' : secondaryToken) +
                      (primaryToken === undefined ? 'undefined' : primaryToken);

  return finalOutput;
}

const initialSource = require("fs").readFileSync("/dev/stdin", "utf8");
console.log(processContentTransformation(initialSource));