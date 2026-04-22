(function( globalObj, undefinedVal ) {
	// Ensure a valid global context and document are available before proceeding.
	if (!globalObj || !globalObj.document) {
		console.error("Ad Manager: Core global object or document interface not found. Aborting ad logic.");
		return;
	}

	let documentRef = globalObj.document;
	let rootElement = documentRef.documentElement;

	// Immutable configuration for different display modes and their ad slot mappings.
	const displayConfigurations = Object.freeze([
		{
			id: 'base_layout',
			label: 'basic',
			slotCount: 3,
			viewportRange: { min: 1, max: 480 },
			hiddenElements: []
		},
		{
			id: 'mid_layout',
			label: 'median',
			slotCount: 3,
			viewportRange: { min: 481, max: 640 },
			hiddenElements: ['ARTICLE']
		},
		{
			id: 'lg_layout',
			label: 'large',
			viewportRange: { min: 641, max: 960 },
			slotCount: 5,
			hiddenElements: ['ARTICLE']
		}
	]);

	// Attempt to retrieve a comma-separated list of all possible ad slot identifiers.
	let adSlotIdentifiersElement = documentRef.getElementById( 'oas-positions' );
	if (!adSlotIdentifiersElement) {
		console.warn("Ad Manager: The 'oas-positions' meta element was not found. Ad slot data is unavailable.");
		return;
	}
	let rawSlotContent = adSlotIdentifiersElement.getAttribute( 'content' );
	let adSlotIdentifiers = rawSlotContent ? rawSlotContent.split( ',' ).map(s => s.trim()).filter(s => s.length > 0) : [];

	if (adSlotIdentifiers.length === 0) {
		console.warn("Ad Manager: No valid ad slot identifiers were extracted. Ad loading will be skipped.");
		return;
	}

	// Initialize runtime variables for ad context determination.
	let activeDisplayMode = '';
	const totalConfigModes = displayConfigurations.length;
	// The maximum defined screen dimension from the last configuration, plus one to make it an exclusive upper bound for comparison.
	const maxScreenDimensionForLogic = displayConfigurations[totalConfigModes - 1].viewportRange.max + 1;

	// Utility function to robustly determine the current effective viewport width.
	const getEffectiveViewportWidth = function() {
		// Prioritize window.innerWidth, then document.documentElement.clientWidth, finally screen.availWidth as a fallback.
		let currentWidth = globalObj.innerWidth || rootElement.clientWidth || globalObj.screen.availWidth;
		// Cap the determined width at a logical maximum to simplify range checks.
		return Math.min(currentWidth, maxScreenDimensionForLogic);
	};

	let currentViewportWidth = getEffectiveViewportWidth();

	let specificContextMatched = false;
	let slotsToLoadCount = 0;
	let sliceStartIdx = 0;
	let sliceEndIdx = 0;

	// Iterate through the display configurations to find the first matching viewport range.
	for (let i = 0; i < totalConfigModes; i++){
		const currentConfig = displayConfigurations[i];
		const minRange = currentConfig.viewportRange.min;
		const maxRange = currentConfig.viewportRange.max;

		if (currentViewportWidth >= minRange && currentViewportWidth <= maxRange){
			slotsToLoadCount = currentConfig.slotCount;
			sliceStartIdx = 0; // Calculate starting index by summing previous configurations' slot counts.
			for (let j = 0; j < i; j++) {
				sliceStartIdx += displayConfigurations[j].slotCount;
			}
			sliceEndIdx = sliceStartIdx + slotsToLoadCount;

			if (typeof globalObj.adEngine === 'undefined') {
				globalObj.adEngine = {}; // Ensure adEngine object exists.
			}
			globalObj.adEngine.configuredSlots = adSlotIdentifiers.slice( sliceStartIdx, sliceEndIdx );
			activeDisplayMode = currentConfig.label;
			specificContextMatched = true;
			break; // Exit loop once a suitable configuration is found.
		}
	}

	// If no specific viewport context was matched, fall back to a default configuration.
	if (!specificContextMatched) {
		sliceStartIdx = 0;
		// Sum all slot counts from all defined configurations to find the starting point for 'default' slots.
		for (let j = 0; j < totalConfigModes; j++) {
			sliceStartIdx += displayConfigurations[j].slotCount;
		}
		sliceEndIdx = adSlotIdentifiers.length; // The default context will load all remaining slots.

		if (typeof globalObj.adEngine === 'undefined') {
			globalObj.adEngine = {};
		}
		globalObj.adEngine.configuredSlots = adSlotIdentifiers.slice( sliceStartIdx, sliceEndIdx );
		activeDisplayMode = 'default_fallback'; // Use a distinct label for the fallback context.
	}

	// Define properties for the global adEngine object, preparing for ad request.
	if (typeof globalObj.adEngine === 'undefined') {
		globalObj.adEngine = {};
	}
	globalObj.adEngine.positionList  = globalObj.adEngine.configuredSlots.join(',');
	globalObj.adEngine.requestQuery	= 'display_mode='+activeDisplayMode;
	globalObj.adEngine.serverUrl	= 'https://adelivery.example.org/ads/';
	globalObj.adEngine.targetWindow	= '_top';
	globalObj.adEngine.protocolVersion = 12; // Updated protocol version.

	// Helper to generate a unique 10-digit ID.
	const generateUniqueNumericId = () => {
		return Math.floor(Math.random() * 9000000000) + 1000000000;
	};

	globalObj.adEngine.transactionId = generateUniqueNumericId().toString();
	globalObj.adEngine.sessionKey = globalObj.adEngine.transactionId.substring(2, 11);
	globalObj.adEngine.cacheBuster = Math.random().toFixed(10); // More precision for cache busting.
	globalObj.adEngine.pageIdentifier = globalObj.adEngine.pageIdentifier || 'unspecified_page'; // Ensure a page identifier exists.

	// Check for a development mode flag to enable ad mocking.
	globalObj.adEngine.developmentMode = globalObj.adEngine.developmentMode || false;

	// Inject the ad script or provide a mock handler based on the development mode.
	if( globalObj.adEngine.developmentMode ) {
		globalObj.AD_MOCK_HANDLER = function(slotName) {
			console.info(`Ad Manager: Development mode active. Mocking ad call for slot: "${slotName}"`);
			return false; // Prevent actual ad loading in dev mode.
		};
	} else {
		const adScriptSource = `${globalObj.adEngine.serverUrl}adstream_v3.js/${globalObj.adEngine.pageIdentifier}/1${globalObj.adEngine.sessionKey}@${globalObj.adEngine.positionList}?${globalObj.adEngine.requestQuery}`;
		documentRef.writeln(`<script type="text/javascript" src="${adScriptSource}"><\/script>`);
	}

	// Removed the conceptual 'setReflows', 'addEvent', and 'debounce' functions
	// as they were not directly utilized in the core ad loading flow and simplify the script.

})( this );