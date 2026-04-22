((globalContext) => {
    // Internal utility function to convert a string segment to an integer, defaulting to 0 if invalid.
    const numericValueOrDefault = (textSegment) => {
        const parsedValue = Number.parseInt(textSegment, 10);
        return Number.isNaN(parsedValue) ? 0 : parsedValue;
    };

    // Internal utility function to transform a dot-separated version string into an array of numbers.
    const transformVersionToArray = (versionString) => {
        if (!versionString) return [];
        return versionString.split('.').map(numericValueOrDefault);
    };

    // Internal utility function to compare two arrays of version numbers.
    // Returns 1 if actual is greater, -1 if actual is smaller, 0 if equal.
    const contrastVersionArrays = (actualComponents, requiredComponents) => {
        const maxLen = Math.max(actualComponents.length, requiredComponents.length);
        for (let i = 0; i < maxLen; i++) {
            const actualVal = actualComponents[i] || 0;
            const requiredVal = requiredComponents[i] || 0;
            if (actualVal > requiredVal) return 1;
            if (actualVal < requiredVal) return -1;
        }
        return 0;
    };

    // Internal utility function to parse a specific mobile version string format (e.g., "1C28")
    // into a structured object.
    const analyzePortableVersionSegment = (rawSequence) => {
        if (typeof rawSequence !== 'string') return null;
        const componentMatch = rawSequence.match(/^(\d+)([A-Z]+)(\d+)$/);
        if (!componentMatch) return null;
        return {
            leadingNumber: numericValueOrDefault(componentMatch[1]),
            middleAlpha: componentMatch[2],
            trailingNumber: numericValueOrDefault(componentMatch[3])
        };
    };

    // Internal utility function to compare two structured portable version objects.
    // Returns 1 if actual is greater, -1 if actual is smaller, 0 if equal.
    const contrastPortableVersionStructures = (actualStructure, requiredStructure) => {
        if (!actualStructure) return -1; // Actual is missing or invalid
        if (!requiredStructure) return 1; // Required is missing or invalid, so actual is "greater" (if actual exists)

        if (actualStructure.leadingNumber > requiredStructure.leadingNumber) return 1;
        if (actualStructure.leadingNumber < requiredStructure.leadingNumber) return -1;

        if (actualStructure.middleAlpha > requiredStructure.middleAlpha) return 1;
        if (actualStructure.middleAlpha < requiredStructure.middleAlpha) return -1;

        if (actualStructure.trailingNumber > requiredStructure.trailingNumber) return 1;
        if (actualStructure.trailingNumber < requiredStructure.trailingNumber) return -1;

        return 0;
    };

    const platformObserver = {
        // Checks if the current user agent indicates the presence of a specific engine type.
        checkEnginePresence: () => {
            return globalContext.navigator.userAgent.includes(" AppleWebKit/");
        },

        // Retrieves and parses the engine's version information from the user agent.
        obtainEngineVersion: () => {
            const engineSpecifier = globalContext.navigator.userAgent.match(/ AppleWebKit\/([^ ]+)/);
            if (!engineSpecifier || engineSpecifier.length < 2) {
                return null;
            }
            let versionText = engineSpecifier[1];

            const isDevelopmentRelease = versionText.includes("+");

            // Sanitize the version string, removing extraneous characters.
            versionText = versionText.replace(/[^.0-9]/g, '');
            
            const versionSegments = versionText.split('.').map(numericValueOrDefault);
            
            return {
                parts: versionSegments,
                isDevelopment: isDevelopmentRelease
            };
        },

        // Determines if the detected engine version meets or exceeds a specified minimum version.
        checkMinimumEngineVersion: (minVersionString = "") => {
            const currentEngineDetails = platformObserver.obtainEngineVersion();
            if (!currentEngineDetails) {
                return false;
            }

            if (currentEngineDetails.isDevelopment) {
                return true; // Development builds are always considered "at least" the minimum.
            }

            const actualNumericParts = currentEngineDetails.parts;
            const requiredNumericParts = transformVersionToArray(minVersionString);

            return contrastVersionArrays(actualNumericParts, requiredNumericParts) >= 0;
        },

        // Checks if the user agent indicates a handheld device.
        isHandheldDevice: () => {
            return platformObserver.checkEnginePresence() && globalContext.navigator.userAgent.includes(" Mobile/");
        },

        // Extracts the specific model identifier for a handheld device from the user agent.
        getHandheldModel: () => {
            if (!platformObserver.isHandheldDevice()) {
                return null;
            }
            const devicePatternMatch = globalContext.navigator.userAgent.match(/(Mozilla\/5\.0 \()([^;]+)/);
            if (!devicePatternMatch || devicePatternMatch.length < 3) {
                return null;
            }
            return devicePatternMatch[2];
        },

        // Retrieves the parsed version information for a handheld device.
        getHandheldVersion: () => {
            const portableInfoMatch = globalContext.navigator.userAgent.match(/( Mobile\/)([^ ]+)/);
            if (!portableInfoMatch || portableInfoMatch.length < 3) {
                return null;
            }
            return analyzePortableVersionSegment(portableInfoMatch[2]);
        },
        
        // Determines if the detected handheld device version meets or exceeds a specified minimum version.
        checkMinimumHandheldVersion: (minVersionString = "") => {
            const currentPortableDetails = platformObserver.getHandheldVersion();
            const requiredPortableDetails = analyzePortableVersionSegment(minVersionString);

            if (!currentPortableDetails) {
                return false; // No current portable version detected.
            }
            
            // If minVersionString is empty, it means no minimum is specified, so current version always meets.
            if (!requiredPortableDetails && minVersionString === "") {
                return true;
            }
            // If minVersionString was provided but couldn't be parsed, it's not met.
            if (!requiredPortableDetails && minVersionString !== "") {
                return false;
            }

            return contrastPortableVersionStructures(currentPortableDetails, requiredPortableDetails) >= 0;
        }
    };

    globalContext.PlatformObserver = platformObserver;

})(typeof window !== 'undefined' ? window : this);