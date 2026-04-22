module.exports.generatePaddedJson = function (
	// The name of the callback function provided in the request, if any.
	requestCallbackName,
	// The data object to be serialized into JSON.
	payloadData
) {
	// Initialize a variable to hold the final output string,
	// which will either be plain JSON or JSONP.
	let
		processedOutput = ""
	;

	// Check if a callback function name was supplied.
	// This determines whether to format as JSONP or just plain JSON.
	if (
		typeof requestCallbackName
		!==
		"undefined"
	) {
		// If a callback name is present, prepare the JSONP string.
		// First, clean the callback name by removing any '?' characters,
		// which might be present if it's derived from a query parameter.
		processedOutput
			=
			requestCallbackName.replace("?", "")
			+
			"({0});"
		;

		// Then, use our custom string substitution utility
		// to embed the stringified payload data into the JSONP template.
		processedOutput
			=
			String.substitutePlaceholders(
				processedOutput,
				JSON.stringify(payloadData)
			)
		;
	}
	// If no callback name was provided, simply return the data as a plain JSON string.
	else
	{
		processedOutput
			=
			JSON.stringify(payloadData)
		;
	}

	// Return the fully constructed JSONP or JSON string.
	return processedOutput;
};


// Extend the global String object with a utility method
// for substituting numbered placeholders in a string.
String.substitutePlaceholders = function (
	// This function uses the 'arguments' object implicitly
	// to access all parameters passed to it.
) {
	// The first argument is always the template string itself.
	let
		templateString = arguments[0]
	;

	// Determine the total count of arguments passed to this function.
	const
		totalArgumentsCount = arguments.length
	;

	// Loop through the arguments, starting from the second one (index 1),
	// as these are the actual values intended for substitution.
	for (
		let argumentIndex = 0;
		argumentIndex < totalArgumentsCount - 1;
		argumentIndex++
	) {
		// Construct a regular expression to find placeholders like '{0}', '{1}', etc.
		// The 'g' flag ensures all occurrences are replaced.
		// The 'm' flag (multiline) is included but not strictly necessary for this use case.
		const
			searchPattern = new RegExp("\\{" + argumentIndex + "\\}", "gm")
		;

		// Retrieve the corresponding replacement value from the arguments list.
		// It's at 'argumentIndex + 1' because 'argumentIndex' starts from 0 for placeholders,
		// but the actual values start from arguments[1].
		const
			replacementValue = arguments[argumentIndex + 1]
		;

		// Replace all instances of the current placeholder with its corresponding value.
		templateString
			=
			templateString.replace(searchPattern, replacementValue)
		;
	}

	// Return the modified string with all placeholders resolved.
	return templateString;
};