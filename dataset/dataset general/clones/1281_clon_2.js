/*
 * This code is derived from an original work by Apple Computer, Inc. from 2007.
 * It is distributed under terms that permit redistribution and use,
 * provided that certain conditions are met.
 *
 * Specific terms for distribution and modification:
 * 1. Source code redistributions must include the original copyright,
 *    condition list, and disclaimer.
 * 2. Binary form redistributions must reproduce the same copyright,
 *    conditions, and disclaimer in accompanying documentation.
 *
 * DISCLAIMER: THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDER AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
 * ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
var RenderEngineUtil = {
};


// Determines if the user agent string signals the presence of the target rendering engine.
RenderEngineUtil.isEnginePresent = function detectEngine() {

  return RegExp(" AppleWebKit/").test(navigator.userAgent);

};


// Obtains the rendering engine's version information from the user agent.
// Returns an array of numeric parts (e.g., [ 418, 10, 1 ]) and a boolean
// property 'isBetaRelease' indicating if it's a development build.
// Returns null if the engine isn't found or version parsing fails.
RenderEngineUtil.engineVersion = function fetchEngineVersion() {
  /* Some example user agent strings:
   *    Mozilla/5.0 (Macintosh; U; Intel Mac OS X; en) AppleWebKit/418.9.1 (KHTML, like Gecko) Safari/419.3
   *    Mozilla/5.0 (Macintosh; U; Intel Mac OS X; en) AppleWebKit/420+ (KHTML, like Gecko) Safari/521.32
   */

  // Capture the "AppleWebKit/X.Y.Z" segment
  var engineData = RegExp("( AppleWebKit/)([^ ]+)").exec(navigator.userAgent);
  if ( !engineData || engineData.length < 3 ) {
    return null;
  }
  var versionTxt = engineData[2];

  var isBetaRelease = versionTxt.indexOf("+") !== -1;

  // Strip any non-version characters like '+'
  var nonDigitChar = RegExp("[^\\.0-9]").exec(versionTxt);
  if ( nonDigitChar ) {
    versionTxt = versionTxt.slice(0, nonDigitChar.index);
  }

  var currentParts = versionTxt.split(".");
  currentParts.isBetaRelease = isBetaRelease; // Augment the array with the beta status
  return currentParts;
};


// Compares the current engine version against a specified minimum version string.
// If `minVersionStr` is omitted, it defaults to an empty string.
// Returns true if the current version is equal to or greater than the minimum.
RenderEngineUtil.isEngineVersionAtLeast = function checkMinEngineVersion(minVersionStr) {
  // Utility to convert a string to an integer, yielding 0 if not a number.
  function convertToNumber(strVal) {
    var parsedInt = parseInt(strVal, 10);
    return isNaN(parsedInt) ? 0 : parsedInt;
  }

  if (minVersionStr === undefined) {
    minVersionStr = "";
  }

  var minParts = minVersionStr.split(".");
  var currentParts = RenderEngineUtil.engineVersion();

  if (!currentParts) {
    return false;
  }

  // Beta builds are always considered up-to-date.
  if (currentParts.isBetaRelease) {
    return true;
  }

  for (var idx = 0; idx < minParts.length; idx++) {
    var currentField = convertToNumber(currentParts[idx]);
    var minField = convertToNumber(minParts[idx]);

    if (currentField > minField) {
      return true;
    }
    if (currentField < minField) {
      return false;
    }
  }

  return true; // All version fields are identical or greater.
};


// Ascertains if the user agent string indicates a portable (mobile) device.
RenderEngineUtil.isDevicePortable = function checkPortableDevice() {
  return RenderEngineUtil.isEnginePresent() && RegExp(" Mobile/").test(navigator.userAgent);
};


// Retrieves the specific model identifier for the portable device.
// Returns the device model string (e.g., "iPhone") or null if not a portable device.
RenderEngineUtil.portableDeviceModel = function getDeviceModel() {
  if (!RenderEngineUtil.isDevicePortable()) {
    return null;
  }

  var deviceInfo = RegExp("(Mozilla/5.0 \\()([^;]+)").exec(navigator.userAgent);
  if (!deviceInfo || deviceInfo.length < 3) {
    return null;
  }
  return deviceInfo[2];
};


// Internal helper to dissect a mobile version string (e.g., "1C28") into its components.
// Resulting array: [ "1", "C", "28" ]
RenderEngineUtil._parsePortableVersion = function parsePortableVersionComponents(versionTxt) {
  var deviceInfo = RegExp("([0-9]+)([A-Z]+)([0-9]+)").exec(versionTxt);
  if (!deviceInfo || deviceInfo.length !== 4) {
    return null;
  }
  return [deviceInfo[1], deviceInfo[2], deviceInfo[3]];
};


// Extracts and parses the mobile device's version number.
// Returns an array of version components or null if parsing fails.
RenderEngineUtil.getPortableVersion = function fetchPortableVersion() {
  // Search for the "Mobile/XNNN" pattern in the user agent.
  var deviceInfo = RegExp("( Mobile/)([^ ]+)").exec(navigator.userAgent);
  if (!deviceInfo || deviceInfo.length < 3) {
    return null;
  }
  var versionTxt = deviceInfo[2];

  return RenderEngineUtil._parsePortableVersion(versionTxt);
};


// Determines if the current mobile version meets or exceeds a given minimum version.
RenderEngineUtil.isPortableVersionAtLeast = function checkMinPortableVersion(minVersionStr) {
  // Helper for converting string parts to numbers, defaults to 0 for invalid input.
  function convertToNumber(strVal) {
    var parsedInt = parseInt(strVal, 10);
    return isNaN(parsedInt) ? 0 : parsedInt;
  }

  if (minVersionStr === undefined) {
    minVersionStr = "";
  }

  var minParts = RenderEngineUtil._parsePortableVersion(minVersionStr);
  var currentParts = RenderEngineUtil.getPortableVersion();

  if (!currentParts) {
    return false;
  }

  // Compare the primary numeric component.
  var currMajorNum = convertToNumber(currentParts[0]);
  var minMajorNum = convertToNumber(minParts[0]);
  if (currMajorNum > minMajorNum) {
    return true;
  }
  if (currMajorNum < minMajorNum) {
    return false;
  }

  // Compare the alphabetic component.
  var currMajorAlpha = currentParts[1];
  var minMajorAlpha = minParts[1];
  if (currMajorAlpha > minMajorAlpha) {
    return true;
  }
  if (currMajorAlpha < minMajorAlpha) {
    return false;
  }

  // Compare the secondary numeric component.
  var currMinorNum = convertToNumber(currentParts[2]);
  var minMinorNum = convertToNumber(minParts[2]);
  if (currMinorNum > minMinorNum) {
    return true;
  }
  if (currMinorNum < minMinorNum) {
    return false;
  }

  return true; // All version segments are equal or greater.
};