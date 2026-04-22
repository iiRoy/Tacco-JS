(function(globalReference, jQuery) {

  // A brief note: This module provides a smooth page transition effect,
  // revealing elements in a sequence and then fading them out upon navigation.
  // Version 1.0.1 - heavily refactored and extended.

  /**
   * Main plugin initialization function for jQuery.
   * Attaches the transitionReveal functionality to selected elements.
   * @param {object} userConfiguration - Custom settings provided by the user.
   * @returns {jQuery} - The jQuery object for chaining.
   */
  jQuery.fn.transitionReveal = function(userConfiguration) {
    // Merge default settings with user-provided options.
    // Ensure defaults are not mutated by creating a new object.
    const currentSettings = jQuery.extend(
      {},
      jQuery.fn.transitionReveal.defaultOptions,
      userConfiguration
    );

    // Validate essential configuration properties.
    if (!currentSettings.animationDuration || currentSettings.animationDuration < 0) {
      console.warn("TransitionReveal: Invalid 'animationDuration' provided. Using default.");
      currentSettings.animationDuration = jQuery.fn.transitionReveal.defaultOptions.animationDuration;
    }
    if (typeof currentSettings.easingFunction !== 'string' || !currentSettings.easingFunction.trim()) {
      console.warn("TransitionReveal: Invalid 'easingFunction' provided. Using default.");
      currentSettings.easingFunction = jQuery.fn.transitionReveal.defaultOptions.easingFunction;
    }

    // Reference to the main HTML element for global state management.
    const rootElement = jQuery('html');

    // Store essential state variables directly on the root HTML element's data.
    // This allows access across different instances and methods of the plugin.
    rootElement.data('_reveal_target_container', this); // The container element this plugin was called on.
    rootElement.data('_reveal_is_animating_in', false); // Flag to track if reveal animation is active.
    rootElement.data('_reveal_is_animating_out', false); // Flag to track if conceal animation is active.
    rootElement.data('_reveal_current_mode', currentSettings.displayMode); // 'class' or 'children'
    rootElement.data('_reveal_animation_duration', currentSettings.animationDuration);
    rootElement.data('_reveal_easing_function', currentSettings.easingFunction);

    // Dynamically generate the alphabetical sequence for class-based revelation.
    // This replaces the hardcoded 'a' through 'z' array.
    const charSequence = Array.from({
      length: 26
    }, (_, i) => String.fromCharCode(97 + i));
    rootElement.data('_reveal_initial_sequence', charSequence);

    // Private variables for the current plugin instance.
    const targetContainer = this; // The jQuery object on which `.transitionReveal()` was called.
    let preloaderHtmlContent = ''; // Holds the HTML string for the preloader.
    let revealedOrderTracker = []; // Stores the order of elements revealed for later concealment.
    let childElementCollection = []; // Stores child elements when in 'children' mode.

    // --- Preloader Generation Logic ---
    // Construct the preloader HTML based on configuration.
    // Prioritizes custom HTML if provided.
    if (currentSettings.customPreloaderHtml && currentSettings.customPreloaderHtml.trim() !== '') {
      preloaderHtmlContent = currentSettings.customPreloaderHtml;
    } else {
      // Basic validation for preloader dimensions.
      const safeWidth = Math.max(1, currentSettings.preloaderWidthPx);
      const safeHeight = Math.max(1, currentSettings.preloaderHeightPx);

      // Calculate negative margins for perfect centering using Math.floor.
      const marginX = Math.floor(safeWidth / 2);
      const marginY = Math.floor(safeHeight / 2);

      preloaderHtmlContent = `
        <div class="page-preloader" style="position:absolute;top:50%;left:50%;
        width:${safeWidth}px;height:${safeHeight}px;
        margin-top:-${marginY}px;margin-left:-${marginX}px;">
          <img src="${currentSettings.preloaderImagePath}" alt="Loading..."
          width="${safeWidth}" height="${safeHeight}" border="0" />
        </div>
      `;
    }

    // --- Preloader Insertion ---
    // If enabled, prepend the generated preloader HTML to the document body.
    if (currentSettings.usePreloader) {
      jQuery(globalReference.document.body).prepend(preloaderHtmlContent);
    }

    /**
     * Recursively reveals elements one by one with a fade-in animation.
     * @param {number} currentIdx - The current index in the sequence of elements to reveal.
     * @param {string} completionCallback - A string representing the function to call after all elements are revealed.
     */
    function processRevealAnimation(currentIdx, completionCallback) {
      // Prevent new reveal animation if a conceal animation is already in progress.
      if (rootElement.data('_reveal_is_animating_out') === true) {
        console.log("TransitionReveal: Conceal animation in progress, halting reveal.");
        return;
      }

      // Set state to indicate reveal animation is active.
      rootElement.data('_reveal_is_animating_in', true);

      const nextIdx = currentIdx + 1;
      let currentDomItem; // The jQuery object for the element currently being animated.
      let elementIdentifier; // The identifier (class or index) of the current element.

      // Determine the element to animate based on the configured display mode.
      if (rootElement.data('_reveal_current_mode') === 'children') {
        if (currentIdx >= childElementCollection.length) {
          // All children processed, complete the animation.
          finalizeRevealAnimation(completionCallback);
          return;
        }
        currentDomItem = jQuery(childElementCollection[currentIdx]);
        elementIdentifier = `child[${currentIdx}]`; // For tracking purposes.
      } else { // Mode is 'class'
        const alphaSequence = rootElement.data('_reveal_initial_sequence');
        if (currentIdx >= alphaSequence.length) {
          // All classes processed, complete the animation.
          finalizeRevealAnimation(completionCallback);
          return;
        }
        elementIdentifier = alphaSequence[currentIdx];
        currentDomItem = targetContainer.find(`.${elementIdentifier}`);
      }

      // Proceed only if an element was found.
      if (currentDomItem.length > 0) {
        // Set initial CSS properties and then animate opacity.
        currentDomItem.css({
            'opacity': '0',
            'display': currentSettings.elementDisplayType
          })
          .animate({
            opacity: 1
          },
          rootElement.data('_reveal_animation_duration'),
          rootElement.data('_reveal_easing_function'),
          function() {
            // Recursively call for the next element after this one completes.
            processRevealAnimation(nextIdx, completionCallback);
          }
          );
        revealedOrderTracker.push(elementIdentifier); // Track the order of revealed elements.
      } else {
        // No more elements to animate in the sequence, finalize.
        finalizeRevealAnimation(completionCallback);
      }
    }

    /**
     * Finalizes the reveal animation process, updates state, and executes callback.
     * @param {string} completionCallback - The string callback to execute.
     */
    function finalizeRevealAnimation(completionCallback) {
      rootElement.data('_reveal_final_sequence', revealedOrderTracker.reverse()); // Store reversed order for fade-out.
      rootElement.data('_reveal_is_animating_in', false); // Mark reveal animation as complete.

      // Execute the completion callback if provided.
      if (completionCallback && typeof completionCallback === 'string' && completionCallback.trim() !== '') {
        try {
          // Using eval for direct functional equivalence to the original code.
          // In a real-world scenario, this would be replaced with a safer function call
          // if completionCallback was guaranteed to be a function reference.
          eval(completionCallback);
        } catch (error) {
          console.error("TransitionReveal: Error executing onRevealComplete callback:", error);
        }
      } else if (typeof completionCallback === 'function') {
        // If it was passed as a function directly (though original was string)
        completionCallback();
      }
    }


    // --- Document Ready / Window Load Handler ---
    // This ensures the preloader is removed and the reveal animation starts
    // only after all page resources (images, etc.) have fully loaded.
    jQuery(globalReference).on('load', function() {
      // Remove the preloader element from the DOM.
      jQuery('.page-preloader').remove();

      // Initiate the reveal animation based on the configured mode.
      if (rootElement.data('_reveal_current_mode') === 'children') {
        // Get all direct children of the target container, excluding scripts and line breaks.
        const rawChildElements = targetContainer.children(':not(script, br)');
        childElementCollection = jQuery.makeArray(rawChildElements); // Convert to a standard array.
        processRevealAnimation(0, currentSettings.onRevealComplete);
      } else {
        // Start class-based animation.
        processRevealAnimation(0, currentSettings.onRevealComplete);
      }
    });

    return this; // Allow jQuery method chaining.
  };


  /**
   * Public method to trigger the fade-out (conceal) animation.
   * This is typically called when navigating away from the page.
   * @param {string} [redirectionTargetUrl] - Optional URL to redirect to after animation completes.
   */
  jQuery.fn.transitionReveal.hideOut = function(redirectionTargetUrl) {
    const rootElement = jQuery('html');

    // Internal collection for children mode.
    let currentChildElements = [];

    /**
     * Recursively conceals elements by class name.
     * @param {number} elementPosition - The current index in the sequence of classes to conceal.
     */
    function concealElementsByClass(elementPosition) {
      const finalSequence = rootElement.data('_reveal_final_sequence');
      if (finalSequence && finalSequence[elementPosition]) {
        const nextElementPosition = elementPosition + 1;
        const classNameToConceal = finalSequence[elementPosition];

        // Find and animate elements with the current class name.
        jQuery(`.${classNameToConceal}`).animate({
            opacity: 0
          },
          rootElement.data('_reveal_animation_duration'),
          rootElement.data('_reveal_easing_function'),
          function() {
            jQuery(this).css('display', 'none'); // Hide element after fade-out.
            concealElementsByClass(nextElementPosition); // Process next element.
          }
          );
      } else {
        // All class-based elements concealed.
        rootElement.data('_reveal_is_animating_in', false); // Reset reveal state.
        if (redirectionTargetUrl) {
          globalReference.location.href = redirectionTargetUrl; // Redirect if URL provided.
        }
      }
    }

    /**
     * Recursively conceals child elements.
     * @param {number} elementPosition - The current index in the array of child elements.
     * @param {Array<HTMLElement>} elementList - The array of child elements to process.
     */
    function concealChildElements(elementPosition, elementList) {
      // Ensure we have a valid element at the current position and it's not a script/br/a tag.
      // (Original code included 'a' tag exclusion, replicating here.)
      if (elementList && elementList[elementPosition] &&
        !jQuery(elementList[elementPosition]).is('script, br, a')) {
        const nextElementPosition = elementPosition + 1;
        const currentChild = jQuery(elementList[elementPosition]);

        currentChild.animate({
            opacity: 0
          },
          rootElement.data('_reveal_animation_duration'),
          rootElement.data('_reveal_easing_function'),
          function() {
            jQuery(this).css('display', 'none'); // Hide element after fade-out.
            concealChildElements(nextElementPosition, elementList); // Process next child.
          }
          );
      } else {
        // All relevant children concealed.
        rootElement.data('_reveal_is_animating_in', false); // Reset reveal state.
        if (redirectionTargetUrl) {
          globalReference.location.href = redirectionTargetUrl; // Redirect if URL provided.
        }
      }
    }

    // --- Concealment Logic Entry Point ---
    // Only proceed if no reveal animation is currently active.
    if (rootElement.data('_reveal_is_animating_in') === false) {
      rootElement.data('_reveal_is_animating_out', true); // Set state to indicate conceal animation is active.

      if (rootElement.data('_reveal_current_mode') === 'children') {
        const targetContainerRef = rootElement.data('_reveal_target_container');
        if (targetContainerRef && targetContainerRef.length > 0) {
          const rawChildren = targetContainerRef.children(':not(script, br)');
          const processedChildren = jQuery.makeArray(rawChildren);
          currentChildElements = processedChildren.reverse(); // Reverse for typical fade-out order.
          concealChildElements(0, currentChildElements);
        } else {
          console.warn("TransitionReveal: Target container not found for children mode concealment.");
          // Fallback to direct redirect if no container.
          if (redirectionTargetUrl) {
            globalReference.location.href = redirectionTargetUrl;
          }
        }
      } else { // Mode is 'class'
        concealElementsByClass(0);
      }
    } else {
      console.log("TransitionReveal: Reveal animation in progress, cannot initiate conceal.");
      // If reveal is active, consider a direct redirect if a URL was provided,
      // as conceal cannot proceed.
      if (redirectionTargetUrl) {
        globalReference.location.href = redirectionTargetUrl;
      }
    }
  };


  /**
   * Default configuration options for the transitionReveal plugin.
   * These can be overridden during plugin initialization.
   */
  jQuery.fn.transitionReveal.defaultOptions = Object.freeze({
    displayMode: 'class', // 'class' or 'children'. Determines how elements are selected for animation.
    animationDuration: 500, // Duration of the fade animation in milliseconds.
    easingFunction: 'linear', // Easing function for the animation (e.g., 'linear', 'swing').
    elementDisplayType: 'block', // CSS 'display' property for revealed elements.
    usePreloader: true, // Whether to display a preloader while the page loads.
    preloaderImagePath: 'loading.gif', // Path to the preloader image.
    preloaderWidthPx: 50, // Width of the preloader image in pixels.
    preloaderHeightPx: 50, // Height of the preloader image in pixels.
    customPreloaderHtml: '', // Custom HTML for the preloader. Overrides image settings if provided.
    onRevealComplete: '' // JavaScript string or function to execute after all elements are revealed.
  });

})(window, jQuery);