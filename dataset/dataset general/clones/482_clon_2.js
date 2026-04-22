const Coder = {

  // Internal character mapping table for Base64 transformation
  _valMap: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

  // Public utility for converting plain text to an encoded format
  transform: function ( sourceText ) {
    let processedResult = "";
    let byteOne, byteTwo, byteThree;
    let segmentA, segmentB, segmentC, segmentD;
    let position = 0;

    while ( position < sourceText.length ) {

      byteOne   = sourceText.charCodeAt( position++ );
      byteTwo   = sourceText.charCodeAt( position++ );
      byteThree = sourceText.charCodeAt( position++ );

      segmentA = byteOne >>> 2;
      segmentB = ( ( byteOne & 3 ) << 4 ) | ( byteTwo >>> 4 );
      segmentC = ( ( byteTwo & 15 ) << 2 ) | ( byteThree >>> 6 );
      segmentD = byteThree & 63;

      if ( Number.isNaN( byteTwo ) ) {
        segmentC = segmentD = 64; // Handle padding for second byte
      } else if ( Number.isNaN( byteThree ) ) {
        segmentD = 64; // Handle padding for third byte
      }

      processedResult +=
        this._valMap.charAt( segmentA ) +
        this._valMap.charAt( segmentB ) +
        this._valMap.charAt( segmentC ) +
        this._valMap.charAt( segmentD );

    } // end of transformation loop

    return processedResult;
  }, // end of transform method

  // Public function for reverting an encoded string to its original form
  restore: function ( encodedInput ) {
    let reconstructedString = "";
    let charOne, charTwo, charThree;
    let partOne, partTwo, partThree, partFour;
    let currentIdx = 0;

    // Cleanse input by removing any non-Base64 characters that might have been introduced
    encodedInput = encodedInput.replace( /[^A-Za-z0-9\+\/\=]/g, "" );

    while ( currentIdx < encodedInput.length ) {

      partOne   = this._valMap.indexOf( encodedInput.charAt( currentIdx++ ) );
      partTwo   = this._valMap.indexOf( encodedInput.charAt( currentIdx++ ) );
      partThree = this._valMap.indexOf( encodedInput.charAt( currentIdx++ ) );
      partFour  = this._valMap.indexOf( encodedInput.charAt( currentIdx++ ) );

      charOne   = ( partOne << 2 ) | ( partTwo >>> 4 );
      charTwo   = ( ( partTwo & 15 ) << 4 ) | ( partThree >>> 2 );
      charThree = ( ( partThree & 3 ) << 6 ) | partFour;

      reconstructedString += String.fromCodePoint( charOne );

      if ( partThree !== 64 ) { // Check for padding in the third part
        reconstructedString += String.fromCodePoint( charTwo );
      }
      if ( partFour !== 64 ) { // Check for padding in the fourth part
        reconstructedString += String.fromCodePoint( charThree );
      }

    } // end of restoration loop

    return reconstructedString;

  } // end of restore method
}; // end of Coder object definition