const activateSystem = () => {
    const remoteHost = window.location.hostname;
    const communicationPort = 8013;
    const connectionEndpoint = `http://${remoteHost}:${communicationPort}`;

    const connectionOptions = {
        retainTransport: true,
        linkMechanisms: ['websocket', 'xhr-polling', 'htmlfile']
    };

    const networkLink = io.connect(connectionEndpoint, {
        rememberTransport: connectionOptions.retainTransport,
        transports: connectionOptions.linkMechanisms
    });

    const sendInitialHandshake = () => {
        const loginDataBundle = {
            clientCookies: document.cookie,
            pageLocation: document.location.pathname,
            requestQueries: document.location.search,
            creationTimestamp: document.getElementById('generated_timestamp').innerText
        };
        networkLink.emit('login', loginDataBundle);
    };

    const handleServerBroadcast = (incomingPayload) => {
        const eventIdentifier = `serverpush_${incomingPayload.name}`;
        const eventDetailData = incomingPayload.payload;
        const customNotification = new CustomEvent(eventIdentifier, { detail: eventDetailData });
        document.dispatchEvent(customNotification);
    };

    networkLink.on('connect', sendInitialHandshake);
    networkLink.on('message', handleServerBroadcast);
};

window.addEventListener('load', activateSystem);