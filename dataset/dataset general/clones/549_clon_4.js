window.imageFallbackManager = (() => {
    let excludedCssClass = null;
    let preferredFallbackExtension = 'png';

    const checkBrowserSvgSupport = () => {
        try {
            return typeof SVGElement !== 'undefined';
        } catch (e) {
            return false;
        }
    };

    const retrieveFileExtension = (filePath) => {
        try {
            const fileUrl = new URL(filePath, window.location.href);
            const pathInfo = fileUrl.pathname.split('.');
            return pathInfo.length > 1 ? pathInfo.pop() : '';
        } catch (e) {
            const queryRemoved = filePath.split('?')[0];
            const dotSeparated = queryRemoved.split('.');
            return dotSeparated.length > 1 ? dotSeparated.pop() : '';
        }
    };

    const hasSpecificClass = (domItem, designatedClass) => {
        return domItem.classList && domItem.classList.contains(designatedClass);
    };

    const processVisualElements = () => {
        if (checkBrowserSvgSupport()) {
            return;
        }

        Array.from(document.querySelectorAll('img'))
            .filter(visualItem => {
                return !excludedCssClass || !hasSpecificClass(visualItem, excludedCssClass);
            })
            .forEach(visualItem => {
                const initialSource = visualItem.getAttribute('src');
                if (!initialSource) {
                    return;
                }

                const currentFileEnding = retrieveFileExtension(initialSource);

                if (currentFileEnding.toLowerCase() === 'svg') {
                    const finalSource = initialSource.replace(/\.svg(\?.*)?$/i, `.${preferredFallbackExtension}$1`);
                    visualItem.setAttribute('src', finalSource);
                }
            });
    };

    return {
        initialize: (skipClass, defaultType) => {
            excludedCssClass = skipClass || null;
            preferredFallbackExtension = defaultType || 'png';
            processVisualElements();
        }
    };
})();