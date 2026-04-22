const globalAppControl = {};

document.addEventListener('DOMContentLoaded', () => {
    globalAppControl.activeFilterKeys = new Set();
    globalAppControl.currentPage = 1;
    globalAppControl.layoutContainer = document.getElementById('visual-board-elements');
    globalAppControl.loadMoreButton = document.getElementById('board-load-more');
    globalAppControl.filterStateDisplay = document.getElementById('visual-board-controls');

    const constructContentRenderer = (templateText) => {
        const processedParts = [];
        let currentPos = 0;
        const delimiterPattern = /<%([\s\S]+?)%>|<%=([\s\S]+?)%>|<%-([\s\S]+?)%>/g;

        const htmlSanitizer = (inputStr) => {
            return String(inputStr).replace(/[&<>"'=\/]/g, (char) => {
                return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '/': '&#x2F;', '=': '&#x3D;' }[char];
            });
        };

        let foundMatch;
        while ((foundMatch = delimiterPattern.exec(templateText)) !== null) {
            const [fullMatch, evalBlock, interpolateBlock, escapeBlock] = foundMatch;

            if (foundMatch.index > currentPos) {
                processedParts.push(templateText.substring(currentPos, foundMatch.index));
            }

            if (evalBlock) {
                processedParts.push(new Function('dataBundle', 'outputPrinter', `with(dataBundle||{}){${evalBlock}}`));
            } else if (interpolateBlock) {
                processedParts.push(new Function('dataBundle', `with(dataBundle||{}){return String(${interpolateBlock} == null ? '' : ${interpolateBlock});}`));
            } else if (escapeBlock) {
                processedParts.push(new Function('dataBundle', `var _san = arguments[1]; with(dataBundle||{}){return _san(${escapeBlock} == null ? '' : ${escapeBlock});}`));
            }
            currentPos = foundMatch.index + fullMatch.length;
        }

        if (currentPos < templateText.length) {
            processedParts.push(templateText.substring(currentPos));
        }

        return (dataInput) => {
            let outputFragments = [];
            const localOutputPrinter = (...args) => { outputFragments.push(Array.prototype.join.call(args, '')); };

            for (const part of processedParts) {
                if (typeof part === 'string') {
                    outputFragments.push(part);
                } else if (typeof part === 'function') {
                    const partResult = part(dataInput, htmlSanitizer, localOutputPrinter);
                    if (partResult !== undefined) {
                        outputFragments.push(partResult);
                    }
                }
            }
            return outputFragments.join('');
        };
    };

    globalAppControl.contentRenderer = constructContentRenderer(eventorganiser_posterboard.template);

    globalAppControl.loadMoreButton.textContent = eventorganiser_posterboard.loading;
    fetchContentBatch().then(initialContent => {
        renderContent(initialContent);
        if (initialContent.length < eventorganiser_posterboard.query.posts_per_page) {
            globalAppControl.loadMoreButton.style.display = 'none';
        }
        awaitAllImagesLoaded(globalAppControl.layoutContainer, () => {
            globalAppControl.boardLayout = new Masonry(globalAppControl.layoutContainer, {
                isFitWidth: true,
                itemSelector: '.component-board-box',
                isAnimatedFromBottom: true,
                isAnimated: true,
                singleMode: true,
                layoutPriorities: { shelfOrder: 0 }
            });
        });
        globalAppControl.loadMoreButton.textContent = eventorganiser_posterboard.load_more;
        globalAppControl.loadMoreButton.addEventListener('click', fetchAndAppendContent);
    });

    document.querySelectorAll('.board-filter-trigger').forEach(trigger => {
        trigger.addEventListener('click', handleFilterActivation);
    });
});

function awaitAllImagesLoaded(containerElement, completionCallback) {
    const imagesToLoad = containerElement.querySelectorAll('img');
    let loadedCount = 0;
    const totalImages = imagesToLoad.length;

    if (totalImages === 0) {
        completionCallback();
        return;
    }

    const onImageStatusChange = () => {
        loadedCount++;
        if (loadedCount === totalImages) {
            completionCallback();
        }
    };

    imagesToLoad.forEach(img => {
        if (img.complete) {
            onImageStatusChange();
        } else {
            img.addEventListener('load', onImageStatusChange);
            img.addEventListener('error', onImageStatusChange);
        }
    });
}

async function fetchContentBatch() {
    const queryParameters = new URLSearchParams({
        action: 'eventorganiser-posterboard',
        page: globalAppControl.currentPage,
        query: JSON.stringify(eventorganiser_posterboard.query)
    });
    const response = await fetch(`${eventorganiser_posterboard.url}?${queryParameters.toString()}`);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
}

function renderContent(contentItems, appendMode = false) {
    const fragment = document.createDocumentFragment();
    let newElementsList = [];

    contentItems.forEach(itemData => {
        const itemHTML = globalAppControl.contentRenderer(itemData);
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = itemHTML.trim();
        const renderedElement = tempDiv.firstElementChild;
        if (renderedElement) {
            fragment.appendChild(renderedElement);
            newElementsList.push(renderedElement);
        }
    });

    if (appendMode) {
        globalAppControl.layoutContainer.appendChild(fragment);
        applyCurrentVisibilityRules();
        globalAppControl.boardLayout.appended(newElementsList);
        awaitAllImagesLoaded(globalAppControl.layoutContainer, () => {
            globalAppControl.boardLayout.layout();
        });
    } else {
        globalAppControl.layoutContainer.innerHTML = '';
        globalAppControl.layoutContainer.appendChild(fragment);
    }
    return newElementsList;
}

async function fetchAndAppendContent() {
    globalAppControl.currentPage++;
    globalAppControl.loadMoreButton.textContent = 'Loading...';

    try {
        const additionalContent = await fetchContentBatch();
        if (additionalContent.length < eventorganiser_posterboard.query.posts_per_page) {
            globalAppControl.loadMoreButton.style.display = 'none';
        }

        renderContent(additionalContent, true);
        globalAppControl.loadMoreButton.textContent = eventorganiser_posterboard.load_more;

    } catch (error) {
        console.error('Failed to load additional content:', error);
        globalAppControl.loadMoreButton.textContent = 'Failed to load';
    }
}

function handleFilterActivation(eventInfo) {
    eventInfo.preventDefault();

    const clickedElement = eventInfo.currentTarget;
    const filterCategory = clickedElement.dataset.filterCategory;
    const filterValue = clickedElement.dataset[filterCategory];
    const filterClassIdentifier = `eo-eb-${filterCategory}-${filterValue}`;

    let isCurrentlyActive = clickedElement.dataset.controlActive === 'true';

    if (isCurrentlyActive) {
        globalAppControl.activeFilterKeys.delete(filterClassIdentifier);
        clickedElement.dataset.controlActive = 'false';
        clickedElement.classList.remove('filter-control-active');
    } else {
        globalAppControl.activeFilterKeys.add(filterClassIdentifier);
        clickedElement.dataset.controlActive = 'true';
        clickedElement.classList.add('filter-control-active');
    }

    applyCurrentVisibilityRules();
    globalAppControl.filterStateDisplay.dataset.currentFilters = Array.from(globalAppControl.activeFilterKeys).join(',');
    
    if (globalAppControl.boardLayout) {
        awaitAllImagesLoaded(globalAppControl.layoutContainer, () => {
            globalAppControl.boardLayout.reloadItems();
            globalAppControl.boardLayout.layout();
        });
    }
}

function elementMatchesAnyExclusion(element, exclusionClasses) {
    if (exclusionClasses.size === 0) return false;
    for (const cls of exclusionClasses) {
        if (element.classList.contains(cls)) {
            return true;
        }
    }
    return false;
}

function applyCurrentVisibilityRules() {
    const contentItems = globalAppControl.layoutContainer.querySelectorAll('.component-board-box, .component-board-hidden');
    const activeExclusions = globalAppControl.activeFilterKeys;

    contentItems.forEach(itemNode => {
        let shouldBeHidden = elementMatchesAnyExclusion(itemNode, activeExclusions);

        if (shouldBeHidden) {
            itemNode.style.display = 'none';
            itemNode.classList.remove('component-board-box');
            itemNode.classList.add('component-board-hidden');
        } else {
            itemNode.style.display = 'block';
            itemNode.classList.add('component-board-box');
            itemNode.classList.remove('component-board-hidden');
        }
    });
}