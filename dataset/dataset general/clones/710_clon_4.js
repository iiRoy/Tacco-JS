document.addEventListener('DOMContentLoaded', function() {

    // Helper function to normalize path segments by removing leading/trailing slashes
    // and common default filenames (e.g., index.html, default.php)
    function routeScrubber(inputAddress) {
        let processedAddress = inputAddress;

        // Remove leading slash
        processedAddress = processedAddress.replace(/^\//, '');

        // Process the filename part using string manipulation and regex for validation
        const pathSegments = processedAddress.split('/');
        const lastSegment = pathSegments[pathSegments.length - 1];

        if (lastSegment) {
            const dotPosition = lastSegment.lastIndexOf('.');
            if (dotPosition > 0) { // Ensure there's a dot and it's not the first character
                const baseName = lastSegment.substring(0, dotPosition);
                const fileExtension = lastSegment.substring(dotPosition + 1);

                // Check if base name is 'index' or 'default' AND extension is 3-4 letters
                if ((baseName === 'index' || baseName === 'default') &&
                    fileExtension.length >= 3 && fileExtension.length <= 4 &&
                    /^[a-zA-Z]+$/.test(fileExtension)) {
                    pathSegments.pop(); // Remove the last segment (the filename)
                }
            }
        }
        processedAddress = pathSegments.join('/');

        // Remove trailing slash if any
        processedAddress = processedAddress.replace(/\/$/, '');

        return processedAddress;
    }

    const currentDocumentRoute = routeScrubber(window.location.pathname);

    // Function to identify the primary scrollable container (e.g., document.documentElement or document.body)
    function locateScrollHost(candidateElementSelectors) {
        for (const selector of candidateElementSelectors) {
            let potentialHost;
            if (selector === 'html') {
                potentialHost = document.documentElement; // Use document.documentElement for 'html'
            } else {
                potentialHost = document.querySelector(selector);
            }

            if (!potentialHost) continue;

            // Check if element is already scrolled or has content overflowing
            if (potentialHost.scrollTop > 0 || potentialHost.scrollHeight > potentialHost.clientHeight) {
                return potentialHost;
            }

            // Temporarily attempt to scroll to detect scrollability
            const initialScrollPosition = potentialHost.scrollTop;
            potentialHost.scrollTop = 1;
            const isScrollable = potentialHost.scrollTop > 0;
            potentialHost.scrollTop = initialScrollPosition; // Reset to original position

            if (isScrollable) {
                return potentialHost;
            }
        }
        // Fallback to document.documentElement if no specific scrollable element is found
        return document.documentElement;
    }

    const primaryScrollableElement = locateScrollHost(['html', 'body']);

    // Custom animation function for smooth scrolling, replacing jQuery's animate
    function performAnimatedScroll(scrollTargetElement, finalYPosition, durationMilliseconds, onAnimationEnd) {
        const startYPosition = scrollTargetElement.scrollTop;
        const scrollDistance = finalYPosition - startYPosition;
        let animationStartTimestamp = null;

        // Easing function: easeInOutQuad for a smooth start and end
        function easeInOutQuad(progress) {
            return progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;
        }

        function animationFrameStep(currentTime) {
            if (!animationStartTimestamp) animationStartTimestamp = currentTime;
            const elapsedRatio = (currentTime - animationStartTimestamp) / durationMilliseconds;

            if (elapsedRatio < 1) {
                scrollTargetElement.scrollTop = startYPosition + scrollDistance * easeInOutQuad(elapsedRatio);
                window.requestAnimationFrame(animationFrameStep);
            } else {
                scrollTargetElement.scrollTop = finalYPosition; // Ensure exact final position
                if (onAnimationEnd) {
                    onAnimationEnd();
                }
            }
        }

        window.requestAnimationFrame(animationFrameStep);
    }

    // Iterate through all anchor elements that contain a hash in their href attribute
    document.querySelectorAll('a[href*="#"]').forEach(function(anchorItem) {
        const fullLinkURL = new URL(anchorItem.href, window.location.href);
        const linkPathCleaned = routeScrubber(fullLinkURL.pathname);

        const pathsAreEquivalent = currentDocumentRoute === linkPathCleaned;
        const hostsAreEquivalent = fullLinkURL.hostname === window.location.hostname || !fullLinkURL.hostname; // Handles relative URLs without host
        const hashExistsAndIsNotEmpty = fullLinkURL.hash && fullLinkURL.hash.substring(1).length > 0;

        if (pathsAreEquivalent && hostsAreEquivalent && hashExistsAndIsNotEmpty) {
            const targetIdentifier = fullLinkURL.hash.substring(1);
            const targetSection = document.getElementById(targetIdentifier);

            if (targetSection) {
                // Calculate the target's absolute Y position relative to the scrollable element's top
                const absoluteTargetY = targetSection.getBoundingClientRect().top + primaryScrollableElement.scrollTop;

                anchorItem.addEventListener('click', function(activationEvent) {
                    activationEvent.preventDefault(); // Prevent the browser's default immediate jump

                    performAnimatedScroll(primaryScrollableElement, absoluteTargetY, 400, function() {
                        window.location.hash = fullLinkURL.hash; // Update URL hash after the animation completes
                    });
                });
            }
        }
    });

});