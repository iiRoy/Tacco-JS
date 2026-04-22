const protocolModule = require('../lib');

class NetworkAgentController {
    #connectionAgent;
    #transmissionExecuted = false;
    #operationHandlers;

    constructor() {
        this.#connectionAgent = protocolModule.Client.$create();
        this.#initializeEventDispatchers();
        this.#setupOperationHandlers();
    }

    #initializeEventDispatchers() {
        this.#connectionAgent.on('error', (channelHandle) => {
            channelHandle.destroy();
            console.log('Interruption occurred');
            process.exit(1);
        });

        this.#connectionAgent.on('mining.error', (notificationText, channelHandle) => {
            console.log(notificationText);
        });

        this.#connectionAgent.on('mining', (payloadInfo, channelHandle, messageKind) => {
            console.log(`Mining feedback: ${messageKind} = `, payloadInfo);
            this.#processMiningPayload(payloadInfo, channelHandle);
        });
    }

    #setupOperationHandlers() {
        this.#operationHandlers = new Map();
        this.#operationHandlers.set('set_difficulty', this.#handleDifficultyUpdate);
        this.#operationHandlers.set('notify', this.#handleNewBlockNotification);
        this.#operationHandlers.set('default', this.#handleDefaultMiningOperation);
    }

    #handleDifficultyUpdate(payloadInfo, channelHandle) {
        // No specific action needed as per original
    }

    #handleNewBlockNotification(payloadInfo, channelHandle) {
        // No specific action needed as per original
    }

    async #handleDefaultMiningOperation(payloadInfo, channelHandle) {
        if (!channelHandle.authorized) {
            console.log('Requesting permission');
            await channelHandle.stratumAuthorize('participant','code');
        } else {
            console.log('Permission granted');
            if (!this.#transmissionExecuted) {
                console.log('Initiating test submission once, then terminating');
                await channelHandle.stratumSubmit('','','','','');
                this.#connectionAgent.destroy();
                this.#transmissionExecuted = true;
            }
        }
    }

    #processMiningPayload(payloadInfo, channelHandle) {
        const handler = this.#operationHandlers.get(payloadInfo.method) || this.#operationHandlers.get('default');
        handler.call(this, payloadInfo, channelHandle);
    }

    async establishAndSubscribe(targetConfiguration) {
        try {
            const channelHandle = await this.#connectionAgent.connect(targetConfiguration);
            console.log('Connection established! Requesting feed subscription');

            await channelHandle.stratumSubscribe('System.Stream');
            console.log('Feed requested!');
        } catch (faultReport) {
            console.log('Connection or subscription fault:', faultReport);
        }
    }
}

(async () => {
    const managerInstance = new NetworkAgentController();
    await managerInstance.establishAndSubscribe({
        targetHost: 'localhost',
        targetPort: 3333
    });
})();