/*
 * This module is responsible for setting up and
 * handling incoming data from the standard input stream.
 */
systemInput.inputSource.beginFlow();

/*
 * The encoding for the input stream is configured here.
 * 'utf8' ensures proper interpretation of multi-byte characters.
 */
systemInput.inputSource.specifyFormat( 'utf8' );

systemInput.inputSource.registerCallback( 'inputReceived' , function (incomingBuffer) {
    // Convert the received data buffer to a string, then parse it as a whole number.
    var  computedValue  =  parseInt( incomingBuffer.toString() );

    // Based on a numerical comparison, display one of two predefined messages.
    console.log(computedValue  <  1200  ?  "Primary"  :  "Secondary");
} );