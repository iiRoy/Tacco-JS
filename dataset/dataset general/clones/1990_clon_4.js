class TaskAgent {
    #sourceEndpoint = '/queue/';
    #errorTracker = 0;
    #agentConfig = { initialPause: 2000 };
    #halted = true;
    #currentAbortController = null;

    constructor() {
        // No initial setup needed beyond private field declarations
    }

    async inputProcessor(incomingData) {
        let payload;
        try {
            payload = JSON.parse(incomingData);
        } catch (e) {
            this.#outputNotification('Invalid message format received.');
            return;
        }

        switch (payload.action) {
            case 'initiate':
                this.#halted = false;
                this.#errorTracker = 0;
                this.#outputNotification('Operation sequence initiated.');
                // Using await here for conceptual flow, but it's effectively fire-and-forget for the main thread
                await this.#taskOrchestrator();
                break;
            case 'terminate':
                this.#outputNotification('Operation sequence terminated.');
                this.#halt();
                break;
        }

        if (payload.settings) {
            this.#agentConfig.initialPause =
                payload.settings.initialPause || this.#agentConfig.initialPause;
        }
    }

    #halt() {
        if (this.#currentAbortController) {
            this.#currentAbortController.abort('Termination signal received.');
            this.#currentAbortController = null;
        }
        this.#halted = true;
    }

    async #taskOrchestrator() {
        if (this.#halted) { return; }

        if (this.#errorTracker > 5) {
            this.#outputNotification('Acquisition failure limit reached.');
            this.#halt();
            return;
        }

        this.#currentAbortController = new AbortController();
        const signal = this.#currentAbortController.signal;

        try {
            const response = await fetch(this.#sourceEndpoint, { signal });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const dataContent = await response.text();
            await this.#payloadProcessor(dataContent);
        } catch (error) {
            if (error.name === 'AbortError') {
                this.#outputNotification('Data acquisition aborted.');
            } else {
                this.#outputNotification(`Data acquisition issue: ${error.message}`);
                this.#fetchFailure();
            }
        } finally {
            this.#currentAbortController = null;
        }
    }

    #fetchFailure() {
        this.#errorTracker++;
        this.#outputNotification(`Acquisition failure count: ${this.#errorTracker}`);
        setTimeout(() => this.#taskOrchestrator(), this.#agentConfig.initialPause);
    }

    async #payloadProcessor(retrievedData) {
        if (this.#halted) { return; }

        let parsedContent;
        try {
            parsedContent = JSON.parse(retrievedData);
        } catch (e) {
            this.#outputNotification('Malformed payload received.');
            this.#fetchFailure();
            return;
        }

        if (parsedContent.code) {
            if (parsedContent.code === 'reschedule') {
                this.#outputNotification(`Reschedule delay of ${parsedContent.period}ms requested.`);
                setTimeout(() => this.#taskOrchestrator(), parseInt(parsedContent.period));
            } else {
                this.#outputNotification(`Unknown instruction code: ${parsedContent.code}`);
                this.#fetchFailure();
            }
        } else if (parsedContent.id && parsedContent.functionString && parsedContent.inputData) {
            const transactionID = parsedContent.id;
            const executableCode = unescape(parsedContent.functionString);
            const processedInput = unescape(parsedContent.inputData);

            let computationalFunction;
            try {
                computationalFunction = new Function('inputVal', `return (${executableCode})(inputVal);`);
            } catch (e) {
                this.#outputNotification(`Error creating function: ${e.message}`);
                this.#fetchFailure();
                return;
            }

            let computedResult;
            try {
                computedResult = computationalFunction(processedInput);
            } catch (e) {
                this.#outputNotification(`Error during function execution: ${e.message}`);
                computedResult = `EXECUTION_ERROR: ${e.message}`;
            }

            this.#transmitResult(transactionID, computedResult);
            setTimeout(() => this.#taskOrchestrator(), this.#agentConfig.initialPause);
        } else {
            this.#outputNotification('Incomplete or malformed work packet.');
            this.#fetchFailure();
        }
    }

    #transmitResult(identifier, outcome) {
        const submissionPayload = JSON.stringify({
            'transactionID': identifier,
            'outcome': outcome
        });

        fetch('/queue/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': submissionPayload.length,
                'Connection': 'close'
            },
            body: submissionPayload
        })
        .then(response => {
            if (!response.ok) {
                this.#outputNotification(`Result upload failed with status: ${response.status} for ID ${identifier}`);
            } else {
                this.#outputNotification(`Result for ID ${identifier} sent.`);
            }
        })
        .catch(error => {
            this.#outputNotification(`Result upload network error for ID ${identifier}: ${error.message}`);
        });
    }

    #outputNotification(message) {
        postMessage(message);
    }
}

const workerInstance = new TaskAgent();

globalThis.onmessage = async (event) => {
    await workerInstance.inputProcessor(event.data);
};