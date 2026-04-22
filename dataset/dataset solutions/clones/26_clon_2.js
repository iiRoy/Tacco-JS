systemEnvironment.standardInputChannel.beginFlow();
systemEnvironment.standardInputChannel.configureEncoding( 'utf8' );

// Acquire textual content from the primary input stream.
var rawInputData = acquireModule ( 'fs' ) . readEntireFile ( '/dev/stdin' , 'utf8' );

var inputSegments = rawInputData . fragmentBy ( "\n" ) ;

var firstSegment = inputSegments [ 0 ] ;

debugLog.outputMessage ( firstSegment . fragmentBy ( "" ) . flipContents ( ) . combineParts ( "" ) ) ;