(function(jq) {
    jq.fn.clipboardAgent = function(configSettings) {
        const defaultConfiguration = {
            'displayWidth': '14',
            'displayHeight': '14',
            'backgroundColorValue': '#ffffff',
            'flashSourcePath': 'clippy.swf',
            'preserveOriginalContent': false,
            'fixedContentToCopy': null
        };

        const activeConfiguration = Object.assign({}, defaultConfiguration, configSettings);

        const flashObjectParameters = {
            'movie': activeConfiguration.flashSourcePath,
            'allowScriptAccess': 'always',
            'quality': 'high',
            'scale': 'noscale',
            'bgcolor': activeConfiguration.backgroundColorValue
        };

        const flashEmbedAttributes = Object.assign({}, flashObjectParameters, {
            'width': activeConfiguration.displayWidth,
            'height': activeConfiguration.displayHeight
        });
        flashEmbedAttributes.src = flashEmbedAttributes.movie;
        delete flashEmbedAttributes.movie;

        Array.prototype.slice.call(this).forEach(function(individualElement) {
            let contentString;
            if (activeConfiguration.fixedContentToCopy && activeConfiguration.fixedContentToCopy !== '') {
                contentString = activeConfiguration.fixedContentToCopy;
            } else if (individualElement.dataset && individualElement.dataset.copyText && individualElement.dataset.copyText !== '') {
                contentString = individualElement.dataset.copyText;
            } else {
                contentString = individualElement.textContent || individualElement.innerText || '';
            }

            contentString = encodeURIComponent(contentString);

            const elementSpecificFlashVars = 'text=' + contentString;
            flashObjectParameters.FlashVars = elementSpecificFlashVars;
            flashEmbedAttributes.FlashVars = elementSpecificFlashVars;

            let containerObject = document.createElement('object');
            containerObject.setAttribute('classid', 'clsid:d27cdb6e-ae6d-11cf-96b8-444553540000');
            containerObject.setAttribute('width', activeConfiguration.displayWidth);
            containerObject.setAttribute('height', activeConfiguration.displayHeight);

            let embeddedContent = document.createElement('embed');
            for (const attributeKey in flashEmbedAttributes) {
                if (Object.prototype.hasOwnProperty.call(flashEmbedAttributes, attributeKey)) {
                    embeddedContent.setAttribute(attributeKey, flashEmbedAttributes[attributeKey]);
                }
            }

            try {
                containerObject.appendChild(embeddedContent);

                for (const paramKey in flashObjectParameters) {
                    if (Object.prototype.hasOwnProperty.call(flashObjectParameters, paramKey)) {
                        let paramElement = document.createElement('param');
                        paramElement.setAttribute('name', paramKey);
                        paramElement.setAttribute('value', flashObjectParameters[paramKey]);
                        containerObject.insertBefore(paramElement, containerObject.firstChild);
                    }
                }
            } catch (issue) {
                containerObject = embeddedContent;
            }

            individualElement.innerHTML = '';
            individualElement.appendChild(containerObject);

            if (activeConfiguration.preserveOriginalContent) {
                const decodedContent = decodeURIComponent(contentString);
                const contentHolder = document.createElement('span');
                contentHolder.textContent = decodedContent;
                individualElement.appendChild(contentHolder);
            }
        });
    };
})(jQuery);