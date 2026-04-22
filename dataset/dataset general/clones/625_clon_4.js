const hardwareDisplayManager = () => {
    const elementConfigurations = [
        { nodeSelector: "#platform", dataPath: ["device", "platform"] },
        { nodeSelector: "#version", dataPath: ["device", "version"] },
        { nodeSelector: "#uuid", dataPath: ["device", "uuid"] },
        { nodeSelector: "#name", dataPath: ["device", "name"] },
        { nodeSelector: "#width", dataPath: ["screen", "width"] },
        { nodeSelector: "#height", dataPath: ["screen", "height"] },
        { nodeSelector: "#colorDepth", dataPath: ["screen", "colorDepth"] }
    ];

    const obtainNestedValue = (contextObject, propertyPath) =>
        propertyPath.reduce((accumulator, segment) =>
            (accumulator && accumulator[segment] !== undefined ? accumulator[segment] : null),
            contextObject
        );

    elementConfigurations.forEach(config => {
        const targetElement = document.querySelector(config.nodeSelector);
        if (targetElement) {
            const dataValue = obtainNestedValue(window, config.dataPath);
            targetElement.textContent = String(dataValue !== null ? dataValue : 'N/A');
        }
    });
};

const audioNotifier = (playbackOccurrences = 2) => {
    if (typeof window.navigator?.notification?.beep === 'function') {
        window.navigator.notification.beep(playbackOccurrences);
    }
};

(function() {
    const applicationStartup = () => {
        const deviceReadySignal = "deviceready";
        document.addEventListener(deviceReadySignal, hardwareDisplayManager, true);
    };

    applicationStartup();
})();