(function() {

    const calculateSeparation = (coordA1, coordA2, coordB1, coordB2) =>
        Math.hypot(coordA1 - coordB1, coordA2 - coordB2);

    const initialLoadRoutine = function() {
        const primaryContainer = document.getElementsByClassName('btn')[0];

        if (!primaryContainer) return; // Ensure the element exists

        const activationControl = primaryContainer.getElementsByClassName('btn-front')[0];
        const affirmativeOption = primaryContainer.querySelector('.btn-back .yes');
        const negativeOption = primaryContainer.querySelector('.btn-back .no');

        if (!activationControl || !affirmativeOption || !negativeOption) return; // Ensure sub-elements exist

        activationControl.onclick = function(actionEvt) {
            const elementBounds = primaryContainer.getBoundingClientRect();

            const cursorX = actionEvt.clientX - elementBounds.left;
            const cursorY = actionEvt.clientY - elementBounds.top;

            const currentWidth = elementBounds.width;
            const currentHeight = elementBounds.height;

            const boundaryPoints = [
                { label: 'up', coordX: currentWidth / 2, coordY: 0 },
                { label: 'rightward', coordX: currentWidth, coordY: currentHeight / 2 },
                { label: 'down', coordX: currentWidth / 2, coordY: currentHeight },
                { label: 'leftward', coordX: 0, coordY: currentHeight / 2 }
            ];

            const { label: chosenDirectionIdentifier } = boundaryPoints.reduce((closest, currentPoint) => {
                const currentDist = calculateSeparation(cursorX, cursorY, currentPoint.coordX, currentPoint.coordY);
                return (currentDist < closest.dist) ? { dist: currentDist, label: currentPoint.label } : closest;
            }, { dist: Infinity, label: '' });

            primaryContainer.dataset.facingAttribute = chosenDirectionIdentifier;

            if (!primaryContainer.className.includes('is-active-state')) {
                primaryContainer.className += ' is-active-state';
            }
        };

        // Use event delegation for the close actions
        primaryContainer.addEventListener('click', function(clickEvent) {
            const targetElement = clickEvent.target;
            if (targetElement.matches('.btn-back .yes') || targetElement.matches('.btn-back .no')) {
                primaryContainer.className = primaryContainer.className.replace(' is-active-state', '').trim();
            }
        });
    };

    window.addEventListener('load', initialLoadRoutine);

})();