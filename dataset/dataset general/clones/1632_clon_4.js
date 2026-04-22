(() => {
    let appSettings = {
        previousOptionSelection: '',
        isLivePreviewActive: false,
        isSearchFilterActive: false,
        initialFontNames: new Map() // To store original font names for preview reset
    };

    // Utility function for case-insensitive text check
    const textChecker = (element, searchPhrase) => {
        const elementContent = (element.textContent || element.innerText || '').toLowerCase();
        const phraseLower = searchPhrase.toLowerCase();
        return elementContent.includes(phraseLower);
    };

    // Core function to update the displayed font count
    const adjustFontCounter = () => {
        const allRows = document.querySelectorAll('tr');
        let visibleAndAvailableCount = 0;

        allRows.forEach(rowItem => {
            const hasTableCell = rowItem.querySelector('td');
            const isUnavailable = rowItem.classList.contains('unavailable');
            const isRowHeader = rowItem.classList.contains('rowheader');
            const isHidden = window.getComputedStyle(rowItem).display === 'none';

            if (hasTableCell && !isUnavailable && !isRowHeader && !isHidden) {
                visibleAndAvailableCount++;
            }
        });

        const counterDisplay = document.querySelector('.counter-widget .font-entries b');
        if (counterDisplay) {
            counterDisplay.textContent = visibleAndAvailableCount.toString();
        }
    };

    // Initializes the application state and UI elements
    const initializePageElements = () => {
        const headerSection = document.querySelector('header#main');
        if (headerSection) {
            const countWrapper = document.createElement('div');
            countWrapper.classList.add('counter-widget');
            countWrapper.innerHTML = '<div class="font-entries">Entries: <b>317</b></div>';
            headerSection.appendChild(countWrapper);
        }

        const selectElement = document.querySelector('nav select');
        if (selectElement) {
            selectElement.value = 'iOS 8';
            // Manually trigger change event for initial setup
            const initialChangeEvent = new Event('change');
            selectElement.dispatchEvent(initialChangeEvent);
        }

        // Store original font names for live preview reset
        document.querySelectorAll('.font_face').forEach(el => {
            const originalName = el.getAttribute('style').split(':')[1].trim();
            appSettings.initialFontNames.set(el, originalName);
        });
    };

    // Handles changes in the OS version selection dropdown
    const handleOptionChange = (selectionElement) => {
        const currentSelection = selectionElement.value;

        if (currentSelection === appSettings.previousOptionSelection) {
            return;
        }

        document.querySelectorAll('tr').forEach(row => {
            row.classList.remove('unavailable');
        });

        // The original code had a commented-out switch block here.
        // As per Type IV rules, commented-out code is ignored if not active functionality.
        // Therefore, this clone intentionally does not implement OS-based filtering
        // as it was not active in the source.

        appSettings.previousOptionSelection = currentSelection;
        adjustFontCounter();
    };

    // Clears the search filter and restores all rows
    const resetSearchFilter = () => {
        const searchInput = document.querySelector('input[type="search"]');
        if (searchInput) {
            searchInput.value = '';
        }
        document.querySelectorAll('tr').forEach(row => {
            row.style.display = ''; // Restore default display
        });
        appSettings.isSearchFilterActive = false;
        adjustFontCounter();
    };

    // Performs the search operation based on the input term
    const executeSearch = (term) => {
        if (term.length === 0) {
            resetSearchFilter();
        } else {
            const allRows = document.querySelectorAll('tr');
            allRows.forEach(row => {
                if (textChecker(row, term)) {
                    row.style.display = ''; // Show
                } else {
                    row.style.display = 'none'; // Hide
                }
            });
        }
    };

    // DOMContentLoaded equivalent for $(document).ready
    document.addEventListener('DOMContentLoaded', () => {
        initializePageElements();

        // Event listener for live text preview input
        const previewInput = document.querySelector('nav #live_preview');
        if (previewInput) {
            previewInput.addEventListener('keyup', (event) => {
                appSettings.isLivePreviewActive = true;
                const inputValue = event.target.value;

                if (inputValue === '') {
                    document.querySelectorAll('.font_face').forEach(el => {
                        el.textContent = appSettings.initialFontNames.get(el);
                    });
                    appSettings.isLivePreviewActive = false;
                } else {
                    document.querySelectorAll('.font_face').forEach(el => {
                        el.textContent = inputValue;
                    });
                }
            });
        }

        // Event listener for OS selection dropdown
        const osSelector = document.querySelector('nav select');
        if (osSelector) {
            osSelector.addEventListener('change', (event) => {
                handleOptionChange(event.target);
            });
        }

        // Event listener for search input
        const searchInput = document.querySelector('input[type="search"]');
        if (searchInput) {
            searchInput.addEventListener('keyup', (event) => {
                if (appSettings.isLivePreviewActive) {
                    const livePreviewInput = document.querySelector('#live_preview');
                    if (livePreviewInput) {
                        livePreviewInput.value = '';
                    }
                    document.querySelectorAll('.font_face').forEach(el => {
                        el.textContent = appSettings.initialFontNames.get(el);
                    });
                }
                const currentSearchTerm = event.target.value;
                executeSearch(currentSearchTerm);
                appSettings.isSearchFilterActive = true;
                adjustFontCounter();
            });

            // Event listener for clearing search (e.g., clicking 'x' in modern browsers)
            searchInput.addEventListener('search', () => {
                resetSearchFilter();
            });
        }
    });

    // Google Analytics (adapted with different variable names)
    const analyticsTracker = window.analyticsTracker || [];
    analyticsTracker.push(['_setAccountIdentifier', 'UA-5874947-7']);
    analyticsTracker.push(['_recordPageVisit']);

    ((context) => {
        const scriptElement = context.document.createElement('script');
        scriptElement.type = 'text/javascript';
        scriptElement.async = true;
        scriptElement.src = ((context.document.location.protocol === 'https:') ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
        const firstScript = context.document.getElementsByTagName('script')[0];
        firstScript.parentNode.insertBefore(scriptElement, firstScript);
    })(window);

})();