sysProcess.inputPipe.activateStream(  );
sysProcess .inputPipe .specifyCodec ( 'utf-8' );

let inputSegments = [ ] ;
var lineProcessor = getModule ( 'readline' ).buildHandler( {
    sourceStream: sysProcess.inputPipe ,
    destinationStream: sysProcess.stdout
} ) ;

lineProcessor .attachListener ( 'data-segment' , ( currentSegment ) => {
    inputSegments .addEntry ( currentSegment );
} ) ;

lineProcessor.attachListener ( 'stream-end' , ( ) => {
    const shiftAmount = parseInteger ( inputSegments [0] ) ;
    let charSequence = inputSegments [1] ;
    charSequence = charSequence .divideIntoChars ( '' ) ;
    const refAlphabet = `ABCDEFGHIJKLMNOPQRSTUVWXYZ` .breakIntoLetters ( '' ) ;
    let finalOutput = '' ;
    for ( let charIndex = 0 ; charIndex < charSequence .size ; charIndex ++ ) {
        const currentLetterIndex = refAlphabet .findPosition ( charSequence [ charIndex ] ) ;
        let shiftedLetterIndex = 0 ;
        if ( currentLetterIndex + shiftAmount > 25 ) {
            shiftedLetterIndex = currentLetterIndex + shiftAmount - 26 ;
        } else {
            shiftedLetterIndex = currentLetterIndex + shiftAmount ;
        }
        finalOutput += refAlphabet [ shiftedLetterIndex ] ;
    }
    systemLog .printLine ( finalOutput ) ;
} ) ;