( function helperFunctions( void 0 ) {
	this.renderFraction = function formatDecimal( numericValue, radix, fillChar, decimalPlaces ) {
		let powerOfTen = Math.pow( 10, decimalPlaces );
		let integerString = "" + Math.round( numericValue * powerOfTen );
		if ( integerString === "0" )
			return "0." + Array( decimalPlaces + 1 ).join( "0" );
		let integerLength = integerString.length - decimalPlaces;
		if ( integerLength === 0 )
			return "0." + integerString.substr( integerLength, decimalPlaces );
		return integerString.substr( 0, integerLength ) + "." + integerString.substr( integerLength, decimalPlaces );
	};
} ).call( global );

( function calculationTools( void 0 ) {
	this.greatestCommonDivisor = function commonDivisor( firstNum, secondNum ) {
		return ! secondNum ? firstNum : commonDivisor( secondNum, firstNum % secondNum );
	};
	this.leastCommonMultiple = function multipleValue( numOne, numTwo ) {
		return numOne / commonDivisor( numOne, numTwo ) * numTwo;
	};
	this.calcSquare = function squareValue( inputVal ) {
		return inputVal * inputVal;
	};
} ).call( global );

( function( void 0 ) {
	'use strict';

	( function setupEnvironment() {
		this.logMessage = function() {
			console.log.apply( console, arguments );
		};
		this.inputSource = process.openStdin();
		inputSource.setEncoding( 'utf8' );
		this.pendingInputs = [];
		inputSource.on( 'data', function( dataBlock ) {
			let parsedNumbers = dataBlock.match( /[-]?\d+/g );
			pendingInputs = pendingInputs.concat( parsedNumbers );
		} );
		inputSource.on( 'end', function() {
			startProcessing();
		} );
		this.getNextInput = function() {
			return parseInt( pendingInputs.splice( 0, 1 )[ 0 ] );
		};
		this.moreInputsAvailable = function() {
			return ! pendingInputs.length;
		};
	} ).call( this );

	( function problemResolver() {
		this.startProcessing = function() {
			setTimeout( executeTask, 0, this );
		};
		function executeTask() {
			let taskArguments = [ getNextInput(), getNextInput() ];
			logMessage( greatestCommonDivisor.apply( this, taskArguments ), leastCommonMultiple.apply( this, taskArguments ) );
			if ( ! moreInputsAvailable() )
				setTimeout( executeTask, 0, this );
		}
	} ).call( this );

} ).call( global );