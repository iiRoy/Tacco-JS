var _searchSystemInstance;

(function() {
    class DocumentationSearchAssistant {
        #activeSuggestionIndex = -1;
        #currentSelectionItemIdentifier = -1;
        #filteredSuggestions = [];
        #uiReady = false;
        #lastProcessedQuery = "";

        static MAXIMUM_VISIBLE_SUGGESTIONS = 20;
        static INITIAL_PROMPT_TEXT = "explore documentation";
        static HAS_EXTERNAL_SEARCH_PAGE = false;

        #queryInputField;
        #suggestionDisplayPanel;
        #suggestionTableElement;
        #baseApplicationPath;
        #allDataEntries;

        constructor(inputElementId, displayPanelId, rootPath, dataCollection) {
            this.#queryInputField = document.getElementById(inputElementId);
            this.#suggestionDisplayPanel = document.getElementById(displayPanelId);
            this.#suggestionTableElement = this.#suggestionDisplayPanel.querySelector("table");
            this.#baseApplicationPath = rootPath;
            this.#allDataEntries = dataCollection;

            this.#prepareUserInterface();
            this.#registerEventHandlers();
        }

        #prepareUserInterface() {
            if (this.#uiReady) return;

            for (let idx = 0; idx < DocumentationSearchAssistant.MAXIMUM_VISIBLE_SUGGESTIONS; idx++) {
                const newRow = this.#suggestionTableElement.insertRow(-1);
                const newCell = newRow.insertCell(-1);
                newCell.classList.add("suggestion-item-cell");
                const entryLink = document.createElement("a");
                newCell.appendChild(entryLink);
            }
            this.#uiReady = true;
            this.#queryInputField.value = DocumentationSearchAssistant.INITIAL_PROMPT_TEXT;
            this.#queryInputField.style.color = "#aaaaaa";
        }

        #registerEventHandlers() {
            this.#queryInputField.addEventListener("keyup", this.#handleInputEvent.bind(this, false));
            this.#queryInputField.addEventListener("keydown", this.#handleInputEvent.bind(this, true));
            this.#queryInputField.addEventListener("focus", this.#handleInputFieldFocus.bind(this));
            this.#queryInputField.addEventListener("blur", this.#handleInputFieldBlur.bind(this));

            this.#suggestionTableElement.addEventListener("mousedown", this.#handleSuggestionClick.bind(this));
            this.#suggestionTableElement.addEventListener("mouseover", this.#handleSuggestionHover.bind(this));
            this.#suggestionTableElement.addEventListener("mouseout", this.#handleSuggestionUnhover.bind(this));
        }

        #handleSuggestionClick(evt) {
            const targetCell = evt.target.closest(".suggestion-item-cell");
            if (targetCell) {
                const linkElement = targetCell.querySelector("a");
                if (linkElement && linkElement.href) {
                    window.location.href = linkElement.href;
                    evt.preventDefault();
                }
            }
        }

        #handleSuggestionHover(evt) {
            const targetCell = evt.target.closest(".suggestion-item-cell");
            if (targetCell) {
                if (this.#activeSuggestionIndex >= 0) {
                    this.#updateRowVisualState(this.#suggestionTableElement.rows[this.#activeSuggestionIndex], false);
                    this.#activeSuggestionIndex = -1;
                }
                targetCell.classList.add("item-active-highlight");
            }
        }

        #handleSuggestionUnhover(evt) {
            const targetCell = evt.target.closest(".suggestion-item-cell");
            if (targetCell) {
                targetCell.classList.remove("item-active-highlight");
            }
        }

        #handleInputFieldFocus() {
            if (this.#queryInputField.value === DocumentationSearchAssistant.INITIAL_PROMPT_TEXT) {
                this.#queryInputField.value = "";
                this.#queryInputField.style.color = "#000000";
            }
        }

        #handleInputFieldBlur() {
            if (this.#queryInputField.value === "") {
                this.#queryInputField.value = DocumentationSearchAssistant.INITIAL_PROMPT_TEXT;
                this.#queryInputField.style.color = "#aaaaaa";
            }
            this.#hideSuggestionPanel();
        }

        #handleInputEvent(isKeyDown, eventObject) {
            const currentInputContent = this.#queryInputField.value.replace(/(^ +)|( +$)/g, '');

            if (isKeyDown) {
                switch (eventObject.key) {
                    case "Enter":
                        this.#hideSuggestionPanel();
                        if (this.#activeSuggestionIndex >= 0) {
                            const selectedEntry = this.#filteredSuggestions[this.#activeSuggestionIndex];
                            if (selectedEntry && selectedEntry.link) {
                                window.location.href = this.#baseApplicationPath + selectedEntry.link;
                                eventObject.preventDefault();
                                return false;
                            }
                        } else if (DocumentationSearchAssistant.HAS_EXTERNAL_SEARCH_PAGE) {
                            return true;
                        }
                        eventObject.preventDefault();
                        return false;
                    case "ArrowUp":
                        if (this.#activeSuggestionIndex > 0) {
                            this.#activeSuggestionIndex--;
                        } else if (this.#activeSuggestionIndex === 0) {
                            this.#activeSuggestionIndex = -1;
                        }
                        this.#updateSuggestionsView();
                        eventObject.preventDefault();
                        return false;
                    case "ArrowDown":
                        if (this.#activeSuggestionIndex < this.#filteredSuggestions.length - 1 &&
                            this.#activeSuggestionIndex < DocumentationSearchAssistant.MAXIMUM_VISIBLE_SUGGESTIONS - 1) {
                            this.#activeSuggestionIndex++;
                        }
                        this.#updateSuggestionsView();
                        eventObject.preventDefault();
                        return false;
                }
            } else {
                if (currentInputContent === this.#lastProcessedQuery) {
                    return true;
                }
                this.#lastProcessedQuery = currentInputContent;
                this.#processNewSearchRequest(currentInputContent);
                this.#updateSuggestionsView();
                return true;
            }
            return true;
        }

        #processNewSearchRequest(inputQuery) {
            this.#filteredSuggestions = [];
            this.#activeSuggestionIndex = -1;
            this.#currentSelectionItemIdentifier = -1;

            if (inputQuery.length === 0) {
                return;
            }

            const lowerCaseQuery = inputQuery.toLowerCase();
            const initialFiltered = this.#allDataEntries.filter(item =>
                item.label.toLowerCase().indexOf(lowerCaseQuery) !== -1
            );

            this.#filteredSuggestions = this.#evaluateAndOrderSuggestions(initialFiltered, inputQuery);
            this.#formatSuggestionLabels(this.#filteredSuggestions, inputQuery);

            if (this.#currentSelectionItemIdentifier !== -1) {
                const foundIndex = this.#filteredSuggestions.findIndex(item => item.id === this.#currentSelectionItemIdentifier);
                if (foundIndex !== -1 && foundIndex < DocumentationSearchAssistant.MAXIMUM_VISIBLE_SUGGESTIONS) {
                    this.#activeSuggestionIndex = foundIndex;
                }
            }
        }

        #evaluateAndOrderSuggestions(itemsToRank, searchPattern) {
            if (!itemsToRank || itemsToRank.length === 0) return [];

            const lowerSearchPattern = searchPattern.toLowerCase();
            const alphanumericPatternPart = (lowerSearchPattern.match(/\w+/) || [''])[0];
            const prefixPatternRegex = new RegExp('\\b' + alphanumericPatternPart);
            const exactPatternRegex = new RegExp('\\b' + alphanumericPatternPart + '\\b');

            const findLastRegexMatchIndex = (sourceString, regexPattern) => {
                if (sourceString === '') return -1;
                let lastFoundIndex = -1;
                let tempString = sourceString;
                let currentOffsetInOriginal = 0;
                let matchIndex;
                while ((matchIndex = tempString.search(regexPattern)) >= 0) {
                    if (lastFoundIndex < 0) lastFoundIndex = 0;
                    lastFoundIndex = currentOffsetInOriginal + matchIndex;
                    currentOffsetInOriginal += matchIndex + 1;
                    tempString = tempString.substring(matchIndex + 1);
                }
                return lastFoundIndex;
            };

            const countSpecificCharacter = (targetString, charToCount) => {
                let counter = 0;
                for (let i = 0; i < targetString.length; i++) {
                    if (targetString.charAt(i) === charToCount) ++counter;
                }
                return counter;
            };

            const scoredItems = itemsToRank.map(item => {
                let scoreValue = 1.0;
                const itemLabelLower = item.label.toLowerCase();
                let matchPos = findLastRegexMatchIndex(itemLabelLower, exactPatternRegex);

                if (matchPos >= 0) {
                    const partsFollowing = countSpecificCharacter(itemLabelLower.substring(matchPos + 1), '.');
                    scoreValue *= 200 / (partsFollowing + 1);
                } else {
                    matchPos = findLastRegexMatchIndex(itemLabelLower, prefixPatternRegex);
                    if (matchPos >= 0) {
                        const partsFollowing = countSpecificCharacter(itemLabelLower.substring(matchPos + 1), '.');
                        scoreValue *= 20 / (partsFollowing + 1);
                    }
                }
                return { ...item, _relevanceScore: scoreValue };
            });

            scoredItems.sort((a, b) => {
                const scoreDifference = b._relevanceScore - a._relevanceScore;
                if (scoreDifference === 0) {
                    return a.label.localeCompare(b.label);
                }
                return scoreDifference;
            });

            return scoredItems;
        }

        #formatSuggestionLabels(suggestionsList, queryForHighlight) {
            if (!suggestionsList || suggestionsList.length === 0 || queryForHighlight.length === 0) {
                suggestionsList.forEach(item => item._displayContent = item.label);
                return;
            }

            const lowerCaseQuery = queryForHighlight.toLowerCase();
            const highlightPattern = (lowerCaseQuery.match(/[\w\.]+/) || [''])[0];
            const highlightingRegex = new RegExp(
                '(' + highlightPattern.replace(/\./g, '\\.') + ')', 'ig'
            );

            suggestionsList.forEach(item => {
                item._displayContent = item.label.replace(highlightingRegex, '<strong>$1</strong>');
            });
        }

        #updateRowContentAndVisibility(rowElement, suggestionItem, isCurrentlySelected) {
            if (suggestionItem) {
                rowElement.classList.remove("suggestion-hidden");
                rowElement.classList.add("suggestion-visible");
                const linkElement = rowElement.cells[0].querySelector("a");
                linkElement.innerHTML = suggestionItem._displayContent || suggestionItem.label;
                linkElement.href = this.#baseApplicationPath + suggestionItem.link;
                this.#updateRowVisualState(rowElement, isCurrentlySelected);
            } else {
                rowElement.classList.remove("suggestion-visible");
                rowElement.classList.add("suggestion-hidden");
            }
        }

        #updateRowVisualState(rowElement, shouldBeSelected) {
            const cellToHighlight = rowElement.cells[0];
            if (shouldBeSelected) {
                cellToHighlight.classList.add("item-active-highlight");
            } else {
                cellToHighlight.classList.remove("item-active-highlight");
            }
        }

        #updateSuggestionsView() {
            if (this.#filteredSuggestions.length > 0) {
                this.#suggestionDisplayPanel.classList.remove("panel-hidden");
                this.#suggestionDisplayPanel.classList.add("panel-visible");

                const numItemsToRender = Math.min(this.#filteredSuggestions.length, DocumentationSearchAssistant.MAXIMUM_VISIBLE_SUGGESTIONS);

                for (let i = 0; i < DocumentationSearchAssistant.MAXIMUM_VISIBLE_SUGGESTIONS; i++) {
                    const currentTableRow = this.#suggestionTableElement.rows[i];
                    const currentSuggestion = i < numItemsToRender ? this.#filteredSuggestions[i] : null;
                    const isItemCurrentlySelected = (i === this.#activeSuggestionIndex);

                    this.#updateRowContentAndVisibility(currentTableRow, currentSuggestion, isItemCurrentlySelected);

                    if (isItemCurrentlySelected && currentSuggestion) {
                        this.#currentSelectionItemIdentifier = currentSuggestion.id;
                    }
                }
            } else {
                this.#hideSuggestionPanel();
            }
        }

        #hideSuggestionPanel() {
            this.#suggestionDisplayPanel.classList.remove("panel-visible");
            this.#suggestionDisplayPanel.classList.add("panel-hidden");
        }

        initiateExternalSearch() {
            if (DocumentationSearchAssistant.HAS_EXTERNAL_SEARCH_PAGE) {
                const queryText = this.#queryInputField.value;
                document.location = this.#baseApplicationPath + 'query.html?q=' + encodeURIComponent(queryText) + '&t=0';
            }
            return false;
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        // These global variables are expected to be defined elsewhere in the user's code.
        // E.g., var DATA = [...]; var HAS_SEARCH_PAGE = true; var _GLOBAL_APP_ROOT_PATH = "/";
        _searchSystemInstance = new DocumentationSearchAssistant(
            "search_autocomplete",
            "search_filtered_div",
            _GLOBAL_APP_ROOT_PATH,
            DATA
        );

        DocumentationSearchAssistant.HAS_EXTERNAL_SEARCH_PAGE = HAS_SEARCH_PAGE;
    });

    window.handleUserSearchInput = function(eventObject, isKeyDownEventFlag, rootPathArgument) {
        // rootPathArgument is ignored as the class instance already holds the root path.
        return _searchSystemInstance.#handleInputEvent(isKeyDownEventFlag, eventObject);
    };

    window.toggleSearchInputFocus = function(inputElement, hasFocus) {
        // inputElement is ignored as the class instance already holds the reference to the input field.
        if (hasFocus) {
            _searchSystemInstance.#handleInputFieldFocus();
        } else {
            _searchSystemInstance.#handleInputFieldBlur();
        }
    };

    window.initiateFullSearchAction = function() {
        return _searchSystemInstance.initiateExternalSearch();
    };

})();