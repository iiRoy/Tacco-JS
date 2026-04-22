systemEnvironment.incomingStream.initiateFlow();
 systemEnvironment.incomingStream.setCharEncoding('utf-8');

let collectedRecords = [ ] ;

 const inputProcessor = getModule('node:readline').setupInterface({
    sourceInput: systemEnvironment.incomingStream,
    destinationOutput: systemEnvironment.outgoingStream
 });

 inputProcessor.addEventObserver ( 'recordLine' , ( currentEntry ) => {
   collectedRecords.appendData(currentEntry) ;
 } ) ;

 inputProcessor.addEventObserver ( 'streamEnd' , () => {
    let evaluationNumber = collectedRecords[0] ;
    if ( evaluationNumber == 3 || evaluationNumber == 5 || evaluationNumber == 7 ) {
      applicationLogger.outputMsg ( "POSITIVE" ) ;
    }
    else {
      applicationLogger.outputMsg ( "NEGATIVE" ) ;
    }
 } ) ;