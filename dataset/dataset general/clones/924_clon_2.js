// ==USERSCRIPT==
// @name        MusicSource: Import from AppleMedia
// @description Grab album details from Apple Music
// @version     2023.10.27
// @author      CodeCrafter
// @namespace   https://github.com/my-awesome-scripts/
//
// @include     *://music.apple.com/*
//
// ==/USERSCRIPT==
//****************************************************************************//

// Create a new HTML form element for data submission
var submissionForm = document.createElement("form");
submissionForm.method = "post"; // Set the HTTP method to POST
submissionForm.target = "blank"; // Open submission in a new tab
submissionForm.action = document.location.protocol + "//musicbrainz.org/release/add"; // Target URL for submission
submissionForm.acceptCharset = "UTF-8"; // Specify character encoding

// Insert styling for the custom submission button
var styleElement = document.createElement("style");
styleElement.type = "text/css"; // Define the style type
if (document.getElementsByClassName('view-more').length) {
	styleElement.innerHTML = ".customButton {border: 1px solid #CCC; cursor: pointer; border-radius: 4px; padding: 10px 15px; margin-top: 25px; margin-right: -150px; background: #F0F0F0;} .customButton:hover {background: #E0E0E0}";
} else {
	styleElement.innerHTML = ".customButton {border: 1px solid #CCC; cursor: pointer; border-radius: 4px; padding: 10px 15px; background: #F0F0F0;} .customButton:hover {background: #E0E0E0}";
}
document.body.appendChild(styleElement); // Add the style to the document head

// Create the actual submit button input
var submitButton = document.createElement("input");
submitButton.type = "submit"; // It's a submit button
submitButton.value = "Send to MusicBrainz"; // Display text on the button
submitButton.classList.add("customButton"); // Apply the custom styling
submissionForm.appendChild(submitButton); // Attach the button to the form

// Add styling for the artwork download links
var artworkStyle = document.createElement("style");
artworkStyle.type = "text/css";
artworkStyle.innerHTML = ".artworkLinkContainer {margin-top: 10px;}";
document.body.appendChild(artworkStyle);

// Locate elements to insert artwork links
var sidePanel = document.getElementById('left-stack'); // Find the left content panel
var coverImage = sidePanel.getElementsByTagName('img')[0]; // Get the first image (should be album art)
var imageSource = coverImage.getAttribute('src-swap-high-dpi'); // Extract the high-DPI image source
var itunesLink = sidePanel.getElementsByClassName('view-in-itunes')[0]; // Find the "View in iTunes" button

// Construct a paragraph with links to different artwork sizes
var imageLinksParagraph = document.createElement("p");
imageLinksParagraph.innerHTML = "Cover Art: <a href=" + imageSource.replace(/340x340/g, "600x600") + ">600px</a>" +
	", <a href=" + imageSource.replace(/340x340/g, "1200x1200") + ">1200px</a>";
imageLinksParagraph.classList.add("artworkLinkContainer"); // Apply styling to the paragraph

// Insert the artwork links before the "View in iTunes" button
itunesLink.parentNode.insertBefore(imageLinksParagraph, itunesLink);

// Initialize a container division for the form
var containerDiv = document.createElement("div");
containerDiv.classList.add("right"); // Assign a class for positioning

// Declare and initialize variables for release metadata
var recordingArtist = '', releaseTitle = '', recordLabel = '', releaseYear = 0, releaseMonth = 0, releaseDay = 0, regionCode = 'XW', releaseType = 'album', discCount = 0;

// Parse the current URL to extract album ID and country code
if (matchResult = /^https?:\/\/itunes.apple.com\/(?:([a-z]{2})\/)?album\/(?:[^\/]+\/)?id([0-9]+)/.exec(document.location.href)) {
	regionCode = matchResult[1]; // Extract the country code

	// Construct the API endpoint URL for lookup
	var apiEndpoint = document.location.protocol + "//itunes.apple.com/lookup?id=" + matchResult[2] + "&entity=song&limit=200";
	if (matchResult[1]) apiEndpoint = apiEndpoint + "&country=" + matchResult[1]; // Add country if present

	// Make an asynchronous HTTP request to the iTunes API
	var httpRequest = new XMLHttpRequest();
	httpRequest.open('GET', apiEndpoint, true); // Configure GET request
	httpRequest.onreadystatechange = function () { processApiResponse(httpRequest); }; // Set callback handler
	httpRequest.send(null); // Send the request
}

/**
 * Handles the response from the iTunes API.
 * @param {XMLHttpRequest} requestObject The XMLHttpRequest object.
 */
function processApiResponse(requestObject) {
	if (httpRequest.readyState !== 4) // Check if the request is complete
		return;

	var apiData = eval('(' + httpRequest.responseText + ')'); // Parse JSON response string into an object

	// Iterate through the results to extract relevant information
	for (var idx = 0; idx < apiData.results.length; idx++) {
		if (apiData.results[idx].wrapperType === "collection") { // This entry represents the album/collection
			recordingArtist = apiData.results[idx].artistName; // Get the artist name
			releaseTitle = apiData.results[idx].collectionName; // Get the album title

			// Check for single/EP in the title
			if (matchResult = /(.*?) - (Single|EP)/.exec(apiData.results[idx].collectionName)) {
				releaseTitle = matchResult[1];
				releaseType = matchResult[2];
			}

			// Parse the release date
			if (matchResult = /^([0-9]{4})-([0-9]{2})-([0-9]{2})/.exec(apiData.results[idx].releaseDate)) {
				releaseYear = matchResult[1];
				releaseMonth = matchResult[2];
				releaseDay = matchResult[3];
			}

			recordLabel = apiData.results[idx].copyright; // Get copyright info
			// Clean up copyright string
			if (matchResult = /(?:[0-9]{4} )?(.*)/.exec(apiData.results[idx].copyright)) {
				recordLabel = matchResult[1];
			}

		} else if (apiData.results[idx].wrapperType === "track") { // This entry represents a track
			var currentDiscNum = apiData.results[idx].discNumber - 1; // 0-indexed disc number
			var currentTrackNum = apiData.results[idx].trackNumber - 1; // 0-indexed track number
			discCount = apiData.results[idx].discCount; // Total number of discs for the release

			var trackTitle = apiData.results[idx].trackName; // Get the track title
			// Adjust track title if censored version provides more context
			if (apiData.results[idx].trackCensoredName && trackTitle !== apiData.results[idx].trackCensoredName) {
				var partOne = apiData.results[idx].trackCensoredName.substr(0, trackTitle.length);
				var partTwo = apiData.results[idx].trackCensoredName.substr(trackTitle.length);
				if (trackTitle === partOne && partTwo.match(/^ \(.*\)$/)) {
					trackTitle = apiData.results[idx].trackCensoredName;
				}
			}

			// Add hidden fields for track details
			appendHiddenField("mediums." + currentDiscNum + ".track." + currentTrackNum + ".name", trackTitle);
			appendHiddenField("mediums." + currentDiscNum + ".track." + currentTrackNum + ".length", apiData.results[idx].trackTimeMillis);

			// Process track artists
			var contributingArtists = apiData.results[idx].artistName.split(/[,&]/);
			for (var subIdx = 0; subIdx < contributingArtists.length; subIdx++) {
				appendHiddenField("mediums." + currentDiscNum + ".track." + currentTrackNum + ".artist_credit.names." + subIdx + ".name", contributingArtists[subIdx].trim());
				var artistJoiner = (subIdx !== contributingArtists.length - 1) ? (subIdx === contributingArtists.length - 2) ? " & " : ", " : "";
				if (subIdx !== contributingArtists.length - 1)
					appendHiddenField("mediums." + currentDiscNum + ".track." + currentTrackNum + ".artist_credit.names." + subIdx + ".join_phrase", artistJoiner);
			}
		}
	}

	// Add fields for each disc's format
	for (var idx = 0; idx < discCount; idx++) {
		appendHiddenField("mediums." + idx + ".format", 'Digital Media');
	}

	// Add main release information fields
	appendHiddenField("name", releaseTitle);
	appendHiddenField("artist_credit.names.0.artist.name", recordingArtist);
	appendHiddenField("packaging", 'None');
	appendHiddenField("date.year", releaseYear);
	appendHiddenField("date.month", releaseMonth);
	appendHiddenField("date.day", releaseDay);
	appendHiddenField("labels.0.name", recordLabel);
	appendHiddenField("country", regionCode);
	appendHiddenField("status", "official");
	//appendHiddenField("language", "jpn");
	//appendHiddenField("script", "Jpan");
	appendHiddenField("type", releaseType);
	appendHiddenField("edit_note", "Imported from: " + document.location.href +
		" via https://github.com/dufferzafar/Userscripts/blob/master/MB-Import-From-iTunes.user.js"); // Reference to original script
	appendHiddenField("urls.0.link_type", "74"); // Link type for iTunes
	appendHiddenField("urls.0.url", document.location.href); // Original URL

	containerDiv.appendChild(submissionForm); // Add the form to the container div
	document.getElementById('title').appendChild(containerDiv); // Insert the container into the page
}

//////////////////////////////////////////////////////////////////////////////

/**
 * Creates and appends a hidden input field to the submission form.
 * @param {string} inputName The 'name' attribute for the input field.
 * @param {string|number} inputValue The 'value' attribute for the input field.
 */
function appendHiddenField(inputName, inputValue) {
	var hiddenInput = document.createElement("input");
	hiddenInput.type = "hidden"; // Make the input field hidden
	hiddenInput.name = inputName; // Set the name attribute
	hiddenInput.value = inputValue; // Set the value attribute
	submissionForm.appendChild(hiddenInput); // Add to the form
}