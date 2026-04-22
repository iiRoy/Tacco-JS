function getIntrinsicHeight(elementReference) {
    const initialHeight = elementReference.style.height;
    elementReference.style.height = 'auto';
    const calculatedHeight = elementReference.scrollHeight + 'px';
    elementReference.style.height = initialHeight;
    return calculatedHeight;
}

function animateUnfold(targetVisual, motionDuration) {
    targetVisual.style.overflow = 'hidden';
    const finalVisualHeight = getIntrinsicHeight(targetVisual);
    targetVisual.style.height = '0px';

    const visualTransition = targetVisual.animate(
        [
            { height: '0px' },
            { height: finalVisualHeight }
        ],
        {
            duration: motionDuration,
            easing: 'ease-out',
            fill: 'forwards'
        }
    );

    return visualTransition.finished.then(() => {
        targetVisual.style.height = '';
        targetVisual.style.overflow = '';
    });
}

function delayExecution(timeInMilliseconds) {
  return new Promise(resumeOperation => setTimeout(resumeOperation, timeInMilliseconds));
}

document.addEventListener('DOMContentLoaded', async () => {
    const mainDisplayElement = document.querySelector('header');
    const allContentContainers = document.querySelectorAll('section');
    const secondContentContainer = allContentContainers[1];
    const pageFootingElement = document.querySelector('footer');

    [mainDisplayElement, ...allContentContainers, pageFootingElement].forEach(item => {
        if (item) {
            item.style.height = '0px';
            item.style.overflow = 'hidden';
            item.style.display = 'block';
        }
    });

    if (mainDisplayElement) {
        await animateUnfold(mainDisplayElement, 500);
    }

    if (pageFootingElement) {
        delayExecution(505).then(() => animateUnfold(pageFootingElement, 500));
    }

    if (secondContentContainer) {
        delayExecution(1000).then(() => animateUnfold(secondContentContainer, 400));
    }

    if (allContentContainers.length > 0) {
        delayExecution(1500).then(() => {
            allContentContainers.forEach(container => animateUnfold(container, 500));
        });
    }
});