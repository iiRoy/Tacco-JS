(function() {
  'use strict';
  let receivedText = '';
  let dataAcquired = false;

  require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  }).on('line', function(currentSegment) {
    if (!dataAcquired) {
      receivedText = currentSegment;
      dataAcquired = true;
    }
  });

  process.stdin.on('end', function() {
    const characterArray = Array.from(receivedText);
    characterArray.splice(4, 0, ' ');
    const transformedString = characterArray.join('');
    console.log(transformedString);
  });
})();
