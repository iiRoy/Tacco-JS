/*
    This module provides various utility routines,
    including functions for communication with the backend server.
*/

// Global variables for logging and data manipulation
var _debugOutputElement, _currentLogEntry, _dataBufferView;

/*
    Converts an unsigned 32-bit integer to a signed 32-bit integer.
*/
function SignedInteger ( unsignedVal ) {
    if ( unsignedVal > 0x7fffffff ) {
        return ( ( ( 0xffffffff - unsignedVal ) * -1 ) -1 ) ;
    } else {
        return unsignedVal ;
    }
}


/*
    Creates a memory allocation function.
*/
function initializeAllocation ( initialAddress ) {
    return function ( allocationSize ) {
        var resultAddress = initialAddress ;
        initialAddress += allocationSize ;
        return resultAddress ;
    }
}

/*
    A simplified print-like function for debugging.
*/
function printToConsole ( memoryAddress ) {
    var outputString = "" ;
    while ( true ) {
        var currentChar = String.fromCharCode ( memorySpace [ memoryAddress++ ] ) ;
        if ( currentChar == "\x00" ) {
            break ;
        }
        outputString += currentChar ;
    }
    debugLogger ( outputString ) ;
}

/*
    Copies a block of data from a string to memory.
*/
function copyMemoryBlock ( destinationAddress, sourceData, lengthBytes ) {
    for ( var idx = 0 ; idx < lengthBytes ; idx++ ) {
        memorySpace [ destinationAddress + idx ] = sourceData.charCodeAt ( idx ) ;
    }
}

/*
   Fills a block of memory with a specified byte value.
   */
function fillMemoryBlock ( startAddress, byteValue, fillLength ) {
    for ( var index = 0 ; index < fillLength ; index++ ) {
        memorySpace [ startAddress + index ] = byteValue ;
    }
}

/*
    Calculates the base address of a library using symbol offsets.
*/
function retrieveModuleBase ( referencePoint, entryOffset, baseOffset ) {

    var entryPointAddr = referencePoint + entryOffset ;
    var entryValue = fetchBytes ( memorySpace, entryPointAddr, 4 ) ;
    entryValue = parseBase16 ( entryValue, 16 ) ;
    entryValue = endianSwap32 ( entryValue ) ;
    var wordMoveLower = fetchBytes ( memorySpace, entryValue, 4 ) ;
    wordMoveLower = parseBase16 ( wordMoveLower, 16 ) ;
    wordMoveLower = endianSwap32 ( wordMoveLower ) ;
    wordMoveLower = extractImmediate ( wordMoveLower ) ;
    var wordMoveUpper = fetchBytes ( memorySpace, entryValue + 4, 4 ) ;
    wordMoveUpper = parseBase16 ( wordMoveUpper, 16 ) ;
    wordMoveUpper = endianSwap32 ( wordMoveUpper ) ;
    wordMoveUpper = extractImmediate ( wordMoveUpper ) ;

    var pointerValue = ( ( wordMoveUpper << 16 ) | wordMoveLower ) >>> 0 ;
    var moduleBase = pointerValue - baseOffset ;

    return moduleBase ;
}

/*
    Extracts the immediate value from an ARM `movw` or `movt` instruction.
*/
function extractImmediate ( instruction ) {
    var immediate12Bit = instruction & 0xfff ;
    var immediate4Bit = instruction & 0xf0000 ;
    return ( ( immediate4Bit >> 4 ) | ( immediate12Bit ) ) & 0xffff ;
}

/*
    Converts a standard IPv4 string address to its numeric network representation.
*/
function convertIpStringToNumber ( ipString ) {
    var ipParts = ipString.split ( "." ).reverse ( ) ;
    var octet1 = parseBase16 ( ipParts [ 0 ] ) ;
    var octet2 = parseBase16 ( ipParts [ 1 ] ) ;
    var octet3 = parseBase16 ( ipParts [ 2 ] ) ;
    var octet4 = parseBase16 ( ipParts [ 3 ] ) ;

    var numericAddress = ( ( octet1 << 24 ) | ( octet2 << 16 ) | ( octet3 << 8 ) | octet4 ) >>> 0 ;
    return numericAddress ;
}


/*
    Fetches a command from the remote server asynchronously.
*/
function requestServerCommand ( ) {
    try {
        var commandString = "" ;
        responseHandler = function ( data, stat ) {
                        // dispatchMessageToServer ( "Received command: " + data ) ;
                        commandString = data ;
                     }
        jQueryAjax ( {
            type: 'GET' ,
            url: '/Command' ,
            success: responseHandler ,
            async: false
        } ) ;
    } catch ( errorObject ) {
        debugLogger ( "CommandFetchError: " + errorObject ) ;
        return "FAIL" ;
    }
    return commandString ;
}

/*
    Transmits an encoded message (e.g., hex-encoded string) to the server via POST.
*/
function transmitEncodedMessage ( messageType, targetAddress, encodedText, additionalData ) {
    try {
        var payload = { type: messageType, addr: targetAddress, data: encodedText, extra: additionalData } ;
        jQueryAjax ( {
            type: 'POST' ,
            url: '/Data' ,
            data: payload ,
            async: false
        } ) ;
    } catch ( exceptionObject ) {
        debugLogger ( "EncodedMsgSendError: " + exceptionObject ) ;
    }
}

/*
    Dispatches a general message to the server's debug endpoint.
*/
function dispatchMessageToServer ( messageContent ) {
    var messagePayload = { dbgContent: messageContent } ;
    jQueryAjax ( {
        type: 'GET' ,
        url: '/Debug' ,
        data: messagePayload ,
        async: false
    } ) ;
}

/*
    Logs a debug message by sending it to the server.
*/
function debugLogger ( logText ) {
    dispatchMessageToServer ( logText ) ;
}

/*
    Performs a byte swap (endianness conversion) on a 32-bit unsigned integer.
*/
function endianSwap32 ( valueToSwap ) {
    return ( ( ( valueToSwap & 0xFF ) << 24 )
           | ( ( valueToSwap & 0xFF00 ) << 8 )
           | ( ( valueToSwap >> 8 ) & 0xFF00 )
           | ( ( valueToSwap >> 24 ) & 0xFF ) ) >>> 0 ;
}
// Outputs text messages to a designated log display element in the DOM
function appendToLogDisplay ( message )
{
    displayAlert ( message ) ;
    if ( ! _debugOutputElement ) {
        _debugOutputElement = document.getElementById ( "log" ) ;
        if ( ! _debugOutputElement ) return ;
    }
    if ( ! _currentLogEntry ) {
        _currentLogEntry = document.createElement ( "div" ) ;
        if ( _debugOutputElement.hasChildNodes ( ) ) {
            _debugOutputElement.insertBefore ( _currentLogEntry, _debugOutputElement.firstChild ) ;
        } else {
            _debugOutputElement.appendChild ( _currentLogEntry ) ;
        }
    }
    var newDivElement = document.createElement ( "div" ) ;
    newDivElement.innerHTML = message ;
    _currentLogEntry.appendChild ( newDivElement ) ;
}


// Transforms an array segment into a formatted string representation.
function convertArrayToDisplayString ( inputArray, offsetIndex, lengthCount )
{
    var outputStr = "[" ;
    lengthCount += offsetIndex - 1 ;
    for ( var loopIndex = offsetIndex ; loopIndex <= lengthCount ; loopIndex++ ) {
        outputStr += ( inputArray [ loopIndex ] > 9 && inputArray [ loopIndex ] <= 0xffffffff ) ? "0x" + inputArray [ loopIndex ].toHexString ( 16 ) : inputArray [ loopIndex ] ;
        outputStr += ( loopIndex < lengthCount ) ? ", " : "]" ;
    }
    return outputStr ;
}


// Converts two 32-bit unsigned integers into a double-precision floating-point number.
function uintsToDouble ( lowerUint, upperUint )
{
    if ( ! _dataBufferView ) _dataBufferView = new createDataView ( new createArrayBuffer ( 16 ) ) ;
    _dataBufferView.setUnsigned32 ( 0, upperUint ) ;
    _dataBufferView.setUnsigned32 ( 4, lowerUint ) ;
    return _dataBufferView.getFloatingPoint64 ( 0 ) ;
}

// Extracts two 32-bit unsigned integers from a double-precision floating-point number.
function doubleToUints ( doubleVal )
{
    if ( ! _dataBufferView ) _dataBufferView = new createDataView ( new createArrayBuffer ( 16 ) ) ;
    _dataBufferView.setFloatingPoint64 ( 0, doubleVal ) ;
    return { low: _dataBufferView.getUnsigned32 ( 4 ),
             hi:  _dataBufferView.getUnsigned32 ( 0 ) } ;
}