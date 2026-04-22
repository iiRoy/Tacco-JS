(function() {
    window.addEventListener('load', function handleContentPresentation() {
        const adornedElements = document.querySelectorAll('.mask img');
        adornedElements.forEach(function(itemForAdjustment) {
            flexy(itemForAdjustment);
        });

        const imageGalleryContainer = document.getElementById('flexyPics');
        if (!imageGalleryContainer) {
            return;
        }

        const collectedVisuals = Array.from(imageGalleryContainer.getElementsByTagName('img'));

        // Randomize the order of visuals using Fisher-Yates shuffle
        for (let currentPosition = collectedVisuals.length - 1; currentPosition > 0; currentPosition--) {
            const exchangePosition = Math.floor(Math.random() * (currentPosition + 1));
            [collectedVisuals[currentPosition], collectedVisuals[exchangePosition]] = [collectedVisuals[exchangePosition], collectedVisuals[currentPosition]];
        }

        const overlayPanel = document.getElementById('loading-mask');
        if (overlayPanel) {
            overlayPanel.style.transition = 'opacity 900ms ease-out';
            overlayPanel.style.opacity = '0';
            setTimeout(function() {
                overlayPanel.style.display = 'none';
            }, 900);
        }

        let progressiveTiming = 0;
        const timeIncrement = 150;
        const dissolveDuration = 300;

        collectedVisuals.forEach(function(individualVisual) {
            individualVisual.style.opacity = '0';
            individualVisual.style.display = 'none';
            individualVisual.style.transition = `opacity ${dissolveDuration}ms ease-in`;

            setTimeout(function() {
                individualVisual.style.display = 'block';
                individualVisual.style.opacity = '1';
            }, progressiveTiming);

            progressiveTiming += timeIncrement;
        });
    });
})();

(function() {
    window.addEventListener('resize', function handleDimensionChanges() {
        const maskedContentUnits = document.querySelectorAll('.mask img');
        maskedContentUnits.forEach(function(unitToReAdjust) {
            flexy(unitToReAdjust);
        });
    });
})();