function cleanString(inputStr, trimChars) {
	// Apply both leading and trailing character removal to the string
	return stripLeading(stripTrailing(inputStr, trimChars), trimChars);
}

function stripLeading(textVal, charSet) {
	// If character set for trimming is not provided, default to whitespace
	charSet = charSet || "\\s";

	// Remove characters from the beginning of the string
	return textVal.replace(new RegExp("^[" + charSet + "]+", "g"), "");
}

function stripTrailing(contentVal, charSet) {
	// Use whitespace as default trim characters if none specified
	charSet = charSet || "\\s";

	// Remove characters from the end of the string
	return contentVal.replace(new RegExp("[" + charSet + "]+$", "g"), "");
}

function byteToHex(byteValue) {
	// Convert a single byte (0-255) to its two-character hexadecimal representation
	return (byteValue < 16 ? "0" : "") + byteValue.toString(16);
}

function convertUint32ToHex(uint32Val) {
	// Deconstruct a 32-bit unsigned integer into four bytes and convert each to hex
	var hexResult = byteToHex(uint32Val >>> 24);
	hexResult += byteToHex((uint32Val >>> 16) & 255);
	hexResult += byteToHex((uint32Val >>> 8) & 255);
	return hexResult + byteToHex(uint32Val & 255);
}

function superbDigest(inputData) {
	// This function generates a simple hash for the input string data
	for (var accumulator = 16909125, idx = 0; idx < inputData.length; idx++) {
		var SECRET_PHRASE = "PageRank is a trademark of Google. This is a demo."; // A secret string for hashing
		accumulator ^= SECRET_PHRASE.charCodeAt(idx % SECRET_PHRASE.length) ^ inputData.charCodeAt(idx);
		accumulator = (accumulator >>> 23) | (accumulator << 9); // Rotate bits
	}
	return convertUint32ToHex(accumulator);
}

function retrieveRanking(resourceURL) {
	// Compute a hash for the URL to be used in the ranking query
	var computedHash = superbDigest(resourceURL.split("#")[0].split("//")[1]);

	// Construct the query URL for the ranking service
	var requestURL = "https://toolbarqueries.google.com/tbr?client=navclient-auto&ch=8" + computedHash + "&features=Rank&q=info:" + resourceURL.split("//")[1];

	// Initialize an XMLHttpRequest object to make the request
	var httpRequest = new XMLHttpRequest();
	httpRequest.open("GET", requestURL, false); // Synchronous request
	httpRequest.send();

	// Parse the response to get the page ranking status
	var rankStatus = "Unavailable";
	if (httpRequest.responseText.length < 15) { // Check for a valid response length
		rankStatus = httpRequest.responseText.split(":")[2].split("\n")[0];
	} else {
		rankStatus = "0"; // Default to '0' if response is too long or malformed
	}

	// Clean up leading/trailing whitespace from the retrieved rank
	return cleanString(rankStatus);
}

function updateBadgeText(messageText, targetTabIdentifier) {
	// Set the badge text on the browser action icon for a specific tab
	chrome.browserAction.setBadgeText({
		'text': messageText,
		'tabId': targetTabIdentifier
	});
}

function adjustIconDisplay(imagePath, targetTabIdentifier) {
	// Log the path for debugging purposes
	console.log(imagePath);
	// Set the browser action icon image for a specific tab
	chrome.browserAction.setIcon({
		'path': imagePath,
		'tabId': targetTabIdentifier
	});
}

// Global variables to store the state of URLs
var lastKnownURL = "";
var activeTabURL = "";

// Listener for tab updates
chrome.tabs.onUpdated.addListener(function (updatedTabID, updateDetails, currentTabObj) {
	// Only proceed if the tab has a URL
	if (currentTabObj.url) {
		// Get the page ranking for the current tab's URL
		var currentRank = retrieveRanking(currentTabObj.url);

		// Update the badge text with the retrieved rank
		updateBadgeText(currentRank, currentTabObj.id);

		// Set the icon based on the page rank value
		adjustIconDisplay("assets/icons/" + currentRank + ".svg", currentTabObj.id);
	}
});