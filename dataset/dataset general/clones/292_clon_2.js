;
// Global style management system for dynamic stylesheets.
var ResponsiveLayout = {

	// Reference to the main stylesheet link in the DOM.
	styleAssetLink : document.getElementById("ResponsiveLayout"),

	// Configuration parameters for responsive behavior.
	layoutOptions : {
		dimensionRules : {
			// Breakpoints mapping width to CSS file names.
			1150: "large_display.css",
			1550: "extra_large.css",
			830: "medium_screen.css",
		},
		defaultFile : "base_style.css", // Fallback stylesheet.
		assetFolder : "/static/styles/responsive_assets/", // Path to CSS files.
	},
	currentViewPortWidth : null // Stores the detected window width.
};

// Pre-process and organize the dimension rules.
ResponsiveLayout.layoutOptions.dimensionRules = organizeDimensionRules(ResponsiveLayout.layoutOptions.dimensionRules);

// Create the stylesheet link element if it doesn't already exist.
if ( ! ResponsiveLayout.styleAssetLink ) {

	ResponsiveLayout.styleAssetLink = document.createElement("link");
	ResponsiveLayout.styleAssetLink.setAttribute("id", "ResponsiveLayout");
	ResponsiveLayout.styleAssetLink.setAttribute("rel", "stylesheet");
	
	// Insert the newly created link into the document's head section.
	document.getElementsByTagName('head')[0].appendChild(ResponsiveLayout.styleAssetLink);
}


// Core function to update the stylesheet based on viewport size.
function updateResponsiveLayout() {

	var previousBound = 0, // Lower bound for the current breakpoint range.
		selectedStyleFile = null, // The CSS file determined by the current width.
		viewportSize = null; // The detected width of the browser window.
	
	// Safely determine the effective width of the browser viewport across different environments.
	if ( typeof window.innerWidth != 'undefined' ) {
		viewportSize = window.innerWidth;
	}
	else if ( typeof document.documentElement != 'undefined' && typeof document.documentElement.clientWidth != 'undefined' && document.documentElement.clientWidth != 0 ) {
		viewportSize = document.documentElement.clientWidth;
	}
	else {
		viewportSize = document.getElementsByTagName('body')[0].clientWidth;
	}
	
	// Update the global record of the current screen width.
	ResponsiveLayout.currentViewPortWidth = viewportSize;
	
	// Iterate through the sorted dimension rules to find the best match.
	for ( var ruleIdentifier in ResponsiveLayout.layoutOptions.dimensionRules ) {
		if ( ResponsiveLayout.layoutOptions.dimensionRules.hasOwnProperty(ruleIdentifier) ) {
	 		if ( ResponsiveLayout.currentViewPortWidth >= previousBound && ResponsiveLayout.currentViewPortWidth <= ruleIdentifier ) {
	 			selectedStyleFile = ResponsiveLayout.layoutOptions.dimensionRules[ruleIdentifier];
	 		}
	 	previousBound = ruleIdentifier; // Update the lower bound for the next iteration.
		}
	}
	
	// If no specific breakpoint was matched, fall back to the default stylesheet.
	if ( ! selectedStyleFile ) {
		selectedStyleFile = ResponsiveLayout.layoutOptions.defaultFile;
	}
	
	// Apply the chosen stylesheet if it's different from the currently loaded one.
	if ( ResponsiveLayout.styleAssetLink.getAttribute("href") != (ResponsiveLayout.layoutOptions.assetFolder + selectedStyleFile) ) {
		ResponsiveLayout.styleAssetLink.setAttribute("href", ResponsiveLayout.layoutOptions.assetFolder + selectedStyleFile);
	}
}

// Utility function to sort an object's keys (treated as strings) and return a new object.
function organizeDimensionRules(inputObjectMap) {
	var sortedObject = {}; // The object to hold sorted rules.
	var propertyKey; // Iterator for object properties.
	var keysArray = []; // Array to collect property keys.

	// Extract all enumerable property keys from the input object.
	for ( propertyKey in inputObjectMap ) {
		if ( inputObjectMap.hasOwnProperty(propertyKey) ) {
			keysArray.push(propertyKey);
		}
	}

	// Sort the collected keys alphabetically (as strings).
	keysArray.sort();

	// Populate the new object with keys in the determined order (reverse iteration).
	propertyKey = keysArray.length;
	while ( propertyKey-- ) {
		sortedObject[keysArray[propertyKey]] = inputObjectMap[keysArray[propertyKey]];
	}
	return sortedObject;
}

// Trigger the initial layout adjustment when the script loads.
updateResponsiveLayout();

// Attach the layout adjustment function to the window's resize event.
window.onresize = updateResponsiveLayout;