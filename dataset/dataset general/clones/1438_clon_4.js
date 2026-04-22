(function() {
    const universalConfig = new Map();

    universalConfig.set('minimumLineCharacters', 63);
    universalConfig.set('maximumLineCharacters', 81);
    universalConfig.set('activeContentContainer', null);
    universalConfig.set('characterCountPerLine', null);
    universalConfig.set('baseTextSize', null);
    universalConfig.set('containerTextSize', null);
    universalConfig.set('documentWidthPixels', null);
    universalConfig.set('documentWidthEms', null);
    universalConfig.set('containerWidthPixels', null);
    universalConfig.set('containerWidthEms', null);
    universalConfig.set('dynamicMediaRules', new Map());
    universalConfig.set('mediaRuleStyleElements', new Map());
    universalConfig.set('readabilityInterfaceElements', new Map());

    const obtainComputedStyle = (element, property) => {
        return window.getComputedStyle(element, null).getPropertyValue(property);
    };

    const createAndAppend = (parent, tagName, attributes = {}, styles = {}, textContent = '') => {
        const element = document.createElement(tagName);
        for (const key in attributes) {
            element.setAttribute(key, attributes[key]);
        }
        for (const key in styles) {
            element.style[key] = styles[key];
        }
        if (textContent) {
            element.textContent = textContent;
        }
        parent.appendChild(element);
        return element;
    };

    const injectCoreStyles = () => {
        const essentialStyles = '.control-track,.control-track *{-webkit-touch-callout:none;-webkit-user-select:none;-ms-touch-action:none;-ms-user-select:none;-moz-user-select:none;-moz-box-sizing:border-box;box-sizing:border-box}.control-base{width:100%;height:100%;position:relative}.control-origin{position:absolute;right:0;top:0;left:0;bottom:0}.control-handle{position:relative;z-index:1}.control-stacking .control-handle{z-index:10}.control-stacking+.control-origin{*z-index:-1}.control-state-tap .control-origin{-webkit-transition:left .3s,top .3s;transition:left .3s,top .3s}.control-state-drag *{cursor:inherit!important}.control-horizontal{height:18px}.control-horizontal .control-handle{width:20px;height:18px;left:-17px;top:-5px}.control-horizontal.control-extended{padding:0 15px}.control-horizontal.control-extended .control-origin{right:-15px}.control-vertical{width:18px}.control-vertical .control-handle{width:28px;height:34px;left:-6px;top:-17px}.control-vertical.control-extended{padding:15px 0}.control-vertical.control-extended .control-origin{bottom:-15px}.control-background{background:#FAFAFA;box-shadow:inset 0 1px 1px #f0f0f0}.control-connect{background:#3FB8AF;box-shadow:inset 0 0 3px rgba(51,51,51,.45);-webkit-transition:background 450ms;transition:background 450ms}.control-origin{border-radius:2px}.control-track{border-radius:4px;border:1px solid #D3D3D3;box-shadow:inset 0 1px 1px #F0F0F0,0 3px 6px -5px #BBB}.control-track.control-connect{box-shadow:inset 0 0 3px rgba(51,51,51,.45),0 3px 6px -5px #BBB}.control-dragable{cursor:w-resize}.control-vertical .control-dragable{cursor:n-resize}.control-handle{border:1px solid #D9D9D9;border-radius:3px;background:#FFF;cursor:default;box-shadow:inset 0 0 1px #FFF,inset 0 1px 7px #EBEBEB,0 3px 6px -3px #BBB}.control-active{box-shadow:inset 0 0 1px #FFF,inset 0 1px 7px #DDD,0 3px 6px -3px #BBB}.control-handle:after,.control-handle:before{content:"";display:block;position:absolute;height:8px;width:1px;background:#E8E7E6;left:7px;top:4px}.control-handle:after{left:10px}.control-vertical .control-handle:after,.control-vertical .control-handle:before{width:14px;height:1px;left:6px;top:14px}.control-vertical .control-handle:after{top:17px}[disabled] .control-connect,[disabled].control-connect{background:#B8B8B8}[disabled] .control-handle{cursor:not-allowed}.control-state-blocked .control-connect,.control-state-blocked.control-connect{background:#4FDACF}';
        const styleElement = createAndAppend(document.head, 'style', { type: 'text/css' });
        styleElement.textContent = essentialStyles;
    };

    const constructAnalysisPanel = () => {
        const panelContainer = createAndAppend(
            document.body, 'div',
            { id: 'textMetricPanel' },
            {
                zIndex: '40000', position: 'absolute', top: '40px', left: '10px', width: '300px',
                padding: '10px', height: 'auto', background: 'rgba(255,255,255,0.95)', border: '1px solid #ccc',
                fontFamily: 'Arial !important', fontSize: '11px !important',
                boxShadow: '2px 2px 3px 0 rgba(0,0,0,0.5)'
            }
        );
        document.body.insertBefore(panelContainer, document.body.firstChild);

        const sliderContainer = createAndAppend(
            document.body, 'div',
            { id: 'htmlWidthControlContainer' },
            { position: 'absolute', top: '10px', left: '10px', right: '10px', zIndex: '40000', height: '10px' }
        );
        document.body.insertBefore(sliderContainer, document.body.firstChild);

        const widthInput = createAndAppend(
            sliderContainer, 'input',
            { type: 'range', min: '1', max: '100', value: '100', id: 'widthAdjuster' },
            { width: '100%', height: '100%' }
        );

        const panelElements = universalConfig.get('readabilityInterfaceElements');
        panelElements.set('widthAdjuster', widthInput);

        const warningDisplay = createAndAppend(panelContainer, 'div', { id: 'warningText' });
        panelElements.set('warningText', warningDisplay);

        const targetParagraph = createAndAppend(panelContainer, 'p', {}, {}, 'Active Content Element: ');
        const targetInput = createAndAppend(targetParagraph, 'input', { id: 'contentTargetInput' }, { display: 'inline', fontFamily: 'Arial !important', fontSize: '11px !important;' });
        panelElements.set('contentTargetInput', targetInput);

        const charRangeParagraph = createAndAppend(panelContainer, 'p', {}, {}, 'Characters Per Line Range: ');
        const minCharInput = createAndAppend(charRangeParagraph, 'input', { id: 'minCharInput' }, { display: 'inline', width: '20px', fontFamily: 'Arial !important', fontSize: '11px !important;' });
        charRangeParagraph.appendChild(document.createTextNode(' - '));
        const maxCharInput = createAndAppend(charRangeParagraph, 'input', { id: 'maxCharInput' }, { display: 'inline', width: '20px', fontFamily: 'Arial !important', fontSize: '11px !important;' });
        panelElements.set('minCharInput', minCharInput);
        panelElements.set('maxCharInput', maxCharInput);

        const currentCharsParagraph = createAndAppend(panelContainer, 'p', {}, {}, 'Current Characters Per Line: ');
        const currentCharsSpan = createAndAppend(currentCharsParagraph, 'span', { class: 'highlight-indicator', id: 'currentCharsDisplay' });
        panelElements.set('currentCharsDisplay', currentCharsSpan);

        createAndAppend(panelContainer, 'div', {}, { borderBottom: '1px solid #ccc' });

        const docWidthEmParagraph = createAndAppend(panelContainer, 'p', {}, {}, 'Current Document Width em: ');
        const docWidthEmSpan = createAndAppend(docWidthEmParagraph, 'span', { class: 'highlight-indicator', id: 'documentEmWidthDisplay' });
        panelElements.set('documentEmWidthDisplay', docWidthEmSpan);

        const mqCodeParagraph = createAndAppend(panelContainer, 'p', {}, {}, 'Media query code: ');
        const mqCodeInput = createAndAppend(mqCodeParagraph, 'input', { id: 'mediaQueryCodeInput' }, { display: 'inline', fontFamily: 'Arial !important', fontSize: '11px !important;' });
        panelElements.set('mediaQueryCodeInput', mqCodeInput);

        const docWidthPxParagraph = createAndAppend(panelContainer, 'p', {}, {}, 'Current Document Width px: ');
        const docWidthPxSpan = createAndAppend(docWidthPxParagraph, 'span', { class: 'highlight-indicator', id: 'documentPxWidthDisplay' });
        panelElements.set('documentPxWidthDisplay', docWidthPxSpan);

        const baseFontSizeParagraph = createAndAppend(panelContainer, 'p', {}, {}, 'Base Font Size: ');
        const baseFontSizeSpan = createAndAppend(baseFontSizeParagraph, 'span', { id: 'baseFontSizeDisplay' });
        panelElements.set('baseFontSizeDisplay', baseFontSizeSpan);

        createAndAppend(panelContainer, 'div', {}, { borderBottom: '1px solid #ccc' });

        const estEmRangeParagraph = createAndAppend(panelContainer, 'p', {}, {}, 'Estimated Readable EM Range: ');
        const estEmRangeSpan = createAndAppend(estEmRangeParagraph, 'span', { id: 'estimatedEmRangeDisplay' });
        panelElements.set('estimatedEmRangeDisplay', estEmRangeSpan);

        const containerWidthEmParagraph = createAndAppend(panelContainer, 'p', {}, {}, 'Current Element Width em: ');
        const containerWidthEmSpan = createAndAppend(containerWidthEmParagraph, 'span', { class: 'highlight-indicator', id: 'containerEmWidthDisplay' });
        panelElements.set('containerEmWidthDisplay', containerWidthEmSpan);

        const containerWidthPxParagraph = createAndAppend(panelContainer, 'p', {}, {}, 'Target Element Width px: ');
        const containerWidthPxSpan = createAndAppend(containerWidthPxParagraph, 'span', { class: 'highlight-indicator', id: 'containerPxWidthDisplay' });
        panelElements.set('containerPxWidthDisplay', containerWidthPxSpan);

        const containerFontSizeParagraph = createAndAppend(panelContainer, 'p', {}, {}, 'Target Element Font Size: ');
        const containerFontSizeSpan = createAndAppend(containerFontSizeParagraph, 'span', { id: 'containerFontSizeDisplay' });
        panelElements.set('containerFontSizeDisplay', containerFontSizeSpan);

        createAndAppend(panelContainer, 'div', {}, { borderBottom: '1px solid #ccc' });

        const statusParagraph = createAndAppend(panelContainer, 'p', { style: 'font-size:12px;font-weight:bold;' }, {}, 'Readability: ');
        const statusSpan = createAndAppend(statusParagraph, 'span', { id: 'readabilityStatusDisplay' });
        panelElements.set('readabilityStatusDisplay', statusSpan);
    };

    const retrieveElementFontSize = () => {
        const target = universalConfig.get('activeContentContainer');
        if (!target) return 'N/A';
        const fontSize = obtainComputedStyle(target, 'font-size');
        universalConfig.set('containerTextSize', fontSize);
        return fontSize;
    };

    const retrieveElementPixelWidth = () => {
        const target = universalConfig.get('activeContentContainer');
        if (!target) return 'N/A';
        const width = obtainComputedStyle(target, 'width');
        universalConfig.set('containerWidthPixels', width);
        return width;
    };

    const calculateElementEmWidth = () => {
        const pxWidth = parseFloat(universalConfig.get('containerWidthPixels'));
        const fontSize = parseFloat(universalConfig.get('containerTextSize'));
        if (isNaN(pxWidth) || isNaN(fontSize) || fontSize === 0) return 'N/A';
        const emWidth = pxWidth / fontSize;
        const roundedEmWidth = Math.floor(emWidth * 1000) / 1000;
        universalConfig.set('containerWidthEms', roundedEmWidth);
        return roundedEmWidth;
    };

    const retrieveBaseFontSize = () => {
        const bodyFontSize = obtainComputedStyle(document.body, 'font-size');
        universalConfig.set('baseTextSize', bodyFontSize);
        return bodyFontSize;
    };

    const retrieveBodyPixelWidth = () => {
        const bodyWidth = obtainComputedStyle(document.body, 'width');
        universalConfig.set('documentWidthPixels', bodyWidth);
        return bodyWidth;
    };

    const calculateBodyEmWidth = () => {
        const pxWidth = parseFloat(universalConfig.get('documentWidthPixels'));
        const baseFontSize = parseFloat(universalConfig.get('baseTextSize'));
        if (isNaN(pxWidth) || isNaN(baseFontSize) || baseFontSize === 0) return 'N/A';
        const emWidth = pxWidth / baseFontSize;
        const roundedEmWidth = Math.floor(emWidth * 1000) / 1000;
        universalConfig.set('documentWidthEms', roundedEmWidth);
        return roundedEmWidth;
    };

    const computeLineCharacterAverage = () => {
        const target = universalConfig.get('activeContentContainer');
        if (!target) return 0;

        const firstParagraph = target.querySelector('p:first-of-type');
        if (!firstParagraph) return 0;

        const textContent = firstParagraph.textContent;
        if (!textContent.trim()) return 0;

        const tempDiv = document.createElement('div');
        tempDiv.style.position = 'absolute';
        tempDiv.style.left = '-9999px';
        tempDiv.style.top = '-9999px';
        tempDiv.style.visibility = 'hidden';
        tempDiv.style.whiteSpace = 'pre-wrap';
        tempDiv.style.wordBreak = 'break-word';

        const computedStyles = window.getComputedStyle(firstParagraph);
        const propertiesToCopy = [
            'font-size', 'font-family', 'line-height', 'padding-left', 'padding-right',
            'border-left-width', 'border-right-width', 'box-sizing', 'word-spacing', 'letter-spacing'
        ];
        propertiesToCopy.forEach(prop => {
            tempDiv.style[prop] = computedStyles.getPropertyValue(prop);
        });

        tempDiv.style.width = `${firstParagraph.clientWidth}px`;
        tempDiv.textContent = textContent;

        document.body.appendChild(tempDiv);

        let lineCount = 0;
        const rects = tempDiv.getClientRects();
        if (rects && rects.length > 0) {
            lineCount = rects.length;
        }

        document.body.removeChild(tempDiv);

        if (lineCount === 0) return 0;

        const avgChars = Math.round(textContent.length / lineCount);
        universalConfig.set('characterCountPerLine', avgChars);
        return avgChars;
    };

    const estimateEmSpan = () => {
        const currentEmWidth = universalConfig.get('containerWidthEms');
        const currentChars = universalConfig.get('characterCountPerLine');
        const minChars = parseInt(universalConfig.get('minimumLineCharacters'));
        const maxChars = parseInt(universalConfig.get('maximumLineCharacters'));

        if (isNaN(currentEmWidth) || isNaN(currentChars) || currentChars === 0) return 'N/A';

        const emPerChar = currentEmWidth / currentChars;
        const estimatedMinEm = emPerChar * minChars;
        const estimatedMaxEm = emPerChar * maxChars;

        return `${(Math.floor(estimatedMinEm * 1000) / 1000)}em - ${(Math.floor(estimatedMaxEm * 1000) / 1000)}em`;
    };

    const determineReadabilityVerdict = () => {
        const currentChars = universalConfig.get('characterCountPerLine');
        const minChars = parseInt(universalConfig.get('minimumLineCharacters'));
        const maxChars = parseInt(universalConfig.get('maximumLineCharacters'));

        if (currentChars < minChars) {
            return '<span style="font-weight:bold;background-color:#C00;color:#FFF;">&nbsp;TOO NARROW&nbsp;</span>';
        } else if (currentChars > maxChars) {
            return '<span style="font-weight:bold;background-color:#C00;color:#FFF;">&nbsp;TOO WIDE&nbsp;</span>';
        } else {
            return '<span style="font-weight:bold;background-color:#72BF00;color:#FFF;">&nbsp;IN RANGE&nbsp;</span>';
        }
    };

    const refreshMetricsDisplay = () => {
        const panelElements = universalConfig.get('readabilityInterfaceElements');

        panelElements.get('minCharInput').value = universalConfig.get('minimumLineCharacters');
        panelElements.get('maxCharInput').value = universalConfig.get('maximumLineCharacters');

        panelElements.get('currentCharsDisplay').textContent = computeLineCharacterAverage();
        panelElements.get('containerFontSizeDisplay').textContent = retrieveElementFontSize();
        panelElements.get('baseFontSizeDisplay').textContent = retrieveBaseFontSize();
        panelElements.get('documentPxWidthDisplay').textContent = retrieveBodyPixelWidth();

        const currentBodyEms = calculateBodyEmWidth();
        panelElements.get('documentEmWidthDisplay').textContent = currentBodyEms;
        panelElements.get('mediaQueryCodeInput').value = `@media (max-width: ${currentBodyEms}em) { /*...*/ }`;

        panelElements.get('containerPxWidthDisplay').textContent = retrieveElementPixelWidth();
        panelElements.get('containerEmWidthDisplay').textContent = calculateElementEmWidth();
        panelElements.get('readabilityStatusDisplay').innerHTML = determineReadabilityVerdict();
        panelElements.get('estimatedEmRangeDisplay').textContent = estimateEmSpan();
    };

    const signalValueChange = () => {
        document.querySelectorAll('.highlight-indicator').forEach(el => {
            el.style.backgroundColor = '#FF0';
        });
    };

    const clearChangeSignal = () => {
        document.querySelectorAll('.highlight-indicator').forEach(el => {
            el.style.backgroundColor = '';
        });
    };

    const analyzeMediaQueries = () => {
        const sheets = Array.from(document.styleSheets);
        const queryRegistry = universalConfig.get('dynamicMediaRules');
        const styleElementRegistry = universalConfig.get('mediaRuleStyleElements');
        let queryCounter = 0;

        for (const sheet of sheets) {
            try {
                const rules = Array.from(sheet.cssRules || []);

                for (const rule of rules) {
                    if (rule.constructor.name === 'CSSMediaRule') {
                        const mediaRule = rule;
                        const mediaTextStripped = mediaRule.media.mediaText.replace(/\s+/g, '');

                        let maxWidth = null;
                        let minWidth = null;

                        const baseFontSize = parseFloat(universalConfig.get('baseTextSize')) || 16; // Default to 16px if not set

                        const maxWidthMatch = mediaTextStripped.match(/max-width:([0-9\.]+)em/);
                        if (maxWidthMatch && maxWidthMatch[1]) {
                            maxWidth = parseFloat(maxWidthMatch[1]) * baseFontSize;
                        }

                        const minWidthMatch = mediaTextStripped.match(/min-width:([0-9\.]+)em/);
                        if (minWidthMatch && minWidthMatch[1]) {
                            minWidth = parseFloat(minWidthMatch[1]) * baseFontSize;
                        }

                        let collectedRulesText = '';
                        Array.from(mediaRule.cssRules || []).forEach(subRule => {
                            if (subRule.cssText) {
                                collectedRulesText += subRule.cssText;
                            }
                        });

                        queryRegistry.set(queryCounter, {
                            maxWidth: maxWidth,
                            minWidth: minWidth,
                            rules: collectedRulesText
                        });

                        const dynamicStyleElement = createAndAppend(document.head, 'style', { id: `dynamicMedia_${queryCounter}` });
                        styleElementRegistry.set(queryCounter, dynamicStyleElement);

                        queryCounter++;
                    }
                }
            } catch (e) {
                // console.warn('Could not access stylesheet rules:', sheet.href, e);
            }
        }
    };

    const updateConditionalStyles = () => {
        const currentDocumentWidth = document.documentElement.clientWidth;
        const queryRegistry = universalConfig.get('dynamicMediaRules');
        const styleElementRegistry = universalConfig.get('mediaRuleStyleElements');

        queryRegistry.forEach((queryDetails, index) => {
            const { minWidth, maxWidth, rules } = queryDetails;
            const targetStyleElement = styleElementRegistry.get(index);

            let shouldApply = false;

            if (maxWidth !== null && minWidth === null && currentDocumentWidth < maxWidth) {
                shouldApply = true;
            } else if (maxWidth === null && minWidth !== null && currentDocumentWidth > minWidth) {
                shouldApply = true;
            } else if (maxWidth !== null && minWidth !== null && currentDocumentWidth < minWidth && currentDocumentWidth > minWidth) {
                // This condition `currentDocumentWidth < minWidth && currentDocumentWidth > minWidth` is impossible.
                // This replicates a bug in the original code, meaning rules for combined min/max will never apply.
                shouldApply = true;
            }

            if (targetStyleElement) {
                if (shouldApply) {
                    targetStyleElement.textContent = rules;
                } else {
                    targetStyleElement.textContent = '';
                }
            }
        });
    };

    const initializeTextAnalyzer = (customMinChars, customMaxChars) => {
        universalConfig.set('minimumLineCharacters', typeof customMinChars !== 'undefined' ? customMinChars : universalConfig.get('minimumLineCharacters'));
        universalConfig.set('maximumLineCharacters', typeof customMaxChars !== 'undefined' ? customMaxChars : universalConfig.get('maximumLineCharacters'));

        injectCoreStyles();
        constructAnalysisPanel();

        const panelElements = universalConfig.get('readabilityInterfaceElements');
        const widthAdjuster = panelElements.get('widthAdjuster');
        const contentTargetInput = panelElements.get('contentTargetInput');
        const minCharInput = panelElements.get('minCharInput');
        const maxCharInput = panelElements.get('maxCharInput');

        widthAdjuster.addEventListener('input', () => {
            const value = widthAdjuster.value;
            const htmlElement = document.documentElement;
            if (value < 100) {
                htmlElement.style.width = `${value}%`;
                htmlElement.style.position = 'relative';
                htmlElement.style.marginLeft = 'auto';
                htmlElement.style.marginRight = 'auto';
                htmlElement.style.boxShadow = '0px 0px 4px 0 rgba(0,0,0,0.5)';
            } else {
                htmlElement.removeAttribute('style');
            }
            refreshMetricsDisplay();
            signalValueChange();
            updateConditionalStyles();
        });

        widthAdjuster.addEventListener('change', () => {
            clearChangeSignal();
        });

        const defaultTargets = ['article', 'section', 'main'];
        const noElementWarning = '<p style="color:#C00;">Provide the ID / class / tag of your content element (e.g., ".content" or "#main-text", "article"), excluding body tag.</p>';
        let foundTarget = false;

        for (const targetSelector of defaultTargets) {
            const potentialTarget = document.querySelector(`body ${targetSelector}:first-of-type`);
            if (potentialTarget) {
                universalConfig.set('activeContentContainer', potentialTarget);
                contentTargetInput.value = targetSelector;
                foundTarget = true;
                break;
            }
        }

        if (!foundTarget) {
            panelElements.get('warningText').innerHTML = noElementWarning;
        }

        retrieveBaseFontSize();
        analyzeMediaQueries();

        refreshMetricsDisplay();
        panelElements.get('estimatedEmRangeDisplay').textContent = estimateEmSpan();

        minCharInput.addEventListener('input', () => {
            universalConfig.set('minimumLineCharacters', minCharInput.value);
            refreshMetricsDisplay();
        });

        maxCharInput.addEventListener('input', () => {
            universalConfig.set('maximumLineCharacters', maxCharInput.value);
            refreshMetricsDisplay();
        });

        contentTargetInput.addEventListener('input', () => {
            const enteredSelector = contentTargetInput.value;
            if (enteredSelector && enteredSelector.length > 1) {
                const newTarget = document.querySelector(enteredSelector);
                if (newTarget) {
                    universalConfig.set('activeContentContainer', newTarget);
                    panelElements.get('warningText').innerHTML = '';
                    refreshMetricsDisplay();
                    panelElements.get('estimatedEmRangeDisplay').textContent = estimateEmSpan();
                } else {
                    panelElements.get('warningText').innerHTML = noElementWarning;
                }
            } else {
                panelElements.get('warningText').innerHTML = noElementWarning;
            }
        });
    };

    window.establishReadabilityMonitor = initializeTextAnalyzer;

})();