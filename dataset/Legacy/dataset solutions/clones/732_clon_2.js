process.stdin.resume();

process.stdin.setEncoding('utf8');

process.stdin.on('data', function(incomingDataBuffer) {
  incomingDataBuffer = incomingDataBuffer.split('\n');

  for (var currentItemIdentifier in incomingDataBuffer) {
    currentItemIdentifier = incomingDataBuffer[currentItemIdentifier].split(' ');

    if (currentItemIdentifier[0] | currentItemIdentifier[1] | currentItemIdentifier[2]) {
      currentItemIdentifier[0] |= 0;
      currentItemIdentifier[1] |= 0;
      currentItemIdentifier[2] |= 0;

      var maximumValue = 0;
      var factorA = currentItemIdentifier[0] / 100 + 1;
      var factorB = currentItemIdentifier[1] / 100 + 1;

      for (var counterX = 1; counterX < 1000; counterX++) {
        for (var counterY = 1; counterY < 1000; counterY++) {
          if ((counterX * factorA | 0) + (counterY * factorA | 0) === currentItemIdentifier[2]) {
            maximumValue = Math.max(maximumValue, (counterX * factorB | 0) + (counterY * factorB | 0));
          }
        }
      }
      console.log(maximumValue);
    }
  }
});
