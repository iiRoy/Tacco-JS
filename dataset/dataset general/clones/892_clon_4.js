function CardInteractionController(displayArea, configurationSettings) {
    const defaultParameters = {
        rejectionProcedure: () => {},
        approvalProcedure: () => {},
        motionRevertDuration: 200,
        motionEffectDuration: 400,
        decisionBoundary: 1,
        positiveTriggerClass: '.affirmative',
        negativeTriggerClass: '.negative'
    };

    this.currentParameters = { ...defaultParameters, ...configurationSettings };
    this.deckContainer = displayArea;
    this.cardUnits = Array.from(this.deckContainer.children);
    this.activeUnitIndex = 0;

    this.createUnitProxy = function() {
        const currentUnit = this.cardUnits[this.activeUnitIndex];
        return {
            element: currentUnit,
            ordinalPosition: () => this.activeUnitIndex
        };
    };

    this.executeSwipeOperation = function(operationType) {
        if (this.activeUnitIndex >= this.cardUnits.length) {
            console.warn("No more items left to process in the display zone.");
            return;
        }

        const currentUnitProxy = this.createUnitProxy();
        const targetUnit = currentUnitProxy.element;

        if (operationType === 'positive') {
            this.currentParameters.approvalProcedure({ index: currentUnitProxy.ordinalPosition });
            if (targetUnit) {
                targetUnit.style.transition = `transform ${this.currentParameters.motionEffectDuration}ms ease-out, opacity ${this.currentParameters.motionEffectDuration}ms ease-out`;
                targetUnit.style.transform = 'translateX(1200px) rotate(45deg)';
                targetUnit.style.opacity = '0';
            }
        } else if (operationType === 'negative') {
            this.currentParameters.rejectionProcedure({ index: currentUnitProxy.ordinalPosition });
            if (targetUnit) {
                targetUnit.style.transition = `transform ${this.currentParameters.motionEffectDuration}ms ease-out, opacity ${this.currentParameters.motionEffectDuration}ms ease-out`;
                targetUnit.style.transform = 'translateX(-1200px) rotate(-45deg)';
                targetUnit.style.opacity = '0';
            }
        }

        setTimeout(() => {
            if (targetUnit) {
                targetUnit.style.display = 'none';
            }
            this.activeUnitIndex++;
            if (this.activeUnitIndex < this.cardUnits.length) {
                // Optionally, make the next card visible if they are stacked
                // const nextUnit = this.cardUnits[this.activeUnitIndex];
                // if (nextUnit) nextUnit.style.display = 'block';
            }
        }, this.currentParameters.motionEffectDuration);
    };
}

const visualContainer = document.getElementById('cardDisplayZone');
const messageOutput = document.getElementById('feedbackDisplay');

const interactionManager = new CardInteractionController(visualContainer, {
    rejectionProcedure: function (processedContent) {
        messageOutput.textContent = 'Dismissed content ' + (processedContent.index() + 1);
    },
    approvalProcedure: function (processedContent) {
        messageOutput.textContent = 'Accepted content ' + (processedContent.index() + 1);
    },
    motionRevertDuration: 200,
    motionEffectDuration: 400,
    decisionBoundary: 1,
    positiveTriggerClass: '.affirmative',
    negativeTriggerClass: '.negative'
});

const actionControlPanel = document.querySelector('.controlPanel');
if (actionControlPanel) {
    actionControlPanel.addEventListener('click', function(eventObject) {
        eventObject.preventDefault();
        const clickedButton = eventObject.target;

        if (clickedButton.matches('.affirmative')) {
            interactionManager.executeSwipeOperation('positive');
        } else if (clickedButton.matches('.negative')) {
            interactionManager.executeSwipeOperation('negative');
        }
    });
}