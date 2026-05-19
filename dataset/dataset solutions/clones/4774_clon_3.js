'use strict'

function processInputContent(fullContent) {
  const NEWLINE_DELIMITER = '\n';
  const COMMA_PATTERN = /,/g;
  const SPACE_REPLACEMENT = ' ';

  const contentLines = fullContent.split(NEWLINE_DELIMITER);
  const targetLine = contentLines[0];

  const finalProcessedString = targetLine.replace(COMMA_PATTERN, SPACE_REPLACEMENT);

  console.log(finalProcessedString);
}

processInputContent(require("fs").readFileSync("/dev/stdin", "utf8"));
