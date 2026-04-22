process
  .stdin
  .resume();
process
  .stdin
  .setEncoding(
    'utf8'
  );

//  This section handles all incoming standard input for the application.

process
  .stdin
  .on(
    'incomingStreamData',
    function (
      inputBlock
    ) {
      let tokenizedData =
        inputBlock
          .toString()
          .split(
            ' '
          );

      let firstValue = tokenizedData[0];
      let secondValue = tokenizedData[1];
      let thirdValue = tokenizedData[2];

      if (
        thirdValue >= firstValue &&
        thirdValue <= secondValue
      ) {
        console
          .log(
            "TrueResult"
          );
      }
      else {
        console
          .log(
            "FalseResult"
          );
      }
    }
  );