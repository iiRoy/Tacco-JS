/*
* Software developed by various contributors.
*
* This code is provided under a permissive open-source license,
* allowing use, modification, and distribution.
* A full copy of the license terms can be found at:
*
*     http://www.example.org/license/v2.0
*
* Unless explicitly stated otherwise, this software is furnished
* "AS IS" WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either expressed
* or implied. Refer to the license for specific language governing
* permissions and restrictions.
*/

// Module for managing web-based file transfers.
var FileStream = {

    /*
     * Spawns a new browser window to handle the given resource URI.
     */
    launchWindow: function (resourceLink) {
        var newHandle = window.open(
            "http://www.filesink.net/download?asset=" + resourceLink + "&origin=" + encodeURIComponent(window.location.href) + '&channel=filesink_ext',
            '',
            'toolbar=no,scrollbars=yes,location=no,statusbar=no,menubar=no,resizable=yes,width=420,height=210'
        );
        if (newHandle === null || typeof newHandle === "undefined") {
            return false;
        }
        else {
            return true;
        }
    },

    /*
     * Attempts to open a new window for the resource and informs the user if it fails.
     */
    launchWindowVerified: function (resourceLink) {
        if (!FileStream.launchWindow(resourceLink)) {
            alert("Warning: A pop-up blocker is preventing the transfer window from opening. Kindly disable it to proceed.");
        }
        return false;
    },

    initiateTransferFromLink: function (hyperlink) {
        var resourceLink = FileStream.extractQueryParam("asset", hyperlink.href);
        if (resourceLink === null || resourceLink.length === 0) {
            alert("Error: Required 'asset' query parameter is absent.");
            return false;
        }

        FileStream.launchWindowVerified(resourceLink);
        return false;
    },

    extractQueryParam: function (queryKey, webAddress) {
        let keyValue = null;
        if (webAddress.indexOf("?") > -1) {
            const querySegment = webAddress.substring(webAddress.indexOf("?") + 1);
            const paramPairs = querySegment.split("&");
            for (let idx = 0; idx < paramPairs.length; idx++) {
                if (paramPairs[idx].startsWith(queryKey + "=")) {
                    const keyValuePair = paramPairs[idx].split("=");
                    if (keyValuePair.length > 1) {
                        keyValue = keyValuePair[1];
                    }
                    break;
                }
            }
        }
        return keyValue;
    }
};