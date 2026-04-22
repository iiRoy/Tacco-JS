const createMediaTextManager = (configParameters) => {

    // Internal constants and aliases for divergent syntax
    const typeIndicator = (val, comp) => typeof val === comp;
    const stringIdentifier = 'string';
    const functionIdentifier = 'function';
    const visualGap = '&nbsp;';
    const potentialPlay = 'maybe';
    const definitePlay = 'probably';
    const mediaKindAttribute = 'type';
    const timeSegmentTag = 'span';
    const startingPointAttribute = 'data-begin';
    const endingPointAttribute = 'data-end';
    const positiveFlag = true;
    const negativeFlag = false;

    // Helper for DOM element retrieval
    const obtainElement = (selectorValue) => {
        if (typeIndicator(selectorValue, stringIdentifier)) {
            return document.querySelector(`#${selectorValue}`);
        }
        return selectorValue || negativeFlag;
    };

    // Configuration defaults and extraction using destructuring
    const {
        enableTranscript: activateTextDisplay = positiveFlag,
        enableCaptions: activateVisualText = positiveFlag,
        transcriptElementID: textDisplayId,
        videoElementID: mediaDisplayId,
        transcriptEnabledClass: textDisplayActiveModifier = "MediaTextManager-active",
        captionID: visualTextId = "MediaTextManager-overlay"
    } = configParameters;

    const textDisplayContainer = obtainElement(textDisplayId);
    const mediaDisplayUnit = obtainElement(mediaDisplayId);

    // Internal state variables using Map for divergent data structure
    let timePointCaptions = new Map();
    let visualTextOverlay;
    let mediaPlaybackCapability;

    // Determines if the media element supports HTML5 playback
    const assessMediaSupport = () => {
        if (!mediaDisplayUnit) return negativeFlag;

        const mediaKind = mediaDisplayUnit.getAttribute(mediaKindAttribute);

        const canElementPlay = (sourceKind) => {
            if (!mediaDisplayUnit.canPlayType) return negativeFlag;
            const result = mediaDisplayUnit.canPlayType(sourceKind);
            return result === potentialPlay || result === definitePlay;
        };

        if (mediaKind && canElementPlay(mediaKind)) {
            return positiveFlag;
        }

        const sourceElements = Array.from(mediaDisplayUnit.querySelectorAll('source'));
        return sourceElements.some(source => canElementPlay(source.getAttribute(mediaKindAttribute)));
    };

    // Updates the visual text overlay with content from the Map
    const presentCaptionContent = (moment) => {
        if (visualTextOverlay && timePointCaptions.has(moment)) {
            visualTextOverlay.innerHTML = timePointCaptions.get(moment);
        }
    };

    // Event handler for media time updates, calls presentCaptionContent
    const mediaTimeMonitor = function() {
        presentCaptionContent(Math.floor(this.currentTime)); // Integer seconds
    };

    // Creates the visual text overlay element if it doesn't exist
    const generateVisualTextOverlay = (targetElement, overlayId) => {
        let existingOverlay = obtainElement(overlayId);
        if (!existingOverlay && targetElement) {
            existingOverlay = document.createElement('div');
            existingOverlay.id = overlayId;
            existingOverlay.innerHTML = visualGap;
            targetElement.parentNode.appendChild(existingOverlay);
        }
        return existingOverlay;
    };

    // Extracts caption data from the transcript container using functional reduce
    const processTranscriptSegments = (container) => {
        if (!container) return new Map();

        return Array.from(container.querySelectorAll(timeSegmentTag)).reduce((accumulatorMap, segmentNode) => {
            const start = parseInt(segmentNode.getAttribute(startingPointAttribute), 10);
            const end = parseInt(segmentNode.getAttribute(endingPointAttribute), 10);
            const content = segmentNode.innerHTML;

            // Ensure valid numbers before setting
            if (!isNaN(start)) {
                accumulatorMap.set(start, content);
            }
            if (!isNaN(end)) {
                 accumulatorMap.set(end, visualGap); // Clear caption at end time
            }
            return accumulatorMap;
        }, new Map());
    };

    // Activates interactive transcript functionality with event delegation
    const activateInteractiveTranscript = (externalSeekHandler, alternativeMediaTarget) => {
        if (!textDisplayContainer || (!mediaPlaybackCapability && !typeIndicator(externalSeekHandler, functionIdentifier))) {
            return negativeFlag;
        }

        // Add class for styling
        if (!textDisplayContainer.classList.contains(textDisplayActiveModifier)) {
            textDisplayContainer.classList.add(textDisplayActiveModifier);
        }

        // Event delegation for clicks on transcript segments using closest
        textDisplayContainer.addEventListener('click', (evt) => {
            const clickedNode = evt.target.closest(timeSegmentTag);

            if (clickedNode) {
                const seekPosition = parseInt(clickedNode.getAttribute(startingPointAttribute), 10);

                if (isNaN(seekPosition)) {
                    return negativeFlag;
                }

                if (mediaPlaybackCapability && mediaDisplayUnit) {
                    mediaDisplayUnit.currentTime = seekPosition;
                } else if (alternativeMediaTarget && externalSeekHandler) {
                    externalSeekHandler(alternativeMediaTarget, seekPosition);
                }
            }
        }, negativeFlag); // Use capture: false
    };

    // Activates caption display functionality
    const activateCaptionDisplay = (externalCaptionHandler, alternativeMediaTarget) => {
        if (!textDisplayContainer || (!mediaPlaybackCapability && !typeIndicator(externalCaptionHandler, functionIdentifier))) {
            return negativeFlag;
        }

        // Populate captions if not already done
        if (timePointCaptions.size === 0) {
            timePointCaptions = processTranscriptSegments(textDisplayContainer);
        }

        // Create caption overlay if not already done
        if (!visualTextOverlay) {
            const targetForOverlay = (!mediaPlaybackCapability && alternativeMediaTarget) ? alternativeMediaTarget : mediaDisplayUnit;
            visualTextOverlay = generateVisualTextOverlay(targetForOverlay, visualTextId);
        }

        if (mediaPlaybackCapability) {
            mediaDisplayUnit.addEventListener('timeupdate', mediaTimeMonitor, negativeFlag);
        } else if (alternativeMediaTarget && externalCaptionHandler) {
            // For non-HTML5, pass the update function to the external handler
            externalCaptionHandler(alternativeMediaTarget, presentCaptionContent);
        }
    };

    // Provides a mechanism for handling non-HTML5 media players
    const registerNonStandardSupport = (supportParameters) => {
        const externalCaptionCallback = typeIndicator(supportParameters.captionHandler, functionIdentifier) ? supportParameters.captionHandler : negativeFlag;
        const externalTranscriptCallback = typeIndicator(supportParameters.transcriptHandler, functionIdentifier) ? supportParameters.transcriptHandler : negativeFlag;
        const externalMediaTarget = obtainElement(supportParameters.elementID);

        if (!externalMediaTarget || (!externalCaptionCallback && !externalTranscriptCallback)) {
            return negativeFlag;
        }

        if (externalCaptionCallback) {
            activateCaptionDisplay(externalCaptionCallback, externalMediaTarget);
        }
        if (externalTranscriptCallback) {
            activateInteractiveTranscript(externalTranscriptCallback, externalMediaTarget);
        }
    };

    // Initial setup logic
    mediaPlaybackCapability = assessMediaSupport();

    if (activateTextDisplay) {
        activateInteractiveTranscript();
    }
    if (activateVisualText) {
        activateCaptionDisplay();
    }

    // Public interface, using different property names
    return {
        associatedMedia: mediaDisplayUnit,
        transcriptSource: textDisplayContainer,
        captionOutputArea: visualTextOverlay,
        displayCurrentCaption: presentCaptionContent,
        isHtml5Capable: mediaPlaybackCapability,
        addExternalPlayerSupport: registerNonStandardSupport
    };
};