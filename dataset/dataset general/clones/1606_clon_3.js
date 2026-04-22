/*
 * Content Fetcher Module 1.0.0 (Beta Release)
 *
 * A jQuery-based utility for retrieving content entries from a remote API.
 * Project repository: https://github.com/yourusername/content-fetcher-js/
 *
 * Copyright (c) 2023 by Your Name
 * Personal site: https://yourwebsite.com
 *
 * Distributed under the MIT License
 * https://opensource.org/licenses/MIT
 *
 * Initial version: October 26, 2023
 */
;(function ( jq, globalObj, undefVal ) {

	// Register a collection of utility functions for JsRender integration.
	jq.views.utilityFunctions({
		/**
		 * Retrieves the configured blog's host domain.
		 * @returns {string} The blog's domain name.
		 */
		retrieveBlogHost: function() {
			// Returns the primary domain for the content source.
			return BLOG_HOST_IDENTIFIER;
		},

		/**
		 * Generates the embed code for a media player, with optional color customization.
		 * @param {object} contextData - The current data context from JsRender.
		 * @param {string} [shadeVal] - Hexadecimal color value (e.g., "#RRGGBB") for tinting.
		 * @returns {string} The HTML embed markup for the audio player.
		 */
		generateColoredAudioEmbed: function(contextData, shadeVal) {
			// Provides the embed HTML for the audio element, allowing a specific color tint.
			const defaultPlayerMarkup = contextData.data?.player || '';
			if (shadeVal && typeof shadeVal === 'string') {
				const colorChangePattern = /color=[A-Fa-f0-9]{6}/g; // Matches 'color=RRGGBB'
				const effectiveShade = shadeVal.startsWith('#') ? shadeVal.substring(1) : shadeVal;
				// Ensure the color string is valid hex (6 chars)
				if (effectiveShade.length === 6 && /^[0-9A-Fa-f]{6}$/.test(effectiveShade)) {
					return defaultPlayerMarkup.replace(colorChangePattern, `color=${effectiveShade}`);
				}
			}
			return defaultPlayerMarkup;
		},

		/**
		 * Selects the most appropriate image URL based on a desired width.
		 * @param {object} contextData - The current data context from JsRender.
		 * @param {number} desiredWidth - The minimum desired width for the image.
		 * @returns {string} The URL of the chosen image.
		 */
		selectOptimalImageSource: function(contextData, desiredWidth) {
			// Determines the best image URL from available alternative sizes based on a target width.
			// If no exact match, it picks the next larger size or the smallest if all are too big.
			const availablePictureSizes = contextData.data?.alt_sizes || [];
			let chosenSrc = '';

			if (!Array.isArray(availablePictureSizes) || availablePictureSizes.length === 0) {
				console.warn("No alternative image sizes found for this entry.");
				return '';
			}

			// Find the first image that is at least as wide as the desired width.
			for (let idx = 0; idx < availablePictureSizes.length; idx++) {
				const currentImage = availablePictureSizes[idx];
				if (currentImage.width >= desiredWidth) {
					chosenSrc = currentImage.url;
					break; // Found a suitable image, exit loop
				}
			}

			// If no image met the desired width, return the smallest available.
			return (chosenSrc === '') ? availablePictureSizes[0].url : chosenSrc;
		},

		/**
		 * Assesses the aspect ratio of an image.
		 * @param {object} contextData - The current data context from JsRender.
		 * @returns {string} "landscape", "portrait", or "square".
		 */
		determineImageAspect: function(contextData) {
			// Calculates and returns the aspect orientation of the image.
			const originalDimensions = contextData.data?.original_size;
			if (!originalDimensions || typeof originalDimensions.width !== 'number' || typeof originalDimensions.height !== 'number') {
				console.warn("Missing or invalid image dimensions for aspect ratio calculation.");
				return "unknown"; // Return a default or error state
			}
			if (originalDimensions.width > originalDimensions.height) {
				return "landscape";
			} else if (originalDimensions.width < originalDimensions.height) {
				return "portrait";
			} else {
				return "square";
			}
		},

		/**
		 * Retrieves the most suitable video embed code based on a target width.
		 * @param {object} contextData - The current data context from JsRender.
		 * @param {number} desiredWidth - The maximum desired width for the video player.
		 * @returns {string} The HTML embed code for the video player.
		 */
		obtainSuitableVideoEmbed: function(contextData, desiredWidth) {
			// Fetches the best video embed markup from available player options,
			// prioritizing the largest player that fits within the target width.
			const availableVideoPlayers = contextData.data?.player || [];
			let finalEmbedMarkup = '';

			if (!Array.isArray(availableVideoPlayers) || availableVideoPlayers.length === 0) {
				console.warn("No video players found for this entry.");
				return '';
			}

			// Iterate to find the largest player that is less than or equal to the desired width.
			for (let idx = 0; idx < availableVideoPlayers.length; idx++) {
				const currentPlayer = availableVideoPlayers[idx];
				if (currentPlayer.width <= desiredWidth) {
					finalEmbedMarkup = currentPlayer.embed_code;
					// Note: Original code breaks here, meaning it finds the *first* one that fits.
					// To get the *best* (largest fitting), we would need to iterate completely
					// or sort. Sticking to original logic for clone.
					break;
				}
			}

			// If no player fit the criteria, return the smallest available player's embed code.
			return (finalEmbedMarkup === '') ? availableVideoPlayers[0].embed_code : finalEmbedMarkup;
		}
	});

	/**
	 * jQuery plugin to retrieve and render content entries from a blog API.
	 * @param {object} configParams - Configuration options for the fetch operation.
	 */
	jq.fn.fetchBlogEntries = function(configParams) {

		// Establish default configuration parameters, merging with user-provided options.
		const defaultSettings = {
			"blogDomain": BLOG_HOST_IDENTIFIER, // The blog's domain, e.g., "myblog.tumblr.com"
			"entryIdentifier": null,             // Specific post ID to fetch (numeric)
			"contentType": "",                   // Filter by content type: "text", "quote", "link", etc.
			"filterTag": "",                     // Filter posts by a specific tag
			"maxResults": 20,                    // Maximum number of entries to retrieve (1-20)
			"startOffset": 0,                    // Starting offset for pagination
			"outputFormat": "",                  // Output format for content: "html", "text", "raw"
			"renderTemplateId": "",              // ID of the JsRender template to use (e.g., "#my-template")
			"preFetchCallback": null,            // Callback executed before the AJAX request
			"successCallback": null,             // Callback executed upon successful data retrieval and processing
			"completionCallback": null           // Callback executed after the AJAX request completes (success or failure)
		};

		const pluginConfiguration = jq.extend(true, {}, defaultSettings, configParams);

		const currentElement = this; // Store reference to the jQuery object for context.

		// Guard: Ensure a blog domain is configured.
		if (!pluginConfiguration.blogDomain || typeof pluginConfiguration.blogDomain !== 'string') {
			console.error("Content Fetcher: A valid 'blogDomain' must be provided in the configuration.");
			return this; // Chainable, but won't perform API call.
		}

		return this.each(function() {
			// Dynamically construct the API request endpoint based on plugin settings.
			let requestEndpoint = `https://api.tumblr.com/v2/blog/${pluginConfiguration.blogDomain}/posts`;

			// Append content type if specified.
			if (pluginConfiguration.contentType && pluginConfiguration.contentType !== "") {
				requestEndpoint += `/${pluginConfiguration.contentType}`;
			}

			// Append the API key, which is mandatory.
			// Guard: Check for API_KEY existence.
			if (typeof GLOBAL_API_KEY === 'undefined' || !GLOBAL_API_KEY) {
				console.error("Content Fetcher: GLOBAL_API_KEY is not defined. Please ensure it's set.");
				return; // Cannot proceed without an API key.
			}
			requestEndpoint += `?api_key=${GLOBAL_API_KEY}`;

			let baseEndpointForPaging = requestEndpoint; // Store URI before adding offset for infinite scroll use cases.

			// Determine if a single post by ID or multiple posts by criteria are requested.
			if (pluginConfiguration.entryIdentifier) {
				// Request a specific post by its unique ID.
				const entryId = Number(pluginConfiguration.entryIdentifier);
				if (!isNaN(entryId) && entryId > 0) {
					requestEndpoint += `&id=${entryId}`;
				} else {
					console.warn(`Content Fetcher: Invalid 'entryIdentifier' provided: ${pluginConfiguration.entryIdentifier}. Skipping ID filter.`);
				}
			} else {
				// Request a collection of posts.
				if (pluginConfiguration.filterTag) {
					requestEndpoint += `&tag=${encodeURIComponent(pluginConfiguration.filterTag)}`;
				}
				if (pluginConfiguration.maxResults) {
					const limitValue = Number(pluginConfiguration.maxResults);
					if (!isNaN(limitValue) && limitValue >= 1 && limitValue <= 20) {
						requestEndpoint += `&limit=${limitValue}`;
					} else {
						console.warn(`Content Fetcher: Invalid 'maxResults' value: ${pluginConfiguration.maxResults}. Defaulting to API limit.`);
					}
				}
				baseEndpointForPaging = requestEndpoint; // This is the URI for subsequent paging if offset is added.
				if (pluginConfiguration.startOffset) {
					const offsetValue = Number(pluginConfiguration.startOffset);
					if (!isNaN(offsetValue) && offsetValue >= 0) {
						requestEndpoint += `&offset=${offsetValue}`;
					} else {
						console.warn(`Content Fetcher: Invalid 'startOffset' value: ${pluginConfiguration.startOffset}. Ignoring offset.`);
					}
				}
			}

			// Initiate the asynchronous request to the blog API.
			const ajaxOperation = jq.ajax({
				requestUrl: requestEndpoint,
				responseType: "jsonp",
				jsonpCallbackName: "jsonp",
				useIfModifiedHeader: true, // Allow browser caching based on If-Modified-Since header.
				beforeSend: function(xhr) {
					// Execute the pre-fetch callback if it's a valid function.
					if (typeof pluginConfiguration.preFetchCallback === "function") {
						pluginConfiguration.preFetchCallback.call(currentElement, xhr);
					}
					// Add a custom header for tracking, just an example.
					xhr.setRequestHeader("X-Content-Fetcher-Version", "1.0");
				}
			})
			.done(function(responseData, statusMsg, xhrObject) {
				// Process the retrieved data if the response is valid and contains posts.
				if (responseData && responseData.response && responseData.response.posts && responseData.response.posts.length > 0) {
					// Log the number of posts received.
					console.info(`Content Fetcher: Successfully received ${responseData.response.posts.length} entries.`);

					// Iterate through each fetched blog entry.
					responseData.response.posts.forEach(function(blogEntry) {
						// Determine the JsRender template to use.
						// Fallback to a default template based on content type if none is specified.
						const activeTemplateId = (pluginConfiguration.renderTemplateId && pluginConfiguration.renderTemplateId !== "") ?
							pluginConfiguration.renderTemplateId : `#tmpl-entry-${blogEntry.type}`;

						// Check if the template exists before attempting to render.
						if (jq(activeTemplateId).length === 0) {
							console.error(`Content Fetcher: JsRender template '${activeTemplateId}' not found. Cannot render entry type '${blogEntry.type}'.`);
							return; // Skip rendering this specific entry.
						}

						// Render the post content using the selected JsRender template and append it to the target element.
						currentElement.append(jq(activeTemplateId).render(blogEntry));
					});
				} else {
					console.warn("Content Fetcher: No posts found or invalid response structure.", responseData);
				}

				// Execute the success callback if it's a valid function, passing relevant data.
				if (typeof pluginConfiguration.successCallback === "function") {
					pluginConfiguration.successCallback.call(currentElement, responseData, statusMsg, xhrObject, baseEndpointForPaging);
				}
			})
			.fail(function(xhrObject, statusMsg, errorThrown) {
				// Log detailed error information.
				console.error(`Content Fetcher: AJAX request failed. Status: ${statusMsg}, Error: ${errorThrown}, URL: ${requestEndpoint}`);
				console.error("Response:", xhrObject.responseText);
			})
			.always(function(xhrOrData, statusMsg) {
				// Hide any "loading" indicators within the target element.
				currentElement.find(".content-loading-indicator").fadeOut(300); // Use a new class name and add fade effect.

				// Execute the completion callback regardless of success or failure.
				if (typeof pluginConfiguration.completionCallback === "function") {
					// Differentiate between success (data as first arg) and error (xhr as first arg)
					const isSuccess = (statusMsg === "success");
					const finalXhr = isSuccess ? arguments[2] : xhrOrData; // xhrObject is 3rd arg on success, 1st on error
					const finalData = isSuccess ? xhrOrData : null;

					pluginConfiguration.completionCallback.call(currentElement, finalData, statusMsg, finalXhr, baseEndpointForPaging);
				}
			});
		});
	};
}(jQuery, window));

// Global constants - ensure these are defined in your application's scope.
// For example:
// const BLOG_HOST_IDENTIFIER = "yourblog.tumblr.com";
// const GLOBAL_API_KEY = "YOUR_TUMBLR_API_KEY";