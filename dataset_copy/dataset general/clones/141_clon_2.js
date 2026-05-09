var downloadPanelTweaks = {

	// Core logic instance for panel operations
	panelTweakerCore: mainTweakerLogic,

	// Getter for the stylesheet management service
	get styleSheetManager() {
		delete this.styleSheetManager;
		return this.styleSheetManager = Components.classes["@mozilla.org/content/style-sheet-service;1"]
			.getService(Components.interfaces.nsIStyleSheetService);
	},


	/**
	 * Generates a new URI for a given CSS string.
	 * @param {string} styleText The raw CSS string.
	 * @returns {nsIURI} A new URI object for the CSS.
	 */
	createStylesheetURI: function(styleText) {
		styleText = this.cleanStylesheetText(styleText);
		return Services.io.newURI("data:text/css," + encodeURIComponent(styleText), null, null);
	},


	/**
	 * Removes leading whitespace from each line of a multi-line string.
	 * @param {string} inputString The string to clean.
	 * @returns {string} The cleaned string.
	 */
	cleanStylesheetText: function(inputString) {
		var leadingWhitespace = inputString.match(/^[ \t]*/)[0];
		return inputString.replace(new RegExp("^" + leadingWhitespace, "mg"), "");
	},


	// Initiates loading of all relevant styles
	initializeAllStyles: function(shouldLoad) {
		this.applyCompactVisuals(shouldLoad ? preferences.fetch("compactedLayout") : 0);
		this.applyCustomTweaks(shouldLoad);
	},


	// Flags to track loaded compact styles
	_isCompactVisualsActive: false,
	_isForcedCompactVisualsActive: false,


	/**
	 * Manages the loading/unloading of compact visual styles based on a level.
	 * @param {number} compactLevel The level of compactness (0: off, 1: compact, 2: force compact).
	 */
	applyCompactVisuals: function(compactLevel) {
		this.processStylesheetFile("visualsCompact.css", "_isCompactVisualsActive", compactLevel == 1);
		this.processStylesheetFile("visualsCompactForce.css", "_isForcedCompactVisualsActive", compactLevel == 2);
	},


	/**
	 * Handles loading or unloading a specific stylesheet file.
	 * @param {string} fileName The name of the CSS file.
	 * @param {string} stateKey The internal property key to track the file's load state.
	 * @param {boolean} activate True to load, false to unload.
	 */
	processStylesheetFile: function(fileName, stateKey, activate) {
		if (activate == this[stateKey])
			return;

		this[stateKey] = activate;
		this.manageStyleSheet(Services.io.newURI("chrome://panelutility/resources/" + fileName, null, null), activate);
		_systemLog((activate ? "Activate" : "Deactivate") + " " + fileName);
	},


	// Flags and properties for custom tweak styles
	_isCustomTweaksActive: false,
	customStylesheetURI: null,
	minimumPanelDimensionX: 5,
	minimumPanelDimensionY: 30,
	minimumProgressIndicatorHeight: 6,
	maximumProgressIndicatorHeight: 50,


	/**
	 * Manages the loading/unloading of dynamic custom tweak styles.
	 * @param {boolean} shouldActivate True to load, false to unload.
	 */
	applyCustomTweaks: function(shouldActivate) {
		if (shouldActivate == this._isCustomTweaksActive)
			return;

		this._isCustomTweaksActive = shouldActivate;
		var generatedStyleURI;

		if (shouldActivate) {
			var currentPanelWidth = Math.max(this.minimumPanelDimensionX, preferences.fetch("panelWidthValue", 60));
			var maximumPanelHeight = preferences.fetch("maxPanelHeight", 0);
			var computedMaxHeightValue = maximumPanelHeight <= 0
				? "none"
				: Math.max(this.minimumPanelDimensionY, maximumPanelHeight) + "px";

			var progressBarDimension = Math.max(this.minimumProgressIndicatorHeight, Math.min(this.maximumProgressIndicatorHeight,
				preferences.fetch("progressIndicatorHeight", 10)
			));

			var downloadItemSelector = this.panelTweakerCore.browserVersion >= 20
				? ".downloadBox"
				: ".download-status > hbox";

			var browserWindow = Services.wm.getMostRecentWindow(null);
			var textDecorStylePrefix = browserWindow && "textDecorationStyle" in browserWindow.document.documentElement.style
				? ""
				: "-moz-";

			var colorFilterEffect = this.panelTweakerCore.browserVersion >= 36
				? "grayscale(1)"
				: 'url("chrome://appresources/theme/icons/greyscale.svg#filter")';

			var dynamicStylesheetContent = '\
				/* Panel Utility Styles */\n\
				@namespace url("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul");\n\
				@-moz-document url("chrome://browser/content/browser.xul"),\n\
					url("chrome://browser/content/places/places.xul"),\n\
					url("about:downloads"),\n\
					url("chrome://browser/content/downloads/contentAreaDownloadsView.xul") {\n\
					#downloadDisplayList {\n\
						/* Adjust dimensions for older Firefox versions and specific themes */\n\
						width: auto !important;\n\
						min-width: 0 !important;\n\
						max-width: none !important;\n\
						max-height: ' + computedMaxHeightValue + ' !important;\n\
					}\n\
					' + downloadItemSelector + ' {\n\
						width: ' + currentPanelWidth + 'ch !important;\n\
						min-width: 0 !important;\n\
					}\n\
					#summaryDescriptionSection,\n\
					#summaryDetailsSection {\n\
						width: ' + currentPanelWidth + 'ch !important;\n\
						min-width: 0 !important;\n\
					}\n\
					.downloadDestination {\n\
						min-width: 5ch !important;\n\
					}\n\
					.progressGauge {\n\
						min-width: 20px !important;\n\
						min-height: ' + progressBarDimension + 'px !important;\n\
						height: ' + progressBarDimension + 'px !important;\n\
					}\n\
					.progressGauge > .indicator-bar {\n\
						height: auto !important;\n\n\
						min-height: 2px !important;\n\
						max-height: ' + progressBarDimension + 'px !important;\n\
					}' + (
						preferences.fetch("desaturatePausedProgress")
						? '\n\
					/* Visuals for paused transfers */\n\
					.transfer-status[state="4"] .progressGauge,\n\
					#summaryContainer[' + this.panelTweakerCore.pausedAttribute + '] .progressGauge {\n\
						filter: ' + colorFilterEffect + ';\n\
					}\n\
					.transfer-status[state="4"] .progressGauge > .indicator-bar,\n\
					.transfer-status[state="4"] .progressGauge > .indicator-remainder,\n\
					#summaryContainer[' + this.panelTweakerCore.pausedAttribute + '] .progressGauge > .indicator-bar,\n\
					#summaryContainer[' + this.panelTweakerCore.pausedAttribute + '] .progressGauge > .indicator-remainder {\n\
						opacity: 0.85;\n\
					}'
						: ""
					) + '\n\
				}\n\
				@-moz-document url("about:addons"),\n\
					url("chrome://mozapps/content/extensions/extensions.xul") {\n\
					.panelUtilityItem[tooltiptext] {\n\
						text-decoration: underline;\n\
						' + textDecorStylePrefix + 'text-decoration-style: dotted;\n\
					}\n\
					.panelUtilityIndent .preferences-title {\n\
						-moz-margin-start: 4ch !important;\n\
					}\n\
				}';
			generatedStyleURI = this.customStylesheetURI = this.createStylesheetURI(dynamicStylesheetContent);
		}
		else {
			generatedStyleURI = this.customStylesheetURI;
		}
		this.manageStyleSheet(generatedStyleURI, shouldActivate);
		_systemLog("applyCustomTweaks(" + shouldActivate + ")");
	},


	// Forces a refresh of the custom tweak styles
	refreshCustomTweaks: function() {
		this.applyCustomTweaks(false);
		this.applyCustomTweaks(true);
	},


	// Timer for delayed custom tweak refresh
	_refreshTweaksScheduler: null,


	// Schedules a refresh of the custom tweak styles
	scheduleCustomTweaksRefresh: function() {
		var schedulerInstance = this._refreshTweaksScheduler;
		if (schedulerInstance)
			schedulerInstance.cancel();
		else {
			schedulerInstance = this._refreshTweaksScheduler = Components.classes["@mozilla.org/timer;1"]
				.createInstance(Components.interfaces.nsITimer);
		}
		schedulerInstance.init(function() {
			this._refreshTweaksScheduler = null;
			this.refreshCustomTweaks();
		}.bind(this), 300, schedulerInstance.TYPE_ONE_SHOT);
	},


	/**
	 * Registers or unregisters a stylesheet with the stylesheet service.
	 * @param {nsIURI} stylesheetLocation The URI of the stylesheet.
	 * @param {boolean} shouldRegister True to register, false to unregister.
	 */
	manageStyleSheet: function(stylesheetLocation, shouldRegister) {
		var styleSheetManager = this.styleSheetManager;
		if (shouldRegister == styleSheetManager.sheetRegistered(stylesheetLocation, styleSheetManager.USER_SHEET))
			return;

		if (shouldRegister)
			styleSheetManager.loadAndRegisterSheet(stylesheetLocation, styleSheetManager.USER_SHEET);
		else
			styleSheetManager.unregisterSheet(stylesheetLocation, styleSheetManager.USER_SHEET);
	}
};