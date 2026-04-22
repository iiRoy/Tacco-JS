(function() {
    let currentCommunicationLink = null;

    const haltActiveSession = function() {
        if (currentCommunicationLink !== null) {
            currentCommunicationLink.emit('kill');
        }
        currentCommunicationLink = null;
    };

    const launchDisplayGateway = function() {
        const environmentLocation = document.location;
        const remoteEndpoint = environmentLocation.protocol + "//" + environmentLocation.host;

        currentCommunicationLink = io.connect(remoteEndpoint);
        
        const screenVisualizer = new VT100(80, 25, "terminal");
        
        screenVisualizer.getch(function(inputCharacter, visualizerInstance) {
            currentCommunicationLink.emit('data', inputCharacter);
        });
        
        const renderingSurface = document.getElementById('terminal');
        screenVisualizer.curs_set(1, true, renderingSurface);
        renderingSurface.focus();
        
        currentCommunicationLink.on('data', function(incomingPacket) {
            const terminationSequenceDetected = (incomingPacket === "\r\nexit\r\n");
            if (terminationSequenceDetected) {
                haltActiveSession();
            } else {
                screenVisualizer.write(incomingPacket);
            }
        });
        
        currentCommunicationLink.on('end', function(finalPacket) {
            screenVisualizer.curs_set(0, true);
            screenVisualizer.write(finalPacket);
        });
    };

    Object.assign(window, {
        initiateTerminalSession: launchDisplayGateway,
        concludeTerminalSession: haltActiveSession
    });
})();