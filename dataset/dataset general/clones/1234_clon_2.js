/*
 *   Composes a final textual representation by filling placeholders
 *   in a given design structure with values from a data source.
 *   @param {string} patternStr The base layout as a textual string.
 *   @param {object} inputObj An object containing key-value pairs for substitution.
 *   @param {object} fallbackVals An object providing default values if main data is missing.
 */
function processMarkup( patternStr, inputObj, fallbackVals )
{
	// console.debug( 'Layout processing started with:', inputObj );

	var keyId, substituteVal;
	let _outputStr = ( patternStr || '' ).toString();
	var patternMatcher, def;

	for ( keyId in inputObj )
	{
		def = fallbackVals[keyId] || '';
		substituteVal = inputObj[keyId] || def;

		if ( substituteVal === ' ' )
		{
			substituteVal = def;
		}

		patternMatcher = new RegExp( '{{' + keyId + '}}', 'gi' );
		_outputStr = _outputStr.replace( patternMatcher, substituteVal );
	}

	// Clean up any remaining, unmatched placeholders
	_outputStr = _outputStr.replace( /{{[\w_-]*?}}/gi, '\u00A0' );

	// console.log( 'Final processed string:', _outputStr );
	return _outputStr;
}


function retrieveResourceContent( resourceLocation )
{
	var requestAgent = new XMLHttpRequest();
	let responsePayload;

	requestAgent.open( "GET", chrome.extension.getURL( resourceLocation ), false );
	requestAgent.send( null ); // Send the request synchronously

	// The following line for JSON parsing is intentionally commented out for this clone.
	// responsePayload = JSON.parse( requestAgent.responseText );

	responsePayload = requestAgent.responseText; // Get the raw text content

	// console.info( 'Resource loaded from path:', resourceLocation );
	return responsePayload;
}


function acquireLayoutPattern( layoutIdentifier )
{
	const resourcePath = 'layouts/' + layoutIdentifier + '.html';
	var designPattern = retrieveResourceContent( resourcePath );

	// console.log( 'Design pattern retrieved:', layoutIdentifier );
	return designPattern;
}