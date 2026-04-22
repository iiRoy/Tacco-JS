const createReporter = function() {
    let messageRepository = [];
    let reportProcessor = function(...entryItems) {
        messageRepository.push(entryItems);
        if (window.console) {
            let actualItems = Array.from(entryItems);
            let consoleMethod = window.console.log;

            if (typeof consoleMethod === 'object') {
                Function.prototype.apply.call(consoleMethod, window.console, actualItems);
            } else {
                Reflect.apply(consoleMethod, window.console, actualItems);
            }
        }
    };
    reportProcessor.record = messageRepository;
    return reportProcessor;
};
window.diagnosticOutput = createReporter();

(function() {
    const virtualFunction = () => {};
    const consoleMethodsList = [
        "assert", "count", "debug", "dir", "dirxml", "error", "exception",
        "group", "groupCollapsed", "groupEnd", "info", "log", "timeStamp",
        "profile", "profileEnd", "time", "timeEnd", "trace", "warn"
    ];

    let actualConsoleContainer;
    try {
        window.console.log();
        actualConsoleContainer = window.console;
    } catch (e) {
        actualConsoleContainer = {};
    }

    consoleMethodsList.forEach(methodName => {
        if (typeof actualConsoleContainer[methodName] === 'undefined') {
            actualConsoleContainer[methodName] = virtualFunction;
        }
    });

    if (typeof window.console === 'undefined' || Object.keys(window.console).length === 0) {
        window.console = actualConsoleContainer;
    }
})();

(function(pageDocument) {
    const MobileEnhancements = window.MobileEnhancements || {};

    const applyViewportScaleFix = () => {
        let metaNodes = pageDocument.getElementsByTagName('meta');
        let targetViewportMeta = null;
        for (let i = 0; i < metaNodes.length; i++) {
            if (metaNodes[i].getAttribute('name') === 'viewport') {
                targetViewportMeta = metaNodes[i];
                break;
            }
        }

        const userAgentString = window.navigator.userAgent;
        const isIOS = /iPhone|iPad/i.test(userAgentString);
        const isOperaMini = /Opera Mini/i.test(userAgentString);

        if (targetViewportMeta && isIOS && !isOperaMini) {
            targetViewportMeta.setAttribute('content', "width=device-width, minimum-scale=1.0, maximum-scale=1.0");

            const handleGestureStart = () => {
                targetViewportMeta.setAttribute('content', "width=device-width, minimum-scale=0.25, maximum-scale=1.6");
            };
            pageDocument.addEventListener("gesturestart", handleGestureStart, { passive: false });
        }
    };

    const performAddressBarHiding = () => {
        const currentWindow = window;
        const pageDocumentRef = currentWindow.document;

        if (currentWindow.location.hash && currentWindow.addEventListener) {
            return;
        }

        currentWindow.scrollTo(0, 1);

        let initialScrollPosition = 1;
        const bodyReadyChecker = currentWindow.setInterval(() => {
            if (pageDocumentRef.body) {
                currentWindow.clearInterval(bodyReadyChecker);
                initialScrollPosition = "scrollTop" in pageDocumentRef.body ? pageDocumentRef.body.scrollTop : 1;
                currentWindow.scrollTo(0, initialScrollPosition === 1 ? 0 : 1);
            }
        }, 15);

        currentWindow.addEventListener("load", () => {
            currentWindow.setTimeout(() => {
                currentWindow.scrollTo(0, initialScrollPosition === 1 ? 0 : 1);
            }, 0);
        }, { passive: false });
    };

    MobileEnhancements.adjustDisplay = applyViewportScaleFix;
    MobileEnhancements.concealAddressBar = performAddressBarHiding;

    window.MobileEnhancements = MobileEnhancements;
})(document);