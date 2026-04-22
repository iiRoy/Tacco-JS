(function(context) {
    "use strict";

    const defaultPreferences = {
        motion: 'instant',
        startConcealed: false
    };

    function combineConfigurations(base, specific) {
        const result = {};
        for (const key in base) {
            result[key] = base[key];
        }
        for (const key in specific) {
            result[key] = specific[key];
        }
        return result;
    }

    function manageNodeClasses(node, addClass, removeClass) {
        if (addClass) node.classList.add(addClass);
        if (removeClass) node.classList.remove(removeClass);
    }

    function controlInstantVisibility(node, reveal) {
        node.style.display = reveal ? '' : 'none';
        manageNodeClasses(node, reveal ? 'branch-revealed' : 'branch-concealed', reveal ? 'branch-concealed' : 'branch-revealed');
    }

    function controlDissolveVisibility(node, reveal) {
        node.style.transition = 'opacity 0.2s ease-out';
        node.style.overflow = 'hidden';

        const handleTransitionCompletion = () => {
            node.removeEventListener('transitionend', handleTransitionCompletion);
            if (!reveal) {
                node.style.display = 'none';
            }
            node.style.transition = '';
            node.style.overflow = '';
        };
        node.addEventListener('transitionend', handleTransitionCompletion);

        if (reveal) {
            node.style.opacity = '0';
            node.style.display = '';
            void node.offsetWidth; 
            node.style.opacity = '1';
            manageNodeClasses(node, 'branch-revealed', 'branch-concealed');
        } else {
            node.style.opacity = '0';
            manageNodeClasses(node, 'branch-concealed', 'branch-revealed');
        }
    }

    function controlGlideVisibility(node, reveal) {
        node.style.transition = 'max-height 0.2s ease-out';
        node.style.overflow = 'hidden';

        const handleTransitionCompletion = () => {
            node.removeEventListener('transitionend', handleTransitionCompletion);
            node.style.transition = '';
            node.style.overflow = '';
            if (reveal) {
                node.style.maxHeight = '';
            } else {
                node.style.display = 'none';
            }
        };
        node.addEventListener('transitionend', handleTransitionCompletion);

        if (reveal) {
            node.style.display = '';
            const naturalHeight = node.scrollHeight + 'px';
            node.style.maxHeight = '0';
            void node.offsetWidth;
            node.style.maxHeight = naturalHeight;
            manageNodeClasses(node, 'branch-revealed', 'branch-concealed');
        } else {
            node.style.maxHeight = node.scrollHeight + 'px';
            void node.offsetWidth;
            node.style.maxHeight = '0';
            manageNodeClasses(node, 'branch-concealed', 'branch-revealed');
        }
    }

    function alterNodeDisplay(node, animationType, shouldReveal) {
        switch (animationType.toLowerCase()) {
            case 'dissolve':
                controlDissolveVisibility(node, shouldReveal);
                break;
            case 'glide':
                controlGlideVisibility(node, shouldReveal);
                break;
            case 'instant':
            default:
                controlInstantVisibility(node, shouldReveal);
                break;
        }
    }

    context.createFoldableTree = function(rootElement, userPreferences) {
        if (!rootElement || !(rootElement instanceof HTMLElement)) {
            console.error("The provided root element is not valid for foldable tree creation.");
            return;
        }

        const currentSettings = combineConfigurations(defaultPreferences, userPreferences || {});

        const togglePairs = [];
        rootElement.querySelectorAll('li > ul').forEach(nestedListElement => {
            const precedingSibling = nestedListElement.previousElementSibling;
            if (precedingSibling) {
                togglePairs.push({ activator: precedingSibling, foldableContent: nestedListElement });
            }
        });

        togglePairs.forEach(pair => {
            if (currentSettings.startConcealed) {
                controlInstantVisibility(pair.foldableContent, false);
            } else {
                controlInstantVisibility(pair.foldableContent, true);
            }
            pair.activator.classList.add('tree-toggle-handle');
        });

        rootElement.addEventListener('click', function(eventDetails) {
            let clickedTarget = eventDetails.target;

            let identifiedPair = null;
            while (clickedTarget && clickedTarget !== rootElement) {
                for (const pair of togglePairs) {
                    if (pair.activator === clickedTarget) {
                        identifiedPair = pair;
                        break;
                    }
                }
                if (identifiedPair) break;
                clickedTarget = clickedTarget.parentElement;
            }

            if (identifiedPair) {
                if (clickedTarget.tagName === 'A') {
                    eventDetails.preventDefault();
                }

                const targetNode = identifiedPair.foldableContent;
                const isCurrentlyRevealed = targetNode.classList.contains('branch-revealed');
                alterNodeDisplay(targetNode, currentSettings.motion, !isCurrentlyRevealed);
            }
        });
    };

    context.createFoldableTree.defaultPreferences = defaultPreferences;

})(window);