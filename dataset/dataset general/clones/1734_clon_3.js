(function(jQueryAlias) {

	// Prevents user text selection on the target elements.
	jQueryAlias.fn.freezeUserInteraction = function() {
		return jQueryAlias(this).css({
			'user-select': 'none',
			'-khtml-user-select': 'none',
			'-moz-user-select': 'none',
			'-o-user-select': 'none',
			'-webkit-user-select': 'none'
		});
	};

	// Main modal gallery plugin method.
	jQueryAlias.fn.modalGallery = function(configOptions) {

		// Input validation: Ensure there's at least one element.
		if (this.length === 0) {
			console.warn("Modal Gallery: No elements selected to initialize plugin.");
			return jQueryAlias(this); // Return original jQuery object for chaining.
		}

		// Handle multiple elements by recursively calling the plugin on each.
		if (this.length > 1) {
			// Iterate over each element in the collection and apply the plugin.
			this.each(function() {
				jQueryAlias(this).modalGallery(configOptions);
			});
			return jQueryAlias(this);
		}

		// Default configuration for the modal gallery.
		const defaultOptions = {
			assetPreloadEnabled:			false,						// If true, attempts to preload full-size images.
			baseZIndexValue:				1000,						// Starting Z-index for overlay and modal.
			transitionDuration:				300,						// General fade/animation speed in milliseconds.
			overlayBackgroundColor:			'rgb(0,0,0)',				// Color of the semi-transparent background overlay.
			overlayTransparency:			60,							// Overlay opacity (0-100, will be divided by 100).
			overlayCssClass:				'poptrox-backdrop',			// CSS class for the overlay element.
			viewportEdgeMargin:				50,							// Margin from viewport edges for content sizing.
			viewportHeightPadding:			0,							// Additional vertical padding for viewport calculations.
			triggerLinkSelector:			'a',						// Selector for anchor tags that trigger the gallery.
			captionSourceFunction:			null,						// Function to retrieve caption text (e.g., from 'title' attr or 'data-caption').
			modalHostElement:				'body',						// Selector for the element where the modal structure is appended.
			modalAnimationSpeed:			300,						// Speed for modal resize/position animations.
			initialModalWidth:				200,						// Default width for the modal container.
			initialModalHeight:				100,						// Default height for the modal container.
			modalFixedSize:					false,						// If true, modal won't resize to fit content.
			restrictBodyScroll:				false,						// If true, sets body overflow to hidden when modal is open.
			allowModalEasyClose:			true,						// If true, clicking anywhere on the overlay/modal closes it.
			forceCloseDuringLoad:			false,						// If true, modal can be closed even when content is loading.
			showLoadingSpinner:				true,						// If true, displays a loading indicator.
			showCloseControl:				true,						// If true, displays a close button.
			showCaptionArea:				false,						// If true, displays a caption area.
			showNavigationControls:			false,						// If true, displays previous/next navigation buttons.
			applyDefaultStyling:			true,						// If true, applies basic inline styles to the modal components.
			modalBgColor:					'rgb(255,255,255)',			// (Default Style) Modal background color.
			modalTxtColor:					'rgb(0,0,0)',				// (Default Style) Modal text color.
			loaderTextSize:					'2em',						// (Default Style) Loader text font size.
			closeBtnBgColor:				'rgb(0,0,0)',				// (Default Style) Close button background color.
			closeBtnTxtColor:				'rgb(255,255,255)',			// (Default Style) Close button text color.
			closeBtnTextSize:				'20px',						// (Default Style) Close button font size.
			modalInnerPadding:				10,							// (Default Style) Padding inside the modal.
			captionAreaHeight:				60,							// (Default Style) Height of the caption area.
			captionTextFontSize:			null,						// (Default Style) Caption text font size.
			emptyCaptionPlaceholder:		'(No Title)',				// Text for items without a caption.
			closeButtonHtml:				'&#215;',					// HTML content for the close button.
			loaderHtmlContent:				'&bull;&bull;&bull;&bull;',	// HTML content for the loading spinner.
			customModalClass:				'poptrox-viewport',			// CSS class for the main modal container.
			customModalSelector:			null,						// (Advanced) Use this if providing a pre-existing modal structure.
			loaderElementSelector:			'.loader-display',			// (Advanced) Selector for the loader within the modal.
			closerElementSelector:			'.close-action',			// (Advanced) Selector for the close button within the modal.
			captionElementSelector:			'.item-caption',			// (Advanced) Selector for the caption area within the modal.
			prevNavSelector:				'.nav-prev',				// (Advanced) Selector for the previous navigation button.
			nextNavSelector:				'.nav-next',				// (Advanced) Selector for the next navigation button.
			onModalClosedCallback:			null,						// Function called when the modal closes.
			onModalOpenedCallback:			null						// Function called when the modal opens.
		};

		// Merge default options with user-provided options.
		const extendedConfig = jQueryAlias.extend({}, defaultOptions, configOptions);
		
		// Internal state variables.
		let mainTriggerElement = jQueryAlias(this);
		let documentBody = jQueryAlias('body');
		let viewportReference = jQueryAlias(window);
		let backdropElement = jQueryAlias(`<div class="${extendedConfig.overlayCssClass}"></div>`);

		let currentViewportWidth = 0;
		let currentViewportHeight = 0;
		let mediaItemSequence = [];
		let currentDisplayIndex = 0;
		let isGalleryBusy = false; // Flag to prevent re-entry during active operations.
		let assetCache = []; // Cache for preloaded assets.

		// Helper function to update viewport dimensions and modal content sizing.
		const adjustModalDimensions = function() {
			currentViewportWidth = viewportReference.width();
			currentViewportHeight = viewportReference.height() + extendedConfig.viewportHeightPadding;

			// Calculate padding/border differences for the modal container.
			const horizontalPadding = Math.abs(modalContainer.width() - modalContainer.outerWidth());
			const verticalPadding = Math.abs(modalContainer.height() - modalContainer.outerHeight());

			// Get current content dimensions (if activeItem exists).
			let contentWidth = activeItem.width();
			let contentHeight = activeItem.height();

			// Calculate maximum allowed width and height for content.
			const maximumContentWidth = currentViewportWidth - (extendedConfig.viewportEdgeMargin * 2) - horizontalPadding;
			const maximumContentHeight = currentViewportHeight - (extendedConfig.viewportEdgeMargin * 2) - verticalPadding;

			// Apply minimum modal dimensions.
			modalContainer
				.css('min-width', extendedConfig.initialModalWidth)
				.css('min-height', extendedConfig.initialModalHeight);

			// Apply max dimensions to the content (image/iframe/etc.).
			contentWrapper.children()
				.css('max-width', maximumContentWidth)
				.css('max-height', maximumContentHeight);
		};

		// Disable features if their respective settings are false.
		// This prevents attempting to find or create elements that won't be used.
		if (!extendedConfig.showLoadingSpinner) {
			extendedConfig.loaderElementSelector = null;
		}
		if (!extendedConfig.showCloseControl) {
			extendedConfig.closerElementSelector = null;
		}
		if (!extendedConfig.showCaptionArea) {
			extendedConfig.captionElementSelector = null;
		}
		if (!extendedConfig.showNavigationControls) {
			extendedConfig.prevNavSelector = null;
			extendedConfig.nextNavSelector = null;
		}

		// Initialize modal container element.
		let modalContainer;
		if (extendedConfig.customModalSelector) {
			modalContainer = jQueryAlias(extendedConfig.customModalSelector);
		} else {
			// Construct the modal HTML dynamically.
			const loaderMarkup = extendedConfig.loaderElementSelector ? `<div class="loader-display">${extendedConfig.loaderHtmlContent}</div>` : '';
			const contentMarkup = '<div class="content-display"></div>';
			const captionMarkup = extendedConfig.captionElementSelector ? `<div class="item-caption"></div>` : '';
			const closerMarkup = extendedConfig.closerElementSelector ? `<span class="close-action">${extendedConfig.closeButtonHtml}</span>` : '';
			const prevNavMarkup = extendedConfig.prevNavSelector ? `<div class="nav-prev"></div>` : '';
			const nextNavMarkup = extendedConfig.nextNavSelector ? `<div class="nav-next"></div>` : '';

			modalContainer = jQueryAlias(`
				<div class="${extendedConfig.customModalClass}">
					${loaderMarkup}
					${contentMarkup}
					${captionMarkup}
					${closerMarkup}
					${prevNavMarkup}
					${nextNavMarkup}
				</div>
			`);
		}

		// Reference individual components within the modal.
		const contentWrapper = modalContainer.find('.content-display');
		let activeItem = jQueryAlias(); // Current active media element (image, iframe, etc.)
		const loadingIndicator = modalContainer.find(extendedConfig.loaderElementSelector);
		const captionDisplay = modalContainer.find(extendedConfig.captionElementSelector);
		const closeButton = modalContainer.find(extendedConfig.closerElementSelector);
		const nextButton = modalContainer.find(extendedConfig.nextNavSelector);
		const prevButton = modalContainer.find(extendedConfig.prevNavSelector);
		const navigationControls = nextButton.add(prevButton);

		// Apply default styling if enabled.
		if (extendedConfig.applyDefaultStyling) {
			modalContainer.css({
				'background': extendedConfig.modalBgColor,
				'color': extendedConfig.modalTxtColor,
				'padding': `${extendedConfig.modalInnerPadding}px`
			});

			if (captionDisplay.length > 0) {
				modalContainer.css('padding-bottom', `${extendedConfig.captionAreaHeight}px`);
				captionDisplay.css({
					'position': 'absolute',
					'left': '0',
					'bottom': '0',
					'width': '100%',
					'text-align': 'center',
					'height': `${extendedConfig.captionAreaHeight}px`,
					'line-height': `${extendedConfig.captionAreaHeight}px`
				});
				if (extendedConfig.captionTextFontSize) {
					captionDisplay.css('font-size', extendedConfig.captionTextFontSize);
				}
			}

			if (closeButton.length > 0) {
				closeButton.html(extendedConfig.closeButtonHtml).css({
					'font-size': extendedConfig.closeBtnTextSize,
					'background': extendedConfig.closeBtnBgColor,
					'color': extendedConfig.closeBtnTxtColor,
					'display': 'block',
					'width': '40px',
					'height': '40px',
					'line-height': '40px',
					'text-align': 'center',
					'position': 'absolute',
					'text-decoration': 'none',
					'outline': '0',
					'top': '0',
					'right': '-40px' // Position outside the modal for typical design.
				});
			}

			if (loadingIndicator.length > 0) {
				loadingIndicator.html('').css({
					'position': 'relative',
					'font-size': extendedConfig.loaderTextSize
				});

				// Custom events for spinner animation.
				loadingIndicator.on('startSpinAnimation', function(eventObj) {
					const spinnerEl = jQueryAlias(`<div>${extendedConfig.loaderHtmlContent}</div>`);
					const availableHeight = modalContainer.height() - (captionDisplay.length > 0 ? captionDisplay.height() : 0);
					const spinnerHeight = Math.floor(availableHeight / 2);

					spinnerEl.css({
						'height': `${spinnerHeight}px`,
						'overflow': 'hidden',
						'line-height': `${spinnerHeight}px`,
						'text-align': 'center',
						'margin-top': Math.floor((availableHeight - spinnerHeight) / 2),
						'color': extendedConfig.modalTxtColor || '' // Use modal text color or inherit.
					});

					// Simple pulsing animation.
					spinnerEl.on('pulseIn', function() {
						spinnerEl.fadeTo(extendedConfig.transitionDuration, 0.5, function() {
							spinnerEl.trigger('pulseOut');
						});
					}).on('pulseOut', function() {
						spinnerEl.fadeTo(extendedConfig.transitionDuration, 0.1, function() {
							spinnerEl.trigger('pulseIn');
						});
					}).trigger('pulseIn');

					loadingIndicator.append(spinnerEl);
				}).on('stopSpinAnimation', function(eventObj) {
					loadingIndicator.find('div').remove(); // Remove the spinner element.
				});
			}

			if (navigationControls.length === 2) { // Ensure both next and previous buttons exist.
				navigationControls.css({
					'font-size': '75px',
					'text-align': 'center',
					'color': '#fff',
					'text-shadow': 'none',
					'height': '100%',
					'position': 'absolute',
					'top': '0',
					'opacity': '0.35',
					'cursor': 'pointer',
					'box-shadow': 'inset 0px 0px 10px 0px rgba(0,0,0,0)' // Subtle hover effect base.
				}).freezeUserInteraction(); // Apply custom disable selection.

				let nextNavWidth, prevNavWidth;
				if (extendedConfig.allowModalEasyClose) {
					nextNavWidth = '100px';
					prevNavWidth = '100px';
				} else {
					nextNavWidth = '75%';
					prevNavWidth = '25%';
				}

				nextButton.css({ 'right': '0', 'width': nextNavWidth })
					.html('<div style="position: absolute; height: 100px; width: 125px; top: 50%; right: 0; margin-top: -50px;">&gt;</div>');

				prevButton.css({ 'left': '0', 'width': prevNavWidth })
					.html('<div style="position: absolute; height: 100px; width: 125px; top: 50%; left: 0; margin-top: -50px;">&lt;</div>');
			}
		}

		// Core functionality and event bindings.
		viewportReference.on('resize orientationchange', adjustModalDimensions);

		captionDisplay.on('updateCaptionContent', function(eventObj, captionTextContent) {
			if (!captionTextContent || captionTextContent.length === 0) {
				captionTextContent = extendedConfig.emptyCaptionPlaceholder;
			}
			captionDisplay.html(captionTextContent);
		});

		closeButton.css('cursor', 'pointer').on('click', function(eventObj) {
			eventObj.preventDefault();
			eventObj.stopPropagation();
			modalContainer.trigger('galleryCloseRequest'); // Trigger custom close event.
			return true;
		});

		nextButton.on('click', function() {
			modalContainer.trigger('galleryNextItem');
		});

		prevButton.on('click', function() {
			modalContainer.trigger('galleryPrevItem');
		});

		// Configure and append the overlay.
		backdropElement.css({
			'position': 'fixed',
			'left': 0,
			'top': 0,
			'z-index': extendedConfig.baseZIndexValue,
			'width': '100%',
			'height': '100%',
			'text-align': 'center',
			'cursor': 'pointer'
		});

		// Ensure the parent element exists before appending.
		const parentElement = jQueryAlias(extendedConfig.modalHostElement);
		if (parentElement.length === 0) {
			console.error(`Modal Gallery: Host element '${extendedConfig.modalHostElement}' not found. Appending to body.`);
			parentElement = documentBody;
		}
		backdropElement.appendTo(parentElement);

		// Add vertical alignment helper and background layer.
		backdropElement.prepend('<div style="display:inline-block;height:100%;vertical-align:middle;"></div>')
			.append(`<div style="position:absolute;left:0;top:0;width:100%;height:100%;background:${extendedConfig.overlayBackgroundColor};opacity:${extendedConfig.overlayTransparency / 100};"></div>`)
			.hide()
			.on('touchmove', function(eventObj) {
				// Prevent scrolling on touch devices when overlay is active.
				eventObj.preventDefault();
				return false;
			})
			.on('click', function(eventObj) {
				eventObj.preventDefault();
				eventObj.stopPropagation();
				modalContainer.trigger('galleryCloseRequest');
			});

		// If easy close is enabled, allow clicking the content wrapper to close.
		if (extendedConfig.allowModalEasyClose) {
			contentWrapper.css('cursor', 'pointer').on('click', function(eventObj) {
				eventObj.preventDefault();
				eventObj.stopPropagation();
				modalContainer.trigger('galleryCloseRequest');
			});
		}

		// Modal container custom event handlers.
		modalContainer.css({
			'display': 'inline-block',
			'vertical-align': 'middle',
			'position': 'relative',
			'z-index': extendedConfig.baseZIndexValue + 1 // Ensure modal is above overlay.
		}).appendTo(backdropElement)
		.hide()
		.on('galleryNextItem', function() {
			let nextIndex = currentDisplayIndex + 1;
			if (nextIndex >= mediaItemSequence.length) {
				nextIndex = 0; // Loop back to the first item.
			}
			modalContainer.trigger('galleryItemChange', [nextIndex]);
		})
		.on('galleryPrevItem', function() {
			let prevIndex = currentDisplayIndex - 1;
			if (prevIndex < 0) {
				prevIndex = mediaItemSequence.length - 1; // Loop to the last item.
			}
			modalContainer.trigger('galleryItemChange', [prevIndex]);
		})
		.on('galleryResetState', function() {
			adjustModalDimensions(); // Recalculate dimensions.

			modalContainer
				.data('storedWidth', extendedConfig.initialModalWidth)
				.data('storedHeight', extendedConfig.initialModalHeight);

			loadingIndicator.hide().trigger('stopSpinAnimation');
			captionDisplay.hide();
			closeButton.hide();
			navigationControls.hide();
			contentWrapper.hide();
			activeItem.detach(); // Remove current content from DOM.
		})
		.on('galleryOpenRequest', function(eventObj, itemIndex) {
			if (isGalleryBusy) {
				console.log("Modal Gallery: Already processing an action. Skipping open request.");
				return true;
			}
			isGalleryBusy = true; // Set busy flag.

			if (extendedConfig.restrictBodyScroll) {
				documentBody.css('overflow', 'hidden');
			}

			if (extendedConfig.onModalOpenedCallback) {
				extendedConfig.onModalOpenedCallback.call(mainTriggerElement[0]); // Call with context.
			}

			// Fade in the overlay, then switch to the requested item.
			backdropElement.fadeTo(extendedConfig.transitionDuration, extendedConfig.overlayTransparency / 100, function() {
				modalContainer.trigger('galleryItemChange', [itemIndex, true]); // Force switch.
			});
		})
		.on('galleryItemChange', function(eventObj, newItemIndex, forceSwitch) {
			// Prevent switching if busy, unless forced.
			if (!forceSwitch && isGalleryBusy && !extendedConfig.forceCloseDuringLoad) {
				console.log("Modal Gallery: Busy, cannot switch item.");
				return true;
			}
			isGalleryBusy = true;

			// Reset modal dimensions to initial before content load.
			modalContainer
				.css('width', modalContainer.data('storedWidth') || extendedConfig.initialModalWidth)
				.css('height', modalContainer.data('storedHeight') || extendedConfig.initialModalHeight);
				
			// Clean up previous item's display.
			captionDisplay.hide();
			if (activeItem.attr('src')) {
				activeItem.attr('src', ''); // Clear image source to prevent re-rendering.
			}
			activeItem.detach(); // Remove the old item.
				
			// Get the new item to display.
			const currentItemData = mediaItemSequence[newItemIndex];
			activeItem = currentItemData.itemObject;
			activeItem.off('load'); // Ensure no old load handlers persist.
		
			contentWrapper
				.css('text-indent', '-9999px') // Hide text content during load.
				.show()
				.append(activeItem); // Append the new item.

			// Handle different content types.
			if (currentItemData.contentType === 'ajax') {
				jQueryAlias.get(currentItemData.sourceUrl, function(data) {
					activeItem.html(data);
					activeItem.trigger('contentLoaded'); // Custom event for AJAX content.
				});
			} else {
				// For images, iframes, etc., set the source.
				activeItem.attr('src', currentItemData.sourceUrl);
			}
			
			// Apply base styles for non-image content.
			if (currentItemData.contentType !== 'image') {
				activeItem
					.css({
						'position': 'relative',
						'outline': '0',
						'z-index': extendedConfig.baseZIndexValue + 100 // Higher z-index for content.
					})
					.width(currentItemData.calculatedWidth)
					.height(currentItemData.calculatedHeight);
			}

			// Show loading spinner.
			loadingIndicator.trigger('startSpinAnimation').fadeIn(extendedConfig.transitionDuration);
			modalContainer.show();

			// Handle modal sizing based on 'modalFixedSize' setting.
			if (extendedConfig.modalFixedSize) {
				// If fixed size, set modal to predefined dimensions.
				modalContainer
					.width(extendedConfig.initialModalWidth)
					.height(extendedConfig.initialModalHeight);

				// Once content is loaded, finalize display.
				activeItem.one('load contentLoaded', function() { // Listen for 'load' or custom 'contentLoaded'.
					loadingIndicator.hide().trigger('stopSpinAnimation');
					captionDisplay.trigger('updateCaptionContent', [currentItemData.captionText]).fadeIn(extendedConfig.transitionDuration);
					closeButton.fadeIn(extendedConfig.transitionDuration);
					contentWrapper.css('text-indent', 0).hide().fadeIn(extendedConfig.transitionDuration, function() {
						isGalleryBusy = false; // Release busy flag.
					});
					currentDisplayIndex = newItemIndex;
					navigationControls.fadeIn(extendedConfig.transitionDuration);
				});
			} else {
				// If dynamic sizing, wait for content to load, then resize.
				activeItem.one('load contentLoaded', function() {
					adjustModalDimensions(); // Recalculate based on loaded content.

					loadingIndicator.hide().trigger('stopSpinAnimation');

					const finalContentWidth = activeItem.width();
					const finalContentHeight = activeItem.height();
					
					// Function to finalize the display after potential resize.
					const finalizeDisplay = function() {
						captionDisplay.trigger('updateCaptionContent', [currentItemData.captionText]).fadeIn(extendedConfig.transitionDuration);
						closeButton.fadeIn(extendedConfig.transitionDuration);
						contentWrapper.css('text-indent', 0).hide().fadeIn(extendedConfig.transitionDuration, function() {
							isGalleryBusy = false; // Release busy flag.
						});
						currentDisplayIndex = newItemIndex;
						navigationControls.fadeIn(extendedConfig.transitionDuration);

						// Store final dimensions for next switch.
						modalContainer
							.data('storedWidth', finalContentWidth)
							.data('storedHeight', finalContentHeight)
							.css({ // Reset width/height to auto for proper scaling.
								'width': 'auto',
								'height': 'auto'
							});
					};

					// If content dimensions changed, animate modal resize.
					if (modalContainer.data('storedWidth') !== finalContentWidth || modalContainer.data('storedHeight') !== finalContentHeight) {
						modalContainer.animate({
							width: finalContentWidth,
							height: finalContentHeight
						}, extendedConfig.modalAnimationSpeed, 'swing', finalizeDisplay);
					} else {
						// No resize needed, just finalize.
						finalizeDisplay();
					}
				});
			}
		})
		.on('galleryCloseRequest', function() {
			if (isGalleryBusy && !extendedConfig.forceCloseDuringLoad) {
				console.log("Modal Gallery: Busy, cannot close forcefully.");
				return true;
			}
			isGalleryBusy = false; // Reset busy flag.

			modalContainer.hide().trigger('galleryResetState');
			backdropElement.fadeOut(extendedConfig.transitionDuration, function() {
				if (extendedConfig.restrictBodyScroll) {
					documentBody.css('overflow', ''); // Restore body overflow.
				}
				if (extendedConfig.onModalClosedCallback) {
					extendedConfig.onModalClosedCallback.call(mainTriggerElement[0]); // Call with context.
				}
			});
		});

		// Initialize the queue of gallery items.
		mainTriggerElement.find(extendedConfig.triggerLinkSelector).each(function() {
			const linkElement = jQueryAlias(this);
			const href = linkElement.attr('href');
			if (!href) return; // Skip if no href.

			let itemType = 'image'; // Default type.
			if (href.match(/\.(mp4|ogg|webm)$/i)) {
				itemType = 'video';
			} else if (href.match(/\.(html|htm)$/i) || href.startsWith('#')) {
				itemType = 'ajax';
			} else if (href.match(/\.(jpg|jpeg|gif|png|webp)$/i)) {
				itemType = 'image';
			} else if (href.startsWith('//') || href.startsWith('http')) {
				// Assume external content (iframe) if not a recognized image/video extension.
				itemType = 'iframe';
			}

			// Determine caption text.
			let itemCaption = null;
			if (extendedConfig.captionSourceFunction && typeof extendedConfig.captionSourceFunction === 'function') {
				itemCaption = extendedConfig.captionSourceFunction(linkElement);
			} else if (linkElement.attr('title')) {
				itemCaption = linkElement.attr('title');
			} else if (linkElement.data('caption')) {
				itemCaption = linkElement.data('caption');
			}

			let mediaObject;
			let initialWidth = extendedConfig.initialModalWidth;
			let initialHeight = extendedConfig.initialModalHeight;

			switch (itemType) {
				case 'image':
					mediaObject = jQueryAlias('<img src="" />');
					break;
				case 'video':
					mediaObject = jQueryAlias('<video controls autoplay loop></video>');
					break;
				case 'iframe':
					mediaObject = jQueryAlias('<iframe src="" frameborder="0" allowfullscreen></iframe>');
					break;
				case 'ajax':
					// For AJAX, content will be loaded into a div.
					mediaObject = jQueryAlias('<div class="ajax-content"></div>');
					initialWidth = linkElement.data('width') || extendedConfig.initialModalWidth;
					initialHeight = linkElement.data('height') || extendedConfig.initialModalHeight;
					break;
				default:
					console.warn(`Modal Gallery: Unknown content type for href: ${href}. Defaulting to image.`);
					mediaObject = jQueryAlias('<img src="" />');
					itemType = 'image';
					break;
			}
			
			// Preload logic (basic implementation).
			if (extendedConfig.assetPreloadEnabled && itemType === 'image') {
				const tempImg = new Image();
				tempImg.src = href;
				assetCache.push(tempImg); // Store for potential future use or just for loading.
			}

			mediaItemSequence.push({
				sourceUrl: href,
				contentType: itemType,
				captionText: itemCaption,
				itemObject: mediaObject,
				calculatedWidth: initialWidth,
				calculatedHeight: initialHeight
			});

			// Bind click event to trigger the modal.
			linkElement.on('click', function(eventObj) {
				eventObj.preventDefault();
				eventObj.stopPropagation();
				const clickedIndex = jQueryAlias(this).index(extendedConfig.triggerLinkSelector); // Get index relative to selector.
				modalContainer.trigger('galleryOpenRequest', [clickedIndex]);
			});
		});

		// Return the original jQuery object for chaining.
		return mainTriggerElement;
	};

})(jQuery);