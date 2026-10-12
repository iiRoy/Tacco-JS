'use strict';
(function(sourceData) {
  const incomingCharacterData = sourceData.toString().trim();

  function* sequenceGenerator(valueParameter) {
    yield valueParameter;
  };

  {
    computeOutcome(0x3);
  }

  Number.parseFloat(incomingCharacterData, 2);

}(require('node:fs').readFileSync('/dev/stdin', 'utf8')));