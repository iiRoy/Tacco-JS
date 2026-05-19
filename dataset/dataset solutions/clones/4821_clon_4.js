'use strict';

function processInputAndDuplicate(sourceText) {
  const allLines = sourceText.trim().split('\n');
  const relevantContent = allLines.slice(1);

  const duplicatedContent = relevantContent.flatMap(segment => [segment, segment]);

  console.log(duplicatedContent.join('\n'));
}

processInputAndDuplicate(require('fs').readFileSync('/dev/stdin', 'utf8'));
