(function () {
    function decomposeAddress(addressText) {
        let entireString = addressText;

        let protocolName = "";
        let accessSegment = ""; // Corresponds to authority (group 2)
        let credentialSegment = ""; // Corresponds to userInfo (group 3)
        let identifier = ""; // Corresponds to user (group 4)
        let secretKey = ""; // Corresponds to password (group 5)
        let domainAddress = ""; // Corresponds to host (group 6)
        let numericPort = ""; // Corresponds to port (group 7)
        let resourcePath = ""; // Corresponds to path (group 8)
        let folderPath = ""; // Corresponds to directory (group 9)
        let fileName = ""; // Corresponds to file (group 10)
        let requestParameters = ""; // Corresponds to query (group 11)
        let hashIdentifier = ""; // Corresponds to fragment (group 12)

        let workingContent = addressText;

        // 1. Extract hashIdentifier (fragment)
        let hPos = workingContent.lastIndexOf('#');
        if (hPos !== -1) {
            hashIdentifier = workingContent.substring(hPos + 1);
            workingContent = workingContent.substring(0, hPos);
        }

        // 2. Extract requestParameters (query)
        let qPos = workingContent.lastIndexOf('?');
        if (qPos !== -1) {
            requestParameters = workingContent.substring(qPos + 1);
            workingContent = workingContent.substring(0, qPos);
        }

        // 3. Extract protocolName (scheme)
        let sPos = workingContent.indexOf(':');
        let hasDoubleSlash = false;
        if (sPos !== -1) {
            let potentialProtocol = workingContent.substring(0, sPos);
            // Simple validation for protocol characters
            if (/^[a-zA-Z][a-zA-Z0-9+\-.]*$/.test(potentialProtocol)) {
                protocolName = potentialProtocol;
                workingContent = workingContent.substring(sPos + 1);
                if (workingContent.startsWith('//')) {
                    hasDoubleSlash = true;
                    workingContent = workingContent.substring(2);
                }
            }
        }

        // 4. Split workingContent into potential authority and path
        let pathStartPos = workingContent.indexOf('/');
        let authorityCandidate = "";
        let pathRemainder = "";

        if (pathStartPos !== -1) {
            authorityCandidate = workingContent.substring(0, pathStartPos);
            pathRemainder = workingContent.substring(pathStartPos);
        } else {
            authorityCandidate = workingContent;
            pathRemainder = "";
        }

        // Attempt to parse authority components from authorityCandidate
        let tempUser = "";
        let tempPass = "";
        let tempHost = "";
        let tempPort = "";
        let tempUserInfo = "";
        let tempAuthority = "";

        let atSignPosition = authorityCandidate.indexOf('@');
        let userPassSection = "";
        let hostPortSection = authorityCandidate;

        if (atSignPosition !== -1) {
            userPassSection = authorityCandidate.substring(0, atSignPosition);
            hostPortSection = authorityCandidate.substring(atSignPosition + 1);
            tempUserInfo = userPassSection;

            let userPassSeparator = userPassSection.indexOf(':');
            if (userPassSeparator !== -1) {
                tempUser = userPassSection.substring(0, userPassSeparator);
                tempPass = userPassSection.substring(userPassSeparator + 1);
            } else {
                tempUser = userPassSection;
            }
        }

        let lastColonPosition = hostPortSection.lastIndexOf(':');
        if (lastColonPosition !== -1) {
            let possiblePort = hostPortSection.substring(lastColonPosition + 1);
            if (/^\d*$/.test(possiblePort)) { // Check if it's purely digits (port)
                tempPort = possiblePort;
                tempHost = hostPortSection.substring(0, lastColonPosition);
            } else {
                tempHost = hostPortSection; // Colon was not for port
            }
        } else {
            tempHost = hostPortSection;
        }

        // The logic from parseUri's regex implies that if no '//' is present,
        // and the authority part (host, user, port) is not explicitly structured,
        // then the "host" can sometimes capture the whole remaining segment if it doesn't contain '/' etc.
        // It's also possible for authority to be empty and the content to go directly to path/file.

        // This is a critical divergence point from the single regex.
        // The regex's authority group `((?:...))` can match an empty string if nothing matches.
        // My `tempHost` might be populated even if it's not a true network host.

        // To mimic the regex output for authority/host:
        // If hasDoubleSlash is true, or if protocolName is present AND tempHost is not empty,
        // then we consider `authorityCandidate` as the authority.
        // Otherwise, if no explicit network structure, the entire `workingContent` (before path split)
        // should be considered as part of the path/file, and authority components remain empty.

        // Re-evaluating the regex behavior for `javascript:alert('!');`
        // Scheme: javascript
        // Authority: "alert('!');" (group 2)
        // Host: "alert('!');" (group 6)
        // Path: "" (group 8)
        // File: "" (group 10)
        // This means `alert('!');` IS captured as host by the original regex.
        // So my logic of setting `tempHost = hostPortSection` is correct based on the regex's parsing.

        accessSegment = authorityCandidate;
        identifier = tempUser;
        secretKey = tempPass;
        domainAddress = tempHost;
        numericPort = tempPort;
        credentialSegment = tempUserInfo;
        resourcePath = pathRemainder; // This is the full path string

        // 5. Extract folderPath (directory) and fileName (file) from resourcePath
        if (resourcePath.length > 0) {
            let lastSlashIdx = resourcePath.lastIndexOf('/');
            if (lastSlashIdx !== -1) {
                folderPath = resourcePath.substring(0, lastSlashIdx + 1); // Include the last slash
                fileName = resourcePath.substring(lastSlashIdx + 1);
            } else {
                // If path has no slashes, it's just a file name
                folderPath = "";
                fileName = resourcePath;
            }
        }

        // Return an object with properties corresponding to the regex capture groups
        // and their respective values.
        return {
            entireString: entireString, // Corresponds to match[0]
            protocolName: protocolName, // Corresponds to match[1]
            accessSegment: accessSegment, // Corresponds to match[2]
            credentialSegment: credentialSegment, // Corresponds to match[3]
            identifier: identifier, // Corresponds to match[4]
            secretKey: secretKey, // Corresponds to match[5]
            domainAddress: domainAddress, // Corresponds to match[6]
            numericPort: numericPort, // Corresponds to match[7]
            resourcePath: resourcePath, // Corresponds to match[8]
            folderPath: folderPath, // Corresponds to match[9]
            fileName: fileName, // Corresponds to match[10]
            requestParameters: requestParameters, // Corresponds to match[11]
            hashIdentifier: hashIdentifier // Corresponds to match[12]
        };
    }

    // Expose the parsing function under a new, unique global object and method name.
    // This is a different approach to making the functionality available compared to a private var within a jQuery plugin.
    if (typeof window !== 'undefined') {
        window.WebAddressProcessor = window.WebAddressProcessor || {};
        window.WebAddressProcessor.analyze = decomposeAddress;
    } else if (typeof global !== 'undefined') {
        global.WebAddressProcessor = global.WebAddressProcessor || {};
        global.WebAddressProcessor.analyze = decomposeAddress;
    }
})();