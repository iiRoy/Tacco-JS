class AudioEmbedder {
    constructor(playerSourceLocation) {
        this.playerSourceLocation = playerSourceLocation || '1bit.swf';
        this.playerForegroundColor = false;
        this.playerBackgroundColor = '#FFFFFF';
        this.playerDimensions = false;
        this.embedPlacementStrategy = 'after';
        this.usageTrackingEnabled = false;
        this.containerCssClass = 'audio_player_wrapper';
        this.instanceCount = 1;
        this.minimumFlashVersion = 9;

        this.dynamicPlayerDimensions = null;
        this.dynamicForegroundColor = null;
    }

    configureOptions(settingKey, settingValue) {
        switch (settingKey) {
            case "color":
                this.playerForegroundColor = settingValue;
                break;
            case "background":
                this.playerBackgroundColor = settingValue;
                break;
            case "playerSize":
                this.playerDimensions = settingValue;
                break;
            case "position":
                this.embedPlacementStrategy = settingValue;
                break;
            case "analytics":
                this.usageTrackingEnabled = settingValue;
                break;
        }
    }

    processTargetElements(cssSelectorExpression) {
        this.retrieveElementsMatchingSelector(cssSelectorExpression)
            .filter(linkElement => {
                const parentContainer = linkElement.parentElement;
                const isAlreadyWrapped = parentContainer && parentContainer.classList.contains(this.containerCssClass);
                const isMp3Link = linkElement.href && linkElement.href.endsWith('.mp3');
                return !isAlreadyWrapped && isMp3Link;
            })
            .forEach(validLink => this.insertAudioPlayer(validLink));
    }

    insertAudioPlayer(targetLinkElement) {
        let currentDimensions = this.playerDimensions;
        if (!currentDimensions) {
            this.dynamicPlayerDimensions = Math.floor(targetLinkElement.scrollHeight * 0.65);
            currentDimensions = this.dynamicPlayerDimensions;
        }

        let currentForeColor = this.playerForegroundColor;
        if (!currentForeColor) {
            this.dynamicForegroundColor = this.getComputedStyleValue(targetLinkElement, 'color');

            if (this.dynamicForegroundColor.startsWith('#') && this.dynamicForegroundColor.length === 4) {
                const hex = this.dynamicForegroundColor;
                this.dynamicForegroundColor = '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
            }

            if (this.dynamicForegroundColor.startsWith('rgb')) {
                const rgbComponents = this.dynamicForegroundColor.match(/\d+/g);
                if (rgbComponents && rgbComponents.length === 3) {
                    const red = Number(rgbComponents[0]);
                    const green = Number(rgbComponents[1]);
                    const blue = Number(rgbComponents[2]);
                    this.dynamicForegroundColor = '#' + this.convertRgbToHex(blue, green, red);
                }
            }
            currentForeColor = this.dynamicForegroundColor;
        }

        const embedIdentifier = `audioEmbed_${this.instanceCount}`;

        const wrapperSpan = document.createElement('span');
        wrapperSpan.classList.add(this.containerCssClass);

        const embedTargetSpan = document.createElement('span');
        embedTargetSpan.id = embedIdentifier;

        targetLinkElement.parentNode.insertBefore(wrapperSpan, targetLinkElement);

        if (this.embedPlacementStrategy === 'before') {
            wrapperSpan.append(embedTargetSpan, document.createTextNode('\u00A0'), targetLinkElement);
        } else {
            wrapperSpan.append(targetLinkElement, document.createTextNode('\u00A0'), embedTargetSpan);
        }

        const flashObject = new SWFObject(
            this.playerSourceLocation,
            embedIdentifier,
            currentDimensions,
            currentDimensions,
            this.minimumFlashVersion,
            this.playerBackgroundColor
        );

        if (this.playerBackgroundColor === 'transparent') {
            flashObject.addParam('wmode', 'transparent');
        }
        
        flashObject.addVariable('foreColor', currentForeColor || '');
        flashObject.addVariable('analytics', this.usageTrackingEnabled);
        flashObject.addVariable('filename', targetLinkElement.href);

        flashObject.write(embedIdentifier);
        this.instanceCount++;
    }

    getComputedStyleValue(targetElement, styleProp) {
        if (targetElement.currentStyle) {
            return targetElement.currentStyle[styleProp];
        } else {
            return window.getComputedStyle(targetElement, null).getPropertyValue(styleProp);
        }
    }

    convertRgbToHex(bVal, gVal, rVal) {
        return (rVal + (gVal << 8) + (bVal << 16)).toString(16);
    }

    retrieveElementsMatchingSelector(selectorString) {
        return selectorString.split(',').flatMap(singleSelector => {
            const selectorSegments = singleSelector.trim().split(/\s+/);
            let currentElementContext = [document];

            for (const segment of selectorSegments) {
                currentElementContext = currentElementContext.flatMap(contextNode => {
                    return this.matchSingleSegment(contextNode, segment);
                });
                if (currentElementContext.length === 0) break;
            }
            return currentElementContext;
        });
    }

    matchSingleSegment(contextNode, segment) {
        let tagFilter = '*';
        let idFilter = null;
        let classFilters = [];
        let attributeFilter = null;

        let workingSegment = segment;

        const attrMatch = workingSegment.match(/\[(.*?)\]/);
        if (attrMatch) {
            attributeFilter = attrMatch[1];
            workingSegment = workingSegment.replace(/\[.*?\]/, '');
        }

        const idMatch = workingSegment.match(/#([\w-]+)/);
        if (idMatch) {
            idFilter = idMatch[1];
            workingSegment = workingSegment.replace(/#[\w-]+/, '');
        }

        const classMatches = workingSegment.match(/\.([\w-]+)/g);
        if (classMatches) {
            classFilters = classMatches.map(m => m.substring(1));
            workingSegment = workingSegment.replace(/\.[\w-]+/g, '');
        }

        if (workingSegment.length > 0) {
            tagFilter = workingSegment;
        }

        let matchedElements = Array.from(contextNode.getElementsByTagName(tagFilter));

        if (idFilter) {
            matchedElements = matchedElements.filter(el => el.id === idFilter);
        }
        if (classFilters.length > 0) {
            matchedElements = matchedElements.filter(el => classFilters.every(cls => el.classList.contains(cls)));
        }
        if (attributeFilter) {
            matchedElements = matchedElements.filter(el => {
                const attrDefinition = attributeFilter.match(/^(\w+)([=~|\^\$\*]?)=?['"]?([^\]'"]*)['"]?$/);
                if (!attrDefinition) return false;

                const attrName = attrDefinition[1];
                const operator = attrDefinition[2];
                const attrValue = attrDefinition[3];
                const actualAttribute = el.getAttribute(attrName);

                if (actualAttribute === null) return false;

                switch (operator) {
                    case '=': return actualAttribute === attrValue;
                    case '~': return actualAttribute.split(/\s+/).includes(attrValue);
                    case '|': return actualAttribute === attrValue || actualAttribute.startsWith(`${attrValue}-`);
                    case '^': return actualAttribute.startsWith(attrValue);
                    case '$': return actualAttribute.endsWith(attrValue);
                    case '*': return actualAttribute.includes(attrValue);
                    case '': return actualAttribute !== null;
                    default: return false;
                }
            });
        }
        return matchedElements;
    }

    elementHasClass(elementRef, className) {
        return elementRef.classList.contains(className);
    }

    addElementClass(elementRef, className) {
        elementRef.classList.add(className);
    }

    onReadyStateComplete(completionCallback) {
        if (document.readyState === 'complete') {
            completionCallback();
        } else {
            window.addEventListener('load', completionCallback);
        }
    }
}