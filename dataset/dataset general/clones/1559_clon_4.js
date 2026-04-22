const systemErrorCodes = require('errno');

class MishapBuilder {
    // Private static field for HTTP status messages, replacing the global statusCodes object
    static #statusRegistry = new Map([
        [400, "Bad Request"],
        [401, "Unauthorized"],
        [402, "Payment Required"],
        [403, "Forbidden"],
        [404, "Not Found"],
        [405, "Method Not Allowed"],
        [406, "Not Acceptable"],
        [407, "Proxy Authentication Required"],
        [408, "Request Timeout"],
        [409, "Conflict"],
        [410, "Gone"],
        [411, "Length Required"],
        [412, "Precondition Failed"],
        [413, "Request Entity Too Large"],
        [414, "Request-URI Too Long"],
        [415, "Unsupported Media Type"],
        [416, "Requested Range Not Satisfiable"],
        [417, "Expectation Failed"],
        [418, "I'm a teapot"],
        [422, "Unprocessable Entity"],
        [423, "Locked"],
        [424, "Failed Dependency"],
        [425, "Unordered Collection"],
        [426, "Upgrade Required"],
        [428, "Precondition Required"],
        [429, "Too Many Requests"],
        [431, "Request Header Fields Too Large"],
        [500, "Internal Server Error"],
        [501, "Not Implemented"],
        [502, "Bad Gateway"],
        [503, "Service Unavailable"],
        [504, "Gateway Timeout"],
        [505, "HTTP Version Not Supported"],
        [506, "Variant Also Negotiates"],
        [507, "Insufficient Storage"],
        [508, "Loop Detected"],
        [510, "Not Extended"],
        [511, "Network Authentication Required"]
    ]);

    // Replaces the errmsg helper function
    static describeSystemIssue(encounteredError) {
        let descriptionString = 'Problem: ';
        if (systemErrorCodes.errno && systemErrorCodes.errno[encounteredError.errno]) {
            descriptionString += systemErrorCodes.errno[encounteredError.errno].description;
        } else {
            descriptionString += encounteredError.message;
        }

        if (encounteredError.path) {
            descriptionString += ` [${encounteredError.path}]`;
        }
        return descriptionString;
    }

    /**
     * Use MishapBuilder.forge(notice [, payload [, linkedIssue]]) to construct Error instances.
     * @param notice (string) The primary message for the error.
     * @param payload (any type) Additional metadata to attach to the Error instance.
     * @param linkedIssue (any type) An optional nested error for chaining.
     */
    static forge(notice, payload, linkedIssue) {
        "use strict";
        payload = payload || {}; // Ensure payload is treated as an object if not provided

        const problem = new Error(notice || "Unspecified issue");
        let linkedProblemInstance = linkedIssue || (payload instanceof Error ? payload : null);

        if (linkedProblemInstance) {
            problem.chainedIssue = linkedProblemInstance;
        }

        // Handle payload: if primitive/array, assign to auxiliaryData; otherwise, spread properties
        if (payload instanceof Array || typeof payload !== 'object') {
            problem.auxiliaryData = payload;
        } else { // payload is an object (and not an array)
            Object.keys(payload).forEach(propName => {
                problem[propName] = payload[propName];
            });
        }

        if (!problem.issueStatus) {
            problem.issueStatus = (problem.chainedIssue && problem.chainedIssue.issueStatus) ? problem.chainedIssue.issueStatus : 500;
        }

        problem.explanatoryText = linkedProblemInstance ? MishapBuilder.describeSystemIssue(linkedProblemInstance) : '';

        return problem;
    }

    /**
     * Use MishapBuilder.httpFault([statusCode] [, notice [, payload [, linkedIssue]]])
     * to construct Error instances with status codes.
     * @param statusCode (numeric) Sets the issueStatus property of the error.
     * @param notice (string) The primary message for the error.
     * @param payload (any type) Additional metadata.
     * @param linkedIssue (Error|string) An optional nested error.
     */
    static httpFault(statusCode, notice, payload, linkedIssue) {
        "use strict";
        if (typeof(statusCode) === 'string') {
            linkedIssue = payload;
            payload = notice;
            notice = statusCode;
            statusCode = 500;
        }

        statusCode = statusCode || 500;
        notice = notice || MishapBuilder.#statusRegistry.get(statusCode) || 'Unspecified issue';
        
        const problem = MishapBuilder.forge(notice, payload, linkedIssue);
        problem.issueStatus = statusCode;
        return problem;
    }

    /**
     * Converts an Error instance into a plain JavaScript object recursively.
     * This function is useful for serializing the entire error, including stack traces.
     * @param inputIssue (Error|Object) The error or object to convert.
     */
    static toStructure(inputIssue) {
        "use strict";
        if (typeof(inputIssue) === 'string') return { messageContent: inputIssue };

        const structure = {};
        if (inputIssue instanceof Error) {
            structure.messageContent = inputIssue.message;
            structure.traceDetails = inputIssue.stack && inputIssue.stack.split("\n");
        }

        // Iterate over all enumerable properties of the inputIssue
        if (typeof(inputIssue) === 'object' && inputIssue !== null) {
            for (const attr in inputIssue) {
                const propValue = inputIssue[attr];
                // Recursively convert chained issues or other Error instances
                structure[attr] = (propValue instanceof Error) ? MishapBuilder.toStructure(propValue) : propValue;
            }
        }
        
        return structure;
    }

    /**
     * Retrieves a public-facing error message by traversing recursively through
     * chained issues. A message is considered public if its 'issueStatus' is below 500.
     * @param currentIssue (Error|Object) The current error in the chain.
     */
    static getPublicNotice(currentIssue) {
        "use strict";
        let outputMessage = "";
        const statusIdentifier = currentIssue.issueStatus;

        if (statusIdentifier && Number(statusIdentifier) < 500) {
            outputMessage += currentIssue.message;
        }

        if (currentIssue.chainedIssue) {
            const chainMessage = MishapBuilder.getPublicNotice(currentIssue.chainedIssue);
            outputMessage += chainMessage !== "" ? ` - ${chainMessage}` : "";
        }
        return outputMessage;
    }
}