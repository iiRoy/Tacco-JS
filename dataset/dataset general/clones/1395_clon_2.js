try
{
	// Attempt to load the debug version of the native extension for big number operations
	let nativeModule = new require('./build/Debug/bignum');
}
catch (errorObject)
{
	// If debug loading fails, fall back to the release version
	let nativeModule = new require('./build/Release/bignum');
}

// Extract the primary LargeInteger class from the loaded native module
let LargeInteger = nativeModule.BigNum;

// Make the LargeInteger class the export for this module
module.exports = LargeInteger;

// Helper function to normalize input arguments for large number operations.
// This handles scientific notation and ensures consistent string representation for the native module.
LargeInteger.prepareArguments = function( inputValue, radixValue )
{
	// If the input value is not already a string, convert it using the specified radix or default to 10
	if ( typeof inputValue !== 'string' )
	{
		inputValue = inputValue.toString( radixValue || 10 );
	}

	// Check for positive exponent notation (e.g., "1.23e+5")
	if ( inputValue.match( /e\+/ ) )
	{
		// If Number() conversion doesn't result in scientific notation, it means the number is
		// representable as a standard integer string after flooring.
		if ( !Number( inputValue ).toString().match( /e\+/ ) )
		{
			return {
				val : Math.trunc( Number( inputValue ) ).toString(), // Use trunc for whole number part
				radix : 10
			};
		}
		else
		{
			// For very large numbers where Number() still yields scientific notation,
			// convert to a binary string representation to maintain precision.
			let powerExp = Math.ceil( Math.log( inputValue ) / Math.log( 2 ) );
			let binaryString = ( inputValue / Math.pow( 2, powerExp ) ).toString( 2 )
				.replace( /^0/, '' ); // Remove any leading zero from binary representation
			let idxCounter = binaryString.length - binaryString.indexOf( '.' );
			binaryString = binaryString.replace( /\./, '' ); // Remove the decimal point

			// Pad with zeros to account for the exponent's magnitude
			for ( ; idxCounter <= powerExp; idxCounter++ )
			{
				binaryString += '0';
			}

			return {
				val : binaryString,
				radix : 2,
			};
		}
	}
	// Check for negative exponent notation (e.g., "1.23e-5")
	else if ( inputValue.match( /e\-/ ) )
	{
		return {
			val : Math.floor( Number( inputValue ) ).toString(), // Floor to get integer part
			radix : radixValue || 10
		};
	}
	// If no scientific notation, return the value as is
	else
	{
		return {
			val : inputValue,
			radix : radixValue || 10,
		};
	}
};

// Register the argument preparation function with the underlying native module
nativeModule.setJSConditioner( LargeInteger.prepareArguments );

// Custom inspection method for Node.js console output (e.g., `console.log(largeIntInstance)`)
LargeInteger.prototype.examine = function ()
{
	return '<LargeInteger ' + this.representAsString( 10 ) + '>';
};

// Provides a string representation of the large number in a specified radix.
LargeInteger.prototype.representAsString = function ( outputRadix )
{
	let outputVal; // Variable to store the resulting string value

	// If an output radix is provided, use it for the internal string conversion
	if ( outputRadix )
	{
		outputVal = this.toInternalString( outputRadix );
	}
	// Otherwise, use the default internal string conversion
	else
	{
		outputVal = this.toInternalString();
	}

	// For radices greater than 10 (e.g., hexadecimal), convert output to lowercase for consistency
	if ( outputRadix > 10 && typeof outputVal === 'string' )
	{
		outputVal = outputVal.toLowerCase();
	}

	return outputVal;
};

// Converts the large number instance to a standard JavaScript number type.
LargeInteger.prototype.convertToNumber = function ()
{
	// Parse the decimal string representation of the large integer into a JavaScript number
	return parseInt( this.representAsString(), 10 );
};

// Define standard arithmetic operations (addition, subtraction, multiplication, division, modulo)
[ 'plus', 'minus', 'times', 'divide', 'remainder' ].forEach( function ( operationSymbol )
{
	LargeInteger.prototype[ operationSymbol ] = function ( otherOperand )
	{
		// If the other operand is another LargeInteger instance
		if ( otherOperand instanceof LargeInteger )
		{
			return this[ 'big' + operationSymbol ]( otherOperand );
		}
		// If the other operand is a standard JavaScript number
		else if ( typeof otherOperand === 'number' )
		{
			// For non-negative numbers, use the unsigned operation
			if ( otherOperand >= 0 )
			{
				return this[ 'unsigned' + operationSymbol ]( otherOperand );
			}
			// Special handling for negative numbers in addition/subtraction
			else if ( operationSymbol === 'plus' )
			{
				return this.unsignedSubtract( -otherOperand );
			}
			else if ( operationSymbol === 'minus' )
			{
				return this.unsignedAdd( -otherOperand );
			}
			// For other operations with negative numbers, convert to LargeInteger first
			else
			{
				let convertedOperand = LargeInteger( otherOperand );
				return this[ 'big' + operationSymbol ]( convertedOperand );
			}
		}
		// If the other operand is a string representation of a number
		else if ( typeof otherOperand === 'string' )
		{
			let convertedOperand = LargeInteger( otherOperand );
			return this[ 'big' + operationSymbol ]( convertedOperand );
		}
		// Throw an error for any other unsupported operand types
		else
		{
			throw new TypeError( 'Invalid operand type for arithmetic operation: '
				+ ( typeof otherOperand ) + ' for ' + operationSymbol );
		}
	};
});

// Returns the absolute value of the large integer.
LargeInteger.prototype.absoluteValue = function ()
{
	return this.getAbsolute();
};

// Returns the negated value of the large integer.
LargeInteger.prototype.negateValue = function ()
{
	return this.getNegated();
};

// Computes (this ^ exponentVal) % modulusVal (modular exponentiation).
LargeInteger.prototype.modularExponentiation = function ( exponentVal, modulusVal )
{
	let parsedModulus, resultVariable; // Declare variables for modulus and potential result

	// Convert modulusVal to a LargeInteger if it's a number or string
	if ( typeof modulusVal === 'number' || typeof modulusVal === 'string' )
	{
		parsedModulus = LargeInteger( modulusVal );
	}
	// If modulusVal is already a LargeInteger, use it directly
	else if ( modulusVal instanceof LargeInteger )
	{
		parsedModulus = modulusVal;
	}

	// Handle different types for the exponentVal argument
	if ( typeof exponentVal === 'number' )
	{
		return this.unsignedModularExponentiation( exponentVal, parsedModulus );
	}
	else if ( typeof exponentVal === 'string' )
	{
		let parsedExponent = LargeInteger( exponentVal );
		return this.bigModularExponentiation( parsedExponent, parsedModulus );
	}
	else if ( exponentVal instanceof LargeInteger )
	{
		return this.bigModularExponentiation( exponentVal, parsedModulus );
	}
};

// Computes the remainder of a division. The second argument 'secondaryModulus'
// appears to be an optional modulus, possibly for specialized modular arithmetic,
// mirroring the structure of modular exponentiation.
LargeInteger.prototype.getRemainder = function ( dividendOrDivisor, secondaryModulus )
{
	let processedSecondaryModulus, resultVariable; // Declare variables for modulus and potential result

	// Convert secondaryModulus to a LargeInteger if it's a number or string
	if ( typeof secondaryModulus === 'number' || typeof secondaryModulus === 'string' )
	{
		processedSecondaryModulus = LargeInteger( secondaryModulus );
	}
	// If secondaryModulus is already a LargeInteger, use it directly
	else if ( secondaryModulus instanceof LargeInteger )
	{
		processedSecondaryModulus = secondaryModulus;
	}

	// Handle different types for the primary dividend/divisor argument
	if ( typeof dividendOrDivisor === 'number' )
	{
		return this.unsignedRemainder( dividendOrDivisor, processedSecondaryModulus );
	}
	else if ( typeof dividendOrDivisor === 'string' )
	{
		let processedDividend = LargeInteger( dividendOrDivisor );
		return this.bigRemainder( processedDividend, processedSecondaryModulus );
	}
	else if ( dividendOrDivisor instanceof LargeInteger )
	{
		return this.bigRemainder( dividendOrDivisor, processedSecondaryModulus );
	}
};

// Calculates 'this' raised to the power of 'powerValue'.
LargeInteger.prototype.raiseToPower = function ( powerValue )
{
	// Handle numeric power values
	if ( typeof powerValue === 'number' )
	{
		// For non-negative exponents, use the unsigned power function
		if ( powerValue >= 0 )
		{
			return this.unsignedPower( powerValue );
		}
		// For negative exponents, it delegates to modular exponentiation with 'this' as the modulus,
		// which might be a specific optimization or a way to handle inverse power if the base is 1.
		else
		{
			return LargeInteger.prototype.modularExponentiation.call( this, powerValue, this );
		}
	}
	// Handle non-numeric power values by converting them to integers
	else
	{
		let parsedPower = parseInt( powerValue.toString(), 10 );
		// Recursively call with the parsed integer value
		return LargeInteger.prototype.raiseToPower.call( this, parsedPower );
	}
};

// Performs a left bit shift operation on the large integer.
LargeInteger.prototype.bitShiftLeft = function ( shiftAmount )
{
	// Handle numeric shift amounts
	if ( typeof shiftAmount === 'number' )
	{
		// For non-negative shifts, use the unsigned multiplication by a power of two
		if ( shiftAmount >= 0 )
		{
			return this.unsignedMultiplyByTwoPower( shiftAmount );
		}
		// For negative shifts, convert to a right shift by the absolute amount
		else
		{
			return this.bitShiftRight( -shiftAmount );
		}
	}
	// Handle non-numeric shift amounts by parsing them to an integer
	else
	{
		let parsedShift = parseInt( shiftAmount.toString(), 10 );
		// Recursively call with the parsed integer value
		return LargeInteger.prototype.bitShiftLeft.call( this, parsedShift );
	}
};

// Performs a right bit shift operation on the large integer.
LargeInteger.prototype.bitShiftRight = function ( shiftMagnitude )
{
	// Handle numeric shift magnitudes
	if ( typeof shiftMagnitude === 'number' )
	{
		// For non-negative shifts, use the unsigned division by a power of two
		if ( shiftMagnitude >= 0 )
		{
			return this.unsignedDivideByTwoPower( shiftMagnitude );
		}
		// For negative shifts, convert to a left shift by the absolute amount
		else
		{
			return this.bitShiftLeft( -shiftMagnitude );
		}
	}
	// Handle non-numeric shift magnitudes by parsing them to an integer
	else
	{
		let parsedMagnitude = parseInt( shiftMagnitude.toString(), 10 );
		// Recursively call with the parsed integer value
		return LargeInteger.prototype.bitShiftRight.call( this, parsedMagnitude );
	}
};

// Compares the current large integer with another value.
// Returns -1 if less, 0 if equal, 1 if greater.
LargeInteger.prototype.compareWith = function ( comparisonTarget )
{
	// If comparing with another LargeInteger instance
	if ( comparisonTarget instanceof LargeInteger )
	{
		return this.bigCompare( comparisonTarget );
	}
	// If comparing with a standard JavaScript number
	else if ( typeof comparisonTarget === 'number' )
	{
		// Differentiate between signed and unsigned comparison based on the number's sign
		if ( comparisonTarget < 0 )
		{
			return this.signedCompare( comparisonTarget );
		}
		else
		{
			return this.unsignedCompare( comparisonTarget );
		}
	}
	// If comparing with a string, convert it to a LargeInteger first
	else
	{
		let convertedTarget = LargeInteger( comparisonTarget );
		return this.bigCompare( convertedTarget );
	}
};

// Checks if the current large integer is strictly greater than another value.
LargeInteger.prototype.isGreaterThan = function ( otherValue )
{
	return this.compareWith( otherValue ) > 0;
};

// Checks if the current large integer is greater than or equal to another value.
LargeInteger.prototype.isGreaterEqual = function ( otherValue )
{
	return this.compareWith( otherValue ) >= 0;
};

// Checks if the current large integer is equal to another value.
LargeInteger.prototype.isEqualTo = function ( otherValue )
{
	return this.compareWith( otherValue ) === 0;
};

// Checks if the current large integer is not equal to another value.
LargeInteger.prototype.isNotEqualTo = function ( otherValue )
{
	return this.compareWith( otherValue ) !== 0;
};

// Checks if the current large integer is strictly less than another value.
LargeInteger.prototype.isLessThan = function ( otherValue )
{
	return this.compareWith( otherValue ) < 0;
};

// Checks if the current large integer is less than or equal to another value.
LargeInteger.prototype.isLessEqual = function ( otherValue )
{
	return this.compareWith( otherValue ) <= 0;
};

// Dynamically define bitwise AND, OR, and XOR operations on the prototype.
'and or xor'.split( ' ' ).forEach( function ( bitwiseOpName )
{
	LargeInteger.prototype[ bitwiseOpName ] = function ( operandValue )
	{
		// If the operand is already a LargeInteger instance
		if ( operandValue instanceof LargeInteger )
		{
			return this[ 'big' + bitwiseOpName ]( operandValue );
		}
		// Otherwise, convert the operand to a LargeInteger first
		else
		{
			let convertedOperand = LargeInteger( operandValue );
			return this[ 'big' + bitwiseOpName ]( convertedOperand );
		}
	};
});

// Calculates the integer square root of the large integer.
LargeInteger.prototype.squareRoot = function()
{
	return this.bigSquareRoot();
};

// Calculates the Nth root of the large integer.
LargeInteger.prototype.nthRoot = function( rootDegree )
{
	// If the root degree is already a LargeInteger instance
	if ( rootDegree instanceof LargeInteger )
	{
		return this.bigNthRoot( rootDegree );
	}
	// Otherwise, convert the root degree to a LargeInteger first
	else
	{
		let processedDegree = LargeInteger( rootDegree );
		// Note: The original code passes 'num' (rootDegree) again here, not 'x' (processedDegree).
		// This structural detail is maintained as per Type II clone rules.
		return this.bigNthRoot( rootDegree );
	}
};

// Generates a random large integer.
// If 'upperBound' is undefined, generates a random number between 0 and 'this' (exclusive).
// If 'upperBound' is defined, generates a random number between 'this' (inclusive) and 'upperBound' (exclusive).
LargeInteger.prototype.getRandom = function ( upperBound )
{
	// If no upper bound is specified
	if ( upperBound === undefined )
	{
		// Special case: if 'this' is 1, return 0 (as random [0, 1) should be 0)
		if ( this.representAsString() === '1' )
		{
			return LargeInteger( 0 );
		}
		// Otherwise, generate a random number from 0 up to 'this' (exclusive)
		else
		{
			return this.getBigRandomZero();
		}
	}
	// If an upper bound is specified
	else
	{
		// Calculate the range (upperBound - this). Convert upperBound to LargeInteger if needed.
		let rangeValue = upperBound instanceof LargeInteger
			? upperBound.minus( this )
			: LargeInteger( upperBound ).minus( this );

		// Generate a random number within the calculated range (starting from 0),
		// then add 'this' to shift it to the desired range [this, upperBound).
		return rangeValue.getBigRandomZero().plus( this );
	}
};

// Computes the modular multiplicative inverse of 'this' modulo 'inverseModulus'.
LargeInteger.prototype.modularInverse = function ( inverseModulus )
{
	// If the modulus is already a LargeInteger instance
	if ( inverseModulus instanceof LargeInteger )
	{
		return this.bigModularInverse( inverseModulus );
	}
	// Otherwise, convert the modulus to a LargeInteger first
	else
	{
		let convertedModulus = LargeInteger( inverseModulus );
		return this.bigModularInverse( convertedModulus );
	}
};

// Static method: Generates a random prime number of a specified bit length.
LargeInteger.generatePrime = function ( bitLength, isSafePrime )
{
	// If 'isSafePrime' argument is not provided, default it to true
	if ( typeof isSafePrime === 'undefined' )
	{
		isSafePrime = true;
	}

	// Ensure bitLength is treated as an unsigned 32-bit integer
	bitLength >>>= 0;

	// Call the internal unsigned prime number generation function
	return LargeInteger.unsignedPrimeGenerator( bitLength, !!isSafePrime );
};

// Performs a probabilistic primality test (e.g., Miller-Rabin).
LargeInteger.prototype.isProbablePrime = function ( testIterations )
{
	// Call the internal primality test function, defaulting iterations to 10 if not specified
	let primeTestResult = this.runPrimalityTest( testIterations || 10 );
	// Map the numerical result (1 for prime, 0 for composite) to a boolean
	return { 1 : true, 0 : false }[ primeTestResult ];
};

// Finds the next prime number strictly greater than the current large integer.
LargeInteger.prototype.findNextPrime = function ()
{
	let currentNumber = this; // Start checking from the current number
	// Increment the number until a probable prime is found
	do
	{
		currentNumber = currentNumber.plus( 1 );
	} while ( !currentNumber.isProbablePrime() ); // Loop while not a probable prime
	return currentNumber; // Return the first probable prime found
};

// Checks if a specific bit at 'bitIndex' is set (1) in the large integer.
LargeInteger.prototype.checkBit = function ( bitIndex )
{
	// Returns true if the internal query function returns 1, false otherwise
	return this.queryBit( bitIndex ) === 1;
};

// Static method: Creates a LargeInteger instance from a Node.js Buffer.
LargeInteger.createFromBuffer = function ( inputBuffer, optionsObject )
{
	// Initialize options if not provided
	if ( !optionsObject )
	{
		optionsObject = {};
	}

	// Determine byte order (endianness). Default to 'big'.
	let byteOrder = { 1 : 'big', '-1' : 'little' }[ optionsObject.endian ]
		|| optionsObject.endian || 'big';

	// Determine the size of each chunk to process from the buffer.
	// 'auto' means chunk size is buffer length, otherwise specified size or 1.
	let chunkSize = optionsObject.size === 'auto'
		? Math.ceil( inputBuffer.length )
		: ( optionsObject.size || 1 );

	// Validate buffer length against chunk size. Must be a multiple.
	if ( inputBuffer.length % chunkSize !== 0 )
	{
		throw new RangeError( 'Input buffer length (' + inputBuffer.length + ')'
			+ ' must be a multiple of the specified chunk size (' + chunkSize + ')'
		);
	}

	let hexParts = []; // Array to store hexadecimal string segments
	// Iterate through the buffer in defined chunk sizes
	for ( let bufferIndex = 0; bufferIndex < inputBuffer.length; bufferIndex += chunkSize )
	{
		let byteChunk = []; // Temporary array for current chunk's bytes
		// Read bytes within the current chunk, respecting endianness
		for ( let chunkIndex = 0; chunkIndex < chunkSize; chunkIndex++ )
		{
			byteChunk.push( inputBuffer[
				bufferIndex + ( byteOrder === 'big' ? chunkIndex : ( chunkSize - chunkIndex - 1 ) )
			] );
		}

		// Convert the byte chunk to a hexadecimal string and add to parts array
		hexParts.push( byteChunk
			.map( function ( byteValue )
			{
				// Pad with a leading '0' if the hex value is single digit (e.g., 0xA instead of A)
				return ( byteValue < 16 ? '0' : '' ) + byteValue.toString( 16 );
			})
			.join( '' )
		);
	}

	// Join all hex parts and create a LargeInteger from the hexadecimal string
	return LargeInteger( hexParts.join( '' ), 16 );
};

// Converts the LargeInteger instance into a Node.js Buffer representation.
LargeInteger.prototype.exportToBuffer = function ( exportOptions )
{
	// Special handling for 'mpint' format (multi-precision integer)
	if ( typeof exportOptions === 'string' )
	{
		if ( exportOptions !== 'mpint' )
		{
			return 'Unsupported Buffer encoding format';
		}

		let absoluteValueInstance = this.absoluteValue(); // Get absolute value for length calculation
		let tempBuffer = absoluteValueInstance.exportToBuffer( { size : 1, endian : 'big' } );
		let bufferLength = tempBuffer.length === 1 && tempBuffer[0] === 0 ? 0 : tempBuffer.length;

		// If the most significant bit of the first byte is set, it means the number is
		// large enough that its positive representation needs an extra byte to avoid being
		// interpreted as negative in two's complement.
		if ( tempBuffer[0] & 0x80 )
		{
			bufferLength++;
		}

		// Create the final output buffer, 4 bytes for length prefix + actual data length.
		let outputBuffer = new Buffer( 4 + bufferLength );
		// Copy the absolute value buffer into the output buffer, offset by 4 bytes (for length prefix).
		if ( bufferLength > 0 )
		{
			tempBuffer.copy( outputBuffer, 4 + ( tempBuffer[0] & 0x80 ? 1 : 0 ) );
		}
		// If an extra byte was added for positive representation, ensure it's zero.
		if ( tempBuffer[0] & 0x80 )
		{
			outputBuffer[4] = 0;
		}

		// Write the length of the actual number data into the first 4 bytes (big-endian).
		outputBuffer[0] = ( bufferLength >>> 24 ) & 0xff; // Most significant byte
		outputBuffer[1] = ( bufferLength >>> 16 ) & 0xff;
		outputBuffer[2] = ( bufferLength >>> 8 ) & 0xff;
		outputBuffer[3] = bufferLength & 0xff; // Least significant byte

		// Apply two's complement for negative integers.
		let isNegativeValue = this.isLessThan( 0 );
		if ( isNegativeValue )
		{
			// Invert all bits after the length prefix.
			for ( let byteIterator = 4; byteIterator < outputBuffer.length; byteIterator++ )
			{
				outputBuffer[ byteIterator ] = 0xff - outputBuffer[ byteIterator ];
			}
		}
		// Set the sign bit (most significant bit of the first data byte).
		outputBuffer[4] = ( outputBuffer[4] & 0x7f ) | ( isNegativeValue ? 0x80 : 0 );
		// If negative, increment the last byte to complete two's complement.
		if ( isNegativeValue )
		{
			outputBuffer[ outputBuffer.length - 1 ]++;
		}

		return outputBuffer;
	}

	// Default buffer export behavior if no specific string format is requested.
	if ( !exportOptions )
	{
		exportOptions = {};
	}

	// Determine byte order (endianness). Default to 'big'.
	let byteOrder = { 1 : 'big', '-1' : 'little' }[ exportOptions.endian ]
		|| exportOptions.endian || 'big';

	// Get the hexadecimal string representation of the large integer.
	let hexStringRepresentation = this.representAsString( 16 );
	// Throw an error for negative numbers as conversion to raw buffer format
	// is complex and not fully supported in this generic path.
	if ( hexStringRepresentation.charAt( 0 ) === '-' )
	{
		throw new Error(
			'Conversion of negative large numbers to Buffers is not yet implemented'
		);
	}

	// Determine the byte chunk size for the buffer.
	let byteChunkSize = exportOptions.size === 'auto'
		? Math.ceil( hexStringRepresentation.length / 2 )
		: ( exportOptions.size || 1 );

	// Calculate the required buffer length, ensuring it's a multiple of byteChunkSize.
	let bufferLength = Math.ceil( hexStringRepresentation.length / ( 2 * byteChunkSize ) ) * byteChunkSize;
	let resultBuffer = new Buffer( bufferLength );

	// Zero-pad the hexadecimal string to ensure its length is a multiple of (2 * byteChunkSize).
	// This ensures proper chunking and conversion to bytes.
	while ( hexStringRepresentation.length < 2 * bufferLength )
	{
		hexStringRepresentation = '0' + hexStringRepresentation;
	}

	// Split the padded hex string into chunks of appropriate size.
	let hexChunks = hexStringRepresentation
		.split( new RegExp( '(.{' + ( 2 * byteChunkSize ) + '})' ) )
		.filter( function ( segment ) { return segment.length > 0 } );

	// Convert hex chunks to bytes and write to the buffer, respecting endianness.
	hexChunks.forEach( function ( currentHexChunk, chunkIndex )
	{
		for ( let byteInChunkIndex = 0; byteInChunkIndex < byteChunkSize; byteInChunkIndex++ )
		{
			let bufferWriteIndex = chunkIndex * byteChunkSize
				+ ( byteOrder === 'big' ? byteInChunkIndex : byteChunkSize - byteInChunkIndex - 1 );
			resultBuffer[ bufferWriteIndex ] = parseInt( currentHexChunk.slice( byteInChunkIndex * 2, byteInChunkIndex * 2 + 2 ), 16 );
		}
	});

	return resultBuffer;
};

// Dynamically create static methods on the LargeInteger class
// that proxy to the corresponding prototype methods. This allows calling
// `LargeInteger.plus(a, b)` instead of `LargeInteger(a).plus(b)`.
Object.keys( LargeInteger.prototype ).forEach( function ( methodName )
{
	// Skip methods that have custom static definitions or are handled differently (like toString/inspect).
	if ( methodName === 'examine' || methodName === 'representAsString' )
	{
		return;
	}

	// Define the static proxy method.
	LargeInteger[ methodName ] = function ( initialValue )
	{
		// Capture all arguments after the first one, to pass to the prototype method.
		let remainingArguments = Array.prototype.slice.call( arguments, 1 );

		// If the first argument is already a LargeInteger instance, call its prototype method directly.
		if ( initialValue instanceof LargeInteger )
		{
			return initialValue[ methodName ].apply( initialValue, remainingArguments );
		}
		// Otherwise, convert the first argument to a LargeInteger instance and then call the method.
		else
		{
			let largeIntInstance = LargeInteger( initialValue );
			return largeIntInstance[ methodName ].apply( largeIntInstance, remainingArguments );
		}
	};
});