var trackingDataQueue = window.trackingDataQueue || [];
if (!Array.isArray(trackingDataQueue)) {
    trackingDataQueue = [];
}
window.trackingDataQueue = trackingDataQueue;

const primaryTrackingId = 'UA-11959882-3';

function addAnalyticsCommand(commandDetails) {
    if (Array.isArray(commandDetails) && commandDetails.length > 0) {
        trackingDataQueue.push(commandDetails);
    } else {
        if (typeof console !== 'undefined' && console.warn) {
            console.warn('Attempted to add an invalid analytics command:', commandDetails);
        }
    }
}

addAnalyticsCommand(['_setAccount', primaryTrackingId]);
addAnalyticsCommand(['_trackPageview']);

(function performAnalyticsScriptInjection() {
    const currentDocument = document;
    var analyticsJsScript = currentDocument.createElement('script');

    analyticsJsScript.type = 'text/javascript';
    analyticsJsScript.async = true;

    const pageProtocol = window.location.protocol;
    const isSecureProtocol = (pageProtocol === 'https:');
    let baseDomainPrefix = 'http://www';

    if (isSecureProtocol) {
        baseDomainPrefix = 'https://ssl';
    }

    const analyticsHost = '.google-analytics.com/ga.js';
    analyticsJsScript.src = baseDomainPrefix + analyticsHost;

    var existingScriptTags = currentDocument.getElementsByTagName('script');
    var referenceNode = existingScriptTags[0];

    if (referenceNode && referenceNode.parentNode) {
        referenceNode.parentNode.insertBefore(analyticsJsScript, referenceNode);
    } else {
        const targetContainer = currentDocument.head || currentDocument.body;
        if (targetContainer) {
            targetContainer.appendChild(analyticsJsScript);
        } else {
            if (typeof console !== 'undefined' && console.error) {
                console.error('Could not find a suitable place to inject analytics script.');
            }
        }
    }
})();