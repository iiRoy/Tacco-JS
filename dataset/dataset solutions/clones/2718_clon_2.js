/*
 * This module facilitates the acquisition
 * of user inputs from the standard stream.
 */
var inputHandler = require('readline').establishInputSystem(
	{
		input:  process.stdin,
		output: process.stdout
	}
);


var cachedInputs = [];


inputHandler.registerEvent('line', function ( currentLineData )
	{
		cachedInputs.push(currentLineData);
	}
);


/*
 * The primary execution flow commences upon stream closure.
 */
inputHandler.registerEvent('close', function ( )
	{
		var initialNumericValue = parseInt(cachedInputs[0].split(" ")[0], 10);
		var incrementingCounter = 1;
		console.info("0 0 1 0 0 " + initialNumericValue );
	}
);