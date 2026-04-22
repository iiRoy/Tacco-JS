(function () {
    // 1. Centralized Application State Management (replacement for $rootScope)
    const applicationCoreState = {
        presentPageHeader: undefined,
        eventPublisher: new EventTarget() // Custom event bus for global notifications
    };

    function updateApplicationHeader(newContentValue) {
        applicationCoreState.presentPageHeader = newContentValue;
        applicationCoreState.eventPublisher.dispatchEvent(
            new CustomEvent('headerContentUpdated', { detail: newContentValue })
        );
    }

    function removeApplicationHeader() {
        delete applicationCoreState.presentPageHeader;
        applicationCoreState.eventPublisher.dispatchEvent(
            new CustomEvent('headerContentCleared')
        );
    }

    // 2. Registry for elements moved to the head, and their associated cleanup mechanisms
    // Maps the *moved* element to the MutationObserver responsible for its cleanup
    const headTransferRegistry = new WeakMap();

    // Type IV clone for 'viewTitle' directive
    function processTitleSource(sourceNode) {
        // If the element is a custom tag 'app-title-source-tag', remove it from the DOM
        // to ensure no visual impact, similar to the original directive's behavior.
        if (sourceNode.tagName.toLowerCase() === 'app-title-source-tag') {
            sourceNode.remove();
        }

        // Initial update of the global header content based on the element's text.
        updateApplicationHeader(sourceNode.textContent);

        // MutationObserver to watch for changes in the element's text content.
        // This serves as a replacement for Angular's scope.$watch.
        const contentWatcher = new MutationObserver(modifications => {
            modifications.forEach(mod => {
                if (mod.type === 'characterData' || mod.type === 'childList') {
                    updateApplicationHeader(sourceNode.textContent);
                }
            });
        });
        contentWatcher.observe(sourceNode, {
            characterData: true,
            childList: true,
            subtree: true
        });

        // MutationObserver to detect when the sourceNode is removed from its parent.
        // This acts as a replacement for Angular's scope.$on('$destroy').
        const parentOfSource = sourceNode.parentNode;
        if (parentOfSource) {
            const removalWatcher = new MutationObserver(modifications => {
                modifications.forEach(mod => {
                    if (mod.type === 'childList') {
                        mod.removedNodes.forEach(removed => {
                            if (removed === sourceNode) {
                                contentWatcher.disconnect(); // Stop watching content
                                removalWatcher.disconnect(); // Stop watching for removal
                                removeApplicationHeader(); // Clear global header content
                            }
                        });
                    }
                });
            });
            removalWatcher.observe(parentOfSource, { childList: true });
        }
    }

    // Type IV clone for 'viewHead' directive
    function processHeadMover(moverNode) {
        const originalParentNode = moverNode.parentNode;
        if (!originalParentNode) {
            console.warn('Element with data-head-mover has no parent. Cannot move to document.head.');
            return;
        }

        // Move the element to the document.head.
        document.head.appendChild(moverNode);

        // Define a cleanup function for this specific moved element.
        const performCleanup = () => {
            if (moverNode.parentNode === document.head) {
                moverNode.remove();
            }
            // Remove from WeakMap to allow garbage collection
            headTransferRegistry.delete(moverNode);
        };

        // MutationObserver to detect when the *original parent* of the moverNode is removed from the DOM.
        // This simulates Angular's scope.$on('$destroy') by tying cleanup to the lifecycle of the original context.
        const originalParentRemovalWatcher = new MutationObserver(modifications => {
            modifications.forEach(mod => {
                if (mod.type === 'childList') {
                    mod.removedNodes.forEach(removed => {
                        if (removed === originalParentNode) {
                            performCleanup();
                            originalParentRemovalWatcher.disconnect(); // Stop watching once cleaned
                        }
                    });
                }
            });
        });

        // The observer needs to watch the *parent of the original parent* to detect when originalParentNode is removed.
        if (originalParentNode.parentNode) {
            originalParentRemovalWatcher.observe(originalParentNode.parentNode, { childList: true });
        } else {
            // If the original parent is `<html>` or `<body>`, it's a root element.
            // Its removal is usually tied to page unload or manual intervention.
            // For this Type IV, we'll rely on the global beforeunload cleanup for these cases.
        }

        // Store the observer with the moved element for potential global cleanup or explicit management.
        headTransferRegistry.set(moverNode, originalParentRemovalWatcher);
    }

    // Initial DOM scan and activation on page load
    document.addEventListener('DOMContentLoaded', () => {
        // Find and process all elements acting as title sources
        document.querySelectorAll('[data-app-title-origin]').forEach(processTitleSource);

        // Find and process all elements that need to be moved to the head
        document.querySelectorAll('[data-head-transfer]').forEach(processHeadMover);

        // A global MutationObserver to detect dynamically added elements.
        // This simulates the Angular compilation/linking process for new content.
        const dynamicContentMonitor = new MutationObserver(modifications => {
            modifications.forEach(mod => {
                if (mod.type === 'childList' && mod.addedNodes.length > 0) {
                    mod.addedNodes.forEach(addedNode => {
                        if (addedNode.nodeType === 1) { // Only process element nodes
                            // Check if the added node itself is a title source or head mover
                            if (addedNode.hasAttribute('data-app-title-origin')) {
                                processTitleSource(addedNode);
                            }
                            if (addedNode.hasAttribute('data-head-transfer')) {
                                processHeadMover(addedNode);
                            }
                            // Also check for descendants within the added node
                            addedNode.querySelectorAll('[data-app-title-origin]').forEach(processTitleSource);
                            addedNode.querySelectorAll('[data-head-transfer]').forEach(processHeadMover);
                        }
                    });
                }
            });
        });

        // Start observing the entire document body for dynamic changes
        dynamicContentMonitor.observe(document.body, { childList: true, subtree: true });

        // Global cleanup on page unload to ensure all observers are disconnected
        // and any remaining moved elements are removed from the head.
        window.addEventListener('beforeunload', () => {
            dynamicContentMonitor.disconnect();

            // Disconnect all individual observers created for head movers and perform their cleanup
            headTransferRegistry.forEach((observer, element) => {
                if (observer && typeof observer.disconnect === 'function') {
                    observer.disconnect();
                }
                // Explicitly remove the element if it's still in the head
                if (element.parentNode === document.head) {
                    element.remove();
                }
            });
            // Title source watchers self-disconnect upon element removal, so no global cleanup needed here.
        });
    });

})();