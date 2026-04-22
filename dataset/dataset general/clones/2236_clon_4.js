(function initialLaunchSequence() {
    "use strict";

    // --- Fundamental DOM Assembler ---

    // A utility to construct DOM elements, serving a similar purpose to React.createElement
    function assembleVisualUnit(designation, characteristics, ...subUnits) {
        const visualUnit = document.createElement(designation);

        if (characteristics) {
            for (const descriptor in characteristics) {
                if (characteristics.hasOwnProperty(descriptor)) {
                    if (descriptor.startsWith('on') && typeof characteristics[descriptor] === 'function') {
                        visualUnit.addEventListener(descriptor.substring(2).toLowerCase(), characteristics[descriptor]);
                    } else if (descriptor === 'style') {
                        Object.assign(visualUnit.style, characteristics[descriptor]);
                    } else if (descriptor === 'className') {
                        visualUnit.className = characteristics[descriptor];
                    } else if (descriptor === 'href') {
                        visualUnit.href = characteristics[descriptor];
                    } else {
                        visualUnit.setAttribute(descriptor, characteristics[descriptor]);
                    }
                }
            }
        }

        subUnits.forEach(childItem => {
            if (childItem instanceof HTMLElement) {
                visualUnit.appendChild(childItem);
            } else if (typeof childItem === 'string' || typeof childItem === 'number') {
                visualUnit.appendChild(document.createTextNode(childItem));
            } else if (childItem !== null && typeof childItem === 'object' && typeof childItem.getInitiatorElement === 'function') {
                // Special handling for dynamicFrame's initiator element
                const initiator = childItem.getInitiatorElement();
                if (initiator) visualUnit.appendChild(initiator);
            }
        });

        return visualUnit;
    }

    // A utility to place the primary application unit into the DOM, akin to ReactDOM.render
    function presentPrimaryUnit(assembledUnit, targetLocation) {
        targetLocation.innerHTML = '';
        targetLocation.appendChild(assembledUnit);
    }

    // Helper to determine if a DOM node is contained within another
    function encompassesVisualElement(candidateNode, containingNode) {
        let currentExamination = candidateNode;
        while (currentExamination) {
            if (currentExamination === containingNode) {
                return true;
            }
            currentExamination = currentExamination.parentNode;
        }
        return false;
    }

    // --- Universal Application State Repository ---
    const applicationMetrics = {
        isActivityIndicatorPresent: false
    };

    // --- Dynamic Frame (Portal) Implementation ---
    function constructDynamicFrame(frameConfiguration) {
        let currentEncasingElement = null;
        let activeDisplayStatus = false;
        const configDetails = frameConfiguration; // { contentBuilder: Function, initiator: HTMLElement | null, allowEscapeDismissal: Boolean, allowExteriorDismissal: Boolean, initialPresence: Boolean }

        const keyboardDismissalHandler = (occurrence) => {
            if (occurrence.key === 'Escape') {
                frameController.conceal();
            }
        };

        const externalClickDismissalHandler = (occurrence) => {
            if (!activeDisplayStatus) return;
            if (currentEncasingElement && encompassesVisualElement(occurrence.target, currentEncasingElement)) {
                return; // Click occurred inside the frame
            }
            occurrence.stopPropagation();
            frameController.conceal();
        };

        const frameController = {
            display: function() {
                if (activeDisplayStatus) return;

                currentEncasingElement = assembleVisualUnit('div', {
                    style: {
                        position: 'fixed',
                        top: '0',
                        left: '0',
                        width: '100%',
                        height: '100%',
                        zIndex: '9999',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'rgba(0,0,0,0.5)'
                    }
                });

                // The contentBuilder receives a 'hide' function for internal dismissal actions
                const generatedContentElement = configDetails.contentBuilder(frameController.conceal);
                currentEncasingElement.appendChild(generatedContentElement);
                document.body.appendChild(currentEncasingElement);
                activeDisplayStatus = true;

                if (configDetails.allowEscapeDismissal) {
                    document.addEventListener('keydown', keyboardDismissalHandler);
                }
                if (configDetails.allowExteriorDismissal) {
                    document.addEventListener('mousedown', externalClickDismissalHandler);
                }
            },
            conceal: function() {
                if (!activeDisplayStatus) return;

                if (currentEncasingElement && currentEncasingElement.parentNode) {
                    currentEncasingElement.parentNode.removeChild(currentEncasingElement);
                }
                currentEncasingElement = null;
                activeDisplayStatus = false;

                if (configDetails.allowEscapeDismissal) {
                    document.removeEventListener('keydown', keyboardDismissalHandler);
                }
                if (configDetails.allowExteriorDismissal) {
                    document.removeEventListener('mousedown', externalClickDismissalHandler);
                }
            },
            getInitiatorElement: function() {
                return configDetails.initiator;
            }
        };

        if (configDetails.initiator) {
            configDetails.initiator.addEventListener('click', (occurrence) => {
                occurrence.preventDefault();
                occurrence.stopPropagation();
                frameController.display();
            });
        }

        if (configDetails.initialPresence) {
            frameController.display();
        }

        return frameController;
    }

    // --- Application-Specific Visual Components ---

    // Replaces PseudoModal
    function createSimulatedDialogue(dismissOperation) {
        return assembleVisualUnit(
            'div',
            { style: { border: '1px solid blue', margin: '10px', padding: '10px', backgroundColor: 'white' } },
            assembleVisualUnit('h2', null, 'Simulated Dialogue Box'),
            assembleVisualUnit('p', null, 'This user interface element is dynamically appended to the main document structure.'),
            assembleVisualUnit('p', null, 'This is ', assembleVisualUnit('strong', null, 'ideal for popup messages, image viewers, notification bars ... etc.') , '.'),
            assembleVisualUnit('p', null, 'Dismiss this by pressing the ', assembleVisualUnit('strong', null, 'ESC key'), '.'),
            assembleVisualUnit('p', null, assembleVisualUnit('strong', null, 'Why "simulated"?'), ' Because the appropriate visual styling is entirely left to your discretion. ;-)'),
            assembleVisualUnit(
                'p',
                null,
                assembleVisualUnit('button', { onClick: dismissOperation }, 'Hide this element')
            )
        );
    }

    // Replaces LoadingBar
    function generateProgressIndicator() {
        return assembleVisualUnit(
            'div',
            { style: { border: '1px solid green', margin: '10px', padding: '10px', backgroundColor: 'white' } },
            assembleVisualUnit('p', null, 'This could represent a background activity progress...'),
            assembleVisualUnit(
                'p',
                null,
                'This dynamic frame is ',
                assembleVisualUnit('strong', null, 'activated by a specific status variable'),
                ' ',
                assembleVisualUnit('i', null, 'isActivityIndicatorPresent'),
                '.'
            ),
            assembleVisualUnit(
                'p',
                null,
                '... when an ',
                assembleVisualUnit('i', null, 'initiator element'),
                ' is not the desired control method.'
            ),
            assembleVisualUnit(
                'p',
                null,
                'Note: by default, you cannot dismiss this using the ESC key or by clicking outside.'
            )
        );
    }

    // --- Primary Application Interface (App) ---
    function constructMainApplicationInterface() {
        // First button for simulated dialogue
        const dialogueInitiatorButton = assembleVisualUnit('button', null, 'Open dynamic frame with simulated dialogue');
        const firstDynamicFrameInstance = constructDynamicFrame({
            contentBuilder: createSimulatedDialogue,
            initiator: dialogueInitiatorButton,
            allowEscapeDismissal: true,
            allowExteriorDismissal: false,
            initialPresence: false
        });

        // Second button for another dynamic frame
        const anotherFrameInitiatorButton = assembleVisualUnit('button', null, 'Another dynamic frame');
        const thirdDynamicFrameInstance = constructDynamicFrame({
            contentBuilder: (hideOperation) => assembleVisualUnit(
                'div',
                { style: { border: '1px solid black', margin: '10px', padding: '10px', backgroundColor: 'white' } },
                assembleVisualUnit('p', null, 'Click anywhere outside of this overlay to dismiss it.')
            ),
            initiator: anotherFrameInitiatorButton,
            allowEscapeDismissal: false,
            allowExteriorDismissal: true,
            initialPresence: false
        });

        // Toggle button for the activity indicator
        let activityIndicatorToggleButton;
        let progressIndicatorFrameInstance = null; // Holds the dynamicFrame instance for the activity indicator

        function refreshActivityIndicatorToggleButtonText() {
            if (activityIndicatorToggleButton) {
                activityIndicatorToggleButton.textContent = applicationMetrics.isActivityIndicatorPresent ?
                    'Conceal the activity indicator' : 'Display the activity indicator';
            }
        }

        function handleActivityIndicatorActivation(occurrence) {
            occurrence.preventDefault();
            occurrence.stopPropagation();

            applicationMetrics.isActivityIndicatorPresent = !applicationMetrics.isActivityIndicatorPresent;

            if (applicationMetrics.isActivityIndicatorPresent) {
                if (!progressIndicatorFrameInstance) {
                    progressIndicatorFrameInstance = constructDynamicFrame({
                        contentBuilder: generateProgressIndicator,
                        initiator: null, // No direct trigger element for this frame
                        allowEscapeDismissal: false,
                        allowExteriorDismissal: false,
                        initialPresence: false // Will be explicitly displayed
                    });
                }
                progressIndicatorFrameInstance.display();
            } else {
                if (progressIndicatorFrameInstance) {
                    progressIndicatorFrameInstance.conceal();
                }
            }
            refreshActivityIndicatorToggleButtonText();
        }

        activityIndicatorToggleButton = assembleVisualUnit(
            'button',
            { onClick: handleActivityIndicatorActivation }
        );
        refreshActivityIndicatorToggleButtonText(); // Set initial text

        // Initial check for activity indicator visibility (though original starts closed)
        if (applicationMetrics.isActivityIndicatorPresent) {
             if (!progressIndicatorFrameInstance) {
                progressIndicatorFrameInstance = constructDynamicFrame({
                    contentBuilder: generateProgressIndicator,
                    initiator: null,
                    allowEscapeDismissal: false,
                    allowExteriorDismissal: false,
                    initialPresence: true
                });
            } else {
                progressIndicatorFrameInstance.display();
            }
        }

        return assembleVisualUnit(
            'div',
            null,
            assembleVisualUnit('h1', null, 'Web Interface Overlay Examples'),
            assembleVisualUnit(
                'a',
                { href: 'https://github.com/tajo/react-portal' },
                'https://github.com/tajo/react-portal'
            ),
            assembleVisualUnit('p', null, ' '),
            firstDynamicFrameInstance, // The initiator element is embedded here
            activityIndicatorToggleButton,
            thirdDynamicFrameInstance // The initiator element is embedded here
        );
    }

    // --- Initial Application Setup ---
    document.addEventListener('DOMContentLoaded', () => {
        const primaryHostLocation = document.getElementById('react-body');
        if (primaryHostLocation) {
            presentPrimaryUnit(constructMainApplicationInterface(), primaryHostLocation);
        } else {
            console.error('Target host element with identifier "react-body" not located.');
        }
    });

})();