window.addEventListener ("pageContentLoaded", activateEnhancementPlugin, false);
window.addEventListener ("domStructureActivated", activateEnhancementPlugin, false);

function determineMediaPresence() {

	// First, check for direct HTML5 video elements.
	if (document.getElementsByTagName('video').length > 0) {

		let mediaSourceLink = document.getElementsByTagName('video')[0].src;

		if (!mediaSourceLink) {
			// If the video tag lacks a 'src', look for nested <source> tags.
			mediaSourceLink = document.getElementsByTagName('source').length > 0 ? document.getElementsByTagName('source')[0].src : undefined;
		}

		return mediaSourceLink;
	}
	else {
		// If no direct video, scan <noscript> tags for dynamically embedded video content.
		let hiddenContentBlocks = document.getElementsByTagName('noscript');

		for (let loopIndex = 0; loopIndex < hiddenContentBlocks.length; loopIndex++) {
		    let temporaryDiv = document.createElement("div");
		    temporaryDiv.innerHTML = hiddenContentBlocks[loopIndex].innerHTML;

			// Extract the actual inner HTML from the nodeValue of the first child, common for <noscript> content.
			temporaryDiv.innerHTML = temporaryDiv.childNodes[0].nodeValue;

			if (temporaryDiv.getElementsByTagName('video').length > 0) {
				let mediaSourceLink = temporaryDiv.getElementsByTagName('video')[0].src;

				if (!mediaSourceLink) {
					// Check for <source> elements within the parsed <noscript> content.
					mediaSourceLink = temporaryDiv.getElementsByTagName('source').length > 0 ? temporaryDiv.getElementsByTagName('source')[0].src : undefined;
				}
				return mediaSourceLink;
			}
		}
	}
}

// Set up a listener for messages originating from the browser extension.
chrome.runtime.onMessage.addListener(
  function(messageData, messageOriginator, replyFunction) {
    if (messageData.action === "mediaStreamIdentifier") {
		// Log the reception of the message requesting video URL.
		console.log('Received message: Request for media stream identifier.');
        replyFunction({mediaStreamIdentifier: determineMediaPresence()});
		return true; // Indicate that a response will be sent asynchronously.
	}
  });

function activateEnhancementPlugin(eventTrigger) {

	// Initialize a timer to repeatedly check for page readiness.
	let pluginInitTimer = setInterval (verifyPageReadiness, 120);

	function verifyPageReadiness () {
	    // Check if Vimeo-specific conditions are met or if a general target element exists.
	    if (!/vimeo.com/.test(document.URL) || document.getElementsByClassName('overlayElement').length > 0) {
	        clearInterval (pluginInitTimer); // Stop the periodic check once conditions are met.
	        engageEnhancement(); // Proceed with the main plugin enhancement logic.
	    }

		function engageEnhancement() {
			// Check if the current URL matches a YouTube watch page pattern.
			if (/^https?:\/\/(?:www\.)?youtube.com\/watch\?(?=[^?]*v=\w+)(?:[^\s?]+)?$/.test(document.URL)) {
				chrome.extension.sendRequest({}, function(apiResponse) {}); // Notify the extension (e.g., to show an icon).
			} else if (determineMediaPresence()) { // Check for presence of any HTML5 video.
				chrome.extension.sendRequest({}, function(apiResponse) {}); // Notify the extension for generic HTML5 video.
		   	} else if (/vimeo.com/.test(document.URL)) {
				// Apply Vimeo-specific style adjustments to enable interaction.
				let domItems = document.getElementsByClassName('overlayElement');
				for(let loopIndex = 0; loopIndex < domItems.length; loopIndex++) {
					domItems[loopIndex].style.zIndex = "-1"; // Push obstructive overlays behind.
			    }
				domItems = document.getElementsByClassName('mediaContainerElement');
				for(let loopIndex = 0; loopIndex < domItems.length; loopIndex++) {
					domItems[loopIndex].style.zIndex = "1000"; // Bring video container to the front.
			        domItems[loopIndex].className = 'enhanced_media_container_by_plugin'; // Update class for identification.
			    }
				domItems = document.getElementsByClassName('mediaContainerElement coverLayer');
				for(let loopIndex = 0; loopIndex < domItems.length; loopIndex++) {
			        domItems[loopIndex].className = 'enhanced_media_container_by_plugin coverLayer'; // Update cover layer class.
			    }
			}
			else {
			  // No specific video platform or HTML5 video found for plugin activation.
			}
		}
	}
}