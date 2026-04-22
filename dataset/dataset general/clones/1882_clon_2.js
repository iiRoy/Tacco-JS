collectedHtmlData = "";

// Reference to the current browsing document.
var currentDocRef = document;
var primaryDocElement = currentDocRef;
// A collection to store discovered metadata entries.
var metadataRegistry = [];
// Flag to indicate if a content license has been detected.
var licenseDetectedFlag = false;

// Set up a listener for messages originating from the browser extension's runtime.
browserAPI.runtime.onMessage.addListener(function(messagePayload, messageOriginator, replyFunction) {
	// Respond by sending the current page's URL back to the extension.
	browserAPI.runtime.sendMessage({requestType: "request_page_url", pageUrl: currentDocRef.location.href});
});  

/**
 * Stores a new metadata entry into the registry, avoiding exact duplicates.
 * @param {Array} inputEntry - An array representing a metadata triple [subject, predicate, object].
 */
function registerEntry(inputEntry) {
		
	// If the registry is empty, simply add the new entry.
	if (metadataRegistry.length === 0) {
	
		metadataRegistry.push(inputEntry);
		// Check if the entry signifies a license.
		if(inputEntry[1] === "permission") {
				
			licenseDetectedFlag = true;
			// Notify the extension about the discovered license.
			browserAPI.runtime.sendMessage({permission: "scope", resourceLink: inputEntry[2], sourceDomain: inputEntry[0]});
			
		}
	}
	// If the registry already contains entries, check for duplicates before adding.
	else {
		
		var entryMissingFlag = false;
	
		// Iterate through existing entries to check for potential duplicates.
		for (var idx = 0; idx < metadataRegistry.length; idx++) {
			
			// If the subject (first element) is different, it's a new entry (or related to a different subject).
			if (metadataRegistry[idx][0] !== inputEntry[0]) {
		
				metadataRegistry.push(inputEntry);
				entryMissingFlag = false; // Reset flag as we added it.
				break; // Exit loop after adding.
			
			}
		
			// If subjects are the same, check predicates.
			if(metadataRegistry[idx][1] !== inputEntry[1]) {
				
				entryMissingFlag = true; // Predicate is different, might be a new entry for the same subject.
				
			} else {
				
				entryMissingFlag = false; // Predicate is the same, considered a duplicate, do not add.
				break; // Exit loop, no need to check further.
				
			}
			
		}
		
		// If after checking all existing entries, the flag indicates it's truly new, add it.
		if(entryMissingFlag) {
	
			metadataRegistry.push(inputEntry);
			// Check again if this new entry is a license.
			if(inputEntry[1] === "permission") {
			
				licenseDetectedFlag = true;
				browserAPI.runtime.sendMessage({permission: "scope", resourceLink: inputEntry[2], sourceDomain: inputEntry[0]});
			
			}
			
		}
		
	}
	
}

// Placeholder for scope-related data.
scopeInformation = "";

// Immediately send initial page information to the extension.
browserAPI.runtime.sendMessage({information: "resource_link", resourceLink: currentDocRef.location.href});
browserAPI.runtime.sendMessage({information: "page_title", pageTitle: currentDocRef.title, resourceLink: currentDocRef.location.href});

// Defer the main content processing to allow the page to fully load.
setTimeout(function() {
	processDocumentContent();
}, 7000); // Wait 7 seconds before initiating processing.

/**
 * Analyzes the current document's HTML to extract various metadata,
 * particularly focusing on licenses and attribution information.
 */
function processDocumentContent() {

	// Check for elements with an 'about' attribute, often indicating RDFa or similar metadata.
	if($('[about]')) {

		var resourceIdentifier = $('[about]').attr("about");
		
		// Validate and normalize the extracted URL.
		if(resourceIdentifier !== undefined) {
		
			if(resourceIdentifier.indexOf("http_protocol") === -1) {
		
				resourceIdentifier = currentDocRef.location.href;
		
			}
		
		} else {
		
			resourceIdentifier = currentDocRef.location.href;
			
		}

		// Look for license declarations within elements having an 'about' attribute.
		if($('[about] > [rel*="license"]')[0]) {
			
			registerEntry([resourceIdentifier, "permission", $('[about] > [rel*="license"]')[0].href]);
			licenseDetectedFlag = true;
			
		}
			
		// Look for attribution URL declarations.
		if($('[about] > [rel="cc:attributionURL"]')[0]) {
			
			registerEntry([resourceIdentifier, "creatorName", $('[about] > [rel="cc:attributionURL"]')[0].href]);
			
		}
			
		// Look for attribution name declarations.
		if($('[about] > [property="cc:attributionName"]')[0]) {
		
			registerEntry([resourceIdentifier, "creatorName", $('[about] > [property="cc:attributionName"]')[0].innerHTML]);
			
		}

	}

	// Check for general license declarations anywhere in the document.
	if($('[rel*="license"]')[0]) {

		// Special handling for Wikipedia, which might have multiple license links.
		if(currentDocRef.location.href.indexOf("wiki_encyclopedia_domain") !== -1) {

			registerEntry([currentDocRef.location.href, "permission", $('[rel*="license"]')[1].href]);
			
		} else {
		
			registerEntry([currentDocRef.location.href, "permission", $('[rel*="license"]')[0].href]);
				
		}
		
		licenseDetectedFlag = true;
		
	}

	// Check for general attribution URL declarations.
	if($('[rel="cc:attributionURL"]')[0]) {

		if($('[rel="cc:attributionURL"]')[0].href) {

			registerEntry([currentDocRef.location.href, "creatorLink", $('[rel="cc:attributionURL"]')[0].href]);
			
		}

	}

	// Check for general attribution name declarations.
	if($('[property="cc:attributionName"]')[0]) {

		if($('[property="cc:attributionName"]')[0].innerHTML) {		

			registerEntry([currentDocRef.location.href, "creatorName", $('[property="cc:attributionName"]')[0].innerHTML]);
			
		}
		
	}

	// Specific check for a custom license URL class.
	if($(".charm-item-license-url")[0]) {
		registerEntry([currentDocRef.location.href, "permission", $(".charm-item-license-url").attr("href")]);
	}

	// Site-specific parsing logic based on the domain.
	switch(currentDocRef.location.href.split(".")[1]) {
		
		case "flickr": 	
						var contentCreator = $('.owner-name').html();
		
						// Fallback for different author name elements on Flickr.
						if(contentCreator === undefined) {	
						
							contentCreator = $('.photo-name-line-1')
								.children()
								.first()
								.html();
						
						}

						// If an author is found and valid, register it.
						if(contentCreator !== undefined) {
						
							if(contentCreator.length !== 1) { // Ensure it's not a single character.
									
								var entryContainer = [currentDocRef.location.href, "writer", contentCreator];
								registerEntry(entryContainer);
								// Reset the temporary container.
								entryContainer = [];
								break;
								
							}
							
						}
						
						break;
		default: 
				// No specific handling for other domains.
				break;
		
	}

	// If a license was detected, send the collected data to the extension for display.
	if(licenseDetectedFlag) {	
		browserAPI.runtime.sendMessage({displayResourceLink: currentDocRef.location.href, indicatorSymbol: "icon", contentData: metadataRegistry});
	}

}