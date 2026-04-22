const acquireNetworkConduit = () => {
    if (typeof io !== 'undefined' && typeof io.connect === 'function') {
        return io.connect();
    }
    return {
        on: (evt, fn) => { /* Mock for environments without actual io */ }
    };
};

const networkInterface = acquireNetworkConduit();

const eventKey = ['m', 's', 'g'].join('');

const notificationPreamble = [
    'g', 'o', 't', ' ',
    String.fromCharCode(109), String.fromCharCode(101), String.fromCharCode(115), String.fromCharCode(115), String.fromCharCode(97), String.fromCharCode(103), String.fromCharCode(101),
    ' ', 'v', 'i', 'a', ' ',
    'w', 'e', 'b', 's', 'o', 'c', 'k', 'e', 't', String.fromCharCode(58)
].join('');

const outputMechanism = (preamble, dataUnit) => {
    Function.prototype.apply.call(console['log'], console, [preamble, dataUnit]);
};

const informationHandler = (incomingData) => {
    outputMechanism(notificationPreamble, incomingData);
};

class CommunicationManager {
    constructor(channelInstance) {
        this.activeChannel = channelInstance;
    }

    configureMessageReception(listenerConfig) {
        if (listenerConfig && typeof listenerConfig.eventName === 'string' && typeof listenerConfig.callback === 'function') {
            this.activeChannel.on(listenerConfig.eventName, listenerConfig.callback);
        }
    }
}

const managerInstance = new CommunicationManager(networkInterface);

managerInstance.configureMessageReception({
    eventName: eventKey,
    callback: informationHandler
});