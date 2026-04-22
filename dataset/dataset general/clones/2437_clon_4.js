const documentInteractionManager = (function() {
    const domElements = {};
    let currentInteractionState = 'inactive'; // 'inactive', 'pulling', 'readyToRelease', 'reloading'
    let timeAtPageTop = null; // performance.now() when window.scrollY becomes 0
    let timeOfReleaseAttempt = null; // performance.now() when user starts moving from negative scroll to positive
    let thresholdWasMet = false; // Corresponds to refreshCapable

    const initInterface = function() {
        // Create and inject HTML elements
        const indicatorDiv = document.createElement('div');
        indicatorDiv.id = 'refreshNotification';
        indicatorDiv.innerHTML = '<span class="symbol"></span><span class="caption">Updating Content...</span>';
        document.body.prepend(indicatorDiv);

        const pullZoneDiv = document.createElement('div');
        pullZoneDiv.id = 'dragToRefreshZone';
        pullZoneDiv.innerHTML = '<div class="wrapper"><span class="symbol">&nbsp;</span><div id="statusText">Drag to update</div></div>';
        document.body.prepend(pullZoneDiv);

        // Store references
        domElements.notificationDisplay = indicatorDiv;
        domElements.dragZone = pullZoneDiv;
        domElements.statusMessage = document.getElementById('statusText');
        domElements.dragSymbol = pullZoneDiv.querySelector('.symbol');

        // Initial hide
        domElements.dragZone.style.top = '-40px';
        domElements.notificationDisplay.style.display = 'none';

        // Bind event
        window.addEventListener('scroll', handleDocumentScroll);
    };

    const handleDocumentScroll = function() {
        const currentPosition = window.scrollY || window.pageYOffset;
        const nowTime = performance.now();

        let shouldUpdateVisuals = false;

        // Logic mirroring original's monitorScroll function
        if (currentPosition > 0) {
            timeAtPageTop = null; // Reset timer if scrolled down
            shouldUpdateVisuals = true; // Always update if scrolled down
        } else if (currentPosition === 0) {
            if (timeAtPageTop === null) {
                timeAtPageTop = nowTime; // Start timer when reaching top
                shouldUpdateVisuals = true; // Update immediately when hitting 0
            } else {
                const timeAtTopDuration = nowTime - timeAtPageTop;
                if (timeAtTopDuration > 500) {
                    shouldUpdateVisuals = true; // Update if stayed at 0 for > 500ms
                } else {
                    // Original's monitorScroll would NOT call runScrollCommands here
                    // if scrollUpTime was set and diff <= 500
                    shouldUpdateVisuals = false;
                }
            }
        } else { // currentPosition < 0 (pulling up)
            shouldUpdateVisuals = true; // Always update if pulling up
        }

        if (shouldUpdateVisuals) {
            updateInteractionVisuals(currentPosition, nowTime);
        }
    };

    const updateInteractionVisuals = function(scrollPos, timestamp) {
        // Logic mirroring original's runScrollCommands function

        // Pulling up (partial)
        if (scrollPos < 0 && scrollPos > -40) {
            domElements.statusMessage.textContent = "Drag to update";
            if (domElements.dragSymbol.classList.contains("invertedSign")) {
                domElements.dragSymbol.classList.remove("invertedSign");
            }
            domElements.dragZone.style.top = `${Math.abs(scrollPos) - 40}px`;

            // If user pulled past threshold and now is in partial pull zone, start release timer
            if (thresholdWasMet && timeOfReleaseAttempt === null) {
                timeOfReleaseAttempt = timestamp;
            }
            currentInteractionState = 'pulling';
        }
        // Pulling up (threshold reached)
        else if (scrollPos <= -40) {
            domElements.statusMessage.textContent = "Release to update";
            if (!domElements.dragSymbol.classList.contains("invertedSign")) {
                domElements.dragSymbol.classList.add("invertedSign");
            }
            domElements.dragZone.style.top = `0px`;
            thresholdWasMet = true;
            timeOfReleaseAttempt = null; // Reset if user pulls further up
            currentInteractionState = 'readyToRelease';
        }
        // Scrolled back down to or past zero
        else if (scrollPos >= 0) {
            domElements.dragZone.style.top = `-40px`; // Hide the pull zone

            if (thresholdWasMet) {
                // This is the release condition
                if (timeOfReleaseAttempt !== null) {
                    const releaseDuration = timestamp - timeOfReleaseAttempt;
                    if (releaseDuration < 500) {
                        initiateContentRefresh();
                    }
                } else {
                    // Original logic: "We haven't even got to set the time it was that fast, let's reload."
                    initiateContentRefresh();
                }
                // Reset state after potential reload
                thresholdWasMet = false;
                timeOfReleaseAttempt = null;
                currentInteractionState = 'inactive';
            }
        }
    };

    const initiateContentRefresh = function() {
        currentInteractionState = 'reloading';
        domElements.notificationDisplay.style.display = 'block'; // Equivalent to jQuery fadeIn display
        domElements.notificationDisplay.style.opacity = '0';
        let currentOpacity = 0;
        const fadeInAnimation = setInterval(() => {
            currentOpacity = Math.min(1, currentOpacity + 0.1); // Increment opacity towards 1
            domElements.notificationDisplay.style.opacity = currentOpacity;
            if (currentOpacity >= 1) {
                clearInterval(fadeInAnimation);
            }
        }, 30); // 10 steps * 30ms = 300ms for fade-in

        setTimeout(() => {
            window.location.reload();
        }, 750); // Original timeout before reload
    };

    return {
        start: initInterface
    };
})();

// Initialize on DOMContentLoaded, equivalent to $(document).ready()
document.addEventListener('DOMContentLoaded', documentInteractionManager.start);