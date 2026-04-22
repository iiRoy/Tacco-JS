class TableContentGenerator {
    constructor(outputContainer, customPreferences) {
        this.outputContainer = outputContainer;
        this.preferences = Object.assign({}, {
            excludeBackToTop: false,
            mainTitle: '<span>Document Outline</span>',
            minimumHeadings: 3,
            headingSelectors: 'h1, h2, h3, h4, h5, h6',
            listStyle: 'ordered',
            displayAnimation: 'reveal',
            animationDuration: 400
        }, customPreferences);

        this.processedHeadings = [];
        this.topmostHeadingLevel = Infinity;
        this.generatedTocElement = null;
    }

    _sanitizeFragment(textString) {
        return encodeURIComponent(textString).replace(/[!'()*]/g, function(char) {
            return '%' + char.charCodeAt(0).toString(16).toUpperCase();
        });
    }

    _extractHeadingLevel(elementNode) {
        const match = elementNode.nodeName.match(/H(\d)/);
        return match ? parseInt(match[1], 10) : 0;
    }

    _prepareHeadings() {
        const foundHeadings = document.querySelectorAll(this.preferences.headingSelectors);
        let dynamicIdCounter = 0;

        foundHeadings.forEach(currentHeading => {
            let headingIdentifier = currentHeading.id;

            if (!headingIdentifier) {
                const priorElement = currentHeading.previousElementSibling;
                if (priorElement && priorElement.hasAttribute("name")) {
                    headingIdentifier = priorElement.getAttribute("name").replace(/\./g, "-");
                } else {
                    headingIdentifier = `auto-content-ref-${dynamicIdCounter++}`;
                }
                currentHeading.id = headingIdentifier;
            }

            if (headingIdentifier) {
                const level = this._extractHeadingLevel(currentHeading);
                this.processedHeadings.push({
                    element: currentHeading,
                    anchorId: headingIdentifier,
                    displayContent: currentHeading.innerHTML,
                    hierarchyLevel: level
                });
                if (level < this.topmostHeadingLevel) {
                    this.topmostHeadingLevel = level;
                }
            }
        });
    }

    _assembleHierarchy() {
        if (!this.processedHeadings.length || this.processedHeadings.length < this.preferences.minimumHeadings || !this.outputContainer) {
            return null;
        }

        const listElementTag = this.preferences.listStyle === 'unordered' ? 'ul' : 'ol';
        const primaryContainer = document.createElement('nav');
        primaryContainer.className = 'toc-main-container-clone';

        const mainTitleDiv = document.createElement('div');
        mainTitleDiv.className = 'toc-title-display-clone';
        mainTitleDiv.innerHTML = this.preferences.mainTitle;
        primaryContainer.appendChild(mainTitleDiv);

        const rootList = document.createElement(listElementTag);
        rootList.className = 'toc-top-level-list-clone';
        primaryContainer.appendChild(rootList);

        if (this.processedHeadings.length > 0) {
            const listStack = [{ listElement: rootList, expectedItemLevel: this.topmostHeadingLevel }];

            this.processedHeadings.forEach(headingData => {
                const actualHeadingLevel = headingData.hierarchyLevel;

                while (listStack.length > 1 && actualHeadingLevel <= listStack[listStack.length - 1].expectedItemLevel) {
                    listStack.pop();
                }

                let currentParentListEntry = listStack[listStack.length - 1];

                if (actualHeadingLevel > currentParentListEntry.expectedItemLevel) {
                    for (let l = currentParentListEntry.expectedItemLevel + 1; l <= actualHeadingLevel; l++) {
                        const lastAddedListItem = currentParentListEntry.listElement.lastElementChild;
                        let newSubListParent = lastAddedListItem;

                        if (!newSubListParent || newSubListParent.tagName.toLowerCase() !== 'li') {
                            newSubListParent = document.createElement('li');
                            newSubListParent.className = 'toc-placeholder-item-clone';
                            currentParentListEntry.listElement.appendChild(newSubListParent);
                        }

                        const newSubList = document.createElement(listElementTag);
                        newSubList.className = 'toc-child-list-clone';
                        newSubListParent.appendChild(newSubList);

                        currentParentListEntry = { listElement: newSubList, expectedItemLevel: l };
                        listStack.push(currentParentListEntry);
                    }
                }

                const newListItem = document.createElement('li');
                newListItem.className = 'toc-entry-item-clone';

                const newLink = document.createElement('a');
                newLink.href = `#${this._sanitizeFragment(headingData.anchorId)}`;
                newLink.innerHTML = headingData.displayContent;
                newLink.className = 'toc-link-anchor-clone';
                newListItem.appendChild(newLink);
                
                currentParentListEntry.listElement.appendChild(newListItem);
            });
        }

        this.generatedTocElement = primaryContainer;
        return primaryContainer;
    }

    _attachInteractionHandlers() {
        if (this.generatedTocElement) {
            this.generatedTocElement.querySelectorAll('.toc-link-anchor-clone').forEach(link => {
                link.addEventListener('click', (event) => {
                    event.preventDefault();
                    const targetId = link.getAttribute('href').substring(1);
                    const targetElement = document.getElementById(targetId);
                    if (targetElement) {
                        targetElement.scrollIntoView({ behavior: 'smooth' });
                        history.pushState(null, '', `#${targetId}`);
                    }
                });
            });
        }

        if (!this.preferences.excludeBackToTop) {
            this.processedHeadings.forEach(headingData => {
                headingData.element.classList.add('document-header-linked-clone');
                
                if (headingData.hierarchyLevel === this.topmostHeadingLevel) {
                    headingData.element.classList.add('document-top-level-header-clone');
                    const backToTopLink = document.createElement('span');
                    backToTopLink.className = 'document-return-to-top-button-clone';
                    backToTopLink.innerHTML = '<span class="icon-up-arrow"></span> Back to top';
                    
                    headingData.element.parentNode.insertBefore(backToTopLink, headingData.element.nextSibling);
                }
            });

            document.addEventListener('click', (event) => {
                if (event.target.closest('.document-return-to-top-button-clone')) {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    history.pushState(null, '', window.location.pathname + window.location.search);
                }
            });
        }
    }

    _applyVisibilityEffect() {
        if (!this.generatedTocElement) return;

        this.outputContainer.innerHTML = '';
        this.outputContainer.style.overflow = 'hidden';

        switch (this.preferences.displayAnimation) {
            case 'reveal':
            case 'fade':
                this.outputContainer.style.opacity = '0';
                this.outputContainer.style.transition = `opacity ${this.preferences.animationDuration / 1000}s ease-in-out`;
                this.outputContainer.appendChild(this.generatedTocElement);
                void this.outputContainer.offsetWidth; 
                this.outputContainer.style.opacity = '1';
                break;
            case 'slide':
                this.outputContainer.style.maxHeight = '0';
                this.outputContainer.style.opacity = '0';
                this.outputContainer.style.transition = `max-height ${this.preferences.animationDuration / 1000}s ease-out, opacity ${this.preferences.animationDuration / 1000}s ease-in`;
                this.outputContainer.appendChild(this.generatedTocElement);
                requestAnimationFrame(() => {
                    this.outputContainer.style.maxHeight = `${this.generatedTocElement.scrollHeight}px`;
                    this.outputContainer.style.opacity = '1';
                });
                break;
            case 'instant':
            default:
                this.outputContainer.appendChild(this.generatedTocElement);
                break;
        }

        if (this.preferences.displayAnimation === 'slide') {
            setTimeout(() => {
                this.outputContainer.style.overflow = '';
                this.outputContainer.style.maxHeight = '';
            }, this.preferences.animationDuration);
        }
    }

    initialize() {
        if (this.preferences.animationDuration === 0) {
            this.preferences.displayAnimation = 'instant';
        }

        this._prepareHeadings();
        const tocContent = this._assembleHierarchy();

        if (tocContent) {
            this._attachInteractionHandlers();
            this._applyVisibilityEffect();
        }
    }
}

function setupDocumentOutline(targetDomElement, customConfiguration) {
    if (!(targetDomElement instanceof HTMLElement)) {
        return;
    }
    const generatorInstance = new TableContentGenerator(targetDomElement, customConfiguration);
    generatorInstance.initialize();
}