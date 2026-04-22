const AppFlow = {
    currentSuggestionHighlight: -1,
    queryInputReference: null,
    suggestionBoxReference: null,
    resultDisplayReference: null,
    progressIndicatorReference: null,

    initializeApplication: function() {
        this.queryInputReference = document.getElementById('searchField');
        this.suggestionBoxReference = document.getElementById('autoComplete');
        this.resultDisplayReference = document.getElementById('musics');
        this.progressIndicatorReference = document.getElementById('loading');

        this.setupGlobalInteractionHandlers();
        this.suggestionBoxReference.addEventListener('click', this.pickSuggestionFromList.bind(this));
        this.resultDisplayReference.addEventListener('click', this.handleResultItemClick.bind(this));
    },

    activateFeatureGuard: function() {
        const urlParams = new URLSearchParams(window.location.search);
        if (!urlParams.has('activation_key') || urlParams.get('activation_key') !== 'active_state') {
            urlParams.set('activation_key', 'active_state');
            window.location.search = urlParams.toString();
            throw new Error('Application re-initialization triggered.');
        }
    },

    moveSuggestionUp: function() {
        const suggestionItems = Array.from(this.suggestionBoxReference.children);
        if (suggestionItems.length === 0) return false;

        if (this.currentSuggestionHighlight > 0) {
            this.currentSuggestionHighlight--;
        } else {
            this.currentSuggestionHighlight = 0;
        }
        this.updateSuggestionVisuals(suggestionItems);
        return false;
    },

    moveSuggestionDown: function() {
        const suggestionItems = Array.from(this.suggestionBoxReference.children);
        if (suggestionItems.length === 0) return false;

        if (this.currentSuggestionHighlight < suggestionItems.length - 1) {
            this.currentSuggestionHighlight++;
        } else {
            this.currentSuggestionHighlight = suggestionItems.length - 1;
        }
        this.updateSuggestionVisuals(suggestionItems);
        return false;
    },

    updateSuggestionVisuals: function(items) {
        items.forEach((item, index) => {
            if (index === this.currentSuggestionHighlight) {
                item.style.backgroundColor = '#F5F5F5';
            } else {
                item.style.backgroundColor = 'white';
            }
        });
    },

    setupGlobalInteractionHandlers: function() {
        window.addEventListener("keydown", (inputEvent) => {
            switch (inputEvent.keyCode) {
                case 13:
                    if (this.currentSuggestionHighlight !== -1) {
                        const selectedText = this.suggestionBoxReference.children[this.currentSuggestionHighlight].textContent;
                        this.queryInputReference.value = selectedText;
                        this.executeContentQuery();
                    } else {
                        this.executeContentQuery();
                    }
                    inputEvent.preventDefault();
                    return false;
                case 38:
                    this.moveSuggestionUp();
                    inputEvent.preventDefault();
                    return false;
                case 40:
                    this.moveSuggestionDown();
                    inputEvent.preventDefault();
                    return false;
            }
        }, false);

        this.queryInputReference.addEventListener("keyup", this.handleSearchTermInput.bind(this));
    },

    executeContentQuery: function() {
        const searchTerm = this.queryInputReference.value;
        this.suggestionBoxReference.style.display = 'none';
        this.resultDisplayReference.innerHTML = '';
        this.progressIndicatorReference.style.display = 'block';

        fetch('http://mp3skull.com/search.php?q=' + encodeURIComponent(searchTerm))
            .then(response => response.text())
            .then(htmlText => {
                this.suggestionBoxReference.style.display = 'none';
                this.progressIndicatorReference.style.display = 'none';

                const parser = new DOMParser();
                const doc = parser.parseFromString(htmlText, 'text/html');

                const rawItems = Array.from(doc.querySelectorAll('div[class*="show"]'));
                const processedItems = rawItems.map(rawElement => {
                    const itemData = {};
                    itemData.label = rawElement.querySelector('b')?.textContent
                        .replace(/mp3/g, '')
                        .replace(/([A-z]+\.)+[A-z]+/g, '')
                        .replace(/\s*-\s*$/g, '')
                        .replace(/\(.*\)/g, '')
                        .trim() || '';
                    itemData.resourceURL = rawElement.querySelector('a')?.getAttribute('href') || '';

                    const infoBlock = rawElement.querySelector('.left')?.innerHTML || '';
                    const detailedInfo = infoBlock.replace(/<br>/g, '|').replace(/<[^>]*>/g, '').split('|').map(s => s.trim()).filter(Boolean);

                    detailedInfo.forEach(value => {
                        if (value.includes("kbps")) {
                            itemData.bitrate = value;
                        } else if (value.includes("mb")) {
                            itemData.fileSize = value;
                        } else if (value.includes(":")) {
                            itemData.duration = value;
                        }
                    });
                    return itemData;
                });
                this.displayQueryOutcome(processedItems);
            })
            .catch(error => {
                console.error('Search query failed:', error);
                this.progressIndicatorReference.style.display = 'none';
                this.resultDisplayReference.innerHTML = `<b class="no_match_found">Failed to load results.</b>`;
            });
        return false;
    },

    handleSearchTermInput: function(inputEvent) {
        if ((inputEvent.keyCode >= 48 && inputEvent.keyCode <= 90) || inputEvent.keyCode === 8 || inputEvent.keyCode === 32) {
            this.currentSuggestionHighlight = -1;
            const currentQuery = this.queryInputReference.value.replace(/%20/g, '');
            
            fetch(`http://ac1.mp3skull.com/autocomplete/get.php?q=${encodeURIComponent(currentQuery)}`)
                .then(response => response.text())
                .then(responseText => {
                    const arrayMatch = responseText.match(/new Array\((.*)\)/);
                    if (arrayMatch && arrayMatch[1]) {
                        const arrayString = `[${arrayMatch[1]}]`;
                        try {
                            const suggestions = JSON.parse(arrayString);
                            this.presentAutoCompleteOptions(suggestions);
                        } catch (e) {
                            console.error("Failed to parse autocomplete suggestions:", e);
                            this.presentAutoCompleteOptions([]);
                        }
                    } else {
                        this.presentAutoCompleteOptions([]);
                    }
                })
                .catch(error => {
                    console.error('Autocomplete fetch failed:', error);
                    this.presentAutoCompleteOptions([]);
                });
        }
        return false;
    },

    presentAutoCompleteOptions: function(optionsArray) {
        const htmlContent = optionsArray.map(item => `<li>${item}</li>`).join('');
        this.suggestionBoxReference.innerHTML = htmlContent;
        this.suggestionBoxReference.style.display = 'block';
    },

    pickSuggestionFromList: function(clickEvent) {
        const targetElement = clickEvent.target.closest('li');
        if (targetElement && this.suggestionBoxReference.contains(targetElement)) {
            const selectedTerm = targetElement.textContent;
            this.queryInputReference.value = selectedTerm;
            this.executeContentQuery();
        }
    },

    displayQueryOutcome: function(dataItems) {
        const generatedHtml = dataItems.map((item, idx) => {
            const hasSharedSource = item.resourceURL.includes("4shared") ? ' class="shared_source"' : '';
            return `
                <li class="item_row_${idx % 2}">
                    <div${hasSharedSource}>
                        <b>${item.label}</b><br>
                        ${item.fileSize ? `<span><b>Size: </b>${item.fileSize}</span>` : ''}
                        ${item.bitrate ? `<span><b>Bitrate: </b>${item.bitrate}</span>` : ''}
                        ${item.duration ? `<span><b>Duration: </b>${item.duration}</span>` : ''}
                        <input type="hidden" class="resource_link" value="${item.resourceURL}">
                    </div>
                </li>
            `;
        }).join('');

        const noResultsMessage = `<b class="no_match_found">No results found for "${this.queryInputReference.value}"</b>`;
        this.resultDisplayReference.innerHTML = generatedHtml === '' ? noResultsMessage : generatedHtml;
    },

    handleResultItemClick: function(clickEvent) {
        const targetListItem = clickEvent.target.closest('li');
        if (targetListItem && this.resultDisplayReference.contains(targetListItem)) {
            const linkInput = targetListItem.querySelector('.resource_link');
            if (linkInput && linkInput.value) {
                if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.create) {
                    chrome.tabs.create({ 'url': linkInput.value }, function(tab) {
                        window.close();
                    });
                } else {
                    window.open(linkInput.value, '_blank');
                }
            }
        }
    }
};

const VisualSetup = {
    initializeFormEnhancements: function() {
        $(function() {
            $("input, textarea, select, button").uniform();
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    AppFlow.initializeApplication();
    VisualSetup.initializeFormEnhancements();
    try {
        AppFlow.activateFeatureGuard();
    } catch (e) {
        // Expected error on initial load for redirection, ignore
    }
});