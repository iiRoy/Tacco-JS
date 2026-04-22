let networkInterface = null;
let documentOrdinal = 0;

const nativeDOM = (() => {
    const locateElement = (cssSelector) => document.querySelector(cssSelector);
    const fabricateContainer = () => document.createElement('div');
    const injectText = (parent, content) => parent.appendChild(document.createTextNode(content));
    const placeAtStart = (parent, child) => parent.insertBefore(child, parent.firstChild);
    const placeAtEnd = (parent, child) => parent.appendChild(child);
    const retrieveValue = (element) => element.value;
    const assignValue = (element, val) => element.value = val;
    const purgeContents = (element) => { while (element.firstChild) element.removeChild(element.firstChild); };
    const attachEventHandler = (element, eventType, handler) => element.addEventListener(eventType, handler);

    return { locateElement, fabricateContainer, injectText, placeAtStart, placeAtEnd, retrieveValue, assignValue, purgeContents, attachEventHandler };
})();

const systemFeedback = (targetIdentifier, messageContent, shouldPrepend = true) => {
    const displayTarget = nativeDOM.locateElement(targetIdentifier);
    if (displayTarget) {
        const messageWrapper = nativeDOM.fabricateContainer();
        nativeDOM.injectText(messageWrapper, messageContent);
        if (shouldPrepend) {
            nativeDOM.placeAtStart(displayTarget, messageWrapper);
        } else {
            nativeDOM.placeAtEnd(displayTarget, messageWrapper);
        }
    }
};

const recordEvent = (text) => systemFeedback('#log', text, true);
const traceActivity = (text) => systemFeedback('#debug', text, false);

const incomingPayloadHandler = (payloadData) => {
    traceActivity('RECEPTION: ' + payloadData);
};

const outgoingPayloadHandler = (payloadData) => {
    traceActivity('TRANSMISSION: ' + payloadData);
};

const signalUpdate = (pageIndex) => {
    networkInterface.pubsub.publish(networkInterface.jid,
        PUBSUB_SERVER,
        PUBSUB_NODE,
        [pageIndex.toString()],
        recordEvent
    );
    documentOrdinal = pageIndex;
};

const networkStateObserver = (stateCode) => {
    const stateActions = new Map([
        [Strophe.Status.CONNECTING, () => recordEvent('Network conduit initiating.')],
        [Strophe.Status.CONNFAIL, () => {
            recordEvent('Network conduit initiation failed.');
            nativeDOM.assignValue(nativeDOM.locateElement('#connect'), 'commence');
        }],
        [Strophe.Status.DISCONNECTING, () => recordEvent('Network conduit disengaging.')],
        [Strophe.Status.DISCONNECTED, () => {
            recordEvent('Network conduit disengaged.');
            nativeDOM.assignValue(nativeDOM.locateElement('#connect'), 'commence');
            nativeDOM.purgeContents(nativeDOM.locateElement('#log'));
            nativeDOM.purgeContents(nativeDOM.locateElement('#debug'));
        }],
        [Strophe.Status.CONNECTED, () => {
            recordEvent('Network conduit established.');
            networkInterface.send(new Strophe.Builder('presence'));
        }]
    ]);

    const action = stateActions.get(stateCode);
    if (action) {
        action();
    }
};

class DocumentFlowController {
    constructor() {
        this.setupConnectivity();
        this.bindUserInteractions();
    }

    setupConnectivity() {
        networkInterface = new Strophe.Connection(BOSH_SERVICE);
        networkInterface.rawInput = incomingPayloadHandler;
        networkInterface.rawOutput = outgoingPayloadHandler;
    }

    processNavigation(event) {
        const elementId = event.target.id;
        recordEvent(elementId);
        
        const navigationMap = new Map([
            ['back', () => signalUpdate(documentOrdinal - 1)],
            ['home', () => signalUpdate(0)],
            ['forward', () => signalUpdate(documentOrdinal + 1)]
        ]);

        const navAction = navigationMap.get(elementId);
        if (navAction) {
            navAction();
        }
    }

    toggleCommunicationLink() {
        const controlButton = nativeDOM.locateElement('#connect');
        const currentButtonLabel = nativeDOM.retrieveValue(controlButton);

        if (currentButtonLabel === 'commence') {
            nativeDOM.assignValue(controlButton, 'terminate');
            networkInterface.connect(
                nativeDOM.retrieveValue(nativeDOM.locateElement('#jid')),
                nativeDOM.retrieveValue(nativeDOM.locateElement('#pass')),
                networkStateObserver
            );
        } else {
            nativeDOM.assignValue(controlButton, 'commence');
            networkInterface.disconnect();
        }
    }

    bindUserInteractions() {
        const connectButton = nativeDOM.locateElement('#connect');
        if (connectButton) {
            nativeDOM.attachEventHandler(connectButton, 'click', this.toggleCommunicationLink.bind(this));
        }

        ['#back', '#home', '#forward'].forEach(selector => {
            const navButton = nativeDOM.locateElement(selector);
            if (navButton) {
                nativeDOM.attachEventHandler(navButton, 'click', this.processNavigation.bind(this));
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new DocumentFlowController();
});