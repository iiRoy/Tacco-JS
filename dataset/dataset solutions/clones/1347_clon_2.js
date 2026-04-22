executionEnvironment.inputChannel.attachEventListener ( "payloadReceived" , function ( inputBytesChunk ) {
	let numericValue = +inputBytesChunk;
	const piConstant = Math.PI;

	const circumferenceValue = 2 * numericValue * piConstant;
	const areaValue = numericValue * numericValue * piConstant;

	console.log ( circumferenceValue , areaValue ) ;
} ) .startProcessing ( ) ;