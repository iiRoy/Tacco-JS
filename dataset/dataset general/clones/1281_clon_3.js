/*
 * Copyright (C) 2023 Acme Corp. All rights reserved.
 *
 * This software is provided for educational purposes and internal use only.
 * Unauthorized distribution, modification, or commercial use is strictly prohibited.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

// Define a global object to house browser agent identification utilities.
// This utility helps in parsing and comparing browser engine versions.
const BrowserAgentDetector = {};

// Internal constant for accessing the user agent string, ensuring it's never null.
const userAgentString = navigator.userAgent || "";

/**
 * Checks if the current browser's rendering engine is WebKit.
 * This function performs a simple pattern match against the user agent.
 * @returns {boolean} True if the WebKit signature is found, false otherwise.
 */
BrowserAgentDetector.isWebkitEngine = function checkIfWebkitEngine() {
    // We are looking for " AppleWebKit/" followed by some version number, which is characteristic of WebKit.
    const webkitPattern = / AppleWebKit\//;
    return webkitPattern.test(userAgentString);
};

/**
 * Extracts and parses the WebKit engine version from the user agent string.
 * This method also indicates if the detected version is a development (nightly) build.
 * @returns {Array<string> & { isDevBuild: boolean } | null} An array of version components
 *          (as strings, e.g., ["418", "10", "1"]) with an `isDevBuild` flag, or null if WebKit is not detected
 *          or its version string cannot be parsed.
 *
 * Example: "418.10.1" -> ["418", "10", "1"], isDevBuild: false
 * Example: "420+"     -> ["420"], isDevBuild: true
 */
BrowserAgentDetector.getEngineVersionDetails = function getEngineVersionDetails() {
    // Regular expression to find " AppleWebKit/X.Y.Z".
    // It captures the version string itself (e.g., "418.9.1" or "420+").
    const versionRegex = /(?: AppleWebKit\/)([^ ]+)/;
    const matchedParts = userAgentString.match(versionRegex);

    // If no match or the version string is missing (less than 2 captured groups), return early.
    if (!matchedParts || matchedParts.length < 2) {
        return null;
    }

    let rawVersionSegment = matchedParts[1];
    // Determine if it's a development build by checking for a '+' character.
    const isDevBuild = rawVersionSegment.includes("+");

    // Clean up the version string by removing any trailing non-numeric or non-dot characters.
    const nonNumericOrDotChar = /[^.0-9]/;
    const invalidCharMatch = rawVersionSegment.match(nonNumericOrDotChar);
    if (invalidCharMatch) {
        rawVersionSegment = rawVersionSegment.substring(0, invalidCharMatch.index);
    }

    // Split the cleaned string into components. These components remain strings for flexible comparison.
    const versionComponents = rawVersionSegment.split(".");
    // Attach the development build flag directly to the array object for convenience.
    versionComponents.isDevBuild = isDevBuild;

    return versionComponents;
};

/**
 * Helper function to safely convert a string to an integer, defaulting to zero if conversion fails.
 * This prevents `NaN` issues during numeric comparisons.
 * @param {string} inputStr - The string to attempt converting to a number.
 * @returns {number} The parsed integer or 0 if `inputStr` is not a valid number or is empty.
 */
function safeParseInt(inputStr) {
    // Using `Number.parseInt` with radix 10 for explicit base.
    const numericValue = Number.parseInt(inputStr, 10);
    // Check if the result is NaN and return 0 in that case, otherwise return the parsed value.
    return Number.isNaN(numericValue) ? 0 : numericValue;
}

/**
 * Compares the detected WebKit engine version against a specified minimum version string.
 * This comparison is performed component by component (major.minor.patch).
 * @param {string} [thresholdVersionStr=""] - The minimum version string to check against (e.g., "418.10.1").
 *                                           An empty string implies that any version is considered sufficient.
 * @returns {boolean} True if the current engine version meets or exceeds the threshold, false otherwise.
 */
BrowserAgentDetector.hasMinimumEngineVersion = function hasMinimumEngineVersion(thresholdVersionStr = "") {
    // Retrieve the current browser's engine version details.
    const currentVersionInfo = BrowserAgentDetector.getEngineVersionDetails();

    // If no version info is available (e.g., not a WebKit browser), it cannot meet any requirement.
    if (!currentVersionInfo) {
        return false;
    }

    // If the detected version is a development build, we generally assume it's "ahead" of any stable release.
    if (currentVersionInfo.isDevBuild) {
        return true;
    }

    // Split the threshold string into its numeric parts for comparison.
    const requiredVersionParts = thresholdVersionStr.split(".");

    // Iterate through version components for comparison, from major to minor.
    for (let componentIndex = 0; componentIndex < requiredVersionParts.length; componentIndex++) {
        // Safely parse the corresponding components from both the current and required versions.
        const currentComponentValue = safeParseInt(currentVersionInfo[componentIndex]);
        const requiredComponentValue = safeParseInt(requiredVersionParts[componentIndex]);

        // If the current component is numerically greater, the version is sufficient.
        if (currentComponentValue > requiredComponentValue) {
            return true;
        }
        // If the current component is numerically smaller, the version is not sufficient.
        if (currentComponentValue < requiredComponentValue) {
            return false;
        }
        // If components are equal, continue to the next (more minor) component for further comparison.
    }

    // If all compared components are equal (or the required version had fewer components and all matched),
    // the version meets the minimum requirement.
    return true;
};

/**
 * Determines if the user agent string indicates a mobile device running a WebKit engine.
 * This involves a two-step check.
 * @returns {boolean} True if it's identified as a mobile WebKit device, false otherwise.
 */
BrowserAgentDetector.isMobileAgent = function checkMobileAgent() {
    // First, confirm that the browser engine is indeed WebKit.
    if (!BrowserAgentDetector.isWebkitEngine()) {
        return false;
    }
    // Then, look for the " Mobile/" string, which is typically found in mobile WebKit user agents.
    const mobilePattern = / Mobile\//;
    return mobilePattern.test(userAgentString);
};

/**
 * Retrieves the specific device identifier string for mobile WebKit agents.
 * This extracts the part of the user agent that usually specifies the device model.
 * @returns {string | null} The device identifier (e.g., "iPhone", "iPad") or null if not a mobile agent
 *          or if the device string cannot be extracted.
 */
BrowserAgentDetector.getMobileDeviceIdentifier = function retrieveMobileDeviceIdentifier() {
    // Only proceed if the user agent is already identified as a mobile WebKit agent.
    if (!BrowserAgentDetector.isMobileAgent()) {
        return null;
    }

    // Regular expression to capture the device part from the user agent string (e.g., "Mozilla/5.0 (iPhone; ...").
    const deviceRegex = /(?:Mozilla\/5\.0 \()([^;]+)/;
    const deviceMatch = userAgentString.match(deviceRegex);

    // Ensure a valid match was found and the captured group exists.
    if (!deviceMatch || deviceMatch.length < 2) {
        return null;
    }

    // The device identifier string is typically the first captured group after the initial pattern.
    return deviceMatch[1];
};

/**
 * Internal utility function to parse a mobile version string (e.g., "1C28") into its distinct components.
 * This specific format is often used for certain mobile OS versions.
 * @param {string} inputMobileVersion - The raw mobile version string to parse.
 * @returns {Array<string> | null} An array containing [majorNum, majorAlpha, minorNum] (e.g., ["1", "C", "28"])
 *          or null if the input string is invalid or does not match the expected format.
 */
function _parseMobileVersionComponents(inputMobileVersion) {
    // Guard clause: Ensure the input is a non-empty string.
    if (typeof inputMobileVersion !== 'string' || inputMobileVersion.trim() === '') {
        return null;
    }
    // Regex to break down a string like "1C28" into three capturing groups: "1", "C", "28".
    const mobileVersionPattern = /^(\d+)([A-Z]+)(\d+)$/;
    const versionPartMatches = inputMobileVersion.match(mobileVersionPattern);

    // We expect exactly 4 parts: the full match, and three captured groups.
    if (!versionPartMatches || versionPartMatches.length !== 4) {
        return null;
    }

    // Return the captured groups as an array of strings.
    return [versionPartMatches[1], versionPartMatches[2], versionPartMatches[3]];
}
// Expose the internal helper for potential external use or testing, but with a different name
// to indicate it's primarily an internal utility.
BrowserAgentDetector._internalMobileVersionParser = _parseMobileVersionComponents;


/**
 * Retrieves the parsed components of the mobile WebKit version from the user agent string.
 * This uses an internal helper to break down the version into its numeric and alphabetic parts.
 * @returns {Array<string> | null} An array like [majorNum, majorAlpha, minorNum] or null if the
 *          mobile version cannot be extracted or parsed.
 */
BrowserAgentDetector.getParsedMobileVersion = function getParsedMobileVersion() {
    // Look for the " Mobile/XNXX" pattern in the user agent string.
    const mobileVersionRegex = /(?: Mobile\/)([^ ]+)/;
    const mobileVersionMatch = userAgentString.match(mobileVersionRegex);

    // If no match is found or the version string is not captured.
    if (!mobileVersionMatch || mobileVersionMatch.length < 2) {
        return null;
    }

    const rawMobileVersionStr = mobileVersionMatch[1];
    // Use the internal helper to parse the raw string into structured components.
    return _parseMobileVersionComponents(rawMobileVersionStr);
};

/**
 * Checks if the current mobile WebKit version is at least a specified minimum threshold.
 * This comparison handles the specific "XNXX" format of mobile versions (e.g., "1C28").
 * @param {string} [minimumMobileVersion=""] - The minimum version string to compare against (e.g., "1C28").
 *                                           An empty string implies any version is sufficient.
 * @returns {boolean} True if the current mobile version meets or exceeds the minimum, false otherwise.
 */
BrowserAgentDetector.isMobileVersionAtLeastThreshold = function isMobileVersionAtLeastThreshold(minimumMobileVersion = "") {
    // Parse the current and required mobile version strings into their respective components.
    const detectedVersionComponents = BrowserAgentDetector.getParsedMobileVersion();
    const requiredVersionComponents = _parseMobileVersionComponents(minimumMobileVersion);

    // Early exit: If the current version cannot be parsed, it cannot meet any requirement.
    if (!detectedVersionComponents) {
        return false;
    }

    // Handle cases where `minimumMobileVersion` is empty or cannot be parsed.
    if (!requiredVersionComponents) {
        // If `minimumMobileVersion` was empty, it means no specific minimum is required, so it's a success.
        if (minimumMobileVersion === "") {
            return true;
        }
        // If `minimumMobileVersion` was provided but couldn't be parsed, the comparison is invalid.
        return false;
    }

    // --- Component-by-component comparison logic ---

    // 1. Compare the major numeric component.
    const currentMajorNum = safeParseInt(detectedVersionComponents[0]);
    const requiredMajorNum = safeParseInt(requiredVersionComponents[0]);
    if (currentMajorNum > requiredMajorNum) {
        return true;
    }
    if (currentMajorNum < requiredMajorNum) {
        return false;
    }

    // 2. Compare the major alphabetic component (lexicographically).
    const currentMajorAlpha = detectedVersionComponents[1];
    const requiredMajorAlpha = requiredVersionComponents[1];
    if (currentMajorAlpha > requiredMajorAlpha) {
        return true;
    }
    if (currentMajorAlpha < requiredMajorAlpha) {
        return false;
    }

    // 3. Compare the minor numeric component.
    const currentMinorNum = safeParseInt(detectedVersionComponents[2]);
    const requiredMinorNum = safeParseInt(requiredVersionComponents[2]);
    if (currentMinorNum > requiredMinorNum) {
        return true;
    }
    if (currentMinorNum < requiredMinorNum) {
        return false;
    }

    // If all components are equal after sequential comparison, the version meets the threshold.
    return true;
};