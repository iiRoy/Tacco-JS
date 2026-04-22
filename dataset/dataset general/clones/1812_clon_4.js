(function() {
    function retrieveChildPosition(item) {
        let count = 1;
        let priorSibling = item.previousElementSibling;
        while (priorSibling) {
            count++;
            priorSibling = priorSibling.previousElementSibling;
        }
        return count;
    }

    function generatePathDescriptor(targetNode, options) {
        const pathSegments = [];
        let activeNode = targetNode;
        const processOptions = {
            fullJourney: false,
            includeSiblingPosition: false,
            ...options
        };

        while (activeNode && activeNode.nodeType === Node.ELEMENT_NODE && activeNode !== document) {
            const nodeId = activeNode.id ? '#' + activeNode.id : '';
            const nodeClasses = activeNode.className ? '.' + activeNode.className.trim().split(/\s+/).join('.') : '';
            const nodeName = activeNode.nodeName.toLowerCase();

            let basePart = nodeName + nodeId + nodeClasses;
            pathSegments.unshift({
                domNode: activeNode,
                segmentText: basePart,
                hasExplicitId: !!nodeId,
                hasClasses: !!nodeClasses,
                isBaseElement: (nodeName === 'html' || nodeName === 'body')
            });

            if (nodeId && !processOptions.fullJourney) {
                break;
            }
            activeNode = activeNode.parentNode;
        }

        let accumulatedPath = '';
        const finalPathComponents = [];

        for (const partInfo of pathSegments) {
            let currentSegment = partInfo.segmentText;
            let queryTestPath = accumulatedPath + (accumulatedPath ? ' ' : '') + currentSegment;

            if (processOptions.includeSiblingPosition && !partInfo.hasExplicitId && !partInfo.isBaseElement) {
                let requiresPosition = false;
                if (!partInfo.hasClasses) {
                    requiresPosition = true;
                } else {
                    try {
                        const matchingElements = document.querySelectorAll(queryTestPath);
                        if (matchingElements.length > 1) {
                            requiresPosition = true;
                        }
                    } catch (e) {
                        // Selector might be invalid, don't add position
                    }
                }

                if (requiresPosition) {
                    currentSegment += `:nth-child(${retrieveChildPosition(partInfo.domNode)})`;
                    queryTestPath = accumulatedPath + (accumulatedPath ? ' ' : '') + currentSegment;
                }
            }
            finalPathComponents.push(currentSegment);
            accumulatedPath = queryTestPath;
        }

        return finalPathComponents.join(' ');
    }

    class ElementObserver {
        constructor(resultProcessor, configuration = {}) {
            this.outputProcessor = resultProcessor;
            this.settings = {
                displayHighlightClass: 'dom-observer-active',
                ...configuration
            };

            this.lastInspectedElement = null;
            this.universalEventHandler = this.universalEventHandler.bind(this);
            this.initiateObservation();
        }

        universalEventHandler(eventObject) {
            eventObject.stopPropagation();

            switch (eventObject.type) {
                case 'mouseover':
                    this.manageHighlightOnEnter(eventObject);
                    break;
                case 'mouseout':
                    this.manageHighlightOnExit(eventObject);
                    break;
                case 'click':
                    this.handleElementSelection(eventObject);
                    break;
                case 'keydown':
                    this.processKeyInput(eventObject);
                    break;
            }
        }

        manageHighlightOnEnter(eventObject) {
            const enteredElement = eventObject.target;
            if (this.lastInspectedElement && this.lastInspectedElement !== enteredElement) {
                this.lastInspectedElement.classList.remove(this.settings.displayHighlightClass);
            }
            enteredElement.classList.add(this.settings.displayHighlightClass);
            this.lastInspectedElement = enteredElement;
        }

        manageHighlightOnExit(eventObject) {
            eventObject.target.classList.remove(this.settings.displayHighlightClass);
        }

        handleElementSelection(eventObject) {
            eventObject.preventDefault();
            const generatedPath = generatePathDescriptor(eventObject.target, {
                fullJourney: false,
                includeSiblingPosition: false
            });
            this.outputProcessor(generatedPath, eventObject.target);
        }

        processKeyInput(eventObject) {
            if (eventObject.key === 'Escape' || eventObject.keyCode === 27) {
                this.terminateObservation();
                if (this.lastInspectedElement) {
                    this.lastInspectedElement.classList.remove(this.settings.displayHighlightClass);
                    this.lastInspectedElement = null;
                }
            }
        }

        initiateObservation() {
            document.addEventListener('mouseover', this.universalEventHandler, { capture: true });
            document.addEventListener('mouseout', this.universalEventHandler, { capture: true });
            document.addEventListener('click', this.universalEventHandler, { capture: true });
            document.addEventListener('keydown', this.universalEventHandler, { capture: true });

            this.highlightStyleTag = document.createElement('style');
            this.highlightStyleTag.textContent = `
                .${this.settings.displayHighlightClass} {
                    outline: 2px solid #f00 !important;
                }
            `;
            document.head.appendChild(this.highlightStyleTag);
        }

        terminateObservation() {
            document.removeEventListener('mouseover', this.universalEventHandler, { capture: true });
            document.removeEventListener('mouseout', this.universalEventHandler, { capture: true });
            document.removeEventListener('click', this.universalEventHandler, { capture: true });
            document.removeEventListener('keydown', this.universalEventHandler, { capture: true });

            if (this.highlightStyleTag && document.head.contains(this.highlightStyleTag)) {
                document.head.removeChild(this.highlightStyleTag);
            }
        }
    }

    const defaultAction = (selectorOutput, selectedElement) => {
        console.log(selectorOutput);
    };

    new ElementObserver(defaultAction, {});
})();