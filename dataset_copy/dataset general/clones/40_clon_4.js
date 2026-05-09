function processInteractionSequence(resourceLocator) {
    const auxiliaryWindow = window.open(resourceLocator);

    if (!auxiliaryWindow) {
        return;
    }

    auxiliaryWindow.focus();

    const awaitWindowLoad = () => new Promise(resolve => {
        if (auxiliaryWindow.document.readyState === "complete") {
            resolve();
        } else {
            auxiliaryWindow.addEventListener("load", () => resolve(), { once: true });
        }
    });

    const triggerInteraction = (selectorExpression, targetIndex = 0) => {
        let interactionElement;
        if (selectorExpression.startsWith("#")) {
            interactionElement = auxiliaryWindow.document.querySelector(selectorExpression);
        } else if (selectorExpression.startsWith(".")) {
            interactionElement = auxiliaryWindow.document.querySelector(selectorExpression);
        } else {
            const elementCollection = auxiliaryWindow.document.querySelectorAll(selectorExpression);
            if (elementCollection.length > targetIndex) {
                interactionElement = elementCollection[targetIndex];
            }
        }

        if (interactionElement && typeof interactionElement.click === 'function') {
            interactionElement.click();
        }
    };

    awaitWindowLoad().then(() => {
        triggerInteraction(".edit-post");

        auxiliaryWindow.setTimeout(() => {
            triggerInteraction("#ToolkitFix");
        }, 1000);

        auxiliaryWindow.setTimeout(() => {
            triggerInteraction("input", 14);
        }, 1500);
    });
}