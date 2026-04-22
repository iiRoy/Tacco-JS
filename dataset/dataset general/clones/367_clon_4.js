class CommsChannel {
    #endpointUrl;
    #countryCode;
    #phoneNumber;
    #deviceIdentifier;

    constructor(url, cCode, pNumber, dIdentifier) {
        this.#endpointUrl = url;
        this.#countryCode = cCode;
        this.#phoneNumber = pNumber;
        this.#deviceIdentifier = dIdentifier;
    }

    dispatchSync(operationName, operationPayload) {
        const clientInfo = {
            ctc: this.#countryCode,
            phn: this.#phoneNumber,
            dev: this.#deviceIdentifier
        };
        const requestDetails = {
            opn: operationName,
            pld: operationPayload
        };
        const postData = JSON.stringify({
            clientInfo: clientInfo,
            requestDetails: requestDetails
        });

        const xhr = new XMLHttpRequest();
        xhr.open('POST', this.#endpointUrl, false);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(postData);

        if (xhr.responseText) {
            return xhr.responseText;
        }
        // If responseText is empty or null, return undefined, mimicking original behavior
        return undefined;
    }

    dispatchAsync(operationName, operationPayload, completionCallback) {
        const clientInfo = {
            ctc: this.#countryCode,
            phn: this.#phoneNumber,
            dev: this.#deviceIdentifier
        };
        const requestDetails = {
            opn: operationName,
            pld: operationPayload
        };
        const postData = JSON.stringify({
            clientInfo: clientInfo,
            requestDetails: requestDetails
        });

        fetch(this.#endpointUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: postData
        })
        .then(response => {
            if (!response.ok) {
                // If response is not OK (e.g., 4xx, 5xx), the original .done()
                // would not trigger the callback. We will throw an error to skip
                // the subsequent .then() and fall into .catch().
                // The original .done() only processes successful responses.
                throw new Error(`HTTP status ${response.status}`);
            }
            return response.json(); // Attempt to parse JSON
        })
        .then(parsedData => {
            // Only call the callback on successful JSON parsing and OK response
            completionCallback(parsedData);
        })
        .catch(error => {
            // Errors (network, HTTP non-OK, JSON parsing failure) are caught here.
            // The original .done() does not have an error handler, so we just
            // log the error and do not invoke the user's completionCallback.
            console.error('Asynchronous communication failure:', error);
        });
    }
}