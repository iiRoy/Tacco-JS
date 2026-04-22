(function()
{
	/**
	 * jQuery UI Notifier Plugin
	 * Version: 2.1.0
	 * Author: [Your Name/Alias]
	 * Description: A flexible and customizable notification bubble generator.
	 *
	 * This module provides functions to display temporary, styleable notification messages
	 * (often called "toasts" or "bubbles") on a webpage, with options for positioning,
	 * stacking, auto-dismissal, and custom styling.
	 */
	$.uiNotifier = function(contentMsg, flavor, configObject)
	{
		// --- Configuration Initialization ---
		// Ensure configObject is an object, then merge with base settings.
		// Using deep merge to handle nested objects like 'positionOffset'.
		const currentSettings = $.extend(true, {}, $.uiNotifier.baseSettings, configObject || {});

		// Basic validation: ensure content message is not empty.
		if (!contentMsg || typeof contentMsg !== 'string' || contentMsg.trim() === '') {
			console.warn("uiNotifier: Notification content message is empty or invalid. Displaying a default message.");
			contentMsg = "An important update occurred!";
		}

		// Determine the notification type, falling back to default if not specified.
		const notificationFlavor = flavor || currentSettings.bubbleType;
		const baseNotificationClass = 'ui-notification-bubble';

		// --- HTML Markup Generation ---
		// Construct the HTML for the notification bubble using a template literal for clarity.
		let bubbleMarkup = `<div class="${baseNotificationClass} alert alert-${notificationFlavor} ${currentSettings.extraClassNames ? currentSettings.extraClassNames : ''}">`;
		
		// Add a dismiss button if configured.
		if (currentSettings.isDismissible) {
			// Using a simple 'X' character, could be an SVG or an icon font.
			bubbleMarkup += `<button type="button" class="close-btn" data-action="dismiss-notification" aria-label="Close">&times;</button>`;
		}

		// Add an optional icon based on flavor. (New fragment: showIcon option)
		if (currentSettings.showIcon) {
			let iconClass = '';
			switch(notificationFlavor) {
				case 'success': iconClass = 'fas fa-check-circle'; break; // Assuming FontAwesome
				case 'error': iconClass = 'fas fa-exclamation-circle'; break;
				case 'warning': iconClass = 'fas fa-exclamation-triangle'; break;
				case 'info':
				default: iconClass = 'fas fa-info-circle'; break;
			}
			bubbleMarkup += `<i class="notification-icon ${iconClass}"></i>`;
		}

		bubbleMarkup += `<span class="notification-content">${contentMsg}</span>`;
		bubbleMarkup += `</div>`;

		// --- Vertical Position Calculation ---
		let verticalOffsetAccumulator = currentSettings.positionOffset.initialValue;
		const targetContainer = $(currentSettings.attachToContainer);
		const notificationSelector = `.${baseNotificationClass}`;

		// Determine which elements to consider for stacking.
		// Refactored the stacking logic for clarity and potential performance.
		const relevantBubbles = currentSettings.enableStacking
			? targetContainer.find(notificationSelector)
			: $(notificationSelector);

		// Calculate the cumulative offset for stacking notifications.
		// Only iterate if there are existing bubbles to stack upon.
		if (relevantBubbles.length > 0) {
			relevantBubbles.each(function() {
				const currentBubblePosition = parseInt($(this).css(currentSettings.positionOffset.anchorSide), 10);
				const currentBubbleHeight = this.offsetHeight;
				verticalOffsetAccumulator = Math.max(verticalOffsetAccumulator, currentBubblePosition + currentBubbleHeight + currentSettings.verticalGap);
			});
		}
		// If no relevant bubbles, verticalOffsetAccumulator remains its initialValue.

		// --- Visual Styling (CSS) ---
		// Define base CSS properties for the notification bubble.
		const visualSettings =
		{
			'position': (currentSettings.fixedPosition || currentSettings.attachToContainer === 'body' ? 'fixed' : 'absolute'),
			'margin': 0, // Reset default margins
			'z-index': '99999', // Higher z-index to ensure visibility above other content
			'display': 'none', // Initially hidden for fade-in effect
			'min-width': currentSettings.minimumWidth + 'px',
			'max-width': currentSettings.maximumWidth + 'px',
			'box-shadow': '0 4px 8px rgba(0,0,0,0.2)', // Added shadow for better visual depth
			'border-radius': '4px', // Slightly rounded corners for a modern look
			'padding': '10px 15px' // Default padding inside the bubble
		};

		// Apply the calculated vertical offset.
		visualSettings[currentSettings.positionOffset.anchorSide] = verticalOffsetAccumulator + 'px';

		// Create the jQuery element and apply initial styles, then append to the DOM.
		const $notificationElement = $(bubbleMarkup)
											.css(visualSettings)
											.appendTo(targetContainer);

		// --- Horizontal Alignment ---
		// Apply specific CSS for horizontal positioning based on configuration.
		switch (currentSettings.horizontalAlignment)
		{
			case "center":
				// Center alignment requires calculating margin-left based on element's width.
				$notificationElement.css(
				{
					"left": "50%",
					"transform": "translateX(-50%)", // More modern centering technique
					"margin-left": "0", // Reset any potential margin-left from old calc
					"right": "auto" // Ensure right is not conflicting
				});
				break;
			case "left":
				$notificationElement.css({"left": "20px", "right": "auto"}); // Ensure right is auto
				break;
			case "right": // Default behavior if not explicitly handled
			default:
				$notificationElement.css({"right": "20px", "left": "auto"}); // Ensure left is auto
		}
		
		// --- Display Animation ---
		// Show the notification, with or without animation based on settings.
		if (currentSettings.noAnimation) {
			$notificationElement.css({display: 'block', opacity: 1});
		} else if ($notificationElement.fadeIn) {
			$notificationElement.fadeIn(currentSettings.animationSpeed); // Use a configurable speed
		} else {
			// Fallback for environments without fadeIn or if jQuery version is old.
			$notificationElement.css({display: 'block', opacity: 1});
		}
		
		// --- Auto-Dismissal Logic ---
		// Helper function to initiate the removal process.
		const vanishBubble = () => {
			$.uiNotifier.dismissBubble($notificationElement);
		};

		let autoDismissTimer; // To store the setTimeout ID

		// Set a timer for auto-dismissal if a positive duration is specified.
		if (currentSettings.displayDuration > 0)
		{
			autoDismissTimer = setTimeout(vanishBubble, currentSettings.displayDuration);

			// Pause timer on hover, resume on mouse leave (New fragment: pauseOnHover option).
			if (currentSettings.pauseOnHover) {
				$notificationElement.hover(
					function() { clearTimeout(autoDismissTimer); },
					function() { autoDismissTimer = setTimeout(vanishBubble, currentSettings.displayDuration); }
				);
			}
		}

		// --- Manual Dismissal Handler ---
		// Attach click handler to the dismiss button.
		// Using a specific data-action attribute to differentiate from other buttons.
		$notificationElement.find("[data-action=\"dismiss-notification\"]")
							.off('click.uiNotifier') // Ensure no duplicate handlers are bound
							.on('click.uiNotifier', function(e) {
								e.preventDefault(); // Prevent default button behavior (e.g., form submission)
								// Optional confirmation before dismissal (New fragment: confirmDismiss option).
								if (currentSettings.confirmDismiss && !confirm("Are you sure you want to dismiss this notification?")) {
									return; // User cancelled dismissal, do nothing
								}
								vanishBubble();
							});

		return $notificationElement; // Return the created notification element for external manipulation.
	};

	/**
	 * Removes a notification bubble from the DOM.
	 * @param {jQuery} $bubbleElement The jQuery object representing the notification to remove.
	 */
	$.uiNotifier.dismissBubble = function($bubbleElement)
	{
		// Guard clause: Check if the element is valid, exists, and is still attached to the DOM.
		if (!$bubbleElement || !$bubbleElement.length || !$.contains(document.documentElement, $bubbleElement[0])) {
			// console.warn("uiNotifier: Attempted to dismiss a non-existent or already removed bubble.");
			return; // Do nothing if the element is not found or already gone.
		}

		// Apply fadeOut animation if available and not explicitly disabled.
		if ($bubbleElement.fadeOut && !$.uiNotifier.baseSettings.noAnimation)
		{
			return $bubbleElement.fadeOut($.uiNotifier.baseSettings.animationSpeed, function()
			{
				$bubbleElement.remove(); // Remove element from DOM after fadeOut completes.
			});
		}
		else
		{
			// Fallback: immediately remove the element if no animation or fadeOut is unavailable.
			return $bubbleElement.remove();
		}
	};

	/**
	 * Default configuration options for uiNotifier.
	 * These can be overridden when calling $.uiNotifier or by modifying $.uiNotifier.baseSettings directly.
	 */
	$.uiNotifier.baseSettings = {
		attachToContainer: "body",      // Selector for the container where notifications are appended.
        enableStacking: true,           // If true, new notifications stack below existing ones, otherwise they overlap.
		extraClassNames: '',            // Additional CSS classes for the notification wrapper.
		bubbleType: "info",             // Default type (e.g., 'info', 'success', 'warning', 'error') for styling.
		showIcon: true,                 // New: Whether to display a flavor-based icon (requires FontAwesome or similar).
		positionOffset: {
			anchorSide: "top",          // Side from which to offset ('top' or 'bottom').
			initialValue: 25            // Initial pixel offset from the anchorSide for the first notification.
		},
		horizontalAlignment: "right",   // Horizontal alignment ('left', 'center', 'right').
		minimumWidth: 280,              // Minimum width of the notification bubble in pixels.
		maximumWidth: 500,              // Maximum width of the notification bubble in pixels.
		displayDuration: 5000,          // Time in milliseconds before auto-dismissal (set to 0 to disable auto-dismiss).
		animationSpeed: 300,            // Speed of fade-in/fade-out animations in milliseconds.
		isDismissible: true,            // If true, a close button is displayed allowing manual dismissal.
		verticalGap: 12,                // Vertical spacing in pixels between stacked notifications.
		noAnimation: false,             // New: If true, skips all fade animations and notifications appear/disappear instantly.
		pauseOnHover: true,             // New: Pause auto-dismiss timer when mouse hovers over the notification.
		fixedPosition: false,           // New: Force 'fixed' positioning, overriding `attachToContainer` check for 'body'.
		confirmDismiss: false           // New: Show a confirmation dialog before manual dismissal via close button.
	};
})();