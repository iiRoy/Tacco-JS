const ConfigurationData = {
    displayMessages: {
        online: { text: "Connected.", color: "green" },
        connecting: { text: "Connecting...", color: "yellow" },
        unsupported: { text: "No browser support.", color: "red" },
        offline: { text: "Click to connect.", color: "gray" }
    },
    systemChannels: {
        primarySource: { label: "Blockchain.info Transactions:", elementSelector: "#blockchainStatus", controlCheckbox: "#blockchainCheckBox" },
        secondarySource: { label: "Mt.Gox Trades:", elementSelector: "#mtgoxStatus", controlCheckbox: "#mtgoxCheckBox" }
    }
};

const ServiceHandler = (function() {
    function refreshChannelState(channelKey, stateKey) {
        const currentChannel = ConfigurationData.systemChannels[channelKey];
        const statusDisplay = ConfigurationData.displayMessages[stateKey];
        if (!currentChannel || !statusDisplay) {
            console.error("Invalid channel or state key provided.");
            return;
        }

        const targetElement = jQuery(currentChannel.elementSelector);
        const finalHtml = `${currentChannel.label} <span style="color: ${statusDisplay.color};">${statusDisplay.text}</span>`;
        targetElement.html(finalHtml);
    }

    function setupSystem(enableDebugging) {
        if (enableDebugging) {
            jQuery(ConfigurationData.systemChannels.primarySource.elementSelector).html("");
            jQuery(ConfigurationData.systemChannels.secondarySource.elementSelector).html("Debug mode.");
        }

        for (const key in ConfigurationData.systemChannels) {
            if (Object.prototype.hasOwnProperty.call(ConfigurationData.systemChannels, key)) {
                const channelInfo = ConfigurationData.systemChannels[key];
                if (jQuery(channelInfo.controlCheckbox).is(":checked")) {
                    refreshChannelState(key, 'connecting');
                } else {
                    refreshChannelState(key, 'offline');
                }
            }
        }
    }

    function signalOnline(channelKey) {
        refreshChannelState(channelKey, 'online');
    }

    function signalConnecting(channelKey) {
        refreshChannelState(channelKey, 'connecting');
    }

    function signalUnsupported(channelKey) {
        refreshChannelState(channelKey, 'unsupported');
    }

    function signalOffline(channelKey) {
        refreshChannelState(channelKey, 'offline');
    }

    return {
        initialize: setupSystem,
        setOnline: signalOnline,
        setConnecting: signalConnecting,
        setUnsupported: signalUnsupported,
        setOffline: signalOffline
    };
})();