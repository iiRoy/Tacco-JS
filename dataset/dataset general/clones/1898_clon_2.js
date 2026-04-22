var MediaTextHandler = function (configParams) {

  // Configuration strings and boolean constants
  var VOID_STR = "undefined",
    TEXT_TYPE = "string",
    ACTION_TYPE = "function",
    EMPTY_STR_HTML = "&nbsp;",
    POSSIBLE_PLAY = "maybe",
    LIKELY_PLAY = "probably",
    KIND_ATTR = "type",
    SEG_ELEM = "span",
    START_ATTR = "data-begin",
    STOP_ATTR = "data-end",
    BOOL_YES = true,
    BOOL_NO = false,

    // Helper to retrieve DOM elements by their unique ID
    getElementByIdRef = function (uniqueId) {
      return document.getElementById(uniqueId);
    },

    // Flags for enabling or disabling features
    activateTranscript = (typeof configParams.enableTranscript !== VOID_STR) ? configParams.enableTranscript : BOOL_YES,
    activateSubtitles = (typeof configParams.enableCaptions !== VOID_STR) ? configParams.enableCaptions : BOOL_YES,

    // References to core DOM elements
    // Checks if a string ID or a direct DOM object was passed
    transcriptContainer = (typeof configParams.transcriptElementID === TEXT_TYPE) ? getElementByIdRef(configParams.transcriptElementID) : configParams.transcriptElementID || BOOL_NO,
    mediaPlayerElement = (typeof configParams.videoElementID === TEXT_TYPE) ? getElementByIdRef(configParams.videoElementID) : configParams.videoElementID || BOOL_NO,

    // CSS class for an active transcript
    transcriptActiveCss = configParams.transcriptEnabledClass || "TextSegment-active",

    // ID for the generated subtitle display area
    subtitleAreaId = configParams.captionID || "MediaText-display",

    // Storage for subtitle content, indexed by time
    subtitleContentMap = [],

    // DOM element where subtitles will be shown
    subtitleDisplayElement,

    // Indicator for HTML5 media API support
    modernMediaApiSupported,


    // --- Core internal functionalities ---

    // Assesses if the browser supports HTML5 video playback
    checkMediaApiCapability = function () {

      var capabilityStatus = BOOL_NO,
        mediaElem = mediaPlayerElement || BOOL_NO,
        mediaElemKind = (mediaElem && mediaElem.getAttribute(KIND_ATTR) !== VOID_STR) ? mediaElem.getAttribute(KIND_ATTR) : BOOL_NO,
        canRender = (typeof mediaElem.canPlayType !== VOID_STR);

      // If no media element, no support
      if (!mediaElem) {
        return BOOL_NO;
      }

      // Check if the primary video element type is playable
      if (mediaElemKind) {

        canRender = mediaElem.canPlayType(mediaElemKind);
        capabilityStatus = mediaElemKind && (canRender === POSSIBLE_PLAY || canRender === LIKELY_PLAY);

      } else { // If no primary type, check source elements

        if (canRender) {

          var sourceTags = mediaElem.getElementsByTagName("source");
          for (var idx = 0; idx < sourceTags.length; idx++) {
            canRender = mediaElem.canPlayType(sourceTags[idx].getAttribute(KIND_ATTR));
            if (canRender === POSSIBLE_PLAY || canRender === LIKELY_PLAY) {
              capabilityStatus = BOOL_YES;
              break;
            }
          }

        }

      }

      return capabilityStatus;

    },


    // Refreshes the displayed subtitle text based on current time
    refreshSubtitleDisplay = function (timestampVal) {
      if (typeof subtitleContentMap[timestampVal] !== VOID_STR) {
        subtitleDisplayElement.innerHTML = subtitleContentMap[timestampVal];
      }
    },

    // Event listener callback for media time updates
    mediaTimeUpdateCallback = function () {
      refreshSubtitleDisplay(parseInt(this.currentTime, 10));
    },

    // Generates the DOM element for displaying subtitles
    constructSubtitleField = function (mediaElemRef, displayId) {
      var subtitleField = getElementByIdRef(displayId);
      if (!subtitleField && typeof mediaElemRef !== VOID_STR) {
        subtitleField = document.createElement("div");
        subtitleField.id = displayId;
        subtitleField.innerHTML = EMPTY_STR_HTML;
        mediaElemRef.parentNode.appendChild(subtitleField);
      }
      return subtitleField;
    },


    // Extracts all time-coded text segments from the transcript container
    extractSegments = function (transcriptSource) {

      if (!transcriptSource) {
        return BOOL_NO;
      }

      var segmentElements = transcriptSource.getElementsByTagName(SEG_ELEM),
        extractedSubtitles = [];

      for (var idx = 0, totalSegments = segmentElements.length; idx < totalSegments; idx++) {
        var beginPoint = segmentElements[idx].getAttribute(START_ATTR);
        var endPoint = segmentElements[idx].getAttribute(STOP_ATTR);
        extractedSubtitles[beginPoint] = segmentElements[idx].innerHTML;
        extractedSubtitles[endPoint] = EMPTY_STR_HTML;
      }

      return extractedSubtitles;

    },


    // Initializes interactive functionality for the transcript
    initInteractiveTranscript = function (userDefinedSeekAction, alternativePlayer) {

      // Halt if no HTML5 support and no custom handler provided
      if (!modernMediaApiSupported && typeof userDefinedSeekAction !== ACTION_TYPE) {
        return BOOL_NO;
      }

      // Adds a class to the transcript container for styling purposes
      if (transcriptContainer.className.indexOf(transcriptActiveCss) === -1) {
        transcriptContainer.className = transcriptContainer.className + " " + transcriptActiveCss;
      }

      // Uses event delegation for click events on the transcript
      transcriptContainer.onclick = function (eventObj) {

        var domEvent = eventObj || window.event,
          eventTarget = domEvent.target || domEvent.srcElement,
          seekPosition;

        if (eventTarget.nodeName.toLowerCase() === SEG_ELEM) {

          seekPosition = eventTarget.getAttribute(START_ATTR);

          if (typeof seekPosition === VOID_STR) {
            return BOOL_NO;
          }

          // If HTML5 video is supported, use its currentTime property
          if (modernMediaApiSupported && mediaPlayerElement) {
            mediaPlayerElement.currentTime = seekPosition;
          }

          // Otherwise, invoke the user's custom video handler
          if (!modernMediaApiSupported && alternativePlayer && userDefinedSeekAction) {
            userDefinedSeekAction(alternativePlayer, seekPosition);
          }

        }

      };

    },


    // Initializes the display of subtitles
    initSubtitleDisplay = function (userDefinedSeekAction, alternativePlayer) {

      // Abort if modern API isn't present and no custom handler is given
      if (!modernMediaApiSupported && typeof userDefinedSeekAction !== ACTION_TYPE) {
        return BOOL_NO;
      }

      // Populates the subtitle array if it's empty
      if (subtitleContentMap.length === 0) {
        subtitleContentMap = extractSegments(transcriptContainer);
      }

      // Creates the subtitle display element if it doesn't exist
      if (!subtitleDisplayElement) {
        var displayTarget = (!modernMediaApiSupported && alternativePlayer) ? alternativePlayer : mediaPlayerElement;
        subtitleDisplayElement = constructSubtitleField(displayTarget, subtitleAreaId);
      }

      // Sets up the HTML5 timeupdate event listener
      if (modernMediaApiSupported) {
        mediaPlayerElement.addEventListener("timeupdate", mediaTimeUpdateCallback, BOOL_NO);
      }

      // Calls the user-defined handler for non-HTML5 scenarios
      if (!modernMediaApiSupported && alternativePlayer && userDefinedSeekAction) {
        userDefinedSeekAction(alternativePlayer, refreshSubtitleDisplay);
      }

    },

    // Provides a mechanism for handling non-HTML5 media players
    setupCompatibilityLayer = function (fallbackOptions) {

      var subtitleAction = (typeof fallbackOptions.captionHandler === ACTION_TYPE) ? fallbackOptions.captionHandler : BOOL_NO,
        transcriptAction = (typeof fallbackOptions.transcriptHandler === ACTION_TYPE) ? fallbackOptions.transcriptHandler : BOOL_NO,
        // Determines if an ID string or a direct element was provided
        alternativePlayer = (typeof fallbackOptions.targetElementIdentifier === VOID_STR) ? BOOL_NO : (typeof fallbackOptions.targetElementIdentifier === TEXT_TYPE) ? getElementByIdRef(fallbackOptions.targetElementIdentifier) : fallbackOptions.targetElementIdentifier;

      // Ensures valid parameters before proceeding
      if (!alternativePlayer || (!subtitleAction && !transcriptAction)) {
        return BOOL_NO;
      }

      if (subtitleAction) {
        initSubtitleDisplay(subtitleAction, alternativePlayer);
      }
      if (transcriptAction) {
        initInteractiveTranscript(transcriptAction, alternativePlayer);
      }

    };


  // --- Initialization sequence ---

  // Detects browser's media API capabilities
  modernMediaApiSupported = checkMediaApiCapability();

  // Activates transcript interactivity if configured
  if (activateTranscript) {
    initInteractiveTranscript();
  }

  // Activates subtitle display if configured
  if (activateSubtitles) {
    initSubtitleDisplay();
  }

  // --- Public accessible methods and properties ---
  this.playerReference = mediaPlayerElement;
  this.transcriptContainer = transcriptContainer;
  this.subtitleDisplay = subtitleDisplayElement;
  this.updateCurrentSubtitle = refreshSubtitleDisplay;
  this.isModernApiSupported = modernMediaApiSupported;
  this.registerFallback = setupCompatibilityLayer;

  return this;

};