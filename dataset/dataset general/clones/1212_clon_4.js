document.addEventListener('DOMContentLoaded', function() {
    processMediaElements();
    enhanceVisualContent();
});

function processMediaElements() {
    const mediaElements = Array.from(document.querySelectorAll('video'));
    if (mediaElements.length === 0) {
        return;
    }

    mediaElements.forEach(function(currentMedia) {
        const mediaSourceElement = currentMedia.querySelector('source');
        const mediaSourceURL = mediaSourceElement ? mediaSourceElement.getAttribute('src') : '';

        if (!mediaSourceURL.includes('mp4') || (typeof Modernizr !== 'undefined' && Modernizr.video && !Modernizr.video.h264)) {
            const wrappingContainer = document.createElement('span');
            wrappingContainer.className = 'video-embed-wrapper';
            currentMedia.parentNode.insertBefore(wrappingContainer, currentMedia);
            wrappingContainer.appendChild(currentMedia);

            const flashEmbedInstance = document.createElement('object');
            flashEmbedInstance.setAttribute('type', 'application/x-shockwave-flash');
            flashEmbedInstance.setAttribute('data', typeof flashplayerlocation !== 'undefined' ? flashplayerlocation : '/assets/player.swf');
            flashEmbedInstance.setAttribute('width', currentMedia.offsetWidth.toString());
            flashEmbedInstance.setAttribute('height', (currentMedia.offsetHeight + 29).toString());

            const paramMovie = document.createElement('param');
            paramMovie.setAttribute('name', 'movie');
            paramMovie.setAttribute('value', mediaSourceURL);
            flashEmbedInstance.appendChild(paramMovie);

            const paramWmode = document.createElement('param');
            paramWmode.setAttribute('name', 'wmode');
            paramWmode.setAttribute('value', 'opaque');
            flashEmbedInstance.appendChild(paramWmode);

            const paramFullscreen = document.createElement('param');
            paramFullscreen.setAttribute('name', 'allowfullscreen');
            paramFullscreen.setAttribute('value', 'true');
            flashEmbedInstance.appendChild(paramFullscreen);

            const flashVars = [];
            flashVars.push('file=' + encodeURIComponent(mediaSourceURL));
            flashVars.push('image=' + encodeURIComponent(currentMedia.getAttribute('poster') || ''));
            flashVars.push('skin=' + encodeURIComponent(typeof flashplayerskin !== 'undefined' ? flashplayerskin : '/assets/skin.swf'));

            const paramVars = document.createElement('param');
            paramVars.setAttribute('name', 'flashvars');
            paramVars.setAttribute('value', flashVars.join('&'));
            flashEmbedInstance.appendChild(paramVars);

            wrappingContainer.appendChild(flashEmbedInstance);
            currentMedia.remove();

        } else if (currentMedia.getAttribute('preload') === 'none') {
            currentMedia.addEventListener('click', function handler(event) {
                lazyMediaLoader(currentMedia);
                currentMedia.removeEventListener('click', handler);
            });
        }
    });
}

function lazyMediaLoader(targetMedia) {
    targetMedia.setAttribute('preload', 'auto');
    if (!targetMedia.hasAttribute('autoplay') || targetMedia.getAttribute('autoplay') === 'false') {
        targetMedia.setAttribute('autoplay', 'true');
    }
}

function enhanceVisualContent() {
    const titledImages = Array.from(document.querySelectorAll('img[title]'));
    titledImages.filter(function(currentImage) {
        return !currentImage.closest('.gallery-item');
    }).forEach(function(currentImage) {
        applyVisualDescription(currentImage, currentImage.getAttribute('title'));
    });

    const quoteElements = Array.from(document.querySelectorAll('q'));
    quoteElements.forEach(function(currentQuote) {
        const annotationContent = currentQuote.innerHTML;
        let associatedVisual = currentQuote.previousElementSibling;

        if (!associatedVisual || associatedVisual.tagName.toLowerCase() !== 'img') {
            const parentContainer = currentQuote.parentNode;
            const prevParentSibling = parentContainer.previousElementSibling;
            if (prevParentSibling) {
                const imagesInPrevSibling = Array.from(prevParentSibling.querySelectorAll('img'));
                if (imagesInPrevSibling.length > 0) {
                    associatedVisual = imagesInPrevSibling[imagesInPrevSibling.length - 1];
                }
            }
            parentContainer.remove();
        }
        currentQuote.remove();
        applyVisualDescription(associatedVisual, annotationContent);
    });
}

function applyVisualDescription(visualAsset, descriptionString) {
    if (!visualAsset) return;

    const outerWrapper = document.createElement('span');
    outerWrapper.className = 'visual-wrapper';
    outerWrapper.style.width = visualAsset.offsetWidth + 'px';

    visualAsset.parentNode.insertBefore(outerWrapper, visualAsset);
    outerWrapper.appendChild(visualAsset);

    const descriptionSpan = document.createElement('span');
    descriptionSpan.className = 'image-description';
    descriptionSpan.innerHTML = descriptionString;
    descriptionSpan.style.width = (visualAsset.offsetWidth - 10) + 'px';

    visualAsset.insertAdjacentElement('afterend', descriptionSpan);
}