(function() {

    // --- Utility Functions for State Management and Display Effects ---

    function retrieveStoredValue(keyIdentifier) {
        const namePattern = keyIdentifier + "=";
        const cookieSegments = document.cookie.split(';');
        for (let i = 0; i < cookieSegments.length; i++) {
            let currentSegment = cookieSegments[i];
            while (currentSegment.charAt(0) === ' ') {
                currentSegment = currentSegment.substring(1);
            }
            if (currentSegment.indexOf(namePattern) === 0) {
                try {
                    return decodeURIComponent(currentSegment.substring(namePattern.length, currentSegment.length));
                } catch (e) {
                    return null;
                }
            }
        }
        return null;
    }

    function storeValueInCookie(keyIdentifier, valueContent, expiryDays = 365) {
        const expirationMoment = new Date();
        expirationMoment.setTime(expirationMoment.getTime() + (expiryDays * 24 * 60 * 60 * 1000));
        const expirationString = "expires=" + expirationMoment.toUTCString();
        try {
            document.cookie = keyIdentifier + "=" + encodeURIComponent(valueContent) + ";" + expirationString + ";path=/";
        } catch (e) { /* Storage might fail due to cookie limits or security */ }
    }

    function animateElementHeight(targetElement, displayAction, effectDuration) {
        const isDisplaying = (displayAction === 'show');
        const effectiveDuration = (effectDuration === 'none' || effectDuration === undefined) ? 0 : 400; // 'slow' ~400ms

        targetElement.style.transition = ''; // Clear prior transitions

        if (isDisplaying) {
            targetElement.style.display = 'block';
            targetElement.style.height = 'auto';
            const naturalHeight = targetElement.scrollHeight;
            targetElement.style.height = '0';
            targetElement.style.overflow = 'hidden';

            targetElement.offsetWidth; // Force browser reflow to apply initial height

            targetElement.style.transition = `height ${effectiveDuration}ms ease-in-out`;
            targetElement.style.height = naturalHeight + 'px';

            const transitionEndCallback = () => {
                targetElement.removeEventListener('transitionend', transitionEndCallback);
                targetElement.style.transition = '';
                targetElement.style.height = 'auto';
                targetElement.style.overflow = '';
            };

            if (effectiveDuration > 0) {
                targetElement.addEventListener('transitionend', transitionEndCallback);
            } else {
                transitionEndCallback(); // Instant execution
            }

        } else { // Hiding
            const naturalHeight = targetElement.scrollHeight;
            targetElement.style.height = naturalHeight + 'px';
            targetElement.style.overflow = 'hidden';

            targetElement.offsetWidth; // Force browser reflow

            targetElement.style.transition = `height ${effectiveDuration}ms ease-in-out`;
            targetElement.style.height = '0';

            const transitionEndCallback = () => {
                targetElement.removeEventListener('transitionend', transitionEndCallback);
                targetElement.style.transition = '';
                targetElement.style.display = 'none';
                targetElement.style.overflow = '';
            };

            if (effectiveDuration > 0) {
                targetElement.addEventListener('transitionend', transitionEndCallback);
            } else {
                transitionEndCallback(); // Instant execution
            }
        }
    }

    // --- Core Collapsible Structure Logic ---

    window.initializeCollapsibleStructure = function(mainContainerElement, configSettings) {
        if (!mainContainerElement || mainContainerElement.tagName !== 'UL') {
            console.error("The 'initializeCollapsibleStructure' function requires a UL element as its main container.");
            return;
        }

        const standardConfiguration = {
            visualToggleOpen: '&#9660;',
            visualToggleClosed: '&#9658;',
            initialExpansionPattern: '',
            singleBranchMode: false,
            displayTransitionEffect: 'slow'
        };

        const currentConfiguration = Object.assign({}, standardConfiguration, configSettings);

        const INDICATOR_CLASS = 'branch-display-indicator';
        const CONTROL_BUTTON_CLASS = 'branch-control-button';
        const OPENED_STATE_CLASS = 'exposed-branch';
        const CLOSED_STATE_CLASS = 'concealed-branch';
        const CHILD_LIST_CLASS = 'nested-branch-list';

        function determineBranchPath(listItemElement) {
            const pathSegments = [];
            let currentItem = listItemElement;
            while (currentItem && currentItem.tagName === 'LI') {
                const parentList = currentItem.parentElement;
                const siblingItems = Array.from(parentList.children).filter(node => node.tagName === 'LI');
                const itemPosition = siblingItems.indexOf(currentItem);
                pathSegments.unshift(itemPosition);
                currentItem = parentList.closest('li');
            }
            return pathSegments.join('/');
        }

        function recordCurrentState() {
            const openedIndicators = mainContainerElement.querySelectorAll(`.${INDICATOR_CLASS}.${OPENED_STATE_CLASS}`);
            const currentExpandedPaths = Array.from(openedIndicators).map(indicator => determineBranchPath(indicator.parentElement));

            const stateStorageKey = mainContainerElement.dataset.stateKey || 'collapsible-structure-state';
            try {
                storeValueInCookie(stateStorageKey, currentExpandedPaths.join(','));
            } catch (e) { /* Error during cookie storage */ }
        }

        function revealBranch(indicatorElement, transitionEffect) {
            if (indicatorElement && indicatorElement.classList.contains(INDICATOR_CLASS)) {
                const parentListItem = indicatorElement.parentElement;
                const childUl = parentListItem.querySelector('ul');
                if (childUl) {
                    animateElementHeight(childUl, 'show', transitionEffect);
                }
                indicatorElement.classList.remove(CLOSED_STATE_CLASS);
                indicatorElement.classList.add(OPENED_STATE_CLASS);
                indicatorElement.innerHTML = currentConfiguration.visualToggleOpen;
            }
        }

        function hideBranch(indicatorElement, transitionEffect) {
            if (indicatorElement && indicatorElement.classList.contains(INDICATOR_CLASS)) {
                const parentListItem = indicatorElement.parentElement;
                const childUl = parentListItem.querySelector('ul');
                if (childUl) {
                    animateElementHeight(childUl, 'hide', transitionEffect);
                }
                indicatorElement.classList.remove(OPENED_STATE_CLASS);
                indicatorElement.classList.add(CLOSED_STATE_CLASS);
                indicatorElement.innerHTML = currentConfiguration.visualToggleClosed;
            }
        }

        function applyInitialExpansion() {
            let storedPathData = null;
            const stateStorageKey = mainContainerElement.dataset.stateKey || 'collapsible-structure-state';
            try {
                storedPathData = retrieveStoredValue(stateStorageKey);
            } catch (e) { /* Error retrieving cookie */ }

            if (!storedPathData) {
                storedPathData = currentConfiguration.initialExpansionPattern;
            }

            if (storedPathData === 'all') {
                mainContainerElement.querySelectorAll(`.${INDICATOR_CLASS}`).forEach(indicator => {
                    revealBranch(indicator, undefined); // Instant reveal
                });
            } else if (storedPathData) {
                const individualPathStrings = storedPathData.split(',');
                individualPathStrings.forEach(pathString => {
                    const positionIndices = pathString.split('/').map(Number);
                    let currentBranchContainer = mainContainerElement;
                    for (let i = 0; i < positionIndices.length; i++) {
                        const index = positionIndices[i];
                        const availableListItems = Array.from(currentBranchContainer.children).filter(node => node.tagName === 'LI');
                        if (index < availableListItems.length) {
                            const targetListItem = availableListItems[index];
                            const indicator = targetListItem.querySelector(`.${INDICATOR_CLASS}`);
                            if (indicator) {
                                revealBranch(indicator, undefined); // Instant reveal
                            }
                            const childUl = targetListItem.querySelector('ul');
                            if (childUl) {
                                currentBranchContainer = childUl;
                            } else {
                                break;
                            }
                        } else {
                            break;
                        }
                    }
                });
            }
        }

        function handleToggleInteraction(event) {
            const clickedIndicator = event.currentTarget;
            if (clickedIndicator.classList.contains(INDICATOR_CLASS)) {
                if (clickedIndicator.classList.contains(OPENED_STATE_CLASS)) {
                    hideBranch(clickedIndicator, currentConfiguration.displayTransitionEffect);
                } else {
                    revealBranch(clickedIndicator, currentConfiguration.displayTransitionEffect);
                    if (currentConfiguration.singleBranchMode) {
                        const currentListItem = clickedIndicator.parentElement;
                        Array.from(currentListItem.parentElement.children)
                             .filter(siblingNode => siblingNode !== currentListItem && siblingNode.tagName === 'LI')
                             .forEach(siblingListItem => {
                                 const siblingIndicator = siblingListItem.querySelector(`.${INDICATOR_CLASS}`);
                                 if (siblingIndicator) {
                                     hideBranch(siblingIndicator, currentConfiguration.displayTransitionEffect);
                                 }
                             });
                    }
                }
                recordCurrentState();
            }
        }

        // --- Structure Initialization ---

        mainContainerElement.querySelectorAll('li').forEach(listItem => {
            const childUl = listItem.querySelector('ul');
            if (childUl) {
                const toggleSpan = document.createElement('span');
                toggleSpan.classList.add(INDICATOR_CLASS, CLOSED_STATE_CLASS);
                toggleSpan.style.cursor = 'pointer';
                toggleSpan.innerHTML = currentConfiguration.visualToggleClosed;
                listItem.prepend(toggleSpan);

                childUl.classList.add(CHILD_LIST_CLASS);
                childUl.style.display = 'none';
                childUl.style.overflow = 'hidden';

                toggleSpan.addEventListener('click', handleToggleInteraction);
            }
        });

        mainContainerElement.querySelectorAll(`li .${CONTROL_BUTTON_CLASS}`).forEach(actionButton => {
            actionButton.addEventListener('click', (event) => {
                const containingListItem = event.currentTarget.closest('li');
                if (containingListItem) {
                    const indicator = containingListItem.querySelector(`.${INDICATOR_CLASS}`);
                    if (indicator) {
                        handleToggleInteraction({ currentTarget: indicator });
                    }
                }
            });
        });

        applyInitialExpansion();

        // --- Public Control Methods ---
        return {
            unfurlAll: function(transitionEffect) {
                const actualTransition = (transitionEffect === 'none' || transitionEffect === undefined) ? 0 : currentConfiguration.displayTransitionEffect;

                // First, instantly unfurl all nested, folded branches (bottom-up expansion)
                mainContainerElement.querySelectorAll('li').forEach(listItem => {
                    if (listItem.parentElement !== mainContainerElement) {
                        const childUl = listItem.querySelector('ul');
                        if (childUl) {
                            const indicator = listItem.querySelector(`.${INDICATOR_CLASS}.${CLOSED_STATE_CLASS}`);
                            if (indicator) {
                                revealBranch(indicator, undefined); // Instant unfurl
                            }
                        }
                    }
                });

                // Then, animate the unfurling of top-level, folded branches
                Array.from(mainContainerElement.children).filter(node => node.tagName === 'LI').forEach(listItem => {
                    const childUl = listItem.querySelector('ul');
                    if (childUl) {
                        const indicator = listItem.querySelector(`.${INDICATOR_CLASS}.${CLOSED_STATE_CLASS}`);
                        if (indicator) {
                            revealBranch(indicator, actualTransition); // Unfurl with animation
                        }
                    }
                });
                recordCurrentState();
            },
            foldAll: function(transitionEffect) {
                const actualTransition = (transitionEffect === 'none' || transitionEffect === undefined) ? 0 : currentConfiguration.displayTransitionEffect;
                mainContainerElement.querySelectorAll(`.${INDICATOR_CLASS}.${OPENED_STATE_CLASS}`).forEach(indicator => {
                    hideBranch(indicator, actualTransition);
                });
                recordCurrentState();
            }
        };
    };

})();