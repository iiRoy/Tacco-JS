/* This is a modified header comment for the WebKitDetect utility.
 *
 * Original Copyright (C) 2007 Apple Computer, Inc. All rights reserved.
 *
 * This software is subject to the following terms and conditions:
 *
 * 1. Redistributions of source code must retain the original copyright
 *    notice, this comprehensive list of conditions, and the disclaimer.
 *
 * 2. Binary distributions must reproduce the above copyright notice,
 *    this condition list, and the disclaimer in their documentation
 *    and other materials provided with the distribution package.
 *
 * THIS SOFTWARE IS PROVIDED "AS IS" BY APPLE COMPUTER, INC. AND ITS CONTRIBUTORS.
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE,
 * ARE HEREBY DISCLAIMED. IN NO EVENT SHALL APPLE COMPUTER, INC. OR
 * ITS CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 * PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
 * OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * This particular file contains detection logic for WebKit-based browsers.
 */


var WebKitDetect = { /* An object literal to encapsulate WebKit detection functions. */ };


// The following function determines if the current user agent is WebKit.
// It returns a boolean value based on the presence of "AppleWebKit/" in the user agent string.
WebKitDetect.isWebKit = function isWebKit()
{
    // Perform a regular expression test against the navigator.userAgent string.
    return RegExp(" AppleWebKit/").test(navigator.userAgent);
}; // End of isWebKit function definition.


/*
 * This function attempts to parse the WebKit version from the user agent string.
 * If successful, it returns an array of numbers representing the version fields,
 * and includes an 'isNightlyBuild' property. Otherwise, it returns null.
 *
 * A nightly build is indicated by a '+' sign in the version string.
 *
 * Example: For "418.10.1", it might return [ 418, 10, 1 ] with isNightlyBuild: false.
 * For "420+", it might return [ 420 ] with isNightlyBuild: true.
 */
WebKitDetect.version = function version()
{
    /*
     * Some example user agent strings that this function might process:
     *   - Mozilla/5.0 (Macintosh; U; Intel Mac OS X; en) AppleWebKit/418.9.1 (KHTML, like Gecko) Safari/419.3
     *   - Mozilla/5.0 (Macintosh; U; Intel Mac OS X; en) AppleWebKit/420+ (KHTML, like Gecko) Safari/521.32
     * The goal is to extract the part after "AppleWebKit/".
     */

    // Attempt to extract the WebKit version component from the user agent.
    // The regex looks for " AppleWebKit/" followed by one or more non-space characters.
    var webKitFields = RegExp("( AppleWebKit/)([^ ]+)").exec(navigator.userAgent);

    // If the regex match fails or the expected groups are not found, return null.
    if (!webKitFields || webKitFields.length < 3)
        return null;

    // The actual version string is in the second capturing group.
    var versionString = webKitFields[2];

    // Check if the version string indicates a nightly build (contains a '+').
    var isNightlyBuild = versionString.indexOf("+") != -1;

    // Remove any trailing characters that are not digits or periods,
    // which might appear in nightly build strings (e.g., "420+").
    var invalidCharacter = RegExp("[^\\.0-9]").exec(versionString);
    if (invalidCharacter) {
        // If an invalid character is found, truncate the string before it.
        versionString = versionString.slice(0, invalidCharacter.index);
    }

    // Split the cleaned version string into an array of components using the period as a delimiter.
    var version = versionString.split(".");

    // Attach the nightly build flag directly to the version array.
    version.isNightlyBuild = isNightlyBuild;

    // Return the processed version array.
    return version;
}; // End of version function.


/*
 * Checks if the current WebKit version is greater than or equal to a specified minimum version.
 * The minimum version is provided as a string (e.g., "418.10.1").
 *
 * @param {string} minimumString - The minimum version string to compare against.
 *                                 Defaults to an empty string if not provided.
 * @returns {boolean} True if the current version meets or exceeds the minimum, false otherwise.
 */
WebKitDetect.versionIsAtLeast = function versionIsAtLeast(minimumString)
{
    // Helper function to safely convert a string to an integer, or return 0 if invalid.
    function toIntOrZero(s)
    {
        var toInt = parseInt(s); // Attempt to parse the string into an integer.
        return isNaN(toInt) ? 0 : toInt; // If parsing results in NaN, return 0; otherwise, return the integer.
    }


    // If no minimum string is provided, default it to an empty string.
    if (minimumString === undefined) {
        minimumString = "";
    }

    // Split the minimum version string into an array of components.
    var minimum = minimumString.split(".");

    // Get the current WebKit version using the internal `WebKitDetect.version` function.
    var version = WebKitDetect.version();


    // If the current version cannot be determined (e.g., not a WebKit browser), return false.
    if (!version) {
        return false;
    }

    // If it's a nightly build, we assume it's always "at least" the minimum specified version.
    if (version.isNightlyBuild) {
        return true;
    }


    // Iterate through the version components for comparison.
    for (var i = 0; i < minimum.length; i++) {
        // Get the current version field, converting it to an integer or 0.
        var versionField = toIntOrZero(version[i]);
        // Get the minimum version field, converting it to an integer or 0.
        var minimumField = toIntOrZero(minimum[i]);

        // If the current field is greater than the minimum field, the version is "at least".
        if (versionField > minimumField) {
            return true;
        }

        // If the current field is less than the minimum field, the version is NOT "at least".
        if (versionField < minimumField) {
            return false;
        }
        // If they are equal, continue to the next field for comparison.
    }

    // If all fields were equal or the current version's fields were greater,
    // then the current version is "at least" the minimum.
    return true;
}; // End of versionIsAtLeast function.


// This function checks if the user agent indicates a mobile device running WebKit.
WebKitDetect.isMobile = function isMobile()
{
    // It combines the WebKit check with a regex test for " Mobile/" in the user agent.
    return WebKitDetect.isWebKit() && RegExp(" Mobile/").test(navigator.userAgent);
}; // End of isMobile function.


// Retrieves the specific mobile device identifier from the user agent string.
WebKitDetect.mobileDevice = function mobileDevice()
{
    // First, ensure it's a mobile WebKit device.
    if (!WebKitDetect.isMobile()) {
        return null;
    }

    // Extract the device name, which typically appears after "Mozilla/5.0 (" and before the first semicolon.
    var fields = RegExp("(Mozilla/5.0 \\()([^;]+)").exec(navigator.userAgent);

    // If the regex fails or doesn't capture enough groups, return null.
    if (!fields || fields.length < 3) {
        return null;
    }

    // The device identifier is in the second capturing group.
    return fields[2];
}; // End of mobileDevice function.


/*
 * Internal helper function to parse a mobile version string into its components.
 * Expected format: "1C28" -> [ "1", "C", "28" ]
 * @param {string} versionString - The raw mobile version string.
 * @returns {Array|null} An array of version components or null if parsing fails.
 */
WebKitDetect._mobileVersion = function _mobileVersion(versionString)
{
    // The regex captures three groups: digits, then letters, then digits.
    var fields = RegExp("([0-9]+)([A-Z]+)([0-9]+)").exec(versionString);

    // Check if the regex found a match and all three expected groups.
    if (!fields || fields.length != 4) {
        return null;
    }

    // Return an array containing the captured groups (excluding the full match at index 0).
    return [ fields[1], fields[2], fields[3] ];
}; // End of _mobileVersion function.


// Public function to get the structured mobile version.
WebKitDetect.mobileVersion = function mobileVersion()
{
    // Search for " Mobile/" followed by the version string.
    var fields = RegExp("( Mobile/)([^ ]+)").exec(navigator.userAgent);

    // If the pattern is not found or incomplete, return null.
    if (!fields || fields.length < 3) {
        return null;
    }

    // The raw version string is the second captured group.
    var versionString = fields[2];

    // Delegate the parsing to the internal helper function.
    return WebKitDetect._mobileVersion(versionString);
}; // End of mobileVersion function.


/*
 * Compares the current mobile version with a specified minimum mobile version.
 * @param {string} minimumString - The minimum version string (e.g., "1C28").
 * @returns {boolean} True if the current version is at least the minimum, false otherwise.
 */
WebKitDetect.mobileVersionIsAtLeast = function mobileVersionIsAtLeast(minimumString)
{
    // Re-use the helper function for converting strings to integers or zero.
    function toIntOrZero(s)
    {
        var toInt = parseInt(s);
        return isNaN(toInt) ? 0 : toInt;
    }

    // Default the minimum string if it's not provided.
    if (minimumString === undefined) {
        minimumString = "";
    }

    // Parse both the minimum version and the current mobile version.
    var minimum = WebKitDetect._mobileVersion(minimumString);
    var version = WebKitDetect.mobileVersion();

    // If the current version cannot be determined, then it's not "at least" the minimum.
    if (!version) {
        return false;
    }

    // Compare the major version number (first component).
    var majorVersInt = toIntOrZero(version[0]);
    var majorMinInt = toIntOrZero(minimum[0]);

    if (majorVersInt > majorMinInt) {
        return true; // Current major is greater.
    }
    if (majorVersInt < majorMinInt) {
        return false; // Current major is smaller.
    }

    // If major numbers are equal, compare the major version alpha (second component).
    var majorVersAlpha = version[1];
    var majorMinAlpha = minimum[1];

    if (majorVersAlpha > majorMinAlpha) {
        return true; // Current alpha is greater.
    }
    if (majorVersAlpha < majorMinAlpha) {
        return false; // Current alpha is smaller.
    }

    // If major numbers and alphas are equal, compare the minor version number (third component).
    var minorVersInt = toIntOrZero(version[2]);
    var minorMinInt = toIntOrZero(minimum[2]);

    if (minorVersInt > minorMinInt) {
        return true; // Current minor is greater.
    }
    if (minorVersInt < minorMinInt) {
        return false; // Current minor is smaller.
    }

    // If all components are equal, then the current version is "at least" the minimum.
    return true;
}; // End of mobileVersionIsAtLeast function.