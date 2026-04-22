// Helper for element animation, replacing jQuery's slide animations
function animateElementProperties(targetElement, durationMillis, finalProperties, completionCallback) {
    const startMoment = performance.now();
    const initialPropertyValues = {};
    const units = {};

    for (const propName in finalProperties) {
        const computedStyle = getComputedStyle(targetElement);
        const currentVal = parseFloat(computedStyle[propName]);
        initialPropertyValues[propName] = isNaN(currentVal) ? 0 : currentVal;
        units[propName] = propName === 'opacity' ? '' : 'px';
    }

    function animationFrame(currentTime) {
        const timeElapsed = currentTime - startMoment;
        const progressRatio = Math.min(timeElapsed / durationMillis, 1);

        for (const propName in finalProperties) {
            const startVal = initialPropertyValues[propName];
            const endVal = finalProperties[propName];
            targetElement.style[propName] = (startVal + (endVal - startVal) * progressRatio) + units[propName];
        }

        if (progressRatio < 1) {
            requestAnimationFrame(animationFrame);
        } else {
            if (completionCallback) completionCallback();
        }
    }
    requestAnimationFrame(animationFrame);
}

// Function to handle the collapsible panel interactions
function initializeInteractivePanels() {
    document.body.addEventListener('click', function(eventObject) {
        const clickedElement = eventObject.target;

        // Check if the clicked element matches the selector '.drug div h2'
        if (clickedElement.tagName === 'H2' &&
            clickedElement.parentElement && clickedElement.parentElement.tagName === 'DIV' &&
            clickedElement.parentElement.parentElement && clickedElement.parentElement.parentElement.classList.contains('drug')) {

            const associatedContent = clickedElement.nextElementSibling;
            if (!associatedContent) return; // No content to toggle

            const animationRate = 250; // Equivalent to jQuery 'fast'

            // Determine if the content is currently hidden
            const isContentHidden = associatedContent.offsetHeight === 0 || getComputedStyle(associatedContent).display === 'none';

            if (isContentHidden) {
                // Prepare to show the content
                associatedContent.style.height = '0px';
                associatedContent.style.opacity = '0';
                associatedContent.style.display = 'block'; // Make block to measure scrollHeight
                associatedContent.style.overflow = 'hidden';

                const targetContentHeight = associatedContent.scrollHeight; // Get natural content height

                animateElementProperties(associatedContent, animationRate, {
                    height: targetContentHeight,
                    opacity: 1
                }, function() {
                    // Clean up inline styles after animation
                    associatedContent.style.height = '';
                    associatedContent.style.opacity = '';
                    associatedContent.style.overflow = '';
                });

            } else {
                // Prepare to hide the content
                associatedContent.style.overflow = 'hidden';
                const currentContentHeight = associatedContent.offsetHeight;

                animateElementProperties(associatedContent, animationRate, {
                    height: 0,
                    opacity: 0
                }, function() {
                    // Clean up inline styles after animation
                    associatedContent.style.display = 'none';
                    associatedContent.style.height = '';
                    associatedContent.style.opacity = '';
                    associatedContent.style.overflow = '';
                });
            }
        }
    });
}

// Trigger the interactive panels setup when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initializeInteractivePanels);

// Function to set up the bookmark prompt
function prepareBookmarkReminder() {
    const initialDelay = 1000; // Delay for 1 second

    window.setTimeout(function() {
        const promptInstance = new google.bookmarkbubble.Bubble();
        const urlParameter = 'bmb=1';

        promptInstance.hasHashParameter = function() {
            return window.location.hash.includes(urlParameter);
        };

        promptInstance.setHashParameter = function() {
            if (!this.hasHashParameter()) {
                window.location.hash += urlParameter;
            }
        };

        promptInstance.getViewportHeight = function() {
            console.info('Bookmark bubble: Custom viewport height routine initiated.');
            return window.innerHeight;
        };

        promptInstance.getViewportScrollY = function() {
            console.info('Bookmark bubble: Custom scroll position routine initiated.');
            return window.pageYOffset;
        };

        promptInstance.registerScrollHandler = function(scrollActionFunction) {
            console.info('Bookmark bubble: Custom scroll handler registration routine initiated.');
            window.addEventListener('scroll', scrollActionFunction, false);
        };

        promptInstance.deregisterScrollHandler = function(scrollActionFunction) {
            console.info('Bookmark bubble: Custom scroll handler deregistration routine initiated.');
            window.removeEventListener('scroll', scrollActionFunction, false);
        };

        promptInstance.showIfAllowed();
    }, initialDelay);
}

// Trigger the bookmark reminder setup when the entire page (including resources) has loaded
window.onload = prepareBookmarkReminder;