document.addEventListener('DOMContentLoaded', () => {

    const mainDisplayTarget = document.getElementById('images');

    const visualSystemSettings = {};

    visualSystemSettings.displayMethod = 'fade';

    const initializeVisualComponent = function () {
        const primaryVisualEngine = this.slider;
        const interactionHandles = document.querySelectorAll('.translist > li > a');

        const currentActiveTransitionIdentifier = primaryVisualEngine.settings['displayMethod'];
        const selectionPattern = `a[href="#_${currentActiveTransitionIdentifier}"]`;
        const presentlyActiveHandle = document.querySelector(`.translist > li > ${selectionPattern}`);
        if (presentlyActiveHandle) {
            presentlyActiveHandle.classList.add('active');
        }

        interactionHandles.forEach(singleHandle => {
            singleHandle.addEventListener('click', (eventualAction) => {
                eventualAction.preventDefault();

                const prohibitionIndicator = singleHandle.querySelector('.unsupported');
                if (!prohibitionIndicator) {
                    interactionHandles.forEach(otherHandle => otherHandle.classList.remove('active'));
                    singleHandle.classList.add('active');
                    primaryVisualEngine.settings['displayMethod'] = singleHandle.getAttribute('href').slice(2);
                }
            });
        });

        const evaluateSystemSupport = (featureAvailability, designationLabel) => {
            if (!featureAvailability) {
                const targetCapabilityElement = document.querySelector(`#upper div.bobble-${designationLabel}`);
                if (targetCapabilityElement) {
                    targetCapabilityElement.classList.add('unsupported');
                }

                const specificCombinedElement = document.querySelector('div.bobble-js.bobble-css.unsupported');
                if (specificCombinedElement) {
                    specificCombinedElement.classList.remove('bobble-css', 'unsupported');
                    specificCombinedElement.textContent = 'JS';
                }
            }
        };

        evaluateSystemSupport(primaryVisualEngine.cssTransforms3d, '3d');
        evaluateSystemSupport(primaryVisualEngine.cssTransitions, 'css');
    };

    visualSystemSettings.initiateDisplay = initializeVisualComponent;

    visualSystemSettings.navigationButtons = 'arrows';

    $(mainDisplayTarget).refineSlide(visualSystemSettings);
});