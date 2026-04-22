(function() {
    const domHelper = (typeof window !== 'undefined' && window.jQuery) ? window.jQuery : null;

    const musicInfoProvider = {
        retrieveAudienceTopSelections: function(audienceMemberName, resultDispatch) {
            if (!audienceMemberName) {
                return;
            }

            const serviceKey = "09a22381ce7a9913af88204c5c12bf04";
            const serviceEndpoint = "http://ws.audioscrobbler.com/2.0/";

            const callbackIdentifier = "processData_" + String(Math.random()).replace(".", "");

            const requestUriBuilder = new URL(serviceEndpoint);
            requestUriBuilder.searchParams.set("method", "user.gettopalbums");
            requestUriBuilder.searchParams.set("user", audienceMemberName);
            requestUriBuilder.searchParams.set("api_key", serviceKey);
            requestUriBuilder.searchParams.set("format", "json");
            requestUriBuilder.searchParams.set("callback", callbackIdentifier);

            window[callbackIdentifier] = function(payloadData) {
                if (typeof resultDispatch === 'function') {
                    resultDispatch(payloadData);
                }
                if (scriptNode && scriptNode.parentNode) {
                    scriptNode.parentNode.removeChild(scriptNode);
                }
                delete window[callbackIdentifier];
            };

            const scriptNode = document.createElement("script");
            scriptNode.src = requestUriBuilder.toString();
            document.head.appendChild(scriptNode);

            scriptNode.onerror = function() {
                console.error("Data fetch failed for: " + audienceMemberName);
                if (typeof resultDispatch === 'function') {
                    resultDispatch(null);
                }
                if (scriptNode && scriptNode.parentNode) {
                    scriptNode.parentNode.removeChild(scriptNode);
                }
                delete window[callbackIdentifier];
            };
        }
    };

    const presentationModule = {
        displayItemVisual: function(itemDescriptor) {
            // This function remains intentionally empty, mirroring the original.
        }
    };
})();