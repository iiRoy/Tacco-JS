document.addEventListener('DOMContentLoaded', function() {
    const navigationUnits = document.querySelectorAll('nav.panel-controls');

    Array.from(navigationUnits).forEach(function(currentNavigationUnit) {
        const interactionTriggers = currentNavigationUnit.querySelectorAll(':scope > li > a');

        currentNavigationUnit.addEventListener('click', function(activationEvent) {
            const activatedTrigger = activationEvent.target;

            if (activatedTrigger.matches(':scope > li > a')) {
                const targetPanelReference = activatedTrigger.getAttribute('href');

                if (targetPanelReference && targetPanelReference.startsWith('#')) {
                    activationEvent.preventDefault();

                    Array.from(interactionTriggers).forEach(function(trigger) {
                        trigger.classList.remove('activated-state');
                    });

                    activatedTrigger.classList.add('activated-state');

                    const displayComponent = document.querySelector(targetPanelReference);

                    if (displayComponent) {
                        const componentWrapper = displayComponent.parentNode;

                        Array.from(componentWrapper.children).forEach(function(siblingComponent) {
                            if (siblingComponent.nodeType === Node.ELEMENT_NODE && siblingComponent !== displayComponent) {
                                siblingComponent.style.display = 'none';
                                siblingComponent.classList.remove('activated-state');
                            }
                        });

                        displayComponent.style.display = 'block';
                        displayComponent.classList.add('activated-state');
                    }
                }
            }
        });
    });
});