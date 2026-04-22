document.addEventListener('DOMContentLoaded', function productDisplaySetup() {
    const mainGalleryWrapper = document.querySelector('body.product #product-images');

    if (!mainGalleryWrapper) {
        return;
    }

    const mainDisplayUnit = mainGalleryWrapper.querySelector('img');
    const thumbCollection = mainGalleryWrapper.querySelectorAll('ul img');

    if (!mainDisplayUnit || thumbCollection.length === 0) {
        return;
    }

    mainGalleryWrapper.addEventListener('click', function handleThumbInteraction(evt) {
        evt.preventDefault();

        const clickedElement = evt.target;
        if (clickedElement.tagName.toLowerCase() !== 'img') {
            return;
        }

        const anchorParent = clickedElement.closest('a');
        if (!anchorParent) {
            return;
        }

        const newSourcePath = anchorParent.getAttribute('href');
        const newDescriptionText = clickedElement.getAttribute('alt');

        if (mainDisplayUnit.getAttribute('src') === newSourcePath) {
            return;
        }

        document.body.style.cursor = 'progress';

        const updateDisplay = function() {
            mainDisplayUnit.setAttribute('src', newSourcePath);
            mainDisplayUnit.setAttribute('alt', newDescriptionText);
        };

        const restoreCursor = function() {
            document.body.style.cursor = 'auto';
            mainDisplayUnit.removeEventListener('load', restoreCursor); // Clean up after execution
        };

        mainDisplayUnit.addEventListener('load', restoreCursor);
        updateDisplay();
    });
});