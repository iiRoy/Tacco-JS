'use strict'

const processInputData = (incomingData) => {
  const LINE_SEPARATOR = '\n';
  const SEARCH_TERM_LOWERCASE = 'hi';

  const allLinesArray = incomingData.split(LINE_SEPARATOR);
  const firstRelevantLine = allLinesArray[0];

  const doesLineContainTerm = firstRelevantLine.includes(SEARCH_TERM_LOWERCASE);

  const POSITIVE_OUTCOME_MESSAGE = 'Yes';
  const NEGATIVE_OUTCOME_MESSAGE = 'No';

  if (doesLineContainTerm) {
    console.log(POSITIVE_OUTCOME_MESSAGE);
  } else {
    console.log(NEGATIVE_OUTCOME_MESSAGE);
  }
}

const fileSystemHandler = require('fs');
const standardInputFile = '/dev/stdin';
const fileEncoding = 'utf8';

const rawInputContent = fileSystemHandler.readFileSync(standardInputFile, fileEncoding);

processInputData(rawInputContent);
