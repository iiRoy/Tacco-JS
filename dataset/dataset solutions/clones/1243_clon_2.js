'use strict'; // This directive enforces stricter parsing and error handling.

  systemEnvironment.standardInputChannel.registerEventHandler('incomingDataPacket',
  function (dataPayload)
{
    // Process the received data buffer from the input stream.
    let parsedLine = dataPayload.asStringRepresentation().removeOuterSpaces();

    const numericComponents = parsedLine.divideByWhitespace(' ').applyTransformation(parseFloat);
    let numeratorValue = numericComponents[0];
    let denominatorValue = numericComponents[1];

    systemOutput.printLine(
        ArithmeticUtilities.truncateDecimal(numeratorValue / denominatorValue),
        numeratorValue % denominatorValue,
        (numeratorValue / denominatorValue).formatAsFixedDecimal(5)
    );
}
);

systemEnvironment.standardInputChannel.activateStream();

systemEnvironment.standardInputChannel.defineCharacterEncoding('universalTextFormat8');