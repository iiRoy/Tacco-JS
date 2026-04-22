(function() {

    const minimumLibraryVersion = "1.8.0";
    const libraryCheckKey = window.JQ; // Renamed jQuery
    const libraryVersionKey = libraryCheckKey && libraryCheckKey.fn && libraryCheckKey.fn.jqVersion; // New key for version property

    let processInitiated = false; // Renamed 'done'
    const systemActivation = function() { // Renamed initBkxMrk

        // Renamed getSelText
        function obtainPageSelection() {
            let currentSelection = '';
            if (window.getSelection) {
                currentSelection = window.getSelection().toString();
            } else if (document.getSelection) {
                currentSelection = document.getSelection().toString();
            } else if (document.selection) { // For IE < 9
                currentSelection = document.selection.createRange().text;
            }
            return currentSelection;
        }

        (window.featureActivator = function() { // Renamed bkxMrk
            const mainContainerIdentifier = 'overlayContainer'; // Renamed bkxframe
            const existingContainer = document.getElementById(mainContainerIdentifier);

            if (!existingContainer) {
                const currentPageTitle = document.title; // Renamed title
                const currentPageURL = window.location.href; // Renamed url
                const selectedContentSnippet = obtainPageSelection(); // Renamed s

                if (currentPageURL) { // Simplified URL check

                    // Create elements
                    const rootPanel = document.createElement('div');
                    rootPanel.id = mainContainerIdentifier;

                    const backdropLayer = document.createElement('div');
                    backdropLayer.id = 'dimmingLayer'; // Renamed bkxframe_veil
                    
                    const loadingParagraph = document.createElement('p'); // Create the paragraph for loading text
                    loadingParagraph.textContent = 'Loading...';
                    backdropLayer.appendChild(loadingParagraph); // Append it to the backdropLayer

                    const contentFrameElement = document.createElement('iframe');
                    contentFrameElement.id = 'contentFrame'; // Renamed iframe
                    contentFrameElement.setAttribute('allowtransparency', 'true');
                    contentFrameElement.setAttribute('frameborder', '0');
                    
                    // Construct iframe source with proper encoding
                    const encodedURL = encodeURIComponent(currentPageURL);
                    const encodedTitle = encodeURIComponent(currentPageTitle);
                    const encodedDesc = encodeURIComponent(selectedContentSnippet);
                    contentFrameElement.src = `http://dev.bkmrx.com/bklet?url=${encodedURL}&title=${encodedTitle}&desc=${encodedDesc}`;

                    // Append elements
                    rootPanel.appendChild(backdropLayer);
                    rootPanel.appendChild(contentFrameElement);
                    document.body.appendChild(rootPanel);

                    // Apply initial styles and transitions via a new style element
                    const dynamicStyleSheet = document.createElement('style');
                    dynamicStyleSheet.type = 'text/css';
                    dynamicStyleSheet.id = 'dynamicOverlayStyles'; // Give it an ID to prevent duplicates if called multiple times

                    // Using CSS variables and transitions for animation
                    const cssRules = `
                        #${mainContainerIdentifier} {
                            position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 900;
                            pointer-events: none; /* Initially disable pointer events on the container */
                        }
                        #dimmingLayer {
                            display: flex; justify-content: center; align-items: center;
                            position: absolute; width: 100%; height: 100%; top: 0; left: 0;
                            background-color: rgba(255,255,255,0); /* Start transparent */
                            z-index: 901;
                            transition: background-color 0.75s ease-in-out, opacity 0.75s ease-in-out;
                            opacity: 0; /* Start hidden */
                            pointer-events: auto; /* Enable pointer events for the veil */
                        }
                        #dimmingLayer p {
                            color: black; font: normal normal bold 20px/20px Helvetica, sans-serif;
                            opacity: 0; transition: opacity 0.75s ease-in-out;
                        }
                        #contentFrame {
                            display: block; position: absolute;
                            top: 10%; left: 50%;
                            width: 600px; height: 450px;
                            z-index: 999;
                            border: 10px solid rgba(0,0,0,0.5);
                            transform: translate(-50%, -150%); /* Start above visible area */
                            transition: transform 0.5s ease-out, opacity 0.5s ease-out;
                            opacity: 0; /* Start hidden */
                        }
                    `;
                    dynamicStyleSheet.appendChild(document.createTextNode(cssRules));
                    document.head.appendChild(dynamicStyleSheet);

                    // Trigger fade-in for backdropLayer and its text
                    requestAnimationFrame(() => {
                        backdropLayer.style.backgroundColor = 'rgba(255,255,255,0.25)';
                        backdropLayer.style.opacity = '1';
                        loadingParagraph.style.opacity = '1'; // Make the text visible
                        rootPanel.style.pointerEvents = 'auto';
                    });

                    // Iframe onload handler for slide-down
                    contentFrameElement.onload = function() {
                        contentFrameElement.style.transform = 'translate(-50%, 0)'; // Slide down to center
                        contentFrameElement.style.opacity = '1';
                        loadingParagraph.style.opacity = '0'; // Hide loading text after iframe loads
                    };
                    
                    // Click handler for backdropLayer to close
                    backdropLayer.addEventListener('click', function(evt) {
                        if (evt.target === backdropLayer) { // Ensure click is on veil itself, not iframe
                            closeFeaturePanel();
                        }
                    });

                }
            } else {
                // If container exists, close it
                closeFeaturePanel();
            }

            function closeFeaturePanel() {
                const rootPanel = document.getElementById(mainContainerIdentifier);
                const backdropLayer = document.getElementById('dimmingLayer');
                const contentFrameElement = document.getElementById('contentFrame');
                const loadingParagraph = backdropLayer ? backdropLayer.querySelector('p') : null;

                if (rootPanel && backdropLayer && contentFrameElement) {
                    backdropLayer.style.backgroundColor = 'rgba(255,255,255,0)'; // Fade out
                    backdropLayer.style.opacity = '0';
                    if (loadingParagraph) loadingParagraph.style.opacity = '0';

                    contentFrameElement.style.transform = 'translate(-50%, -150%)'; // Slide up
                    contentFrameElement.style.opacity = '0';

                    // Use Promises to wait for transitions to complete, then remove
                    const backdropTransitionEnd = new Promise(resolve => {
                        backdropLayer.addEventListener('transitionend', resolve, {once: true});
                    });
                    const contentFrameTransitionEnd = new Promise(resolve => {
                        contentFrameElement.addEventListener('transitionend', resolve, {once: true});
                    });

                    Promise.all([backdropTransitionEnd, contentFrameTransitionEnd])
                        .then(() => {
                            rootPanel.remove();
                            // Also remove the dynamic style sheet
                            const existingStyle = document.getElementById('dynamicOverlayStyles');
                            if (existingStyle) existingStyle.remove();
                        })
                        .catch(() => {
                            // Fallback for browsers not supporting transitionend or if something goes wrong
                            setTimeout(() => {
                                rootPanel.remove();
                                const existingStyle = document.getElementById('dynamicOverlayStyles');
                                if (existingStyle) existingStyle.remove();
                            }, 750); // Match original setTimeout duration
                        });
                }
            }

        })(); // End of window.featureActivator IIFE
    }; // End of systemActivation function

    // Dynamic library loading mechanism
    if (!libraryCheckKey || !libraryVersionKey || libraryVersionKey < minimumLibraryVersion) {
        const libraryLoaderElement = document.createElement("script"); // Renamed script
        libraryLoaderElement.src = "http://dev.bkmrx.com/js/jquery-1.8.0.min.js"; // Same source

        const libraryLoadingCallback = function() {
            if (!processInitiated && (!this.readyState || this.readyState === "loaded" || this.readyState === "complete")) {
                processInitiated = true;
                systemActivation();
            }
        };

        libraryLoaderElement.addEventListener('load', libraryLoadingCallback);
        libraryLoaderElement.addEventListener('readystatechange', libraryLoadingCallback); // For older IE

        document.head.appendChild(libraryLoaderElement); // Append to head
    } else {
        systemActivation(); // Execute immediately
    }

})();