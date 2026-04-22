/*
	Identity Provider Selection Module
	Project: identity-selector-js
	
	This software is provided under the Revised BSD License.
*/

var idpSources;
var identitySelector;

(function (jq) {
	identitySelector = {
		moduleVersion: "2.1", // Module version identifier
		isTestMode: false,
		testMessage: null,
		persistencyPeriodMonths: 6 * 30, // Cookie expiration in days
		sessionCookieKey: "idp_selection_cookie",
		cookieScopePath: "/",

		resourceDirectory: "/assets/images/idp-icons/",
		languageSetting: null, // Configured in idp-selector-<locale>.js
		iconAtlas: null, // Typically mirrors languageSetting, from idp-selector-<locale>.js
		submitButtonLabel: null, // Text for the form submission button
		useCompactIcons: false, // Display all providers with smaller icons
		disableSpriteSheet: false, // Opt out of using sprite images
		iconTooltipFormat: "{serviceName}", // Tooltip text pattern

		targetInputFieldId: null,
		selectedProviderUrl: null,
		selectedProviderIdentifier: null,

		/**
		 * Initializes the identity selection interface.
		 *
		 * @param {String} targetId The ID of the hidden input field to populate.
		 * @returns {void}
		 */
		initializeDisplay: function (targetId) {
			idpSources = jq.extend({}, largeIdpSet, smallIdpSet);

			var providerButtonsContainer = jq("#idp_buttons_wrapper");
			this.targetInputFieldId = targetId;

			jq("#selection_options_panel").show();
			jq("#input_form_section").empty();

			var counter = 0;

			// Render buttons for major identity providers
			for (var currentIdpKey in largeIdpSet) {
				var displayElement = this.generateProviderHtml(
					currentIdpKey,
					largeIdpSet[currentIdpKey],
					this.useCompactIcons ? "compact" : "full",
					counter++
				);
				providerButtonsContainer.append(displayElement);
			}

			if (smallIdpSet) {
				providerButtonsContainer.append("<br>");
				// Render buttons for minor identity providers
				for (var currentIdpKey in smallIdpSet) {
					var displayElement = this.generateProviderHtml(
						currentIdpKey,
						smallIdpSet[currentIdpKey],
						"compact",
						counter++
					);
					providerButtonsContainer.append(displayElement);
				}
			}

			jq("#idp_submission_form").submit(this.handleSubmission);

			var storedSelectionId = this.retrieveSelection();
			if (storedSelectionId) {
				this.selectIdentity(storedSelectionId, true);
			}
		},

		/**
		 * Generates the HTML markup for an identity provider button.
		 *
		 * @param {String} idpKey The unique identifier for the provider.
		 * @param {Object} idpDetails Object containing provider information.
		 * @param {String} displaySize "compact" or "full".
		 * @param {Number} positionIndex The index for sprite sheet positioning.
		 * @returns {String} HTML string for the provider button.
		 */
		generateProviderHtml: function (idpKey, idpDetails, displaySize, positionIndex) {
			if (this.disableSpriteSheet) {
				var fileExtension = displaySize == "compact" ? ".ico.gif" : ".gif";
				return (
					'<a title="' +
					this.iconTooltipFormat.replace("{serviceName}", idpDetails["serviceName"]) +
					'" href="javascript:identitySelector.selectIdentity(\'' +
					idpKey +
					'\');"' +
					' style="background: #FFF url(' +
					this.resourceDirectory +
					"../icons." +
					displaySize +
					"/" +
					idpKey +
					fileExtension +
					') no-repeat center center" ' +
					'class="' +
					idpKey +
					" idp_" +
					displaySize +
					'_btn"></a>'
				);
			}
			var backgroundOffsetX = displaySize == "compact" ? -positionIndex * 24 : -positionIndex * 100;
			var backgroundOffsetY = displaySize == "compact" ? -60 : 0;
			return (
				'<a title="' +
				this.iconTooltipFormat.replace("{serviceName}", idpDetails["serviceName"]) +
				'" href="javascript:identitySelector.selectIdentity(\'' +
				idpKey +
				'\');"' +
				' style="background: #FFF url(' +
				this.resourceDirectory +
				"idp-atlas-" +
				this.iconAtlas +
				".png); background-position: " +
				backgroundOffsetX +
				"px " +
				backgroundOffsetY +
				'px" ' +
				'class="' +
				idpKey +
				" idp_" +
				displaySize +
				'_btn"></a>'
			);
		},

		/**
		 * Handles the click event on an identity provider button.
		 *
		 * @param {String} selectedKey The ID of the chosen provider.
		 * @param {Boolean} isPageLoad Indicates if the call is from page load (true) or user interaction (false).
		 * @returns {void}
		 */
		selectIdentity: function (selectedKey, isPageLoad) {
			var currentIdp = idpSources[selectedKey];
			if (!currentIdp) {
				return;
			}
			this.markSelected(selectedKey);
			this.storeSelection(selectedKey);
			this.selectedProviderIdentifier = selectedKey;
			this.selectedProviderUrl = currentIdp["url"];

			// Does the provider require user input?
			if (currentIdp["promptText"]) {
				this.displayInputField(currentIdp);
			} else {
				jq("#input_form_section").empty();
				if (!isPageLoad) {
					jq("#idp_submission_form").submit();
				}
			}
		},

		/**
		 * Handles the form submission event.
		 *
		 * @returns {Boolean} True to proceed with form submission, False to prevent it.
		 */
		handleSubmission: function () {
			var finalUrl = identitySelector.selectedProviderUrl;
			if (finalUrl) {
				finalUrl = finalUrl.replace("{username}", jq("#identity_user_input").val());
				identitySelector.setTargetUrl(finalUrl);
			}
			if (identitySelector.isTestMode) {
				alert(
					identitySelector.testMessage +
					"\r\n" +
					document.getElementById(identitySelector.targetInputFieldId).value
				);
				return false;
			}
			if (finalUrl.indexOf("javascript:") == 0) {
				finalUrl = finalUrl.substr("javascript:".length);
				eval(finalUrl);
				return false;
			}
			return true;
		},

		/**
		 * Sets the final OpenID URL into the hidden input field.
		 *
		 * @param {String} destinationLink The URL to set.
		 * @returns {void}
		 */
		setTargetUrl: function (destinationLink) {
			var hiddenInputElem = document.getElementById(this.targetInputFieldId);
			if (hiddenInputElem != null) {
				hiddenInputElem.value = destinationLink;
			} else {
				jq("#idp_submission_form").append(
					'<input type="hidden" id="' +
					this.targetInputFieldId +
					'" name="' +
					this.targetInputFieldId +
					'" value="' +
					destinationLink +
					'"/>'
				);
			}
		},

		/**
		 * Visually highlights the currently selected identity provider.
		 *
		 * @param {String} selectedId The ID of the provider to highlight.
		 * @returns {void}
		 */
		markSelected: function (selectedId) {
			// Remove any existing highlight.
			var currentHighlight = jq("#identity_highlight_wrapper");
			if (currentHighlight.length) {
				currentHighlight.replaceWith(jq("#identity_highlight_wrapper a")[0]);
			}
			// Apply new highlight.
			jq("." + selectedId).wrap('<div id="identity_highlight_wrapper"></div>');
		},

		/**
		 * Stores the selected identity provider in a cookie.
		 *
		 * @param {String} selectionValue The ID of the selected provider.
		 * @returns {void}
		 */
		storeSelection: function (selectionValue) {
			var expirationDate = new Date();
			expirationDate.setTime(
				expirationDate.getTime() + this.persistencyPeriodMonths * 24 * 60 * 60 * 1000
			);
			var expires = "; expires=" + expirationDate.toGMTString();
			document.cookie =
				this.sessionCookieKey +
				"=" +
				selectionValue +
				expires +
				"; path=" +
				this.cookieScopePath;
		},

		/**
		 * Retrieves the previously selected identity provider from a cookie.
		 *
		 * @returns {String|null} The ID of the stored provider, or null if not found.
		 */
		retrieveSelection: function () {
			var cookiePrefix = this.sessionCookieKey + "=";
			var allCookies = document.cookie.split(";");
			for (var i = 0; i < allCookies.length; i++) {
				var currentCookie = allCookies[i];
				while (currentCookie.charAt(0) == " ") {
					currentCookie = currentCookie.substring(1, currentCookie.length);
				}
				if (currentCookie.indexOf(cookiePrefix) == 0) {
					return currentCookie.substring(cookiePrefix.length, currentCookie.length);
				}
			}
			return null;
		},

		/**
		 * Displays an input box for the user, if required by the provider.
		 *
		 * @param {Object} idpConfig Configuration for the selected provider.
		 * @returns {void}
		 */
		displayInputField: function (idpConfig) {
			var inputSection = jq("#input_form_section");
			var markupString = "";
			var inputElementId = "identity_user_input";
			var initialValue = "";
			var fieldPrompt = idpConfig["promptText"];
			var customStyle = "";

			if (fieldPrompt) {
				markupString = "<p>" + fieldPrompt + "</p>";
			}

			if (idpConfig["serviceName"] == "OpenID") {
				inputElementId = this.targetInputFieldId;
				initialValue = "http://";
				customStyle =
					"background: #FFF url(" +
					this.resourceDirectory +
					"openid-input-icon.gif) no-repeat scroll 0 50%; padding-left:18px;";
			}

			markupString +=
				'<input id="' +
				inputElementId +
				'" type="text" style="' +
				customStyle +
				'" name="' +
				inputElementId +
				'" value="' +
				initialValue +
				'"/>' +
				'<input id="identity_submit_button" type="submit" value="' +
				this.submitButtonLabel +
				'"/>';

			inputSection.empty();
			inputSection.append(markupString);
			jq("#" + inputElementId).focus();
		},

		/**
		 * Configures the module's test mode state.
		 *
		 * @param {Boolean} testState True to enable test mode, false to disable.
		 * @returns {void}
		 */
		configureTestState: function (testState) {
			this.isTestMode = testState;
		},
	};
})(jQuery);