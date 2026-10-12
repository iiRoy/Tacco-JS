const fileSystemModule = require("fs");

const targetPhraseIdentifier = "Hoshino";
const replacementPhraseIdentifier = "Hoshina";

const rawInputContent = fileSystemModule.readFileSync("/dev/stdin", "utf8");

const allInputLines = rawInputContent.trim().split("\n");

const numberOfDataLines = Number(allInputLines[0]);

const dataSegments = allInputLines.slice(1, numberOfDataLines + 1);

dataSegments
  .map(currentSegment => {
    const wordUnits = currentSegment.split(" ");

    const transformedUnits = wordUnits.map(unit =>
      unit === targetPhraseIdentifier ? replacementPhraseIdentifier : unit
    );

    return transformedUnits.join(" ");
  })
  .forEach(finalOutputString => {
    console.log(finalOutputString);
  });
