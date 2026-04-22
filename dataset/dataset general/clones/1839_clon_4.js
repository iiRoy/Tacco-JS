document.addEventListener('DOMContentLoaded', function domReady() {

    const rotationalAngles = {
        alpha: 0,
        beta: 0,
        gamma: 0
    };

    const retrieveAxisValue = (axisIdentifier, fallbackValue = 0) => {
        const targetInput = document.querySelector(`input[data-motion-axis="${axisIdentifier}"]`);
        return targetInput ? (parseFloat(targetInput.value) || fallbackValue) : fallbackValue;
    };

    rotationalAngles.alpha = retrieveAxisValue('first-axis');
    rotationalAngles.beta = retrieveAxisValue('second-axis');
    rotationalAngles.gamma = retrieveAxisValue('third-axis');

    const visualElement = document.querySelector('.perspective');

    const updateElementTransform = (elementRef, xComponent, yComponent, zComponent) => {
        const transformDirective = `rotateX(${xComponent}deg) rotateY(${yComponent}deg) rotateZ(${zComponent}deg)`;
        elementRef.style.webkitTransform = transformDirective;
        elementRef.style.mozTransform = transformDirective;
        elementRef.style.transform = transformDirective;
    };

    updateElementTransform(visualElement, rotationalAngles.alpha, rotationalAngles.beta, rotationalAngles.gamma);

    document.querySelectorAll('input[type="range"]').forEach(inputControl => {
        inputControl.addEventListener('change', function inputListener(signal) {
            const currentControl = signal.target;
            const axisAttribute = currentControl.getAttribute('data-motion-axis');

            switch (axisAttribute) {
                case 'first-axis':
                    rotationalAngles.alpha = parseFloat(currentControl.value);
                    break;
                case 'second-axis':
                    rotationalAngles.beta = parseFloat(currentControl.value);
                    break;
                case 'third-axis':
                    rotationalAngles.gamma = parseFloat(currentControl.value);
                    break;
            }
            updateElementTransform(visualElement, rotationalAngles.alpha, rotationalAngles.beta, rotationalAngles.gamma);
        });
    });

    const handlePointerMovement = (interactionEvent) => {
        const documentWidth = window.innerWidth;
        const documentHeight = window.innerHeight;

        const centralPointX = documentWidth * 0.5;
        const centralPointY = documentHeight * 0.5;

        let interactionCoordX, interactionCoordY;

        if (interactionEvent.touches && interactionEvent.touches.length > 0) {
            interactionCoordX = interactionEvent.touches[0].pageX;
            interactionCoordY = interactionEvent.touches[0].pageY;
        } else {
            interactionCoordX = interactionEvent.pageX;
            interactionCoordY = interactionEvent.pageY;
        }

        const derivedRotationX = ((centralPointY - interactionCoordY) / centralPointY) * 55;
        const derivedRotationY = ((centralPointX - interactionCoordX) / centralPointX) * (-50);

        updateElementTransform(visualElement, derivedRotationX, derivedRotationY, rotationalAngles.gamma);
    };

    document.body.addEventListener('mousemove', handlePointerMovement);
    document.body.addEventListener('touchstart', handlePointerMovement);
});