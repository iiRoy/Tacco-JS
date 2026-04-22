function createFastTapHandler(targetNodeSpecifier, activationProcedure) {
    let designatedElement;
    let gestureMoved = false;
    let engagedInteractionSubject = null;

    if (typeof targetNodeSpecifier === 'string') {
        designatedElement = document.getElementById(targetNodeSpecifier);
    } else if (targetNodeSpecifier instanceof Element) {
        designatedElement = targetNodeSpecifier;
    } else {
        return; // Invalid input, cannot proceed
    }

    if (!designatedElement) {
        return; // Element not found, cannot proceed
    }

    function retrieveDeepestElement(horizontalCoordinate, verticalCoordinate) {
        let discoveredNode = document.elementFromPoint(horizontalCoordinate, verticalCoordinate);
        if (discoveredNode && discoveredNode.nodeType === Node.TEXT_NODE) {
            discoveredNode = discoveredNode.parentNode;
        }
        return discoveredNode;
    }

    const beginTouchSequence = (eventObject) => {
        eventObject.preventDefault();
        eventObject.stopPropagation();
        gestureMoved = false;

        engagedInteractionSubject = retrieveDeepestElement(eventObject.targetTouches[0].clientX, eventObject.targetTouches[0].clientY);
        if (engagedInteractionSubject) {
            engagedInteractionSubject.classList.add('instant-tap-active');
        }

        designatedElement.addEventListener('touchmove', monitorTouchMotion, { passive: false });
        designatedElement.addEventListener('touchend', completeTouchSequence, { passive: false });
    };

    const monitorTouchMotion = (eventObject) => {
        gestureMoved = true;
        if (engagedInteractionSubject) {
            engagedInteractionSubject.classList.remove('instant-tap-active');
        }
    };

    const completeTouchSequence = (eventObject) => {
        eventObject.preventDefault();
        eventObject.stopPropagation();
        
        designatedElement.removeEventListener('touchmove', monitorTouchMotion, { passive: false });
        designatedElement.removeEventListener('touchend', completeTouchSequence, { passive: false });

        if (!gestureMoved && engagedInteractionSubject) {
            engagedInteractionSubject.classList.remove('instant-tap-active');
            activationProcedure(engagedInteractionSubject);
        }

        engagedInteractionSubject = null;
    };
    
    const suppressClickEvent = (eventObject) => {
        eventObject.stopPropagation();
        eventObject.preventDefault();
    };

    designatedElement.addEventListener('touchstart', beginTouchSequence, { passive: false });
    designatedElement.addEventListener('click', suppressClickEvent, { passive: false });

    return {
        releaseHandler: () => {
            designatedElement.removeEventListener('touchstart', beginTouchSequence, { passive: false });
            designatedElement.removeEventListener('click', suppressClickEvent, { passive: false });
            designatedElement.removeEventListener('touchmove', monitorTouchMotion, { passive: false });
            designatedElement.removeEventListener('touchend', completeTouchSequence, { passive: false });
            if (engagedInteractionSubject) {
                engagedInteractionSubject.classList.remove('instant-tap-active');
            }
        }
    };
}