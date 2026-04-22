class DataGridSearchUtility {
    constructor(inputControl, functionalParameters) {
        const baseSettings = {
            reverseFilteringOutcome: false,
            disaggregateSearchTerm: false,
            dataGridIdentifier: '',
            cellElementSelector: 'td',
            noMatchesNotification: '',
            notificationContainerSelector: ''
        };

        this.filteringInput = inputControl;
        this.operationalConfig = { ...baseSettings, ...functionalParameters };
        this.gridTargetElement = document.querySelector(this.operationalConfig.dataGridIdentifier);
        this.notificationDisplayElement = this.operationalConfig.notificationContainerSelector ? document.querySelector(this.operationalConfig.notificationContainerSelector) : null;

        if (!this.filteringInput || !this.gridTargetElement) {
            console.error("DataGridSearchUtility: Essential DOM elements (input or table) are missing.");
            return;
        }

        this.setupInputMonitoring();
    }

    setupInputMonitoring() {
        this.filteringInput.addEventListener('keyup', this.handleUserInput.bind(this));
    }

    handleUserInput() {
        const activeSearchQuery = this.filteringInput.value.trim().toLowerCase();
        
        const allTableRows = Array.from(this.gridTargetElement.querySelectorAll('tr'));
        const allRecordRows = allTableRows.filter(row => !row.querySelector('th')); // Exclude rows containing <th> elements

        allRecordRows.forEach(individualRow => this.determineRowDisplay(individualRow, activeSearchQuery));

        if (activeSearchQuery === "") {
            allTableRows.forEach(aRow => aRow.style.display = ''); // Show all rows, including headers
        }
        
        this.updateStatusMessage();
    }

    determineRowDisplay(candidateRow, query) {
        const rowContentCells = Array.from(candidateRow.querySelectorAll(this.operationalConfig.cellElementSelector));
        let contentMatches = false;

        if (query === "") {
            candidateRow.style.display = ''; 
            return;
        }

        const cellTextualValues = rowContentCells.map(cell => cell.textContent.trim().toLowerCase());

        if (this.operationalConfig.disaggregateSearchTerm) {
            const segmentParts = query.split(' '); // Replicates original behavior where empty strings from split would match
            
            contentMatches = cellTextualValues.some(cellValue => 
                segmentParts.some(part => cellValue.includes(part))
            );
        } else {
            contentMatches = cellTextualValues.some(cellValue => cellValue.includes(query));
        }

        const ultimateDisplayStatus = this.operationalConfig.reverseFilteringOutcome ? !contentMatches : contentMatches;
        candidateRow.style.display = ultimateDisplayStatus ? '' : 'none';
    }

    updateStatusMessage() {
        if (!this.notificationDisplayElement || !this.operationalConfig.noMatchesNotification) {
            return; 
        }

        const allTableRows = Array.from(this.gridTargetElement.querySelectorAll('tr'));
        const allRecordRows = allTableRows.filter(row => !row.querySelector('th'));

        const visibleEntryCount = allRecordRows.filter(row => row.style.display !== 'none').length;

        if (visibleEntryCount === 0) {
            this.notificationDisplayElement.textContent = this.operationalConfig.noMatchesNotification;
            this.notificationDisplayElement.style.display = '';
        } else {
            this.notificationDisplayElement.textContent = '';
            this.notificationDisplayElement.style.display = 'none';
        }
    }
}