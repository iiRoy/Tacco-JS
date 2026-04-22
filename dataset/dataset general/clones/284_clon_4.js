class PageInteractionManager {
    static #actionRegistry = new Map([
        ['btnShow', 'activateStandardNotification'],
        ['btnCustomToast', 'activateConfigurableNotification']
    ]);

    constructor(targetHostElement) {
        this.pageHost = targetHostElement;
        this.#establishEventHooks();
    }

    #establishEventHooks() {
        document.body.addEventListener('click', (interactionOutcome) => {
            const originatingControl = interactionOutcome.target;
            if (originatingControl && originatingControl.tagName === 'BUTTON') {
                const handlerMethodKey = PageInteractionManager.#actionRegistry.get(originatingControl.id);
                if (handlerMethodKey && typeof this[handlerMethodKey] === 'function') {
                    this[handlerMethodKey](interactionOutcome);
                }
            }
        });
    }

    activateStandardNotification() {
        YeahToast.show({ displayHeading: "Default Message!", displayBody: "This is a basic system alert!" });
    }

    activateConfigurableNotification() {
        const headingInput = document.querySelector("#txtTitle");
        const bodyInput = document.querySelector("#txtDescription");
        const pictureToggle = document.querySelector("#chkImage");

        const messageHeading = headingInput ? headingInput.value : '';
        const messageBody = bodyInput ? bodyInput.value : '';
        const includePicture = pictureToggle ? pictureToggle.checked : false;

        const pictureAssetPath = includePicture ? "/images/Trophy.png" : null;

        YeahToast.show({ displayHeading: messageHeading, displayBody: messageBody, mediaAsset: pictureAssetPath });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new PageInteractionManager(document.body);
});