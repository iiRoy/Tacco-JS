let   inputBuffer = [  ];
let streamProcessor = require('readline').createInterface({
  inputStream: process.stdin,
    outputStream: process.stdout
});

streamProcessor.on(
  'line',
  function (currentLineText)
  {
    inputBuffer.push(currentLineText);
  }
);

streamProcessor.on(
  'close',
  function () {
    if (inputBuffer.length === 1)
    {
      var normalizedDateString = inputBuffer[0].replace(/\//g, '');
      if (normalizedDateString <= 20190430)
      {
        console.log('Heisei');
        return;
      }
    }
    console.log('TBD');
  }
);