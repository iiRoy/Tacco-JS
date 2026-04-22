chrome.extension.sendMessage({}, function(ackResponse) {

  // Core configuration and state management for the media playback enhancer.
  const playbackEnhancer = {
    configParams: {
      currentRate: 1.0,                   // Initial playback rate (e.g., 1.0 for normal speed)
      rateIncrement: 0.1,                 // Amount to adjust playback rate by
      skipDurationSec: 10,                // Time in seconds to skip backward
      keyRewindCode: 65,                  // Keyboard code for 'A' (rewind)
      keyDecreaseRateCode: 83,            // Keyboard code for 'S' (decrease rate)
      keyIncreaseRateCode: 68,            // Keyboard code for 'D' (increase rate)
      persistRateAcrossSessions: false    // Flag to remember rate across browser sessions
    },
    activeControllers: new Set(),         // Collection of active MediaElementController instances
    MAX_PLAYBACK_RATE: 16,                // Upper limit for playback speed in Chromium
    MIN_PLAYBACK_RATE: 0.05               // Lower limit for playback speed before audio issues
  };

  let domContentReadyIntervalId; // Timer ID for monitoring document readiness

  // Fetch user preferences from browser's synchronized storage.
  // Default values from configParams are used if no stored preferences exist.
  chrome.storage.sync.get(playbackEnhancer.configParams, function(storedValues) {
    if (storedValues) {
      // Apply stored settings, ensuring correct data types and providing fallbacks.
      playbackEnhancer.configParams.currentRate = parseFloat(storedValues.currentRate) || playbackEnhancer.configParams.currentRate;
      playbackEnhancer.configParams.rateIncrement = parseFloat(storedValues.rateIncrement) || playbackEnhancer.configParams.rateIncrement;
      playbackEnhancer.configParams.skipDurationSec = parseFloat(storedValues.skipDurationSec) || playbackEnhancer.configParams.skipDurationSec;
      playbackEnhancer.configParams.keyRewindCode = parseInt(storedValues.keyRewindCode) || playbackEnhancer.configParams.keyRewindCode;
      playbackEnhancer.configParams.keyDecreaseRateCode = parseInt(storedValues.keyDecreaseRateCode) || playbackEnhancer.configParams.keyDecreaseRateCode;
      playbackEnhancer.configParams.keyIncreaseRateCode = parseInt(storedValues.keyIncreaseRateCode) || playbackEnhancer.configParams.keyIncreaseRateCode;
      playbackEnhancer.configParams.persistRateAcrossSessions = Boolean(storedValues.persistRateAcrossSessions);
    }

    // Start an interval to periodically check if the DOM is fully loaded.
    domContentReadyIntervalId = setInterval(setupMediaHooks, 25);
  });

  /**
   * Initializes the media playback enhancer once the entire DOM is parsed and loaded.
   * Clears the readiness check interval and establishes global event listeners.
   */
  function setupMediaHooks() {
    // Proceed only when the document is complete and the body element is available.
    if (document.readyState === 'complete' && document.body) {
      clearInterval(domContentReadyIntervalId); // Stop the DOM readiness check.
      console.debug('Playback Enhancer: DOM ready, commencing media element setup.');

      /**
       * Manages the UI and behavior for a specific HTML media element (e.g., <video>, <audio>).
       */
      class MediaElementController {
        constructor(mediaElement) {
          // Input validation: Ensure a valid HTMLMediaElement is provided.
          if (!(mediaElement instanceof HTMLMediaElement)) {
            console.error('Playback Enhancer: Invalid element for controller.', mediaElement);
            return;
          }
          // Prevent duplicate control instances on the same media element.
          if (mediaElement.dataset.playbackEnhancerControlled === 'true') {
            console.debug('Playback Enhancer: Element already managed, skipping.', mediaElement);
            return;
          }

          this.mediaReference = mediaElement;
          this.controllerId = `pe-${Math.random().toString(36).substring(2, 9)}`; // Generate unique ID.
          this.mediaReference.dataset.playbackEnhancerControlled = 'true'; // Mark as controlled.
          this.mediaReference.dataset.controllerId = this.controllerId;

          // If speed persistence is off, reset the global current rate to default.
          if (!playbackEnhancer.configParams.persistRateAcrossSessions) {
            playbackEnhancer.configParams.currentRate = 1.0;
          }

          this.renderControls();          // Create and append the UI overlay.
          this.initializeMediaListeners(); // Attach media-specific event handlers.

          // Apply the initial (or remembered) playback rate to the media.
          this.mediaReference.playbackRate = playbackEnhancer.configParams.currentRate;

          playbackEnhancer.activeControllers.add(this); // Add this controller to the global set.
          console.debug(`Playback Enhancer: Controller ${this.controllerId} active for`, mediaElement);
        }

        /**
         * Retrieves the media element's current playback rate, formatted to two decimal places.
         * @returns {string} The formatted playback rate.
         */
        retrieveCurrentRate() {
          const currentRate = this.mediaReference.playbackRate;
          return (Math.round(currentRate * 100) / 100).toFixed(2);
        }

        /**
         * Disposes of the controller, removing its UI and cleaning up event listeners.
         */
        disposeController() {
          if (this.controlWrapper && this.mediaReference.parentElement) {
            this.mediaReference.parentElement.removeChild(this.controlWrapper);
          }
          // Remove media-specific listeners.
          this.mediaReference.removeEventListener('play', this.handleMediaPlay);
          this.mediaReference.removeEventListener('ratechange', this.handleRateChange);

          // Clear custom data attributes from the media element.
          delete this.mediaReference.dataset.playbackEnhancerControlled;
          delete this.mediaReference.dataset.controllerId;

          // Remove the controller instance from the global set.
          playbackEnhancer.activeControllers.delete(this);
          console.debug(`Playback Enhancer: Controller ${this.controllerId} deactivated.`);
        }

        /**
         * Constructs and inserts the UI controls (speed display, action buttons) for the media element.
         */
        renderControls() {
          const uiFragment = document.createDocumentFragment();
          const controlWrapper = document.createElement('div');
          const rateDisplay = document.createElement('span');
          const actionButtonsContainer = document.createElement('span');

          // Create individual control buttons.
          const skipBackButton = document.createElement('button');
          const decreaseRateButton = document.createElement('button');
          const increaseRateButton = document.createElement('button');

          skipBackButton.textContent = '«'; // Unicode for left arrow, indicating rewind.
          decreaseRateButton.textContent = '-';
          increaseRateButton.textContent = '+';

          // Assign data attributes to buttons for event delegation and action identification.
          skipBackButton.dataset.action = 'rewind';
          decreaseRateButton.dataset.action = 'slower';
          increaseRateButton.dataset.action = 'faster';

          actionButtonsContainer.append(skipBackButton, decreaseRateButton, increaseRateButton);
          controlWrapper.append(rateDisplay, actionButtonsContainer);

          // Apply CSS classes for styling.
          controlWrapper.classList.add('playback-enhancer-controls', `controller-${this.controllerId}`);
          actionButtonsContainer.classList.add('playback-enhancer-actions');
          rateDisplay.classList.add('playback-enhancer-rate-display');

          uiFragment.appendChild(controlWrapper);
          // Insert the control UI directly before the media element in the DOM.
          this.mediaReference.insertAdjacentElement('beforebegin', uiFragment);
          this.mediaReference.classList.add('playback-enhancer-host-media'); // Add class to the media element itself.

          // Initialize the rate display with the current playback rate.
          rateDisplay.textContent = this.retrieveCurrentRate();
          this.rateDisplay = rateDisplay;       // Store reference to the display element.
          this.controlWrapper = controlWrapper; // Store reference to the main UI container.

          this.initUIListeners(); // Attach listeners to the newly created UI.
        }

        /**
         * Sets up event listeners for the controller's UI elements.
         */
        initUIListeners() {
          // Use .bind(this) to ensure 'this' context refers to the controller instance.
          this.controlWrapper.addEventListener('click', this.handleControlClick.bind(this), true);

          // Prevent common issues with media players (like YouTube/Vimeo) entering fullscreen
          // when interacting with overlaid controls.
          this.controlWrapper.addEventListener('dblclick', this.preventFullScreen, true);
          this.controlWrapper.addEventListener('mousedown', this.preventFullScreen, true);
        }

        /**
         * Handles click events originating from within the control wrapper.
         * Delegates actions based on the clicked button's data-action attribute.
         * @param {MouseEvent} clickEvent - The DOM click event.
         */
        handleControlClick(clickEvent) {
          clickEvent.preventDefault(); // Stop default browser behavior.
          clickEvent.stopPropagation(); // Prevent event bubbling up to parent elements.

          const targetButton = clickEvent.target.closest('button');
          if (targetButton && targetButton.dataset.action) {
            executePlaybackAction(targetButton.dataset.action, this.mediaReference);
          } else if (clickEvent.target === this.controlWrapper) {
            // If the wrapper itself (not a button) is clicked, hide the controls.
            this.toggleControlsVisibility(false);
            console.debug(`Playback Enhancer: Controls for ${this.controllerId} hidden.`);
            // Original code removed the controls entirely here; hiding is a less destructive alternative.
          }
        }

        /**
         * Toggles the visibility of the control wrapper.
         * @param {boolean} show - If true, displays controls; if false, hides them.
         */
        toggleControlsVisibility(show) {
          if (this.controlWrapper) {
            this.controlWrapper.style.display = show ? '' : 'none';
          }
        }

        /**
         * Generic event handler to prevent default actions and stop propagation,
         * useful for preventing fullscreen mode or other unwanted browser behaviors.
         * @param {Event} e - The event object.
         */
        preventFullScreen(e) {
          e.preventDefault();
          e.stopPropagation();
        }

        /**
         * Attaches event listeners directly to the managed media element.
         */
        initializeMediaListeners() {
          // Using arrow functions to automatically bind 'this' to the class instance.
          this.handleMediaPlay = (playEvent) => {
            // Ensure the configured rate is applied whenever media starts playing.
            this.mediaReference.playbackRate = playbackEnhancer.configParams.currentRate;
            console.debug(`Playback Enhancer: Rate ${this.mediaReference.playbackRate} applied on play.`);
          };

          this.handleRateChange = (rateChangeEvent) => {
            // Update the UI display whenever the media's playback rate changes.
            this.rateDisplay.textContent = this.retrieveCurrentRate();
            console.debug(`Playback Enhancer: Display rate updated to ${this.retrieveCurrentRate()}.`);
          };

          this.mediaReference.addEventListener('play', this.handleMediaPlay);
          this.mediaReference.addEventListener('ratechange', this.handleRateChange);
        }
      }

      /**
       * Updates the playback rate of a given media element and, if configured, saves it to storage.
       * @param {HTMLMediaElement} mediaElem - The media element whose rate is to be updated.
       * @param {number} newRate - The desired new playback rate.
       */
      const updatePlaybackRate = (mediaElem, newRate) => {
        // Validate the new rate against defined min/max limits.
        if (isNaN(newRate) || newRate < playbackEnhancer.MIN_PLAYBACK_RATE || newRate > playbackEnhancer.MAX_PLAYBACK_RATE) {
          console.warn(`Playback Enhancer: Invalid rate (${newRate}) attempted. Rate must be between ${playbackEnhancer.MIN_PLAYBACK_RATE} and ${playbackEnhancer.MAX_PLAYBACK_RATE}.`);
          return;
        }
        mediaElem.playbackRate = newRate;
        playbackEnhancer.configParams.currentRate = newRate; // Update global config.

        // If persistence is enabled, save the new rate to browser storage.
        if (playbackEnhancer.configParams.persistRateAcrossSessions) {
          chrome.storage.sync.set({'currentRate': newRate});
        }
        console.debug(`Playback Enhancer: Playback rate set to ${newRate}.`);
      };

      /**
       * Executes a specific playback action (rewind, faster, slower) on media elements.
       * Can target a single element or all currently managed media elements.
       * @param {string} actionType - The type of action to perform ('rewind', 'faster', 'slower').
       * @param {HTMLMediaElement | null} [targetMediaElement=null] - Optional: A specific media element to act upon.
       */
      const executePlaybackAction = (actionType, targetMediaElement = null) => {
        const mediaElementsToProcess = targetMediaElement
          ? [targetMediaElement]
          : Array.from(document.querySelectorAll('video, audio')); // Query all video/audio elements.

        if (!mediaElementsToProcess.length) {
          console.debug('Playback Enhancer: No media elements found to apply action.');
          return;
        }

        mediaElementsToProcess.forEach(mediaElem => {
          // Actions are only applied to actively playing, controlled media elements.
          if (!mediaElem.paused && mediaElem.dataset.playbackEnhancerControlled === 'true') {
            try {
              let calculatedRate = mediaElem.playbackRate; // Start with current rate for calculations.
              switch (actionType) {
                case 'rewind':
                  // Ensure current time doesn't go below zero.
                  mediaElem.currentTime = Math.max(0, mediaElem.currentTime - playbackEnhancer.configParams.skipDurationSec);
                  break;
                case 'faster':
                  // Increase rate, capping at MAX_PLAYBACK_RATE.
                  calculatedRate = Math.min(mediaElem.playbackRate + playbackEnhancer.configParams.rateIncrement, playbackEnhancer.MAX_PLAYBACK_RATE);
                  updatePlaybackRate(mediaElem, calculatedRate);
                  break;
                case 'slower':
                  // Decrease rate, floor at MIN_PLAYBACK_RATE.
                  calculatedRate = Math.max(mediaElem.playbackRate - playbackEnhancer.configParams.rateIncrement, playbackEnhancer.MIN_PLAYBACK_RATE);
                  updatePlaybackRate(mediaElem, calculatedRate);
                  break;
                default:
                  console.warn(`Playback Enhancer: Unknown action type encountered: ${actionType}`);
              }
            } catch (error) {
              console.error(`Playback Enhancer: Failed to apply action "${actionType}" to media element:`, mediaElem, error);
            }
          }
        });
      };

      // Global keyboard event listener for hotkey functionality.
      document.addEventListener('keydown', (keyEvent) => {
        // Ignore key repeats (when a key is held down) to prevent over-triggering actions.
        if (keyEvent.repeat) return;

        const activeElement = document.activeElement;
        // Skip hotkeys if the user is typing in a text input, textarea, or content-editable area.
        if (activeElement && (activeElement.nodeName === 'INPUT' || activeElement.nodeName === 'TEXTAREA' || activeElement.isContentEditable)) {
          // Allow hotkeys if the input type is not 'text' or 'search' (e.g., range sliders).
          if (activeElement.nodeName === 'INPUT' && activeElement.getAttribute('type') !== 'text' && activeElement.getAttribute('type') !== 'search') {
             // Do nothing, allow hotkey to process.
          } else {
             return; // Ignore key event if it's a text input field.
          }
        }

        const pressedKeyCode = keyEvent.keyCode; // Use keyCode for broad compatibility.
        let actionWasTriggered = false;

        if (pressedKeyCode === playbackEnhancer.configParams.keyRewindCode) {
          executePlaybackAction('rewind');
          actionWasTriggered = true;
        } else if (pressedKeyCode === playbackEnhancer.configParams.keyIncreaseRateCode) {
          executePlaybackAction('faster');
          actionWasTriggered = true;
        } else if (pressedKeyCode === playbackEnhancer.configParams.keyDecreaseRateCode) {
          executePlaybackAction('slower');
          actionWasTriggered = true;
        }

        // If an action was performed, prevent default browser behavior and event propagation.
        if (actionWasTriggered) {
          keyEvent.preventDefault();
          keyEvent.stopPropagation();
        }
      }, true); // Use capture phase to ensure this listener runs before other page scripts.

      // MutationObserver to dynamically detect new video/audio elements added to the DOM.
      const mediaElementObserver = new MutationObserver(mutationsList => {
        for (const mutation of mutationsList) {
          if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            mutation.addedNodes.forEach(node => {
              // Check if the added node itself is a media element.
              if ((node instanceof HTMLVideoElement || node instanceof HTMLAudioElement) && node.readyState >= 0) {
                new MediaElementController(node);
              }
              // Recursively check for media elements within the added node's subtree.
              if (node.querySelectorAll) {
                const nestedMedia = node.querySelectorAll('video, audio');
                nestedMedia.forEach(media => {
                  if (media.readyState >= 0) { // Ensure media element is sufficiently initialized.
                    new MediaElementController(media);
                  }
                });
              }
            });
          }
        }
      });

      // Start observing the document body for changes in its child list and any descendants.
      mediaElementObserver.observe(document.body, { childList: true, subtree: true });

      // Initial scan for any media elements already present in the DOM when the script loads.
      const initialMediaElements = Array.from(document.querySelectorAll('video, audio'));
      initialMediaElements.forEach(mediaItem => {
        if (mediaItem.readyState >= 0) { // Only process if the element has started loading.
          new MediaElementController(mediaItem);
        }
      });
      console.debug(`Playback Enhancer: Initialized controllers for ${initialMediaElements.length} existing media elements.`);
    }
  }
});