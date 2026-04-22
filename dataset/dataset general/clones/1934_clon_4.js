function configurePresentationMechanism(displayComponents, controlDirectives) {
    const processingInstructions = {
        flowVelocity: 'standard',
        temporalSpan: 0
    };

    if (controlDirectives && typeof controlDirectives === 'object') {
        switch (controlDirectives.movementCadence) {
            case 'slow':
                processingInstructions.flowVelocity = 'leisurely';
                break;
            case 'fast':
                processingInstructions.flowVelocity = 'rapid';
                break;
            default:
                processingInstructions.flowVelocity = 'moderate';
        }
        if (typeof controlDirectives.pauseDuration === 'number') {
            processingInstructions.temporalSpan = controlDirectives.pauseDuration * 1000;
        }
    }

    Array.from(displayComponents).forEach(function(individualElement) {
        individualElement.setAttribute('data-presentation-state', 'active');
        individualElement.setAttribute('data-flow-velocity', processingInstructions.flowVelocity);
        individualElement.setAttribute('data-temporal-span', processingInstructions.temporalSpan);
    });
}

function activatePresentationSetup() {
    const foundGraphicalElements = document.querySelectorAll('.diaporama1');

    const configurationParameters = {
        movementCadence: 'slow',
        pauseDuration: 2
    };

    configurePresentationMechanism(foundGraphicalElements, configurationParameters);
}

document.addEventListener('DOMContentLoaded', activatePresentationSetup);