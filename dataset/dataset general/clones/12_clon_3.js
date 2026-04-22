function WordDisplayController(vm, delayService, htmlSanitizer) {
  // Configuration constants and default values for the word display mechanism.
  const DISPLAY_SETTINGS = {
    INITIAL_PLACEHOLDER_HTML: htmlSanitizer.trustAsHtml("<span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;a-word</span>"), // Default text shown before any input
    DEFAULT_SOURCE_TEXT_CONTENT: "There is something at the bottom of every new human thought, every thought of genius, or even every earnest thought that springs up in any brain, which can never be communicated to others, even if one were to write volumes about it and were explaining one's idea for thirty-five years; there's something left which cannot be induced to emerge from your brain, and remains with you forever; and with it you will die, without communicating to anyone perhaps the most important of your ideas. - Fyodor Dostoyevsky, The Idiot",
    HIGHLIGHT_CSS_CLASS: 'reading-focus', // CSS class applied to the highlighted character
    MAX_LEADING_SPACES_COUNT: 9, // Number of leading non-breaking spaces to visually center the word
    MIN_DISPLAY_INTERVAL_MS: 20 // The absolute minimum delay between displaying words
  };

  // Private variables maintained within the controller's scope.
  let wordSegmentsCache = []; // Array storing individual words parsed from the source text.
  let activeDisplayTimeoutId = null; // Holds the ID of the current $timeout, allowing it to be cancelled.

  // Public properties exposed to the view model (vm, standing in for $scope).
  vm.currentDisplayedHtml = DISPLAY_SETTINGS.INITIAL_PLACEHOLDER_HTML;
  vm.wordIndexPointer = 0;
  vm.inputSourceText = DISPLAY_SETTINGS.DEFAULT_SOURCE_TEXT_CONTENT;
  vm.isPlaybackActive = false; // Flag indicating if the display loop is currently running.

  // Playback speed configuration grouped for better organization.
  vm.playbackParameters = {
    baseCharacterDelay: 20, // Milliseconds per character contributing to word display duration.
    overallDelayOffset: 100, // Fixed millisecond offset added to each word's display duration.
    delayAdjustmentStepSize: 10 // Increment/decrement value for speed adjustments.
  };

  /**
   * Processes the `inputSourceText` into an array of words, filtering out empty entries.
   * Resets the word pointer to the beginning.
   */
  vm.prepareTextForDisplay = function() {
    const trimmedText = String(vm.inputSourceText || '').trim();

    if (!trimmedText) {
      wordSegmentsCache = [];
      vm.wordIndexPointer = 0;
      vm.currentDisplayedHtml = htmlSanitizer.trustAsHtml('<span>&nbsp;</span>'); // Display a minimal placeholder
      return;
    }

    // Split by one or more whitespace characters and remove any resulting empty strings.
    wordSegmentsCache = trimmedText.split(/\s+/).filter(segment => segment.length > 0);
    vm.wordIndexPointer = 0; // Always reset index when new text is prepared.
  };

  /**
   * Initiates the word display sequence. Prevents multiple instances from running concurrently.
   */
  vm.startDisplaySequence = function() {
    if (vm.isPlaybackActive) {
      // If already playing, do nothing.
      return;
    }

    vm.isPlaybackActive = true;

    // Ensure word data is prepared before starting.
    if (!wordSegmentsCache || wordSegmentsCache.length === 0) {
      vm.prepareTextForDisplay();
      if (wordSegmentsCache.length === 0) {
        // If still no words after preparation, cannot start playback.
        vm.isPlaybackActive = false;
        return;
      }
    }

    // Begin the recursive display process.
    executeDisplayLoop();
  };

  /**
   * Halts the currently active word display sequence.
   * Cancels any pending display operations.
   */
  vm.stopDisplaySequence = function() {
    vm.isPlaybackActive = false;
    if (activeDisplayTimeoutId) {
      delayService.cancel(activeDisplayTimeoutId);
      activeDisplayTimeoutId = null;
    }
  };

  /**
   * Resets the entire display system: stops playback, re-prepares text, and clears the display.
   */
  vm.resetDisplaySystem = function() {
    vm.stopDisplaySequence(); // First, ensure any active display is stopped.
    vm.prepareTextForDisplay(); // Re-process the text and reset the word index.
    vm.currentDisplayedHtml = DISPLAY_SETTINGS.INITIAL_PLACEHOLDER_HTML; // Set initial placeholder.
  };

  /**
   * Decreases the delay between words, effectively increasing the reading speed.
   */
  vm.acceleratePlayback = function() {
    vm.playbackParameters.overallDelayOffset = Math.max(
      DISPLAY_SETTINGS.MIN_DISPLAY_INTERVAL_MS,
      vm.playbackParameters.overallDelayOffset - vm.playbackParameters.delayAdjustmentStepSize
    );
  };

  /**
   * Increases the delay between words, effectively decreasing the reading speed.
   */
  vm.deceleratePlayback = function() {
    vm.playbackParameters.overallDelayOffset += vm.playbackParameters.delayAdjustmentStepSize;
  };

  /**
   * Clears the source text input area and completely resets the display state.
   */
  vm.clearSourceInput = function() {
    vm.inputSourceText = "";
    wordSegmentsCache = [];
    vm.wordIndexPointer = 0;
    vm.currentDisplayedHtml = htmlSanitizer.trustAsHtml("<span>Type or paste text here...</span>"); // New prompt.
    vm.isPlaybackActive = false;
    if (activeDisplayTimeoutId) {
      delayService.cancel(activeDisplayTimeoutId);
      activeDisplayTimeoutId = null;
    }
  };

  /**
   * The core recursive function that handles displaying each word.
   * It fetches, formats, updates the view, and schedules the next word.
   */
  function executeDisplayLoop() {
    // Exit conditions: if playback is paused or all words have been displayed.
    if (!vm.isPlaybackActive || vm.wordIndexPointer >= wordSegmentsCache.length) {
      vm.isPlaybackActive = false; // Mark as inactive.
      vm.wordIndexPointer = 0; // Reset for a fresh start next time.
      vm.currentDisplayedHtml = DISPLAY_SETTINGS.INITIAL_PLACEHOLDER_HTML; // Reset display.
      return; // Stop the loop.
    }

    const currentWord = wordSegmentsCache[vm.wordIndexPointer];
    const centralCharPos = determineWordCenteringPoint(currentWord);

    // Construct the HTML for display: leading spaces + formatted word with highlight.
    const fullWordHtml = generatePaddingSpaces(centralCharPos) + highlightCharacterInWord(currentWord, centralCharPos);
    vm.currentDisplayedHtml = htmlSanitizer.trustAsHtml(fullWordHtml);

    // Advance to the next word.
    vm.wordIndexPointer++;

    // Calculate the time delay before the next word is shown.
    const nextIntervalDuration = calculateNextDisplayInterval(currentWord.length, vm.playbackParameters);

    // If playback is still active, schedule the next iteration.
    if (vm.isPlaybackActive) {
      activeDisplayTimeoutId = delayService(executeDisplayLoop, nextIntervalDuration);
    }
  }

  /**
   * Determines the 1-based index of the character to be highlighted for visual centering.
   * This logic aims to keep the visual "anchor" point relatively consistent across word lengths.
   * @param {string} targetWord - The word for which to find the focus point.
   * @returns {number} The 1-based index of the focal character.
   */
  function determineWordCenteringPoint(targetWord) {
    const len = targetWord.length;
    if (len <= 1) return 1;
    if (len <= 5) return 2;
    if (len <= 9) return 3;
    if (len <= 13) return 4;
    return 5; // Default for longer words.
  }

  /**
   * Generates a string of non-breaking spaces to precede the word, helping to center
   * the highlighted character on the display.
   * @param {number} centeringCharIndex - The 1-based index of the character that should be centered.
   * @returns {string} An HTML string containing the required number of non-breaking spaces.
   */
  function generatePaddingSpaces(centeringCharIndex) {
    // Calculate how many spaces are needed based on the fixed max and the current word's focus point.
    const requiredSpaces = DISPLAY_SETTINGS.MAX_LEADING_SPACES_COUNT - centeringCharIndex;
    // Ensure the count is not negative.
    return "&nbsp;".repeat(Math.max(0, requiredSpaces));
  }

  /**
   * Formats a given word by wrapping a specific character in a `<span>` with a highlight class.
   * @param {string} wordContent - The full text of the word.
   * @param {number} highlightPosition - The 1-based index of the character to highlight.
   * @returns {string} An HTML string of the word with the specified character highlighted.
   */
  function highlightCharacterInWord(wordContent, highlightPosition) {
    if (wordContent.length === 0) {
      return '';
    }

    // Convert 1-based position to 0-based index for string methods.
    const highlightIdx = highlightPosition - 1;

    // Handle cases where the highlight position might be outside the word's bounds.
    if (highlightIdx < 0 || highlightIdx >= wordContent.length) {
      return `<span>${wordContent}</span>`; // Return word without highlight if position is invalid.
    }

    const partBefore = wordContent.slice(0, highlightIdx);
    const highlightedChar = wordContent.slice(highlightIdx, highlightIdx + 1);
    const partAfter = wordContent.slice(highlightIdx + 1);

    return `<span>${partBefore}<span class="${DISPLAY_SETTINGS.HIGHLIGHT_CSS_CLASS}">${highlightedChar}</span>${partAfter}</span>`;
  }

  /**
   * Computes the duration (in milliseconds) for which the current word should be displayed.
   * This duration is a function of the word's length and configured playback parameters.
   * @param {number} currentWordLength - The length of the word currently being displayed.
   * @param {object} params - Object containing `baseCharacterDelay` and `overallDelayOffset`.
   * @returns {number} The calculated delay in milliseconds before the next word appears.
   */
  function calculateNextDisplayInterval(currentWordLength, params) {
    // The base calculation is roughly proportional to word length, plus a fixed offset.
    const charDependentDelay = Math.round(((currentWordLength + 2) / 2) * params.baseCharacterDelay);
    let totalCalculatedDelay = charDependentDelay + params.overallDelayOffset;

    // Ensure the delay never falls below a predefined minimum for usability.
    return Math.max(DISPLAY_SETTINGS.MIN_DISPLAY_INTERVAL_MS, totalCalculatedDelay);
  }

  // --- Controller Initialization Logic ---
  // Execute initial text preparation when the controller is first instantiated.
  vm.prepareTextForDisplay();
}