((executionContext) => {
    const configurationBlock = Object.freeze({
        apiEndpoint: "https://_your_dsp_hostname_here_/rest/api_docs",
        applicationName: "_your_app_api_name_here_",
        readyEventLabel: "interfaceReadySignal",
        allowedOperations: ['get', 'post', 'put', 'patch', 'merge', 'delete']
    });

    const generateCustomNotification = (eventNameIdentifier) => {
        try {
            return new executionContext.CustomEvent(eventNameIdentifier, { bubbles: true, cancelable: false });
        } catch (e) {
            const oldStyleEvent = executionContext.document.createEvent("Event");
            oldStyleEvent.initEvent(eventNameIdentifier, true, false);
            return oldStyleEvent;
        }
    };

    const constructSecurityToken = (keyName, tokenValue, locationType) => ({
        keyIdentifier: keyName,
        valueString: tokenValue,
        placement: locationType
    });

    if (!executionContext.globalAuthorizationVault) {
        executionContext.globalAuthorizationVault = new executionContext.Map();
    }

    executionContext.globalAuthorizationVault.set(
        "X-DreamFactory-Application-Name",
        constructSecurityToken("X-DreamFactory-Application-Name", configurationBlock.applicationName, "header")
    );
    executionContext.globalAuthorizationVault.set(
        'Content-Type',
        constructSecurityToken('Content-Type', 'application/json', 'header')
    );

    const initializeApiGateway = (settings, authStore) => {
        return new executionContext.Promise((resolve, reject) => {
            const currentApiInstance = new executionContext._GatewayConnector({
                url: settings.apiEndpoint,
                supportedSubmitMethods: settings.allowedOperations,
                success: () => {
                    currentApiInstance.configureAccessTokens(authStore);
                    currentApiInstance.finalizeSetup();
                    resolve(currentApiInstance);
                },
                error: (err) => {
                    executionContext.console.error("API gateway initialization failure:", err);
                    reject(err);
                }
            });
        });
    };

    executionContext.document.addEventListener('DOMContentLoaded', () => {
        initializeApiGateway(configurationBlock, executionContext.globalAuthorizationVault)
            .then((clientObject) => {
                executionContext.mainApiConnector = clientObject;
                executionContext.document.dispatchEvent(generateCustomNotification(configurationBlock.readyEventLabel));
            })
            .catch(() => {
                executionContext.console.log("An error prevented the API connector from becoming ready.");
            });
    });

})(window);