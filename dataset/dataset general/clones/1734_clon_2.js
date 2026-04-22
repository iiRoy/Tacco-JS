var myLib_0_0_1 = function(domObject) {

	// Block user selection
		domObject.fn.myLib_inhibitSelection = function() { return domObject(this).css('user-select', 'none').css('-khtml-user-select', 'none').css('-moz-user-select', 'none').css('-o-user-select', 'none').css('-webkit-user-select', 'none'); }

	// Module main routine
		domObject.fn.myLibModule = function(moduleConfiguration) {

			// If no elements exist, return the current jQuery object.
				if (this.length === 0)
					return domObject(this);

			// If multiple elements exist, process each one individually.
				if (this.length > 1) {
				
					for (var itemIndex = 0; itemIndex < this.length; itemIndex++)
						domObject(this[itemIndex]).myLibModule(moduleConfiguration);
					
					return domObject(this);
				
				}

			// Configuration options
				var configData = domObject.extend({

					// Core functionality
					mediaPreload:					false,						// Should full-size media be loaded in background?
					baseLayerIndex:					1000,						// Base Z-Index for UI layers
					transitionDuration:				300,						// Universal fade speed in milliseconds
					overlayColorValue:				'#000000',					// Background color for overlay
					overlayTransparency:			0.6,						// Opacity of the overlay
					overlayCssClass:				'myLib-overlay-style',		// CSS class for the overlay
					viewportMargin:					50,							// Margin around the media display (pixels)
					viewportHeightAdjustment:		0,							// Additional height adjustment for viewport
					targetElementSelector:			'a',						// Selector for elements that trigger the module
					captionSource:					null,						// Configuration for captions (see documentation)
					appendToElement:				'body',						// Selector for the parent element where UI components are added.
					// Popup specific settings
					popupAnimationSpeed:			300,						// Speed of popup resize animation
					popupInitialWidth:				200,						// Default width of popup
					popupInitialHeight:				100,						// Default height of popup
					popupFixedSize:					false,						// If true, popup size won't adapt to media
					blockBodyScroll:				false,						// If true, BODY overflow is hidden when popup is active
					enablePopupClickClose:			true,						// If true, clicking popup anywhere closes it
					allowForceClose:				false,						// If true, popup can be closed even during media loading
					showLoadingIndicator:			true,						// If true, display a loading spinner/text
					showCloseButton:				true,						// If true, display a close button
					showCaptionDisplay:				false,						// If true, display media caption
					enableNavigationButtons:		false,						// If true, show and enable next/previous navigation
					applyDefaultStyling:			true,						// If true, apply built-in styling to popup
					// Default Style settings
					popupBackgroundColor:			'#FFFFFF',					// Default popup background color
					popupTextColor:					'#000000',					// Default popup text color
					loaderFontSize:					'2em',						// Default font size for loading text
					closeButtonBackgroundColor:		'#000000',					// Default close button background
					closeButtonTextColor:			'#FFFFFF',					// Default close button text color
					closeButtonFontSize:			'20px',						// Default close button font size
					popupInnerPadding:				10,							// Default inner padding for popup
					captionAreaHeight:				60,							// Default height for caption area
					captionTextSize:				null,						// Default font size for caption text
					emptyCaptionText:				'(no title)',				// Text for images without captions
					// UI text strings
					closeButtonText:				'&#215;',					// Text for the close button
					loaderText:						'&bull;&bull;&bull;&bull;',	// Text for the loading indicator
					// Advanced selectors
					popupCssClass:					'myLib-popup-container',	// CSS class for the popup
					customPopupSelector:			null,						// Use a custom selector for the popup instead of generating one
					loaderElementSelector:			'.loader',					// Selector for the loading indicator element
					closeButtonElementSelector:		'.closer',					// Selector for the close button element
					captionElementSelector:			'.caption',					// Selector for the caption element
					prevNavElementSelector:			'.nav-previous',			// Selector for the previous navigation button
					nextNavElementSelector:			'.nav-next',				// Selector for the next navigation button
					// Callbacks
					onPopupClosed:					null,						// Function called when popup closes
					onPopupOpened:					null						// Function called when popup opens

				}, moduleConfiguration);
				
			// Internal variables

				var	currentElement = domObject(this),
					documentBody = domObject('body'),
					overlayContainer = domObject('<div class="' + configData.overlayCssClass +  '"></div>'),
					browserWindow = domObject(window);
				
				var	currentWindowWidth,
					currentWindowHeight,
					mediaQueue = [],
					currentMediaPosition = 0,
					operationLocked = false,
					mediaCache = new Array();
				
				function refreshDimensions() {

					currentWindowWidth = domObject(window).width();
					currentWindowHeight = domObject(window).height() + configData.viewportHeightAdjustment;

					var popupHorizontalPadding = Math.abs(popupDisplay.width() - popupDisplay.outerWidth());
					var popupVerticalPadding = Math.abs(popupDisplay.height() - popupDisplay.outerHeight());
					var mediaNaturalWidth = displayedMedia.width();
					var mediaNaturalHeight = displayedMedia.height();
					var maxDisplayWidth = currentWindowWidth - (configData.viewportMargin * 2) - popupHorizontalPadding;
					var maxDisplayHeight = currentWindowHeight - (configData.viewportMargin * 2) - popupVerticalPadding;

					popupDisplay
						.css('min-width', configData.popupInitialWidth)
						.css('min-height', configData.popupInitialHeight);

					mediaContainer.children()
						.css('max-width', maxDisplayWidth)
						.css('max-height', maxDisplayHeight);

				}

				// Deactivate unused components
					if (!configData.showLoadingIndicator)
						configData.loaderElementSelector = null;

					if (!configData.showCloseButton)
						configData.closeButtonElementSelector = null;

					if (!configData.showCaptionDisplay)
						configData.captionElementSelector = null;

					if (!configData.enableNavigationButtons) {

						configData.prevNavElementSelector = null;
						configData.nextNavElementSelector = null;

					}

				// Retrieve or create popup element
					var popupDisplay;
				
					if (configData.customPopupSelector)
						popupDisplay = domObject(configData.customPopupSelector);
					else
						popupDisplay = domObject('<div class="' + configData.popupCssClass + '">' + (configData.loaderElementSelector ? '<div class="loader">' + configData.loaderText + '</div>' : '') + '<div class="pic"></div>' + (configData.captionElementSelector ? '<div class="caption"></div>' : '') + (configData.closeButtonElementSelector ? '<span class="closer">' + configData.closeButtonText + '</span>' : '') + (configData.prevNavElementSelector ? '<div class="nav-previous"></div>' : '') + (configData.nextNavElementSelector ? '<div class="nav-next"></div>' : '') + '</div>');

				// Get references to popup sub-components
					var	mediaContainer = popupDisplay.find('.pic'),
						displayedMedia = domObject(),
						loadingSpinner = popupDisplay.find(configData.loaderElementSelector),
						mediaCaption = popupDisplay.find(configData.captionElementSelector),
						closeControl = popupDisplay.find(configData.closeButtonElementSelector),
						nextNavigation = popupDisplay.find(configData.nextNavElementSelector),
						prevNavigation = popupDisplay.find(configData.prevNavElementSelector),
						allNavigation = nextNavigation.add(prevNavigation);

				// Apply default visual styles if enabled
					if (configData.applyDefaultStyling) {
						
						popupDisplay
							.css('background', configData.popupBackgroundColor)
							.css('color', configData.popupTextColor)
							.css('padding', configData.popupInnerPadding + 'px');
							
						if (mediaCaption.length > 0) {
							
							popupDisplay
								.css('padding-bottom', configData.captionAreaHeight + 'px');
							
							mediaCaption
								.css('position', 'absolute')
								.css('left', '0')
								.css('bottom', '0')
								.css('width', '100%')
								.css('text-align', 'center')
								.css('height', configData.captionAreaHeight + 'px')
								.css('line-height', configData.captionAreaHeight + 'px');
								
							if (configData.captionTextSize)
								mediaCaption.css('font-size', configData.captionTextSize);
						
						}
							
						if (closeControl.length > 0)
							closeControl
								.html(configData.closeButtonText)
								.css('font-size', configData.closeButtonFontSize)
								.css('background', configData.closeButtonBackgroundColor)
								.css('color', configData.closeButtonTextColor)
								.css('display', 'block')
								.css('width', '40px')
								.css('height', '40px')
								.css('line-height', '40px')
								.css('text-align', 'center')
								.css('position', 'absolute')
								.css('text-decoration', 'none')
								.css('outline', '0')
								.css('top', '0')
								.css('right', '-40px');
								
						if (loadingSpinner.length > 0) {
							
							loadingSpinner
								.html('')
								.css('position', 'relative')
								.css('font-size', configData.loaderFontSize)
								.on('startSpinningAnimation', function(event) {
									
									var spinnerElement = domObject('<div>' + configData.loaderText + '</div>');
									
									spinnerElement
										.css('height', Math.floor(configData.popupInitialHeight / 2) + 'px')
										.css('overflow', 'hidden')
										.css('line-height', Math.floor(configData.popupInitialHeight / 2) + 'px')
										.css('text-align', 'center')
										.css('margin-top', Math.floor((popupDisplay.height() - spinnerElement.height() + (mediaCaption.length > 0 ? mediaCaption.height() : 0)) / 2))
										.css('color', (configData.popupTextColor ? configData.popupTextColor : ''))
										.on('fadeInPulse', function() { spinnerElement.fadeTo(300, 0.5, function() { spinnerElement.trigger('fadeOutPulse'); }); })
										.on('fadeOutPulse', function() { spinnerElement.fadeTo(300, 0.05, function() { spinnerElement.trigger('fadeInPulse'); }); })
										.trigger('fadeInPulse');
									
									loadingSpinner.append(spinnerElement);
								
								})
								.on('stopSpinningAnimation', function(event) {
									
									var spinnerElement = loadingSpinner.find('div');
									spinnerElement.remove();
								
								});
						
						}
						
						if (allNavigation.length === 2) {
							
							allNavigation
								.css('font-size', '75px')
								.css('text-align', 'center')
								.css('color', '#fff')
								.css('text-shadow', 'none')
								.css('height', '100%')
								.css('position', 'absolute')
								.css('top', '0')
								.css('opacity', '0.35')
								.css('cursor', 'pointer')
								.css('box-shadow', 'inset 0px 0px 10px 0px rgba(0,0,0,0)')
								.myLib_inhibitSelection();

							var nextNavWidth, prevNavWidth;

							if (configData.enablePopupClickClose) {
							
								nextNavWidth = '100px';
								prevNavWidth = '100px';
							
							}
							else {
								
								nextNavWidth = '75%';
								prevNavWidth = '25%';
							
							}
							
							nextNavigation
								.css('right', '0')
								.css('width', nextNavWidth)
								.html('<div style="position: absolute; height: 100px; width: 125px; top: 50%; right: 0; margin-top: -50px;">&gt;</div>');

							prevNavigation
								.css('left', '0')
								.css('width', prevNavWidth)
								.html('<div style="position: absolute; height: 100px; width: 125px; top: 50%; left: 0; margin-top: -50px;">&lt;</div>');
						
						}
					
					}
			
			// Main event handlers
				browserWindow
					.on('resize orientationchange', function() {
						refreshDimensions();
					});

				mediaCaption
					.on('updateCaptionText', function(event, captionString) {
						
						if (!captionString || captionString.length === 0)
							captionString = configData.emptyCaptionText;
						
						mediaCaption.html(captionString);
					
					});
				
				closeControl
					.css('cursor', 'pointer')
					.on('click', function(event) {
						
						event.preventDefault();
						event.stopPropagation();
					
						popupDisplay.trigger('myLib_closePopup');
						
						return true;
					
					});

				nextNavigation
					.on('click', function() {
						popupDisplay.trigger('myLib_nextMedia');
					});

				prevNavigation
					.on('click', function() {
						popupDisplay.trigger('myLib_previousMedia');
					});

				overlayContainer
					.css('position', 'fixed')
					.css('left', 0)
					.css('top', 0)
					.css('z-index', configData.baseLayerIndex)
					.css('width', '100%')
					.css('height', '100%')
					.css('text-align', 'center')
					.css('cursor', 'pointer')
					.appendTo(configData.appendToElement)
					.prepend('<div style="display:inline-block;height:100%;vertical-align:middle;"></div>')
					.append('<div style="position:absolute;left:0;top:0;width:100%;height:100%;background:' + configData.overlayColorValue + ';opacity:' + configData.overlayTransparency + ';filter:alpha(opacity=' + (configData.overlayTransparency * 100) + ');"></div>')
					.hide()
					.on('touchmove', function(event) {
						return false;
					})
					.on('click', function(event) {

						event.preventDefault();
						event.stopPropagation();

						popupDisplay.trigger('myLib_closePopup');

					});
				
				if (configData.enablePopupClickClose) {

					mediaContainer
						.css('cursor', 'pointer')
						.on('click', function(event) {

							event.preventDefault();
							event.stopPropagation();

							popupDisplay.trigger('myLib_closePopup');

						});

				}

				popupDisplay
					.css('display', 'inline-block')
					.css('vertical-align', 'middle')
					.css('position', 'relative')
					.css('z-index', 1)
					.appendTo(overlayContainer)
					.hide()
					.on('myLib_nextMedia', function() {
						
						var nextIndex = currentMediaPosition + 1;

						if (nextIndex >= mediaQueue.length)
							nextIndex = 0;
						
						popupDisplay.trigger('myLib_changeMedia', [nextIndex]);
					
					})
					.on('myLib_previousMedia', function() {
					
						var prevIndex = currentMediaPosition - 1;
					
						if (prevIndex < 0)
							prevIndex = mediaQueue.length - 1;
					
						popupDisplay.trigger('myLib_changeMedia', [prevIndex]);
					
					})
					.on('myLib_resetPopup', function() {
						
						refreshDimensions();

						popupDisplay
							.data('width', configData.popupInitialWidth)
							.data('height', configData.popupInitialHeight);

						loadingSpinner.hide().trigger('stopSpinningAnimation');
						mediaCaption.hide();
						closeControl.hide();
						allNavigation.hide();
						mediaContainer.hide();
						displayedMedia.detach();
					
					})
					.on('myLib_openPopup', function(event, mediaIndex) {
					
						if (operationLocked)
							return true;
					
						operationLocked = true;
					
						if (configData.blockBodyScroll)
							documentBody.css('overflow', 'hidden');

						if (configData.onPopupOpened)
							(configData.onPopupOpened)();

						overlayContainer
							.fadeTo(configData.transitionDuration, 1.0, function() {
								popupDisplay.trigger('myLib_changeMedia', [mediaIndex, true]);
							});

					})
					.on('myLib_changeMedia', function(event, newIndex, bypassLock) {
						
						var currentMediaItem, mediaObject;

						if (!bypassLock && operationLocked)
							return true;
						
						operationLocked = true;

						popupDisplay
							.css('width', popupDisplay.data('width'))
							.css('height', popupDisplay.data('height'));
							
						// Clear previous content
							mediaCaption.hide();
							if (displayedMedia.attr('src'))
								displayedMedia.attr('src', '');
							displayedMedia.detach();
							
						// Activate new media object
							currentMediaItem = mediaQueue[newIndex];
							displayedMedia = currentMediaItem.mediaElement;
							displayedMedia.off('load');
						
							mediaContainer
								.css('text-indent', '-9999px')
								.show()
								.append(displayedMedia);

							if (currentMediaItem.mediaType === 'ajax')
								domObject.get(currentMediaItem.sourceUrl, function(responseData) {
									
									displayedMedia.html(responseData);
									displayedMedia.trigger('load');
								
								});
							else
								displayedMedia.attr('src', currentMediaItem.sourceUrl);
							
							if (currentMediaItem.mediaType !== 'image')
								displayedMedia
									.css('position', 'relative')
									.css('outline', '0')
									.css('z-index', configData.baseLayerIndex + 100)
									.width(currentMediaItem.width)
									.height(currentMediaItem.height);

						// Initialize display
							loadingSpinner.trigger('startSpinningAnimation').fadeIn(300);
							popupDisplay.show();

						if (configData.popupFixedSize) {
							
							popupDisplay
								.width(configData.popupInitialWidth)
								.height(configData.popupInitialHeight);

							displayedMedia.load(function() {
							
								displayedMedia.off('load');
								loadingSpinner.hide().trigger('stopSpinningAnimation');
								mediaCaption.trigger('updateCaptionText', [currentMediaItem.captionText]).fadeIn(configData.transitionDuration);
								closeControl.fadeIn(configData.transitionDuration);
								mediaContainer.css('text-indent', 0).hide().fadeIn(configData.transitionDuration, function() { operationLocked = false; });
								currentMediaPosition = newIndex;
								allNavigation.fadeIn(configData.transitionDuration);

							});
						
						}
						else {
							
							displayedMedia.load(function() {
								
								refreshDimensions();

								displayedMedia.off('load');
								loadingSpinner.hide().trigger('stopSpinningAnimation');

								var	mediaActualWidth = displayedMedia.width(),
									mediaActualHeight = displayedMedia.height(),
									postLoadAction = function() {

										mediaCaption.trigger('updateCaptionText', [currentMediaItem.captionText]).fadeIn(configData.transitionDuration);
										closeControl.fadeIn(configData.transitionDuration);
										mediaContainer.css('text-indent', 0).hide().fadeIn(configData.transitionDuration, function() { operationLocked = false; });
										currentMediaPosition = newIndex;
										allNavigation.fadeIn(configData.transitionDuration);

										popupDisplay
											.data('width', mediaActualWidth)
											.data('height', mediaActualHeight)
											.css('width', 'auto')
											.css('height', 'auto');

									};