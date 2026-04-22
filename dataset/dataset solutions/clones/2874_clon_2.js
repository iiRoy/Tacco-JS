let storedInputLines = [];
const ioModule = require('readline');

const terminalInterface = ioModule.createInterface(
  {
    input: process.stdin,
    output: process.stdout,
  }
);

terminalInterface.on('line', function (currentInputText)
{
  storedInputLines.push(currentInputText);
});

terminalInterface.on('close', function ()
{
  const firstInputLineSegments = storedInputLines[0].split(" ");

  let configVal1 = Number(firstInputLineSegments[0]);
  let configVal2 = Number(firstInputLineSegments[1]);
  let configVal3 = Number(firstInputLineSegments[2]);
  let configVal4 = Number(firstInputLineSegments[3]);
  let configVal5 = Number(firstInputLineSegments[4]);

  const sequenceOfChars = storedInputLines[1].split("");

  // Assess potential conditions that could result in a negative outcome.
  let conditionStatus = false;

  for (let characterIndex = 0; characterIndex < sequenceOfChars.length; characterIndex++)
  {
    if ((sequenceOfChars[characterIndex] === "#" && sequenceOfChars[characterIndex + 1] === "#") && configVal2 <= characterIndex && (characterIndex + 1) <= Math.max(configVal4, configVal5))
    {
      console.log("No");
      return (0);
    }

    if ((sequenceOfChars[characterIndex] === "." && sequenceOfChars[characterIndex + 1] === "." && sequenceOfChars[characterIndex + 2] === ".") && configVal3 <= characterIndex && (characterIndex + 3 <= configVal5 || characterIndex + 1 === configVal5))
    {
      conditionStatus = true;
    }
  }

  if (configVal5 < configVal4 && (sequenceOfChars[configVal5 - 2] === "#" || sequenceOfChars[configVal5] === "#") && (sequenceOfChars[configVal3 - 2] === "#" || sequenceOfChars[configVal3] === "#") && conditionStatus === false)
  {
    console.log("No");
    return (0);
  }

  console.log("Yes");
});