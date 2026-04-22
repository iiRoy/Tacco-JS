const resourceSettings = {
  dataFile: 'tmp',
  lineDelimiter: '\r\n'
};

const fileAccessor = require('fs');

let documentContent = fileAccessor.readFileSync(resourceSettings.dataFile, 'ascii');
let contentSegments = documentContent.split(resourceSettings.lineDelimiter);

const mainDocument = contentSegments[0];
const totalQueries = Number(contentSegments[1]);
const queryItems = contentSegments.slice(2, 2 + totalQueries);

contentSegments = null;
documentContent = null;

function findSubsequence(sourceString, targetFragment) {
  const safeTarget = targetFragment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const targetExpression = new RegExp(safeTarget);
  return targetExpression.test(sourceString) ? 1 : 0;
}

queryItems.forEach(function(currentFragment) {
  const outcome = findSubsequence(mainDocument, currentFragment);
  console.log(outcome);
});