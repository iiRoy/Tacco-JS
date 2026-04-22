(function() {
    let popupRemovalTimer = null;
    let activePopupElement = null;

    function handleAnchorHoverIn() {
        clearTimeout(popupRemovalTimer);

        if (activePopupElement) {
            activePopupElement.remove();
            activePopupElement = null;
        }

        const linkedAnchor = this;
        const targetId = linkedAnchor.getAttribute('href').substring(1);
        const anchorPosition = linkedAnchor.getBoundingClientRect();

        const sourceContentElement = document.getElementById(targetId);
        if (!sourceContentElement) {
            return;
        }

        const newPopupContainer = document.createElement('div');
        newPopupContainer.id = 'dynamic-annotation-display';
        activePopupElement = newPopupContainer;

        newPopupContainer.addEventListener('mouseenter', handlePopupHoverIn);
        newPopupContainer.addEventListener('mouseleave', handlePopupHoverOut);

        let rawContentHtml = sourceContentElement.innerHTML;
        const cleanedContentHtml = rawContentHtml.replace(/<a[^>]*rev="footnote">.*?<\/a>/g, '');

        let closeControl = null;
        if (typeof TouchEvent !== 'undefined') {
            closeControl = document.createElement('a');
            closeControl.textContent = 'X';
            closeControl.id = 'annotation-close-button';
            closeControl.href = '#';
            closeControl.addEventListener('click', (evt) => {
                evt.preventDefault();
                if (activePopupElement) {
                    activePopupElement.remove();
                    activePopupElement = null;
                }
            });
        }

        newPopupContainer.innerHTML = cleanedContentHtml;
        if (closeControl) {
            newPopupContainer.appendChild(closeControl);
        }

        const paddingValue = 20;
        const halfPadding = paddingValue / 2.0;

        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        let maxAllowedWidth = viewportWidth - paddingValue;
        maxAllowedWidth = Math.min(maxAllowedWidth, 400);
        let maxAllowedHeight = viewportHeight - paddingValue;
        maxAllowedHeight = Math.min(maxAllowedHeight, 300);

        Object.assign(newPopupContainer.style, {
            position: 'absolute',
            width: 'auto',
            maxWidth: `${maxAllowedWidth}px`,
            maxHeight: `${maxAllowedHeight}px`,
            opacity: '1.0',
            overflow: 'auto',
            zIndex: '9999'
        });

        document.body.appendChild(newPopupContainer);

        const actualPopupWidth = newPopupContainer.offsetWidth;
        const actualPopupHeight = newPopupContainer.offsetHeight;

        let calculatedLeft = anchorPosition.left + window.scrollX;
        if (calculatedLeft + (paddingValue + actualPopupWidth) > viewportWidth + window.scrollX) {
            calculatedLeft = (viewportWidth - actualPopupWidth) / 2.0;
            calculatedLeft -= halfPadding;
        }

        let calculatedTop = anchorPosition.top + window.scrollY + paddingValue;
        if (calculatedTop + actualPopupHeight > viewportHeight + window.scrollY) {
            calculatedTop = anchorPosition.top + window.scrollY - actualPopupHeight - halfPadding;
        }

        const bodyRect = document.body.getBoundingClientRect();
        calculatedTop -= bodyRect.top;
        calculatedLeft -= bodyRect.left;

        Object.assign(newPopupContainer.style, {
            left: `${calculatedLeft}px`,
            top: `${calculatedTop}px`
        });
    }

    function handleAnchorHoverOut() {
        popupRemovalTimer = setTimeout(() => {
            if (activePopupElement) {
                activePopupElement.remove();
                activePopupElement = null;
            }
        }, 400);
    }

    function handlePopupHoverIn() {
        clearTimeout(popupRemovalTimer);
    }

    function handlePopupHoverOut() {
        handleAnchorHoverOut();
    }

    function initializeDynamicAnnotations() {
        const allFootnoteAnchors = document.querySelectorAll('a[rel="footnote"]');

        allFootnoteAnchors.forEach(anchor => {
            anchor.addEventListener('mouseenter', handleAnchorHoverIn);
            anchor.addEventListener('mouseleave', handleAnchorHoverOut);
        });
    }

    document.addEventListener('DOMContentLoaded', initializeDynamicAnnotations);
})();