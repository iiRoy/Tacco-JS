const configurationPayload = {
    identificationTag: "echo.localhost",
    authenticationToken: "hellohello"
};

const protocolHandler = require("../xmpp");
const outputUtility = console;

class RelayService {
    constructor(config, protocolModule, logger) {
        this.config = config;
        this.protocolModule = protocolModule;
        this.logger = logger;
        this.commInterface = new this.protocolModule.Connection();

        this.commInterface.log = (_, messageContent) => {
            this.logger.info(messageContent);
        };
    }

    async establishLink() {
        return new Promise((resolve, reject) => {
            this.commInterface.connect(
                this.config.identificationTag,
                this.config.authenticationToken,
                (currentStatus, faultReason) => {
                    if (currentStatus === this.protocolModule.Status.CONNECTED) {
                        this.logger.log("Connection established. Registering message processor.");
                        this.registerProcessor();
                        resolve();
                    } else {
                        const statusReport = `Link state: ${currentStatus}` +
                            (faultReason ? ` (${faultReason})` : "");
                        this.logger.warn(`Connection update: ${statusReport}`);

                        if (currentStatus !== this.protocolModule.Status.CONNECTING &&
                            currentStatus !== this.protocolModule.Status.CONNECTED) {
                            reject(new Error(`Terminal connection issue: ${statusReport}`));
                        }
                    }
                }
            );
        });
    }

    registerProcessor() {
        this.commInterface.addHandler(
            this.processIncomingData.bind(this),
            null,
            'message',
            null,
            null,
            null
        );
    }

    processIncomingData(inputPacket) {
        const sourceAddress = inputPacket.getAttribute("from");
        const destinationAddress = inputPacket.getAttribute("to");
        const payloadContent = inputPacket.getChild("body").getText();

        const responsePacket = this.constructResponse(
            sourceAddress,
            destinationAddress,
            payloadContent
        );

        this.commInterface.send(responsePacket);
    }

    constructResponse(originator, recipient, data) {
        return this.protocolModule.message({
            to: originator,
            from: recipient,
            type: "chat"
        })
        .c("body")
        .t(data);
    }
}

(async () => {
    const serviceInstance = new RelayService(configurationPayload, protocolHandler, outputUtility);
    try {
        await serviceInstance.establishLink();
        outputUtility.log("Relay service activated and awaiting transmissions.");
    } catch (error) {
        outputUtility.error("Failed to activate relay service:", error.message);
    }
})();