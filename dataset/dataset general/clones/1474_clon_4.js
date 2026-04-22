const domAssist = (() => {

    const acquireElement = (identifier) => {
        return (typeof identifier === 'string') ? document.getElementById(identifier) : identifier;
    };

    const eventAliases = new Map([
        ['mousewheel', 'DOMMouseScroll']
    ]);

    const manageElementSubscription = (target, eventKind, handler, operation) => {
        const actualElement = acquireElement(target);
        if (!actualElement) return;

        const standardMethod = operation === 'enroll' ? 'addEventListener' : 'removeEventListener';
        const legacyMethod = operation === 'enroll' ? 'attachEvent' : 'detachEvent';

        if (actualElement[standardMethod]) {
            if (eventAliases.has(eventKind)) {
                actualElement[standardMethod](eventAliases.get(eventKind), handler, false);
            }
            actualElement[standardMethod](eventKind, handler, false);
        } else if (actualElement[legacyMethod]) {
            actualElement[legacyMethod](`on${eventKind}`, handler);
        }
    };

    const cascadeProperties = (destinationObject, sourceProperties) => {
        Object.keys(sourceProperties).forEach(attribute => {
            const sourceValue = sourceProperties[attribute];
            const destinationValue = destinationObject[attribute];

            if (typeof sourceValue === 'object' && sourceValue !== null) {
                if (Array.isArray(sourceValue)) {
                    destinationObject[attribute] = sourceValue;
                } else {
                    if (typeof destinationValue !== 'object' || destinationValue === null || Array.isArray(destinationValue)) {
                        destinationObject[attribute] = {};
                    }
                    cascadeProperties(destinationObject[attribute], sourceValue);
                }
            } else {
                destinationObject[attribute] = sourceValue;
            }
        });
        return destinationObject;
    };

    return {
        enrollHandler: (nodeRef, triggerType, actionFn) => manageElementSubscription(nodeRef, triggerType, actionFn, 'enroll'),

        releaseHandler: (nodeRef, triggerType, actionFn) => manageElementSubscription(nodeRef, triggerType, actionFn, 'release'),

        obstructEventFlow: (evt) => {
            const currentEvt = evt || window.event;
            if (!currentEvt) return false;

            [
                (e) => e.stopPropagation && e.stopPropagation(),
                (e) => e.preventDefault && e.preventDefault(),
                (e) => { e.cancelBubble = true; },
                (e) => { e.cancel = true; },
                (e) => { e.returnValue = false; }
            ].forEach(fn => fn(currentEvt));

            return false;
        },

        integrateAttributes: cascadeProperties,

        isSocketCapable: () => (
            Reflect.has(window, 'WebSocket') || Reflect.has(window, 'MozWebSocket')
        ),

        obtainSocketConstructor: () => (
            Reflect.get(window, 'WebSocket') || Reflect.get(window, 'MozWebSocket')
        )
    };
})();