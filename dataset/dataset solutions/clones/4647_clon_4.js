function displayOutcome(messageContent){console.log(messageContent);}
function orchestrateOperation(rawEntry) {
  const segments = rawEntry.split("\n");
  const primarySource = segments[0];
  const secondarySource = segments[1] || "";
  const combinedSequence = Array.from({ length: primarySource.length }, (_, currentPosition) => {
    const charFromPrimary = primarySource[currentPosition];
    const charFromSecondary = secondarySource[currentPosition] || '';
    return [charFromPrimary, charFromSecondary];
  }).flatMap(pair => pair).join('');
  displayOutcome(combinedSequence);
}
const fileSystemInterface = require("fs");
const dataLocation = "/dev/stdin";
const textEncoding = "utf8";
orchestrateOperation(fileSystemInterface.readFileSync(dataLocation, textEncoding).trim());