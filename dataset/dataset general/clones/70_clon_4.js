(function(global) {
    "use strict";

    // Utility function to merge configuration objects
    function combineSettings(targetObject, sourceObject) {
        for (let prop in sourceObject) {
            if (Object.prototype.hasOwnProperty.call(sourceObject, prop)) {
                targetObject[prop] = sourceObject[prop];
            }
        }
        return targetObject;
    }

    // Easing function for smooth animation (quadrilateral ease-in-out)
    function quadraticEaseInOut(time, initialValue, changeInValue, duration) {
        time /= duration / 2;
        if (time < 1) return changeInValue / 2 * time * time + initialValue;
        time--;
        return -changeInValue / 2 * (time * (time - 2) - 1) + initialValue;
    }

    // Main class for managing single-page navigation behavior
    class SectionPilot {
        constructor(domElement, customPreferences) {
            this.rootElement = domElement;
            this.navAnchors = Array.from(this.rootElement.querySelectorAll('a'));
            this.currentSettings = combineSettings({}, SectionPilot.defaultPreferences);
            combineSettings(this.currentSettings, customPreferences);

            if (this.currentSettings.anchorFilter !== '') {
                this.navAnchors = this.navAnchors.filter(linkElement => linkElement.matches(this.currentSettings.anchorFilter));
            }

            this.viewportReference = global.window;
            this.mainScrollContainer = global.document.documentElement; // Represents <html> for scrolling

            this.navAnchors.forEach(anchorElement => {
                anchorElement.addEventListener('click', this.handleAnchorInteraction.bind(this));
            });

            this.isScrollMonitoringActive = false;
            this.frameUpdatePending = false;
            this.currentlyActiveHash = null; // Stores the hash of the section currently in view
            this.isManualScrolling = false; // Flag to pause scroll monitoring during smooth scroll

            // Pre-process target section elements for efficiency
            this.targetSectionElements = this.navAnchors
                .map(anchorElement => {
                    const targetId = anchorElement.hash.substring(1);
                    return global.document.getElementById(targetId);
                })
                .filter(element => element !== null); // Only include existing elements

            this.activateViewTracker();
            this.assessViewportLocation(); // Perform an initial check
        }

        handleAnchorInteraction(eventObject) {
            const interactedAnchor = eventObject.currentTarget;
            const targetIdentifier = interactedAnchor.hash.substring(1);
            const destinationElement = global.document.getElementById(targetIdentifier);

            if (destinationElement) {
                eventObject.preventDefault();

                this.deactivateViewTracker(); // Temporarily stop scroll monitoring
                this.isManualScrolling = true;

                if (typeof this.currentSettings.preScrollHook === 'function') {
                    this.currentSettings.preScrollHook();
                }

                this.markActiveNavpoint(interactedAnchor.hash);

                this.smoothDisplacement(destinationElement, () => {
                    if (this.currentSettings.updatePageAddress && global.history.pushState) {
                        global.history.pushState(null, null, interactedAnchor.hash);
                    }

                    this.isManualScrolling = false;
                    this.activateViewTracker(); // Resume scroll monitoring

                    if (typeof this.currentSettings.postScrollHook === 'function') {
                        this.currentSettings.postScrollHook();
                    }
                });
            }
        }

        smoothDisplacement(targetElement, onCompletionCallback) {
            const startScrollY = global.window.pageYOffset;
            const finalScrollY = this.fetchBoundaryData(targetElement).top;
            const scrollDistance = finalScrollY - startScrollY;
            const animDuration = this.currentSettings.scrollDuration;
            let animationStartTime = null;

            const performAnimation = (currentTime) => {
                if (!animationStartTime) animationStartTime = currentTime;
                const elapsedTime = currentTime - animationStartTime;
                const progressRatio = Math.min(elapsedTime / animDuration, 1);
                const easedProgress = quadraticEaseInOut(elapsedTime, 0, 1, animDuration);

                global.window.scrollTo(0, startScrollY + scrollDistance * easedProgress);

                if (elapsedTime < animDuration) {
                    global.requestAnimationFrame(performAnimation);
                } else {
                    // Ensure the scroll lands precisely on the target
                    global.window.scrollTo(0, finalScrollY);
                    if (typeof onCompletionCallback === 'function') {
                        onCompletionCallback();
                    }
                }
            };

            global.requestAnimationFrame(performAnimation);
        }

        activateViewTracker() {
            if (!this.isScrollMonitoringActive) {
                this.viewportReference.addEventListener('scroll', this.handleScrollEvent.bind(this));
                this.isScrollMonitoringActive = true;
            }
        }

        deactivateViewTracker() {
            if (this.isScrollMonitoringActive) {
                this.viewportReference.removeEventListener('scroll', this.handleScrollEvent.bind(this));
                this.isScrollMonitoringActive = false;
                this.frameUpdatePending = false; // Reset requestAnimationFrame flag
            }
        }

        handleScrollEvent() {
            if (!this.frameUpdatePending && !this.isManualScrolling) {
                global.requestAnimationFrame(() => {
                    this.assessViewportLocation();
                    this.frameUpdatePending = false; // Reset flag after processing
                });
                this.frameUpdatePending = true; // Set flag to prevent multiple pending requests
            }
        }

        assessViewportLocation() {
            const currentScrollPosition = global.window.pageYOffset;
            const identifiedActiveSection = this.determineActiveSection(currentScrollPosition);

            if (identifiedActiveSection !== null && identifiedActiveSection !== this.currentlyActiveHash) {
                this.currentlyActiveHash = identifiedActiveSection;
                this.markActiveNavpoint(identifiedActiveSection);
            }
        }

        fetchBoundaryData(elementRef) {
            // Calculates element's document-relative top position, adjusted by verticalShift
            const boundingBox = elementRef.getBoundingClientRect();
            return {
                top: Math.round(boundingBox.top + global.window.pageYOffset) - this.currentSettings.verticalShift
            };
        }

        markActiveNavpoint(sectionHashValue) {
            this.navAnchors.forEach(anchorRef => {
                if (anchorRef.classList.contains(this.currentSettings.activeLinkClass)) {
                    anchorRef.classList.remove(this.currentSettings.activeLinkClass);
                }
            });

            // Find the navigation anchor whose href matches the section hash
            const targetNavAnchor = this.navAnchors.find(anchorRef => anchorRef.hash === sectionHashValue);
            if (targetNavAnchor) {
                targetNavAnchor.classList.add(this.currentSettings.activeLinkClass);
            }
        }

        determineActiveSection(scrollPointY) {
            let foundSectionHash = null;
            let initialNavHash = null;

            if (this.navAnchors.length > 0) {
                initialNavHash = this.navAnchors[0].hash;
            }

            // Map target elements to their relevant data and sort by top position
            const sortedTargets = this.targetSectionElements
                .map(element => ({
                    elementRef: element,
                    hashId: '#' + element.id,
                    topCoordinate: this.fetchBoundaryData(element).top // Use adjusted top
                }))
                .sort((a, b) => a.topCoordinate - b.topCoordinate);

            for (let i = 0; i < sortedTargets.length; i++) {
                const sectionDetails = sortedTargets[i];

                // A section is considered active if the scroll position is past its activation point.
                // The activation point is section's top coordinate minus the proximity threshold.
                if (scrollPointY >= sectionDetails.topCoordinate - this.currentSettings.proximityThreshold) {
                    foundSectionHash = sectionDetails.hashId;
                }
            }

            // Return the last found section (which is the lowest on the page that meets the criteria)
            // or the first navigation item's hash if no section is currently "active".
            return foundSectionHash || initialNavHash;
        }
    }

    // Default configuration options for the SectionPilot
    SectionPilot.defaultPreferences = {
        verticalShift: 0,
        proximityThreshold: 120,
        scrollDuration: 400,
        activeLinkClass: 'current',
        scrollEasing: 'swing', // Note: Custom easing is used, this is for semantic parity
        updatePageAddress: false,
        anchorFilter: '',
        postScrollHook: null,
        preScrollHook: null
    };

    // Global interface for initializing the navigation system
    global.TheGreatScrollNavigator = function(containerSelector, settingsObject) {
        const selectedContainers = global.document.querySelectorAll(containerSelector);
        selectedContainers.forEach(containerDOMElement => {
            new SectionPilot(containerDOMElement, settingsObject);
        });
    };

})(window);

// Polyfill for Element.prototype.matches for broader browser support
if (!Element.prototype.matches) {
    Element.prototype.matches = Element.prototype.msMatchesSelector ||
                                Element.prototype.webkitMatchesSelector ||
                                function(s) {
                                    var matches = (this.document || this.ownerDocument).querySelectorAll(s),
                                        i = matches.length;
                                    while (--i >= 0 && matches.item(i) !== this) {}
                                    return i > -1;
                                };
}