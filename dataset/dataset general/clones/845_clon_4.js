(function () {

    // A utility to fetch data from JSONP endpoints.
    // Replaces jQuery.getJSON for JSONP requests.
    function obtainRemoteData(endpointUrl, requestParams, callbackFunction) {
        const uniqueCallbackName = `jsonp_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
        window[uniqueCallbackName] = (responseData) => {
            callbackFunction(responseData);
            delete window[uniqueCallbackName];
            if (scriptElement && scriptElement.parentNode) {
                scriptElement.parentNode.removeChild(scriptElement);
            }
        };

        const urlParameters = new URLSearchParams(requestParams).toString();
        const finalUrl = `${endpointUrl.replace('callback=?', `callback=${uniqueCallbackName}`)}&${urlParameters}`;

        const scriptElement = document.createElement('script');
        scriptElement.src = finalUrl;
        scriptElement.onerror = () => {
            console.error('Failed to load JSONP script:', finalUrl);
            delete window[uniqueCallbackName];
            if (scriptElement && scriptElement.parentNode) {
                scriptElement.parentNode.removeChild(scriptElement);
            }
        };
        document.head.appendChild(scriptElement);
    }

    // Manages opacity transitions and display property for elements.
    // Replaces jQuery's .fadeTo(), .fadeOut(), and .stop(true) functionality.
    const activeElementAnimations = new Map(); // Maps element -> animationFrameId

    function manageElementVisibility(element, targetOpacity, durationMs, finalDisplayType = '', onCompletion = () => {}) {
        if (!element) return;

        // Clear any existing animation for this element (equivalent to jQuery.stop())
        const existingAnimationId = activeElementAnimations.get(element);
        if (existingAnimationId) {
            cancelAnimationFrame(existingAnimationId);
            activeElementAnimations.delete(element);
        }

        // Handle immediate transition (durationMs = 0)
        if (durationMs === 0) {
            element.style.opacity = targetOpacity.toString();
            element.style.display = targetOpacity === 0 ? 'none' : (finalDisplayType || 'block');
            onCompletion();
            return;
        }

        // Determine starting opacity (handle initial hidden state)
        const currentOpacity = parseFloat(element.style.opacity || (element.style.display === 'none' ? 0 : 1));
        const startTime = performance.now();

        // If fading in from hidden, make visible before starting animation
        if (targetOpacity > 0 && element.style.display === 'none') {
            element.style.display = finalDisplayType || 'block';
        }

        const animationStep = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / durationMs, 1);
            const interpolatedOpacity = currentOpacity + (targetOpacity - currentOpacity) * progress;

            element.style.opacity = interpolatedOpacity.toString();

            if (progress < 1) {
                activeElementAnimations.set(element, requestAnimationFrame(animationStep));
            } else {
                // Animation finished
                if (targetOpacity === 0) {
                    element.style.display = 'none'; // Equivalent to fadeOut's final state
                }
                element.style.opacity = targetOpacity.toString(); // Ensure final opacity is set
                activeElementAnimations.delete(element);
                onCompletion();
            }
        };

        activeElementAnimations.set(element, requestAnimationFrame(animationStep));
    }

    // Global named timeout management. Replicates $.doTimeout functionality.
    const globalActionScheduler = {}; // Stores { key: { id: timeoutId, action: function } }

    function scheduleGlobalAction(actionKey, delayMilliseconds, actionCallback, executeOnCancel = false) {
        // Clear any existing action for this key
        if (globalActionScheduler[actionKey]) {
            clearTimeout(globalActionScheduler[actionKey].id);
            delete globalActionScheduler[actionKey];
        }

        // If delay is 0 and not meant to be deferred, execute immediately
        if (delayMilliseconds === 0 && !executeOnCancel) {
            actionCallback();
            return;
        }

        const timeoutId = setTimeout(() => {
            if (globalActionScheduler[actionKey]) { // Ensure it wasn't cancelled prematurely
                actionCallback();
                delete globalActionScheduler[actionKey];
            }
        }, delayMilliseconds);

        globalActionScheduler[actionKey] = {
            id: timeoutId,
            callback: actionCallback,
            executeOnCancel: executeOnCancel
        };
    }

    function cancelGlobalAction(actionKey, triggerCallbackImmediately = false) {
        if (globalActionScheduler[actionKey]) {
            clearTimeout(globalActionScheduler[actionKey].id);
            if (triggerCallbackImmediately && globalActionScheduler[actionKey].callback) {
                globalActionScheduler[actionKey].callback();
            }
            delete globalActionScheduler[actionKey];
        }
    }

    // Simple templating engine. Replaces jQuery.tmpl.
    // Assumes template content in a script tag with specific ID.
    // Assumes placeholders like ${key} or {{=key}}.
    function generateHtmlFromTemplate(templateElementIdentifier, dataItems) {
        const templateSourceElement = document.getElementById(templateElementIdentifier);
        if (!templateSourceElement) {
            console.error('Template source element not found:', templateElementIdentifier);
            return '';
        }
        const templateMarkup = templateSourceElement.textContent;

        let finalRenderedHtml = '';
        if (Array.isArray(dataItems)) {
            for (const dataObject of dataItems) {
                let itemHtml = templateMarkup;
                for (const propKey in dataObject) {
                    if (Object.prototype.hasOwnProperty.call(dataObject, propKey)) {
                        // Replace ${key}
                        itemHtml = itemHtml.replace(new RegExp(`\\$\\{${propKey}\\}`, 'g'), dataObject[propKey]);
                        // Replace {{=key}}
                        itemHtml = itemHtml.replace(new RegExp(`\\{\\{=${propKey}\\}\\}`, 'g'), dataObject[propKey]);
                    }
                }
                finalRenderedHtml += itemHtml;
            }
        }
        return finalRenderedHtml;
    }

    // --- Main application logic ---

    // Part 1: Fetch and render initial shot data
    const apiEndpoint = "http://api.dribbble.com/players/johnneiner/shots?callback=?";
    const requestOptions = { per_page: 6 };

    obtainRemoteData(apiEndpoint, requestOptions, (apiResponse) => {
        if (apiResponse && apiResponse.shots) {
            const contentDisplayArea = document.getElementById("dribbble-shots");
            if (contentDisplayArea) {
                // The structure of the template is inferred as it's not provided.
                // It likely generates <li> elements, each containing a <div> for the label.
                const generatedContent = generateHtmlFromTemplate("shot-template", apiResponse.shots);
                contentDisplayArea.innerHTML = generatedContent;

                // After initial rendering, attach interactive behaviors
                initializeHoverInteraction();
            }
        }
    });

    // Part 2: Implement advanced hover interaction (cloning final_code)
    function initializeHoverInteraction() {
        let lastEngagedItem = null; // Tracks the last <li> that initiated a hover sequence. Replaces `li_cache`.
        let currentInteractionActive = false; // Flag indicating if any label is currently shown or fading in. Replaces `over`.

        const interactionContainer = document.getElementById("dribbble-shots");
        if (!interactionContainer) return;

        interactionContainer.addEventListener('mouseover', (event) => {
            const hoveredListItem = event.target.closest('li');
            if (!hoveredListItem) return;

            const labelElement = hoveredListItem.querySelector('div');
            if (!labelElement) return;

            // Scenario 1: Re-entering the exact same item while interaction is still active.
            if (lastEngagedItem === hoveredListItem && currentInteractionActive) {
                cancelGlobalAction("hideLabelTimer"); // Prevent any pending hide operation.
                return;
            }

            let activationDelayPeriod = 0;
            if (currentInteractionActive) {
                // Scenario 2: Moving from one item to another.
                cancelGlobalAction("hideLabelTimer", true); // Immediately hide the previous label.
                activationDelayPeriod = 0; // Show new label immediately.
            } else {
                // Scenario 3: Entering an item from a non-hovered state.
                cancelGlobalAction("hideLabelTimer"); // Clear any irrelevant hide timer.
                activationDelayPeriod = 500; // Delay showing the label.
            }

            lastEngagedItem = hoveredListItem; // Update the last engaged item.

            scheduleGlobalAction("showLabelTimer", activationDelayPeriod, () => {
                currentInteractionActive = true;
                manageElementVisibility(labelElement, 1.0, 200); // Fade in the label.
            });
        });

        interactionContainer.addEventListener('mouseout', (event) => {
            const exitedListItem = event.target.closest('li');
            if (!exitedListItem) return;

            // Ensure mouse truly left the LI, not just moved to a child element.
            if (event.relatedTarget && exitedListItem.contains(event.relatedTarget)) {
                return;
            }

            const labelElement = exitedListItem.querySelector('div');
            if (!labelElement) return;

            cancelGlobalAction("showLabelTimer"); // Cancel any pending show operation.
            scheduleGlobalAction("hideLabelTimer", 500, () => {
                currentInteractionActive = false;
                manageElementVisibility(labelElement, 0, 200); // Fade out the label.
            });
        });
    }

})();