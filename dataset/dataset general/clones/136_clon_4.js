var GridVisualizer;

(function(globalJQuery) {
  "use strict";

  class DataGridRendererImpl {
    #columnLayouts;
    #commHandler;
    #dataFetchConfig;
    #elementTarget;
    #sortIdentifier;
    #jq; // Internal alias for jQuery

    /**
     * Constructs a new DataGridRendererImpl instance.
     * @param {string} dataKey The key for the spreadsheet data source.
     * @param {Array<Array<string>>} columnConfig An array of column definitions.
     * @param {string} containerSelector The CSS selector for the DOM element where the grid will be rendered.
     * @param {jQuery} jqInstance The jQuery instance to use.
     */
    constructor(dataKey, columnConfig, containerSelector, jqInstance) {
      this.#columnLayouts = columnConfig;
      this.#sortIdentifier = this.#columnLayouts[0][0]; // Assuming the first column is the primary sort key
      this.#dataFetchConfig = dataKey;
      this.#jq = jqInstance;

      // Mimic the original's $(document).ready behavior, triggering initialization
      this.#jq(document).ready(() => {
        this.#elementTarget = this.#jq(containerSelector);
        this.#activateDataDisplay();
      });
    }

    /**
     * Activates the data display process, initializing external services and fetching data.
     * This method is equivalent to the original's `init`.
     * @private
     */
    async #activateDataDisplay() {
      this.#commHandler = new pym.Child({ polling: 500 });

      // Wrap Tabletop.init in a Promise for a more modern async flow
      const obtainData = () => {
        return new Promise((resolve, reject) => {
          Tabletop.init({
            key: this.#dataFetchConfig,
            callback: (retrievedData) => {
              if (retrievedData) {
                resolve(retrievedData);
              } else {
                reject(new Error("Data retrieval failed from source."));
              }
            },
            simpleSheet: true,
            debug: false
          });
        });
      };

      try {
        const recordsCollection = await obtainData();
        this.#presentVisualGrid(recordsCollection);
      } catch (issue) {
        console.error("Error in data processing pipeline:", issue);
        this.#elementTarget.html('<p>Failed to load data for display.</p>');
      }
    }

    /**
     * Sorts a collection of records based on the primary sort identifier.
     * This method is a pure function, returning a new sorted array.
     * Equivalent to the original's `sortData`.
     * @param {Array<Object>} incomingRecords The array of data records to sort.
     * @returns {Array<Object>} A new array containing the sorted records.
     * @private
     */
    #reorderCollection(incomingRecords) {
      const primaryCriterion = this.#sortIdentifier;

      // Create a shallow copy to avoid mutating the original array
      const sortableRecords = [...incomingRecords];

      sortableRecords.sort((recordA, recordB) => {
        let valueA = recordA[primaryCriterion];
        let valueB = recordB[primaryCriterion];

        // Attempt numeric conversion for robust sorting
        const numA = parseFloat(valueA);
        const numB = parseFloat(valueB);

        if (!isNaN(numA) && !isNaN(numB)) {
          valueA = numA;
          valueB = numB;
        }

        if (valueA < valueB) return -1;
        if (valueA > valueB) return 1;
        return 0;
      });

      return sortableRecords;
    }

    /**
     * Orchestrates the rendering of the data grid to the DOM.
     * Equivalent to the original's `writeTable`.
     * @param {Array<Object>} incomingRecords The data records to display.
     * @private
     */
    #presentVisualGrid(incomingRecords) {
      const sortedRecords = this.#reorderCollection(incomingRecords);

      this.#elementTarget.empty(); // Clear existing content using jQuery
      const displayTable = document.createElement('table');
      displayTable.style.display = 'none';
      displayTable.classList.add('tablesaw'); // Use classList for modern class management
      displayTable.id = 'visual-grid-container'; // Unique ID for the new table
      displayTable.setAttribute('data-sortable', ''); // Set custom attribute

      this.#elementTarget.append(displayTable); // Append table using jQuery

      this.#constructHeader(displayTable);
      this.#fillGridBody(sortedRecords, displayTable);

      // Initialize Tablesaw plugin and fade in using jQuery
      this.#jq(displayTable).table().fadeIn();

      // Notify parent via Pym.js
      this.#commHandler.sendHeightToParent();
    }

    /**
     * Constructs the table header based on column definitions.
     * Equivalent to the original's `createTableColumns`.
     * @param {HTMLTableElement} targetTable The table element to which the header will be appended.
     * @private
     */
    #constructHeader(targetTable) {
      const tableHead = document.createElement('thead');
      const headerRowElement = document.createElement('tr');

      this.#columnLayouts.forEach((layoutItem, index) => {
        const headerCellElement = document.createElement('th');
        headerCellElement.setAttribute('data-sortable-col', '');
        if (index === 0) {
          headerCellElement.setAttribute('data-sortable-default-col', '');
        }
        headerCellElement.textContent = layoutItem[1]; // Display name for the column
        headerRowElement.appendChild(headerCellElement);
      });

      tableHead.appendChild(headerRowElement);
      targetTable.appendChild(tableHead);
    }

    /**
     * Fills the table body with data from the provided payload.
     * Equivalent to the original's `populateTable`.
     * @param {Array<Object>} dataPayload The array of data records.
     * @param {HTMLTableElement} targetTable The table element to which the body will be appended.
     * @private
     */
    #fillGridBody(dataPayload, targetTable) {
      const tableBody = document.createElement('tbody');
      const activeKeys = this.#columnLayouts.map(item => item[0]); // Extract data keys from column definitions

      dataPayload.forEach((recordEntry) => {
        const rowElement = document.createElement('tr');

        activeKeys.forEach((keyName, keyIndex) => {
          const contentValue = recordEntry[keyName];
          // Only create cell if the key exists in the record
          if (contentValue !== undefined) {
            const cellElement = document.createElement('td');
            cellElement.classList.add(keyName); // Add class based on key name

            // Set data-priority attribute using native dataset API
            cellElement.dataset.priority = (keyIndex === 0) ? 'persist' : keyIndex;

            // URL detection and transformation (different regex and logic)
            // Matches a URL anywhere in the string, similar to original's intent
            const urlPatternInternal = /(https?:\/\/)([\dA-Za-z\.-]+)\.([A-Za-z\.]{2,6})([\/\w \.-]*)*\/?(\?.*)?(\#.*)?/gi;
            let processedContent = String(contentValue); // Ensure string type for matching

            const firstMatch = processedContent.match(urlPatternInternal);
            if (firstMatch && firstMatch[0]) {
              // The original replaced only the first matched URL segment.
              const matchedUrl = firstMatch[0];
              const replacementAnchor = `<a target="_blank" class="ellipsis-link" href="${matchedUrl}">${matchedUrl}</a>`;
              processedContent = processedContent.replace(matchedUrl, replacementAnchor);
              cellElement.innerHTML = processedContent; // Use innerHTML for HTML content
            } else {
              cellElement.textContent = processedContent; // Use textContent for plain text for safety
            }
            rowElement.appendChild(cellElement);
          }
        });
        tableBody.appendChild(rowElement);
      });
      targetTable.appendChild(tableBody);
    }
  }

  // Assign the internal class constructor to the global variable GridVisualizer.
  // This mirrors the original's `ResponsiveTable = function(...)` assignment.
  globalJQuery.GridVisualizer = DataGridRendererImpl;

})(jQuery); // Pass jQuery into the IIFE to manage dependency