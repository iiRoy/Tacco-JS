class DataExchangeService {
    // Internal method to acquire an XMLHttpRequest instance.
    // Mimics the original's error behavior: if XHR is unavailable,
    // it throws a TypeError, as `new false()` would.
    static #acquireChannelInstance() {
        if (typeof window !== 'undefined' && window.XMLHttpRequest) {
            return new XMLHttpRequest();
        } else {
            throw new TypeError("HTTP communication object not available in this environment.");
        }
    }

    // Configures the common asynchronous callback for request completion.
    static #setupCompletionHandler(channelInstance, completionAction) {
        channelInstance.onreadystatechange = function() {
            if (channelInstance.readyState === 4) {
                completionAction(channelInstance);
            }
        };
    }

    // Executes the `send` method, encapsulating its error handling.
    static #dispatchContentWithFailureCallback(channelInstance, contentBody, failureAction) {
        try {
            channelInstance.send(contentBody);
        } catch (operationError) {
            failureAction(operationError);
        }
    }

    // Initiates an asynchronous GET request.
    static requestResourceAsynchronously(resourceLocation, completionAction, failureAction, accountIdentifier, secretCredential) {
        const currentChannel = DataExchangeService.#acquireChannelInstance(); // May throw TypeError

        DataExchangeService.#setupCompletionHandler(currentChannel, completionAction);

        currentChannel.open("GET", resourceLocation, true, accountIdentifier, secretCredential);
        DataExchangeService.#dispatchContentWithFailureCallback(currentChannel, null, failureAction);
        return currentChannel;
    }

    // Initiates an asynchronous POST request.
    static transmitDataAsynchronously(resourceLocation, transmissionContent, completionAction, failureAction, contentSpecification, accountIdentifier, secretCredential) {
        const effectiveContentSpecification = contentSpecification || "application/x-www-form-urlencoded";

        const currentChannel = DataExchangeService.#acquireChannelInstance(); // May throw TypeError

        DataExchangeService.#setupCompletionHandler(currentChannel, completionAction);

        currentChannel.open("POST", resourceLocation, true, accountIdentifier, secretCredential);
        currentChannel.setRequestHeader("Content-type", effectiveContentSpecification);
        DataExchangeService.#dispatchContentWithFailureCallback(currentChannel, transmissionContent, failureAction);
        return currentChannel;
    }

    // Performs a synchronous GET request.
    static obtainResourceSynchronously(resourceLocation, accountIdentifier, secretCredential) {
        const currentChannel = DataExchangeService.#acquireChannelInstance(); // May throw TypeError

        currentChannel.open("GET", resourceLocation, false, accountIdentifier, secretCredential);
        currentChannel.send(null); // Original lets exceptions propagate
        return currentChannel;
    }

    // Performs a synchronous POST request.
    static submitContentSynchronously(resourceLocation, transmissionContent, contentSpecification, accountIdentifier, secretCredential) {
        const effectiveContentSpecification = contentSpecification || "application/x-www-form-urlencoded";

        const currentChannel = DataExchangeService.#acquireChannelInstance(); // May throw TypeError

        currentChannel.open("POST", resourceLocation, false, accountIdentifier, secretCredential);
        currentChannel.setRequestHeader("Content-type", effectiveContentSpecification);
        currentChannel.send(transmissionContent); // Original lets exceptions propagate
        return currentChannel;
    }
}

// Expose the core functionality through a new, differently named object.
const remoteOperations = {
    fetchAsync: DataExchangeService.requestResourceAsynchronously,
    postAsync: DataExchangeService.transmitDataAsynchronously,
    fetchSync: DataExchangeService.obtainResourceSynchronously,
    postSync: DataExchangeService.submitContentSynchronously
};