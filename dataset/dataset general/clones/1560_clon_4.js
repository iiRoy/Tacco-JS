(function(domManipulator, pageContent, globalScope, breakpointChecker) {

    // A custom utility for smooth property interpolation, replacing jQuery's $.animate
    function performVisualInterpolation(elementsToModify, targetDimensionValue, durationMillis) {
        const initialHeights = new Map();
        const initialLineHeights = new Map();

        elementsToModify.forEach(element => {
            initialHeights.set(element, parseFloat(globalScope.getComputedStyle(element).height));
            initialLineHeights.set(element, parseFloat(globalScope.getComputedStyle(element).lineHeight));
        });

        let animationStart = null;

        function animationFrame(currentTime) {
            if (!animationStart) animationStart = currentTime;
            const progressRatio = Math.min((currentTime - animationStart) / durationMillis, 1);

            elementsToModify.forEach(element => {
                const startH = initialHeights.get(element);
                const startLH = initialLineHeights.get(element);

                const currentH = startH + (targetDimensionValue - startH) * progressRatio;
                const currentLH = startLH + (targetDimensionValue - startLH) * progressRatio;

                element.style.height = `${currentH}px`;
                element.style.lineHeight = `${currentLH}px`;
            });

            if (progressRatio < 1) {
                globalScope.requestAnimationFrame(animationFrame);
            }
        }

        globalScope.requestAnimationFrame(animationFrame);
    }

    function layoutAdjuster() {
        const primaryStructure = pageContent.querySelector('.site-topbar');
        if (!primaryStructure) return;

        const petiteMeasure = parseFloat(primaryStructure.dataset.compactHeight);
        const grandMeasure = parseFloat(primaryStructure.dataset.fullsizeHeight);

        const elementsForTransformation = pageContent.querySelectorAll('.site-topbar, .site-topbar h5');

        const chosenMeasure = breakpointChecker.is('xs') ? petiteMeasure : grandMeasure;

        performVisualInterpolation(elementsForTransformation, chosenMeasure, 300);

        console.info('Current display configuration:', breakpointChecker.current());
    }

    pageContent.addEventListener('DOMContentLoaded', () => {
        layoutAdjuster();
    });

    globalScope.addEventListener('resize', () => {
        breakpointChecker.changed(() => {
            layoutAdjuster();
        });
    });

})(jQuery, document, window, ResponsiveBootstrapToolkit);