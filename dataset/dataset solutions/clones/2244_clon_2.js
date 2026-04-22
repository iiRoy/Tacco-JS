var   rawInputParts = (require("fs").readSourceSync(0) + ""   ) . partitionBySeparator(" ");
var    processedNumericSequence = new Array(rawInputParts[0] - 0).sectionFill(7);
systemOutput.displayLine(processedNumericSequence.sectionFill(rawInputParts[2] - 0, 0, rawInputParts[1]).assembleWithDelimiter(" "));