(function(jqPlug, presentationKey) {
    const mainDocument = document;
    let lookupPanel = null;

    const lookupIdentifier = 'searchComponent';

    const baseOptions = {
        headingSelectors: 'header, h1, h2, h3, h4',
        employNavigation: true,
        housing: {
            target: 'body',
            id: 'locator_wrapper',
            defaultStyle: {
                position: 'fixed',
                top: '0',
                left: '0',
                background: 'none',
                border: 'none',
                padding: '0.4em',
                'font-size': '12pt',
                'z-index': '10',
                overflow: 'auto'
            },
            activeStyle: {
                background: '#fff',
                border: '1px solid #aaa',
                'border-left': 'none',
                'border-top': 'none'
            }
        },
        suggestion: {
            display: true,
            id: 'guidance_tip',
            text: "(Clue: Press 'F' to locate)",
            elementStyle: {
                'font-style': 'italic',
                color: '#000',
                background: '#fff',
                opacity: '0.5',
                padding: '0.2em'
            }
        },
        query: {
            id: 'query_input',
            dormantStyle: {
                outline: 'none',
                width: '3.3em'
            },
            activeStyle: {
                outline: 'none',
                width: 'auto'
            }
        },
        outcomes: {
            id: 'result_listing',
            itemClass: 'found_item',
            hitMarkerStyle: 'font-style: italic; font-size: 80%; color: #888;'
        },
        keybinds: {
            activateQuery: 70, // f
            clearQuery: 27, // esc
            proceedToResult: 13 // enter
        }
    };

    function customDeepMerge(target, source) {
        const output = { ...target };
        if (target && typeof target === 'object' && source && typeof source === 'object') {
            Object.keys(source).forEach(key => {
                if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                    if (!(key in target)) {
                        Object.assign(output, { [key]: source[key] });
                    } else {
                        output[key] = customDeepMerge(target[key], source[key]);
                    }
                } else {
                    Object.assign(output, { [key]: source[key] });
                }
            });
        }
        return output;
    }

    jqPlug[presentationKey].defaults[lookupIdentifier] = {};
    jqPlug.extend(true, jqPlug[presentationKey].defaults[lookupIdentifier], baseOptions);

    let documentKeyHandler, documentClickHandler, resizeHandler;
    let guidanceElement, entryField, outcomeDisplay;
    let currentParameters;

    function disableLookup() {
        mainDocument.removeEventListener('keyup', documentKeyHandler);
        mainDocument.removeEventListener('click', documentClickHandler);
        window.removeEventListener('resize', resizeHandler);

        if (lookupPanel) {
            lookupPanel.remove();
            lookupPanel = null;
        }
        const oldPanel = document.getElementById(baseOptions.housing.id);
        if (oldPanel) {
            oldPanel.remove();
        }
    }

    function enableLookup(userOptions) {
        currentParameters = customDeepMerge({}, jqPlug[presentationKey].defaults[lookupIdentifier]);
        currentParameters = customDeepMerge(currentParameters, userOptions);

        disableLookup();

        lookupPanel = mainDocument.createElement('div');
        lookupPanel.id = currentParameters.housing.id;
        Object.assign(lookupPanel.style, currentParameters.housing.defaultStyle);

        lookupPanel.addEventListener('focusin', () => {
            if (guidanceElement) {
                guidanceElement.remove();
                guidanceElement = null;
            }
            Object.assign(entryField.style, currentParameters.query.activeStyle);
        });

        lookupPanel.addEventListener('focusout', () => {
            entryField.removeAttribute('placeholder');
            if (!outcomeDisplay.innerHTML) {
                Object.assign(entryField.style, currentParameters.query.dormantStyle);
                Object.assign(lookupPanel.style, currentParameters.housing.defaultStyle);
            }
        });

        if (currentParameters.suggestion.display) {
            guidanceElement = mainDocument.createElement('div');
            guidanceElement.id = currentParameters.suggestion.id;
            guidanceElement.textContent = currentParameters.suggestion.text;
            Object.assign(guidanceElement.style, currentParameters.suggestion.elementStyle);
            lookupPanel.appendChild(guidanceElement);
        }

        entryField = mainDocument.createElement('input');
        entryField.id = currentParameters.query.id;
        entryField.type = 'search';
        entryField.setAttribute('results', '5');
        entryField.setAttribute('autocomplete', 'on');
        entryField.placeholder = 'Locate...';
        Object.assign(entryField.style, currentParameters.query.dormantStyle);

        entryField.addEventListener('keyup', (event) => {
            event.stopPropagation();
            
            const searchInput = event.target.value;
            const foundLinks = [];

            if (searchInput.length) {
                const searchRegex = new RegExp(searchInput, 'img');
                const allSlides = mainDocument.querySelectorAll('.slide');

                allSlides.forEach((aSlide, index) => {
                    const slideTextContent = aSlide.textContent;
                    const hitCount = (slideTextContent.match(searchRegex) || []).length;

                    if (hitCount > 0 || index === parseInt(searchInput, 10)) {
                        let slideHeading = "", itemDetails = "", itemStyle = "";

                        const parentSlide = aSlide.parentElement.closest('.slide');

                        if (!parentSlide) {
                            itemStyle = 'margin: 0.5em 0 0;';
                            const firstHeading = aSlide.querySelector(currentParameters.headingSelectors);
                            if (firstHeading) {
                                slideHeading = firstHeading.textContent;
                                if (slideHeading.length > 25) {
                                    slideHeading = slideHeading.substring(0, 22) + "...";
                                }
                            }
                        } else {
                            itemStyle += 'margin: 0 0 0 0.5em;';
                        }

                        if (hitCount > 0) {
                            itemDetails = `(${hitCount} hit${(hitCount > 1 ? 's' : '')})`;
                        } else {
                            itemDetails = `(slide #${index})`;
                        }

                        foundLinks.push(`
                            <div class="${currentParameters.outcomes.itemClass}" style="${itemStyle}">
                                <a id="outcome${index}" href="#${aSlide.id}"><span style="font-weight: bold;">${slideHeading}</span>${(slideHeading ? '<br>' : '')}#${aSlide.id}</a>
                                <span style="${currentParameters.outcomes.hitMarkerStyle}">${itemDetails}</span>
                            </div>
                        `);
                    }
                });

                if (!foundLinks.length) {
                    foundLinks.push('(no results)');
                }
            }
            const displayHTML = foundLinks.join('');
            Object.assign(lookupPanel.style, displayHTML ? currentParameters.housing.activeStyle : currentParameters.housing.defaultStyle);
            lookupPanel.style.maxHeight = `${window.innerHeight}px`;

            outcomeDisplay.innerHTML = displayHTML;

            const currentKey = event.keyCode || event.which;
            if (currentKey === currentParameters.keybinds.proceedToResult) {
                const firstResultLink = outcomeDisplay.querySelector('a');
                if (firstResultLink) {
                    firstResultLink.click();
                }
            }
            else if (currentKey === currentParameters.keybinds.clearQuery) {
                event.target.blur();
            }
        });

        entryField.addEventListener('click', (event) => {
            if (!event.target.value.length) {
                outcomeDisplay.innerHTML = '';
            }
        });

        lookupPanel.appendChild(entryField);

        documentKeyHandler = (event) => {
            const currentKey = event.keyCode || event.which;
            if (currentKey === currentParameters.keybinds.activateQuery) {
                entryField.removeAttribute('placeholder');
                entryField.focus();
            }
        };
        mainDocument.addEventListener('keyup', documentKeyHandler);

        documentClickHandler = (event) => {
            if (!lookupPanel.contains(event.target)) {
                entryField.value = '';
                entryField.dispatchEvent(new Event('click'));
                lookupPanel.dispatchEvent(new Event('focusout'));
            }
        };
        mainDocument.addEventListener('click', documentClickHandler);


        outcomeDisplay = mainDocument.createElement('div');
        outcomeDisplay.id = currentParameters.outcomes.id;

        outcomeDisplay.addEventListener('click', (event) => {
            const targetLink = event.target.tagName === 'A' ? event.target : event.target.closest('a');
            if (targetLink) {
                event.preventDefault();
                event.stopPropagation();

                if (currentParameters.employNavigation) {
                    const indexMatch = targetLink.id.match(/\d*$/);
                    const slideIndex = indexMatch ? parseInt(indexMatch[0], 10) : null;
                    if (slideIndex !== null) {
                        jqPlug[presentationKey]('go', slideIndex);
                    }
                }
            }
        });

        outcomeDisplay.addEventListener('keyup', (event) => {
            const targetLink = event.target.tagName === 'A' ? event.target : event.target.closest('a');
            if (targetLink) {
                const currentKey = event.keyCode || event.which;
                if (currentKey && currentKey !== 13 && currentKey !== 32) {
                    return;
                }
                event.stopPropagation();
                targetLink.click();
            } else if (event.target === outcomeDisplay) {
                const currentKey = event.keyCode || event.which;
                if (currentKey === currentParameters.keybinds.clearQuery) {
                    entryField.value = '';
                    entryField.dispatchEvent(new Event('click'));
                    lookupPanel.dispatchEvent(new Event('focusout'));
                }
            }
        });
        outcomeDisplay.addEventListener('keydown', (event) => {
            const targetLink = event.target.tagName === 'A' ? event.target : event.target.closest('a');
            if (targetLink) {
                const currentKey = event.keyCode || event.which;
                if (currentKey === 13 || currentKey === 32) {
                    event.stopPropagation();
                }
            }
        });
        outcomeDisplay.addEventListener('keypress', (event) => {
            const targetLink = event.target.tagName === 'A' ? event.target : event.target.closest('a');
            if (targetLink) {
                const currentKey = event.keyCode || event.which;
                if (currentKey === 13 || currentKey === 32) {
                    event.stopPropagation();
                }
            }
        });

        lookupPanel.appendChild(outcomeDisplay);

        resizeHandler = () => {
            lookupPanel.style.maxHeight = `${window.innerHeight}px`;
        };
        window.addEventListener('resize', resizeHandler);

        mainDocument.querySelector(currentParameters.housing.target).appendChild(lookupPanel);
    }

    jqPlug[presentationKey]('extend', 'enableLocator', enableLookup);
    jqPlug[presentationKey]('extend', 'disableLocator', disableLookup);

    jqPlug(mainDocument).bind('deck.init', enableLookup);

    jqPlug(function() {
        const firstSlide = mainDocument.querySelector('.slide:first-child');
        if (firstSlide) {
            const computedStyle = window.getComputedStyle(firstSlide);
            const slideFontFamily = computedStyle.fontFamily;
            if (slideFontFamily) {
                baseOptions.housing.defaultStyle['font-family'] = slideFontFamily;
                if (lookupPanel) {
                    lookupPanel.style.fontFamily = slideFontFamily;
                }
            }
        }
    });

})(jQuery, 'deck');