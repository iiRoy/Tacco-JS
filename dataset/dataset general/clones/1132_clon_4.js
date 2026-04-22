(function (globalReference, builderFunction) {
    "use strict";

    if (typeof define === 'function' && define.amd) {
        define("appGate", builderFunction(globalReference));
    } else if (typeof exports === 'object') {
        module.exports = builderFunction(globalReference);
    } else {
        globalReference["appGate"] = builderFunction(globalReference);
    }
})(window || this, function(environment) {

    /**
     * Cannot run without DOM or user-agent
     */
    if (!environment.document || !environment.navigator) {
        return;
    }

    const defaultParameters = {
        iosConfig: {},
        androidConfig: {},
        shouldFallback: true,
        delayMillis: 1000,
        timeVariance: 500
    };

    const combineOptions = (base, overrides) => {
        const result = { ...base };
        for (const attribute in overrides) {
            if (Object.prototype.hasOwnProperty.call(overrides, attribute)) {
                result[attribute] = overrides[attribute];
            }
        }
        return result;
    };

    const ascertainDeviceType = (agentString) => {
        if (agentString.match(/Android/i)) return "ANDROID_DEVICE";
        if (agentString.match(/iPad|iPhone|iPod/i)) return "IOS_DEVICE";
        return "UNKNOWN_DEVICE";
    };

    let currentConfiguration = {};
    let identifiedPlatform = "UNKNOWN_DEVICE";
    let pendingRedirectTimer = null;

    const retrieveStoreLink = () => {
        const platformSpecificLinkers = {
            "IOS_DEVICE": () => {
                const iosData = currentConfiguration.iosConfig;
                const customStore = iosData.storePath;
                if (customStore) return customStore;

                const appName = iosData.applicationName;
                const appId = iosData.applicationId;
                return (appId && appName) ? `itms-apps://itunes.apple.com/app/${appName}/id${appId}?mt=8` : null;
            },
            "ANDROID_DEVICE": () => {
                const androidData = currentConfiguration.androidConfig;
                const customStore = androidData.storePath;
                if (customStore) return customStore;

                const appId = androidData.applicationId;
                return appId ? `market://details?id=${appId}` : null;
            }
        };
        return platformSpecificLinkers[identifiedPlatform] ? platformSpecificLinkers[identifiedPlatform]() : null;
    };

    const executeStoreRedirect = (initiationTimestamp) => () => {
        const storePath = retrieveStoreLink();
        const acceptableWindow = currentConfiguration.delayMillis + currentConfiguration.timeVariance;
        if (typeof storePath === "string" && (Date.now() - initiationTimestamp) < acceptableWindow) {
            environment.location.href = storePath;
        }
    };

    const configureGate = (options) => {
        currentConfiguration = combineOptions(defaultParameters, options);
        identifiedPlatform = ascertainDeviceType(environment.navigator.userAgent);
    };

    const initiateLink = (destinationURL) => {
        if (identifiedPlatform === "UNKNOWN_DEVICE") {
            return;
        }

        let finalURL = destinationURL;

        if (identifiedPlatform === "ANDROID_DEVICE" && !environment.navigator.userAgent.match(/Firefox/i)) {
            const urlComponents = destinationURL.match(/([^:]+):\/\/(.+)$/i);
            if (urlComponents && urlComponents.length === 3) {
                finalURL = `intent://${urlComponents[2]}#Intent;scheme=${urlComponents[1]};package=${currentConfiguration.androidConfig.applicationId};end`;
            }
        }

        const primaryLinkAttempt = new Promise((resolve, reject) => {
            let appSuccessfullyOpened = false;

            const handleVisibilityChange = () => {
                if (environment.document.hidden) {
                    appSuccessfullyOpened = true;
                    resolve();
                }
            };
            const handleBlur = () => {
                appSuccessfullyOpened = true;
                resolve();
            };

            environment.document.addEventListener('visibilitychange', handleVisibilityChange, { once: true });
            environment.addEventListener('blur', handleBlur, { once: true });

            environment.location.assign(finalURL);

            environment.setTimeout(() => {
                environment.document.removeEventListener('visibilitychange', handleVisibilityChange);
                environment.removeEventListener('blur', handleBlur);
                if (!appSuccessfullyOpened) {
                    reject(); // Deep link failed to open app or navigate away
                }
            }, 50); // Short delay to detect immediate app switch
        });

        primaryLinkAttempt.catch(() => {
            // Only proceed with fallback if the primary deep link attempt failed
            if (currentConfiguration.shouldFallback) {
                pendingRedirectTimer = environment.setTimeout(executeStoreRedirect(Date.now()), currentConfiguration.delayMillis);
            }
        });
    };

    return {
        configureGate: configureGate,
        initiateLink: initiateLink
    };

});