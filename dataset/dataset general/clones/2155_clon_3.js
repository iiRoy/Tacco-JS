// Custom function binding utility
if (!Function.prototype.bind) {
  Object.defineProperty(Function.prototype, 'bind', {
    value: function (contextualRef) {
      // Ensure the target is an invokable entity
      if (typeof this !== "function") {
        throw new TypeError("Function.prototype.bind - The element attempting to be bound is not a function type.");
      }

      const originalArgumentsSlice = Array.prototype.slice;
      const initialArguments = originalArgumentsSlice.call(arguments, 1);
      const funcToBeBound = this;

      // A temporary constructor function to maintain prototype chain
      const temporaryNoOp = function () {};

      // The newly created bound function
      const resultantBoundFunc = function () {
        // Determine the 'this' context:
        // If the bound function is called with 'new', 'this' should refer to the new instance.
        // Otherwise, it refers to the 'contextualRef' provided, or 'window' in non-strict mode.
        const currentContext = this instanceof temporaryNoOp ? this : (contextualRef || window);
        const combinedArguments = initialArguments.concat(originalArgumentsSlice.call(arguments));
        return funcToBeBound.apply(currentContext, combinedArguments);
      };

      // Establish the prototype chain
      if (funcToBeBound.prototype) {
        temporaryNoOp.prototype = funcToBeBound.prototype;
      }
      resultantBoundFunc.prototype = new temporaryNoOp();

      return resultantBoundFunc;
    },
    writable: true,
    configurable: true
  });
}

// Self-executing anonymous function to encapsulate presentation logic
(function() {
  const currentDocument = document; // Reference to the document object
  let presentationBuildsDisabled = false; // Flag to control build animations
  let speakerNotesHidden = false; // Flag to control visibility of speaker notes

  let uniqueCounter = 0; // Counter for unique IDs
  const whitespacePattern = /\s+/; // Regex for one or more whitespace characters
  const singleElementArray = ['']; // Reusable array for single-element string splits

  /**
   * Converts an array-like object (e.g., NodeList) into a true JavaScript Array.
   * @param {ArrayLike<any>} collection - The array-like object to convert.
   * @returns {Array<any>} A new array containing the elements.
   */
  const convertToArray = function(collection) {
    return Array.prototype.slice.call(collection || [], 0);
  };

  /**
   * Retrieves an HTML element by its ID.
   * @param {string|HTMLElement} elementIdOrRef - The ID string or the element itself.
   * @returns {HTMLElement|null} The element if found, otherwise null.
   */
  const getElementByIdentifier = function(elementIdOrRef) {
    if (typeof elementIdOrRef === 'string') {
      return currentDocument.getElementById(elementIdOrRef);
    }
    return elementIdOrRef;
  };

  /**
   * Finds the first element matching a CSS selector within an optional root.
   * @param {string} selectorString - The CSS selector.
   * @param {HTMLElement|string} [contextElement] - The root element or its ID to search within.
   * @returns {HTMLElement|null} The first matching element, or null if none found.
   */
  const findFirstElement = function(selectorString, contextElement) {
    const allMatches = findAllElements(selectorString, contextElement);
    return allMatches.length > 0 ? allMatches[0] : null;
  };

  /**
   * Finds all elements matching a CSS selector within an optional root.
   * @param {string|HTMLElement|Array<HTMLElement>} selectorStringOrElements - The CSS selector, an element, or an array of elements.
   * @param {HTMLElement|string} [contextElement] - The root element or its ID to search within.
   * @returns {Array<HTMLElement>} An array of matching elements.
   */
  const findAllElements = function(selectorStringOrElements, contextElement) {
    if (!selectorStringOrElements) {
      return [];
    }
    if (typeof selectorStringOrElements !== 'string') {
      return convertToArray(selectorStringOrElements); // Already elements, just convert to array
    }

    let searchRoot = contextElement;
    if (typeof contextElement === 'string') {
      searchRoot = getElementByIdentifier(contextElement);
      if (!searchRoot) { return []; } // Root not found, no results
    }

    searchRoot = searchRoot || currentDocument; // Default to document if no root provided
    const isDocumentRoot = (searchRoot.nodeType === Node.DOCUMENT_NODE);
    const effectiveDocument = isDocumentRoot ? searchRoot : (searchRoot.ownerDocument || currentDocument);

    // If the root is not the document itself, or the query starts with a combinator,
    // we need to make the query ID-rooted to scope it correctly.
    const firstChar = selectorStringOrElements.charAt(0);
    if (!isDocumentRoot || (['>', '~', '+'].includes(firstChar))) {
      searchRoot.id = searchRoot.id || ('uniqueQueryId' + (uniqueCounter++));
      selectorStringOrElements = '#' + searchRoot.id + ' ' + selectorStringOrElements;
    }

    // Append a wildcard if the query ends with a combinator to avoid selector errors
    const lastChar = selectorStringOrElements.slice(-1);
    if (['>', '~', '+'].includes(lastChar)) {
      selectorStringOrElements += ' *';
    }

    try {
      return convertToArray(effectiveDocument.querySelectorAll(selectorStringOrElements));
    } catch (error) {
      console.warn("Invalid selector used:", selectorStringOrElements, error);
      return [];
    }
  };

  /**
   * Converts a space-separated string of classes into an array of class strings.
   * @param {string|Array<string>} classStringOrArray - The string or array of class names.
   * @returns {Array<string>} An array of class names.
   */
  const classStringToArray = function(classStringOrArray) {
    if (typeof classStringOrArray === 'string' || classStringOrArray instanceof String) {
      if (classStringOrArray.indexOf(' ') < 0) {
        singleElementArray[0] = classStringOrArray;
        return singleElementArray;
      } else {
        return classStringOrArray.split(whitespacePattern);
      }
    }
    return classStringOrArray; // Already an array or other type
  };

  /**
   * Trims leading/trailing whitespace from a string.
   * Uses String.prototype.trim if available, otherwise a regex fallback.
   * @param {string} inputString - The string to trim.
   * @returns {string} The trimmed string.
   */
  const trimString = function(inputString) {
    if (typeof String.prototype.trim === 'function') {
      return inputString.trim();
    }
    return inputString.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
  };

  /**
   * Adds one or more CSS classes to an HTML element.
   * @param {HTMLElement} targetNode - The element to modify.
   * @param {string|Array<string>} classesToAdd - Class name(s) to add.
   */
  const addCssClass = function(targetNode, classesToAdd) {
    if (!targetNode || !classesToAdd) return;
    const newClasses = classStringToArray(classesToAdd);
    let currentClassList = ' ' + targetNode.className + ' ';
    for (let i = 0; i < newClasses.length; ++i) {
      const cls = newClasses[i];
      if (cls && currentClassList.indexOf(' ' + cls + ' ') < 0) {
        currentClassList += cls + ' ';
      }
    }
    targetNode.className = trimString(currentClassList);
  };

  /**
   * Removes one or more CSS classes from an HTML element.
   * @param {HTMLElement} targetNode - The element to modify.
   * @param {string|Array<string>} [classesToRemove] - Class name(s) to remove. If undefined, all classes are removed.
   */
  const removeCssClass = function(targetNode, classesToRemove) {
    if (!targetNode) return;
    let updatedClassList;
    if (classesToRemove !== undefined) {
      const classes = classStringToArray(classesToRemove);
      updatedClassList = ' ' + targetNode.className + ' ';
      for (let i = 0; i < classes.length; ++i) {
        updatedClassList = updatedClassList.replace(' ' + classes[i] + ' ', ' ');
      }
      updatedClassList = trimString(updatedClassList);
    } else {
      updatedClassList = ''; // Clear all classes
    }

    if (targetNode.className !== updatedClassList) {
      targetNode.className = updatedClassList;
    }
  };

  /**
   * Toggles a single CSS class on an HTML element.
   * @param {HTMLElement} targetNode - The element to modify.
   * @param {string} classToToggle - The class name to toggle.
   */
  const toggleCssClass = function(targetNode, classToToggle) {
    if (!targetNode || !classToToggle) return;
    const currentClassList = ' ' + targetNode.className + ' ';
    const trimmedClass = trimString(classToToggle);
    if (currentClassList.indexOf(' ' + trimmedClass + ' ') >= 0) {
      removeCssClass(targetNode, trimmedClass);
    } else {
      addCssClass(targetNode, trimmedClass);
    }
  };


  // Feature detection for CSS properties (simplified Modernizr-like)
  const detectCssFeature = function(propertyName) {
    const tempElement = currentDocument.createElement('div');
    const vendorPrefixes = ['Webkit', 'Moz', 'O', 'ms', 'Khtml'];
    let featureSupported = false;
    let prefixedPropName;

    // Helper to capitalize first letter and camelCase CSS properties
    const toCamelCase = function(match, char) {
      return char.toUpperCase();
    };

    // Check for standard property name
    featureSupported = propertyName in tempElement.style;

    // Convert to camelCase for prefixed checks (e.g., 'transition' -> 'Transition', '-webkit-transition' -> 'WebkitTransition')
    prefixedPropName = propertyName.replace(/^(.)/, (all, char) => char.toUpperCase()).replace(/-([a-z])/ig, toCamelCase);

    // Check with vendor prefixes
    for (let i = vendorPrefixes.length - 1; i >= 0; i--) {
      if (featureSupported) {
        break; // Already found support
      }
      featureSupported = (vendorPrefixes[i] + prefixedPropName) in tempElement.style;
    }

    // Add a class to the document root indicating feature support
    const rootHtmlElement = currentDocument.documentElement;
    if (rootHtmlElement) {
        rootHtmlElement.className += ' ' + (featureSupported ? '' : 'no-') + propertyName.replace(/-/g, '');
    }

    return featureSupported;
  };

  const hasCssTransitions = detectCssFeature('transition');

  //
  // PresentationUnit class definition
  //
  const PresentationUnit = function(elementNode, indexPosition) {
    this._displayNode = elementNode; // The DOM node for this slide
    this._speakerNoteContent = ''; // Content for speaker notes

    if (this._displayNode) {
      // Extract speaker notes if available
      const associatedNote = findFirstElement('.note > section', elementNode);
      if (associatedNote && associatedNote.innerHTML) {
        this._speakerNoteContent = associatedNote.innerHTML;
      }
      // Initialize class for slides
      addCssClass(this._displayNode, 'slide distant-slide');
    }

    if (indexPosition >= 0) {
      this._slideSequenceNumber = indexPosition + 1; // 1-based index
    }

    this._initializeCounterDisplay();
    this._prepareBuildElements();
  };

  PresentationUnit.prototype = {
    _displayNode: null, // The actual DOM element
    _slideSequenceNumber: 0, // 1-based index of the slide
    _incrementalBuildList: [], // Elements that build in incrementally
    _hasBeenVisited: false, // Flag if the slide has been shown as current
    _currentVisualState: '', // Current visual state string (e.g., 'current', 'past')
    _possibleStates: [
      'distant-slide', 'far-past', 'past', 'current', 'future', 'far-future', 'distant-slide'
    ], // Ordered visual states

    /**
     * Sets the visual state of the slide.
     * @param {string|number} newState - The state string (e.g., 'current') or its index.
     */
    setVisualState: function(newState) {
      let resolvedState = newState;
      if (typeof newState === 'number') {
        resolvedState = this._possibleStates[newState];
      }

      if (!resolvedState || !this._possibleStates.includes(resolvedState)) {
        console.warn("Attempted to set invalid slide state:", newState);
        return;
      }

      if (resolvedState === 'current' && !this._hasBeenVisited) {
        this._hasBeenVisited = true;
        this._prepareBuildElements(); // Ensure builds are ready on first visit
      }

      // Remove all possible states first, then add the new one
      removeCssClass(this._displayNode, this._possibleStates);
      addCssClass(this._displayNode, resolvedState);
      this._currentVisualState = resolvedState;

      // Execute auto-animations after a short delay to allow CSS transitions to apply
      const selfRef = this;
      setTimeout(() => { selfRef._triggerAutoBuilds(); }, 400); // Delay for visual smoothness

      if (resolvedState === 'current') {
        this._handleSlideActivation();
      } else {
        this._handleSlideDeactivation();
      }
    },

    /**
     * Actions to perform when the slide becomes active.
     */
    _handleSlideActivation: function() {
      this._dispatchCustomEvent('slideactivated'); // Use a custom event name
      this._revealEmbeddedFrames();
    },

    /**
     * Actions to perform when the slide becomes inactive.
     */
    _handleSlideDeactivation: function() {
      this._dispatchCustomEvent('slidedeactivated'); // Use a custom event name
      this._concealEmbeddedFrames();
    },

    /**
     * Dispatches a custom event on the slide's DOM node.
     * @param {string} eventName - The name of the event to dispatch.
     */
    _dispatchCustomEvent: function(eventName) {
      if (!this._displayNode) return;
      const eventHandlerCode = this._displayNode.getAttribute(eventName);
      if (eventHandlerCode) {
        try {
          // Use new Function for safer evaluation than eval()
          const dynamicFunction = new Function(eventHandlerCode);
          dynamicFunction.call(this._displayNode);
        } catch (e) {
          console.error(`Error executing inline event handler for '${eventName}':`, e);
        }
      }
    },

    /**
     * Loads content into iframes when the slide is current.
     */
    _revealEmbeddedFrames: function() {
      if (!this._displayNode) return;
      const iframesOnSlide = findAllElements('iframe', this._displayNode);
      if (iframesOnSlide.length === 0) return;

      // Use a short timeout to ensure frames load after slide transition
      setTimeout(() => {
        iframesOnSlide.forEach(frameElement => {
          const sourceAttribute = frameElement.getAttribute('data-src-placeholder'); // Renamed attribute
          if (sourceAttribute && sourceAttribute.length) {
            frameElement.src = sourceAttribute;
          }
        });
      }, 50); // Slightly adjusted delay
    },

    /**
     * Clears iframe sources when the slide is not current to save resources.
     */
    _concealEmbeddedFrames: function() {
      if (!this._displayNode) return;
      const iframesOnSlide = findAllElements('iframe', this._displayNode);
      if (iframesOnSlide.length === 0) return;

      setTimeout(() => {
        iframesOnSlide.forEach(frameElement => {
          const sourceAttribute = frameElement.getAttribute('data-src-placeholder');
          if (sourceAttribute && sourceAttribute.length) {
            frameElement.src = ''; // Clear src
          }
        });
      }, 200); // Slightly adjusted delay
    },

    /**
     * Creates and appends a slide counter to the slide.
     */
    _initializeCounterDisplay: function() {
      if (!this._slideSequenceNumber || !this._displayNode) {
        return;
      }
      const counterSpan = currentDocument.createElement('span');
      counterSpan.className = 'slide-index-counter'; // Renamed class
      // The actual number is usually set by the slideshow manager, not here.
      // This just adds the element.
      this._displayNode.appendChild(counterSpan);
    },

    /**
     * Identifies and initializes elements marked for incremental display.
     */
    _prepareBuildElements: function() {
      this._incrementalBuildList = []; // Reset list
      if (presentationBuildsDisabled || !this._displayNode) {
        return;
      }
      // Find all direct children of elements with 'data-build' attribute
      const potentialBuilds = findAllElements('[data-build] > *', this._displayNode);
      this._incrementalBuildList = potentialBuilds;

      this._incrementalBuildList.forEach(element => {
        addCssClass(element, 'awaiting-build'); // Renamed class
      });
    },

    /**
     * Automatically reveals elements marked for auto-build on the current slide.
     */
    _triggerAutoBuilds: function() {
      if (this._currentVisualState !== 'current' || !this._displayNode) {
        return; // Only run for the current slide
      }

      let autoBuildElementIndex = -1;
      // Find the first element with 'data-auto-build' attribute
      for (let i = 0; i < this._incrementalBuildList.length; i++) {
          if (this._incrementalBuildList[i].hasAttribute('data-auto-build')) { // Renamed attribute
              autoBuildElementIndex = i;
              break;
          }
      }

      if (autoBuildElementIndex >= 0) {
        const elementToReveal = this._incrementalBuildList.splice(autoBuildElementIndex, 1)[0];
        const selfReference = this;

        // Function to proceed to the next auto-build step
        const continueAutoBuild = () => {
            removeCssClass(elementToReveal, 'awaiting-build');
            selfReference._triggerAutoBuilds(); // Recurse for the next auto-build
        };

        if (hasCssTransitions && elementToReveal.parentNode) {
          // Listen for transition end events if transitions are supported
          const transitionEndHandler = function(event) {
            // Ensure the event originated from the element we're animating
            if (event.target !== elementToReveal) return;
            elementToReveal.parentNode.removeEventListener('webkitTransitionEnd', transitionEndHandler, false);
            elementToReveal.parentNode.removeEventListener('transitionend', transitionEndHandler, false);
            elementToReveal.parentNode.removeEventListener('oTransitionEnd', transitionEndHandler, false);
            continueAutoBuild();
          };
          elementToReveal.parentNode.addEventListener('webkitTransitionEnd', transitionEndHandler, false);
          elementToReveal.parentNode.addEventListener('transitionend', transitionEndHandler, false);
          elementToReveal.parentNode.addEventListener('oTransitionEnd', transitionEndHandler, false);
          // Trigger transition by removing the class
          removeCssClass(elementToReveal, 'awaiting-build');
        } else {
          // Fallback for no transitions: just a timeout
          setTimeout(continueAutoBuild, 400); // Match approximate transition duration
        }
      }
    },

    /**
     * Returns the speaker notes associated with this slide.
     * @returns {string} The HTML content of the speaker notes.
     */
    getNotesForSpeaker: function() {
      return this._speakerNoteContent;
    },

    /**
     * Reveals the next incremental build element on the slide.
     * @returns {boolean} True if an element was revealed, false otherwise.
     */
    revealNextBuildStep: function() {
      if (this._incrementalBuildList.length === 0) {
        return false; // No more elements to build
      }
      const nextElement = this._incrementalBuildList.shift(); // Get and remove first element
      removeCssClass(nextElement, 'awaiting-build');
      return true;
    },
  };

  //
  // PresentationFlowHandler class
  // Manages the overall presentation state and navigation.
  //
  const PresentationFlowHandler = function(slideElements) {
    this._allSlides = (slideElements || []).map((domEl, idx) => new PresentationUnit(domEl, idx));
    this._currentSlideId = ''; // Stores the ID of the currently active slide

    // Initialize current slide based on URL hash
    const initialHash = window.location.hash;
    try {
      this._currentSlideId = initialHash;
    } catch (e) {
      console.warn("Could not read initial hash:", e);
      // Fallback if hash reading fails
    }
    this._currentSlideId = (!this._currentSlideId) ? "welcome-slide" : this._currentSlideId.replace('#', '');

    // Validate if the initial slide ID exists, if not, revert to default
    if (!getElementByIdentifier(this._currentSlideId)) {
      console.warn('Initial slide ID "%s" not found. Reverting to default "welcome-slide".', this._currentSlideId);
      // Potentially inform user if the format has changed
      // alert('The format of the permalinks have recently changed. If you are coming ' +
      //        'here from an old external link it\'s very likely you will land to the wrong slide');
      this._currentSlideId = "welcome-slide";
    }

    // Bind event listeners for keyboard, touch, and browser history
    const self = this;
    currentDocument.addEventListener('keydown', (e) => { self._handleKeyboardInput(e); }, false);
    currentDocument.addEventListener('touchstart', (e) => { self._handleTouchStart(e); }, false);
    currentDocument.addEventListener('touchend', (e) => { self._handleTouchEnd(e); }, false);
    window.addEventListener('popstate', (e) => {
        if (e.state) { self.navigateToSlide(e.state, true); }
      }, false);

    // Bind navigation buttons if they exist
    const initialNavButton = findFirstElement('#left-init-key');
    if (initialNavButton) {
      initialNavButton.addEventListener('click', () => { self.advanceSlide(); }, false);
    }

    // Bind global navigation controls
    findAllElements('#nav-prev, #nav-next').forEach(navEl => {
      navEl.addEventListener('click', self._onNavigationClick.bind(self), false);
    });

    // Bind menu command buttons
    findAllElements('menu button').forEach(menuBtn => {
      menuBtn.addEventListener('click', self._onCommandButtonClick.bind(self), false);
    });

    this._refreshPresentationState(); // Initial update
  };

  PresentationFlowHandler.prototype = {
    _globalSlideCounter: findFirstElement('#presentation-counter'), // Display for current slide number
    _menuSlideNumberDisplay: findFirstElement('#slide-no'), // Display in menu
    _speakerNoteDisplayArea: findFirstElement('#speaker-note'), // Area for speaker notes
    _helpOverlay: findFirstElement('#help-dialog'), // Renamed help element
    _allSlides: [], // Array of PresentationUnit instances
    _presentationThemes: findAllElements('.theme-stylesheet'), // Renamed theme elements

    /**
     * Determines the 1-based index of the currently active slide.
     * @returns {number} The current slide's sequence number, or 0 if not found.
     */
    _retrieveCurrentSlideIndex: function() {
      let currentIdx = 0;
      for (let i = 0; i < this._allSlides.length; i++) {
        if (this._allSlides[i]._displayNode && this._allSlides[i]._displayNode.id === this._currentSlideId) {
          currentIdx = i + 1; // 1-based index
          break;
        }
      }
      return currentIdx;
    },

    /**
     * Updates the presentation state, including slide visibility, counter, and history.
     * @param {string} [targetSlideIdentifier] - The ID of the slide to navigate to.
     * @param {boolean} [preventHistoryPush] - If true, prevents adding an entry to browser history.
     */
    _refreshPresentationState: function(targetSlideIdentifier, preventHistoryPush) {
      let currentDisplayIndex = this._retrieveCurrentSlideIndex();
      let previousDisplayIndex = currentDisplayIndex;

      if (targetSlideIdentifier) {
        this._currentSlideId = targetSlideIdentifier;
        currentDisplayIndex = this._retrieveCurrentSlideIndex();

        // If jumping a large distance, reset states of intermediate slides to 'distant'
        if (Math.abs(previousDisplayIndex - currentDisplayIndex) > 1) {
          for (let k = previousDisplayIndex; k < previousDisplayIndex + 7; k++) {
            if (this._allSlides[k - 4]) { // Adjust index for relative positioning
              this._allSlides[k - 4].setVisualState(0); // Set to 'distant-slide'
            }
          }
        }
      }

      // Update slide number displays
      if (this._globalSlideCounter) {
        this._globalSlideCounter.textContent = currentDisplayIndex.toString();
      }
      if (this._menuSlideNumberDisplay) {
        this._menuSlideNumberDisplay.textContent = currentDisplayIndex.toString();
      }

      // Update speaker notes
      if (this._speakerNoteDisplayArea && this._allSlides[currentDisplayIndex - 1]) {
        this._speakerNoteDisplayArea.innerHTML = this._allSlides[currentDisplayIndex - 1].getNotesForSpeaker();
      }

      // Update browser history (if supported and not prevented)
      if (window.history && typeof window.history.pushState === 'function') {
        if (!preventHistoryPush) {
          window.history.pushState(this._currentSlideId, 'Slide ' + this._currentSlideId, '#' + this._currentSlideId);
        }
      } else {
        window.location.hash = this._currentSlideId; // Fallback for older browsers
      }

      // Set visual states for current and surrounding slides
      for (let j = currentDisplayIndex; j < currentDisplayIndex + 7; j++) {
        if (this._allSlides[j - 4]) { // Center around current slide
          this._allSlides[j - 4].setVisualState(j - currentDisplayIndex); // Calculate relative state index
        }
      }
    },

    // Current slide ID (initialized in constructor)
    // current: '',

    /**
     * Advances to the next slide or reveals the next build step on the current slide.
     */
    advanceSlide: function() {
      const currentUnit = this._allSlides[this._retrieveCurrentSlideIndex() - 1];
      if (currentUnit && currentUnit.revealNextBuildStep()) {
        // Build step revealed, stay on current slide
      } else {
        // No more builds, move to next slide
        const nextSlideNode = findFirstElement('#' + this._currentSlideId + ' + .slide');
        const nextSlideId = nextSlideNode ? nextSlideNode.id : this._currentSlideId;
        this._refreshPresentationState(nextSlideId);
      }
    },

    /**
     * Navigates to the previous slide.
     */
    retreatSlide: function() {
      const previousSlideNode = findFirstElement('.slide:nth-child(' + (this._retrieveCurrentSlideIndex() - 1) + ')');
      const previousSlideId = previousSlideNode ? previousSlideNode.id : this._currentSlideId; // Stay if no previous
      this._refreshPresentationState(previousSlideId);
    },

    /**
     * Jumps directly to a specific slide by its ID.
     * @param {string} slideIdentifier - The ID of the slide to navigate to.
     * @param {boolean} [noHistoryEntry] - If true, prevents adding an entry to browser history.
     */
    navigateToSlide: function(slideIdentifier, noHistoryEntry) {
      if (getElementByIdentifier(slideIdentifier)) { // Only navigate if ID is valid
        this._refreshPresentationState(slideIdentifier, noHistoryEntry);
      } else {
        console.warn("Attempted to navigate to non-existent slide ID:", slideIdentifier);
      }
    },

    /**
     * Toggles the visibility of speaker notes.
     */
    toggleSpeakerNotes: function() {
      if (speakerNotesHidden || !this._speakerNoteDisplayArea) {
        return; // Do nothing if notes are globally disabled or element not found
      }
      this._speakerNoteDisplayArea.style.display = 'block'; // Ensure it's not 'none'
      toggleCssClass(this._speakerNoteDisplayArea, 'hidden-notes'); // Renamed class
    },

    /**
     * Toggles a 3D effect on the presentation.
     */
    activate3DEffect: function() {
      toggleCssClass(currentDocument.body, 'three-dimensional-view'); // Renamed class
    },

    /**
     * Toggles the syntax highlighting stylesheet.
     */
    toggleCodeHighlighting: function() {
      const syntaxHighlightLink = findFirstElement('#prettify-link');
      if (syntaxHighlightLink) {
        syntaxHighlightLink.disabled = !syntaxHighlightLink.disabled;
        sessionStorage.setItem('highlightActive', !syntaxHighlightLink.disabled); // Renamed sessionStorage key
      }
    },

    /**
     * Cycles through available presentation themes.
     */
    changePresentationTheme: function() {
      let activeSheetIndex = 0;
      // Find the currently active stylesheet
      while (activeSheetIndex < this._presentationThemes.length && this._presentationThemes[activeSheetIndex].disabled) {
        activeSheetIndex++;
      }

      if (activeSheetIndex < this._presentationThemes.length) {
        this._presentationThemes[activeSheetIndex].disabled = true; // Deactivate current
      }

      // Activate the next stylesheet in the array (loop back to start if at end)
      const nextSheetIndex = (activeSheetIndex + 1) % this._presentationThemes.length;
      const nextActiveSheet = this._presentationThemes[nextSheetIndex];
      if (nextActiveSheet) {
        nextActiveSheet.disabled = false;
        // Save the theme name to session storage
        const themeFileName = nextActiveSheet.getAttribute('href').split('/').pop();
        sessionStorage.setItem('activeTheme', themeFileName); // Renamed sessionStorage key
      }
    },

    /**
     * Toggles the visibility of the help overlay.
     */
    toggleHelpDisplay: function() {
      if (this._helpOverlay) {
        this._helpOverlay.style.display = 'block'; // Ensure it's visible before toggling class
        toggleCssClass(this._helpOverlay, 'is-hidden'); // Renamed class
      }
    },

    /**
     * Opens a new window to view the source code of the current page.
     */
    showPageSource: function() {
      window.open("view-source:" + window.location.href, '_blank'); // Added _blank for clarity
    },

    /**
     * Handles keyboard input for navigation and commands.
     * @param {KeyboardEvent} keyEvent - The keyboard event object.
     */
    _handleKeyboardInput: function(keyEvent) {
      // Ignore input if focus is on an editable element
      const targetTag = keyEvent.target.nodeName.toLowerCase();
      if (['input', 'textarea'].includes(targetTag) || keyEvent.target.isContentEditable) {
        return;
      }

      // Use a map for cleaner key handling
      const keyActions = {
        37: () => this.retreatSlide(),       // Left arrow
        39: () => this.advanceSlide(),       // Right arrow
        32: () => this.advanceSlide(),       // Spacebar
        48: () => this.toggleHelpDisplay(),  // 0
        51: () => this.activate3DEffect(),   // 3
        72: () => this.toggleCodeHighlighting(), // H
        78: () => this.toggleSpeakerNotes(), // N
        83: () => this.showPageSource(),     // S
        84: () => this.changePresentationTheme() // T
      };

      const action = keyActions[keyEvent.keyCode];
      if (action) {
        keyEvent.preventDefault(); // Prevent default browser action for handled keys
        action();
      }
    },

    _touchSwipeStartX: 0, // Stores the starting X coordinate of a touch swipe

    /**
     * Records the starting point of a touch event for swipe detection.
     * @param {TouchEvent} touchEvent - The touch event object.
     */
    _handleTouchStart: function(touchEvent) {
      if (touchEvent.touches.length > 0) {
        this._touchSwipeStartX = touchEvent.touches[0].pageX;
      }
    },

    /**
     * Processes the end of a touch event to determine if a swipe occurred.
     * @param {TouchEvent} touchEvent - The touch event object.
     */
    _handleTouchEnd: function(touchEvent) {
      if (touchEvent.changedTouches.length === 0) return;

      const deltaX = this._touchSwipeStartX - touchEvent.changedTouches[0].pageX;
      const MIN_SWIPE_DISTANCE = 150; // Minimum distance for a recognized swipe

      if (deltaX > MIN_SWIPE_DISTANCE) {
        this.advanceSlide(); // Swipe left -> next slide
      } else if (deltaX < -MIN_SWIPE_DISTANCE) {
        this.retreatSlide(); // Swipe right -> previous slide
      }
    },

    /**
     * Event handler for navigation button clicks (prev/next).
     * @param {MouseEvent} clickEvent - The click event object.
     */
    _onNavigationClick: function(clickEvent) {
      const clickedElement = clickEvent.currentTarget;
      if (clickedElement.id === 'nav-next') {
        this.advanceSlide();
      } else if (clickedElement.id === 'nav-prev') {
        this.retreatSlide();
      }
    },

    /**
     * Event handler for menu command button clicks.
     * @param {MouseEvent} clickEvent - The click event object.
     */
    _onCommandButtonClick: function(clickEvent) {
      const clickedElement = clickEvent.currentTarget;
      const command = clickedElement.getAttribute('data-command'); // Use data attribute for command
      if (command) {
        switch (command) {
          case 'toggle-help': this.toggleHelpDisplay(); break;
          case 'toggle-3d': this.activate3DEffect(); break;
          case 'toggle-highlight': this.toggleCodeHighlighting(); break;
          case 'toggle-notes': this.toggleSpeakerNotes(); break;
          case 'view-source': this.showPageSource(); break;
          case 'change-theme': this.changePresentationTheme(); break;
          default: console.warn('Unknown command:', command);
        }
      }
    }
  };

  // Auto-initialize the presentation when the DOM is ready
  currentDocument.addEventListener('DOMContentLoaded', () => {
    const slidesContainer = findAllElements('.slide'); // Assuming slides have 'slide' class
    new PresentationFlowHandler(slidesContainer);
  });

})();