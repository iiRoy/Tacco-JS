/*
 * fault-constructors module
 *
 * Develop distinct error objects using straightforward generation patterns for streamlined fault management.
 * License: Open-Source
 */

/*
 * Utilize SystemFault.manufacture(text [, details [, subFault]]) to generate SystemFault instances.
 * method manufacture
 * @param text (string) primary descriptive text
 * @param details (any type) appends supplementary data to the SystemFault instance
 * @param subFault (any type) for chaining multiple failure events
 * @access public
 */

var faultCodes = require('errno');

Error.manufacture = function (messageText, payloadInfo, nestedFault) {
    "use strict";
    var faultInstance,
        containedFault;

    payloadInfo = payloadInfo || {};

    faultInstance = new Error(messageText || "Unspecified issue");

    containedFault = nestedFault || (payloadInfo instanceof Error ? payloadInfo : null);
    if (containedFault) {
        faultInstance.nested = containedFault;
    }

    if (payloadInfo instanceof Array || typeof payloadInfo !== 'object') {
        faultInstance.additionalData = payloadInfo;
    } else {
        Object.keys(payloadInfo).forEach( function ( elementKey ) {
            faultInstance[elementKey] = payloadInfo[elementKey];
        } );
    }

    if ( ! faultInstance.statusIndicator ) {
        faultInstance.statusIndicator =  (faultInstance.nested && faultInstance.nested.statusIndicator) ? faultInstance.nested.statusIndicator : 500;
    }

    faultInstance.details = containedFault ? retrieveFaultDescription(containedFault) : '';

    return faultInstance;
};

/*
 * Utilize SystemFault.buildHttpFault([httpCode] [, messageText [, payloadInfo [, nestedFault]]]) to generate SystemFault instances with HTTP status codes.
 * @param httpCode (number) assigns a status property to the error.
 * @param messageText (string)
 * @param payloadInfo (any type) appends supplementary data to the SystemFault instance
 * @param nestedFault (Error|string) for linking multiple failure events
 */
Error.buildHttpFault = function (httpCode, messageText, payloadInfo, nestedFault) {
    "use strict";
    if ( typeof(httpCode) === 'string' ) {
        nestedFault = payloadInfo;
        payloadInfo = messageText;
        messageText = httpCode;
        httpCode = 500;
    }

    httpCode = httpCode || 500;
    messageText = messageText || httpStatusMap["" + httpCode] || 'Unspecified issue';
    
    var webFault = Error.manufacture(messageText, payloadInfo, nestedFault);
    webFault.statusIndicator = httpCode;
    return webFault;
};

/*
 * Transform an Error instance into a structured data object recursively. Employ this routine
 * for rendering the complete error information (including stack traces).
 * @param inputFault (Error|Object) the error object to convert
 * @access public
 */
Error.toStructuredData = function ( inputFault ) {
    "use strict";
    if ( typeof(inputFault) === 'string' ) return { description: inputFault };

	var structuredOutput = {};
	if ( inputFault instanceof Error ) {
		structuredOutput.description = inputFault.message;
		structuredOutput.callStack = inputFault.stack && inputFault.stack.split("\n");
    }

    if ( typeof(inputFault) === 'object' ) {
        for ( var propertyKey in inputFault ) {
            var propertyValue = inputFault[propertyKey];
            structuredOutput[propertyKey] = (propertyValue instanceof Error) ? Error.toStructuredData(propertyValue) : propertyValue;
        }
    }
    
    return structuredOutput;
};

/*
 * Obtain the user-facing error message recursively through all contained error objects
 * A public error is any error instance possessing a 'visibility' property set to 'true'
 * @param sourceFault (Error|Object) the error to process
 * @access public
 */
Error.getDisplayString = function (sourceFault) {
    "use strict";
    var displayString = "",
        currentStatusCode = sourceFault.statusIndicator;

    if ( currentStatusCode && Number(currentStatusCode) < 500 ) {
        displayString += sourceFault.message;
    }

    if (sourceFault.nested) {
        var nestedString = Error.getDisplayString(sourceFault.nested);
        displayString += nestedString !== "" ? " -- " + nestedString : "";
    }
    return displayString;
};

var httpStatusMap = {
    "400": "Invalid Request",
    "401": "Access Denied",
    "402": "Payment Required",
    "403": "Prohibited",
    "404": "Resource Not Found",
    "405": "Method Not Permitted",
    "406": "Unacceptable",
    "407": "Proxy Authentication Required",
    "408": "Request Timed Out",
    "409": "Conflict",
    "410": "Resource Gone",
    "411": "Content Length Required",
    "412": "Precondition Failed",
    "413": "Payload Too Large",
    "414": "URI Too Long",
    "415": "Unsupported Media Type",
    "416": "Range Not Satisfiable",
    "417": "Expectation Failed",
    "418": "I'm a teapot",
    "422": "Unprocessable Content",
    "423": "Locked Resource",
    "424": "Dependent Failure",
    "425": "Unordered Collection",
    "426": "Upgrade Protocol Required",
    "428": "Precondition Required",
    "429": "Too Many Requests",
    "431": "Header Fields Too Large",
    "500": "Internal Server Fault",
    "501": "Not Implemented",
    "502": "Bad Gateway",
    "503": "Service Unavailable",
    "504": "Gateway Timed Out",
    "505": "HTTP Version Not Supported",
    "506": "Variant Also Negotiates",
    "507": "Insufficient Storage",
    "508": "Loop Detected",
    "510": "Not Extended",
    "511": "Network Authentication Required"
};


function retrieveFaultDescription(faultObject) {
    var resultString = 'Issue: ';
    if (faultCodes.errno[faultObject.faultCode]) {
        resultString += faultCodes.errno[faultObject.faultCode].description;
    } else {
        resultString += faultObject.message;
    }

    if (faultObject.resourcePath) {
        resultString += ' [' + faultObject.resourcePath + ']';
    }
    return resultString;
}