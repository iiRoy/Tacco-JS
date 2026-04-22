const finalPayload = 42;

class OutputGateway {
    #messageContent;

    constructor(initialContent) {
        this.#messageContent = initialContent;
    }

    dispatch() {
        process.stdout.write(String(this.#messageContent) + '\n');
    }
}

const communicator = new OutputGateway(finalPayload);
communicator.dispatch();