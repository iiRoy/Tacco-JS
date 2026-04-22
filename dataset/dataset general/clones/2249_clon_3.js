// This script manages the dynamic addition of rows to two distinct HTML tables:
// one for display field configurations and another for annotation definitions.

// --- Global state variables for the main display configuration table ---
// Tracks the sequential number for naming form elements within the display table (e.g., display[1].itemNo).
let displayFormEntryNumber = 1;

// These variables store the DOM insertion indices for the four types of rows added to the display table.
// They are updated with each call to ensure rows are inserted at the correct, growing positions.
let displayHeaderRowOneIndex = 3;  // Insertion index for the first set of header cells
let displayInputRowOneIndex = 4;   // Insertion index for the first set of input fields
let displayHeaderRowTwoIndex = 5;  // Insertion index for the second set of header cells
let displayInputRowTwoIndex = 6;   // Insertion index for the second set of input fields

// A flag to differentiate the very first row addition from subsequent ones,
// as the index increment logic changes after the initial call.
let isFirstDisplayRowAddition = true;

/**
 * Appends a new block of display configuration rows (two header rows and two input rows)
 * to the HTML table identified by "DispTable".
 * This function handles the dynamic calculation of insertion points and populates cells
 * with appropriate form elements and descriptive headers based on the current entry number.
 */
function appendDisplayConfigurationBlock() {
    // Increment the entry number for the new set of form fields.
    displayFormEntryNumber++;

    // Adjust the row insertion indices based on whether this is the initial call or a subsequent one.
    if (isFirstDisplayRowAddition) {
        // For the very first addition, increment indices by 1 from their starting values.
        displayHeaderRowOneIndex++;
        displayInputRowOneIndex++;
        displayHeaderRowTwoIndex++;
        displayInputRowTwoIndex++;
        isFirstDisplayRowAddition = false; // Mark that the initial addition has occurred.
    } else {
        // For all subsequent additions, increment indices by 4 to maintain the structured spacing.
        const ROW_GROUP_SPACING = 4;
        displayHeaderRowOneIndex += ROW_GROUP_SPACING;
        displayInputRowOneIndex += ROW_GROUP_SPACING;
        displayHeaderRowTwoIndex += ROW_GROUP_SPACING;
        displayInputRowTwoIndex += ROW_GROUP_SPACING;
    }

    // Attempt to retrieve the main display table element. If not found, log an error and exit.
    const mainDisplayTable = document.getElementById("DispTable");
    if (!mainDisplayTable) {
        console.error("Critical Error: The main display table (ID: 'DispTable') was not found in the document.");
        return;
    }

    /**
     * Helper function to efficiently create and populate multiple cells within a given table row.
     * @param {HTMLTableRowElement} targetRow The row to which cells will be added.
     * @param {Array<Object>} cellDefinitions An array of objects, each defining a cell's class and HTML content.
     */
    const addMultipleCells = (targetRow, cellDefinitions) => {
        cellDefinitions.forEach((cellData, index) => {
            const newCell = targetRow.insertCell(index);
            newCell.className = cellData.cssClass;
            newCell.innerHTML = cellData.htmlContent;
        });
    };

    // --- Data structures defining the content for each type of row ---

    // Definitions for the first header row (general item properties).
    const headerRow1Content = [
        { cssClass: 'itemIdentifier', htmlContent: '<th style="background-color:#7b68ee;">#</th>' },
        { cssClass: 'itemNameJapanese', htmlContent: '<th style="background-color:#7b68ee;">Item Name (JP)</th>' },
        { cssClass: 'screenComponentType', htmlContent: '<th style="background-color:#7b68ee;">UI Component</th>' },
        { cssClass: 'annotationShort', htmlContent: '<th style="background-color:#7b68ee;" colspan="2">Annot. Ref</th>' },
        { cssClass: 'annotationLong', htmlContent: '<th style="background-color:#7b68ee;" colspan="2">Annotation</th>' },
        { cssClass: 'renderLength', htmlContent: '<th style="background-color:#7b68ee;">Display Length</th>' },
        { cssClass: 'mandatoryFlag', htmlContent: '<th style="background-color:#7b68ee;">Mandatory?</th>' },
        { cssClass: 'queryCriterion', htmlContent: '<th style="background-color:#7b68ee;">Search Condition</th>' }
    ];
    const newHeaderRow1 = mainDisplayTable.insertRow(displayHeaderRowOneIndex);
    addMultipleCells(newHeaderRow1, headerRow1Content);

    // Definitions for the first input row (form fields for general item properties).
    const inputRow1Content = [
        { cssClass: 'itemIdentifierInput', htmlContent: `${displayFormEntryNumber}<input type="text" value="${displayFormEntryNumber}" name="display[${displayFormEntryNumber}].itemNo" />` },
        { cssClass: 'itemNameJapaneseInput', htmlContent: `<input type="text" name="display[${displayFormEntryNumber}].itemNmJa" />` },
        { cssClass: 'screenComponentTypeInput', htmlContent: `<input type="text" name="display[${displayFormEntryNumber}].component" />` },
        { cssClass: 'annotationSelection', htmlContent: `<a href="Annotation.html" target="_blank" name="display[${displayFormEntryNumber}].annotationSel${displayFormEntryNumber}">Choose</a>` },
        { cssClass: 'annotationCodeInput', htmlContent: `<input type="text" name="display[${displayFormEntryNumber}].annotationCd" />` },
        { cssClass: 'renderLengthInput', htmlContent: `<input type="text" name="display[${displayFormEntryNumber}].displayDigit" />` },
        { cssClass: 'mandatoryFlagSelect', htmlContent: `<select name="display[${displayFormEntryNumber}].requiredKb">
                                                            <option value=""></option>
                                                            <option value="false">No</option>
                                                            <option value="true">Yes</option>
                                                        </select>` },
        { cssClass: 'queryCriterionSelect', htmlContent: `<select name="display[${displayFormEntryNumber}].searchConditionKb">
                                                                <option value=""></option>
                                                                <option value="--">--</option>
                                                                <option value="EQ">=</option>
                                                                <option value="NEQ"><></option>
                                                            </select>` }
    ];
    const newInputRow1 = mainDisplayTable.insertRow(displayInputRowOneIndex);
    addMultipleCells(newInputRow1, inputRow1Content);

    // Definitions for the second header row (action-related properties).
    const headerRow2Content = [
        { cssClass: 'actionIdHeader', htmlContent: '<th>Action Identifier</th>' },
        { cssClass: 'actionNameHeader', htmlContent: '<th>Action Title</th>' },
        { cssClass: 'forwardScreenIdHeader', htmlContent: '<th>Next Screen ID</th>' },
        { cssClass: 'errorScreenIdHeader', htmlContent: '<th>Error Screen ID</th>' }
    ];
    const newHeaderRow2 = mainDisplayTable.insertRow(displayHeaderRowTwoIndex);
    addMultipleCells(newHeaderRow2, headerRow2Content);

    // Definitions for the second input row (form fields for action-related properties).
    const inputRow2Content = [
        { cssClass: 'actionIdInput', htmlContent: `<input type="text" name="display[${displayFormEntryNumber}].actionID" />` },
        { cssClass: 'actionNameInput', htmlContent: `<input type="text" name="display[${displayFormEntryNumber}].actionNm" />` },
        { cssClass: 'forwardScreenIdInput', htmlContent: `<input type="text" name="display[${displayFormEntryNumber}].forwardScreenId" />` },
        { cssClass: 'errorScreenIdInput', htmlContent: `<input type="text" name="display[${displayFormEntryNumber}].errorScreenId" />` }
    ];
    const newInputRow2 = mainDisplayTable.insertRow(displayInputRowTwoIndex);
    addMultipleCells(newInputRow2, inputRow2Content);
}


// --- Global state variables for the annotation details table ---
// Tracks the sequential number for naming form elements within the annotation table.
let annotationEntrySequence = 1;
// Stores the DOM insertion index for new rows in the annotation table.
let nextAnnotationRowIndex = 1;

/**
 * Adds a new row to the annotation definition table.
 * This function appends a row containing input fields for specifying a new annotation,
 * including its code, name, argument types, and classpath.
 */
function appendAnnotationDetailRow() {
    // Increment the annotation entry sequence number for unique form field names.
    annotationEntrySequence++;

    // Attempt to retrieve the annotation table element. If not found, log an error and exit.
    const annotationDefinitionTable = document.getElementById("AnnotationTable");
    if (!annotationDefinitionTable) {
        console.error("Critical Error: The annotation definition table (ID: 'AnnotationTable') was not found in the document.");
        return;
    }

    // Insert a new row into the table at the current insertion index.
    const newAnnotationEntryRow = annotationDefinitionTable.insertRow(nextAnnotationRowIndex);

    /**
     * Helper function to set the class and inner HTML for a specific cell.
     * @param {HTMLTableCellElement} cell The cell to be configured.
     * @param {string} className The CSS class to apply to the cell.
     * @param {string} htmlContent The HTML string to set as the cell's content.
     */
    const configureCellContent = (cell, className, htmlContent) => {
        cell.className = className;
        cell.innerHTML = htmlContent;
    };

    // Definitions for the cells within the new annotation row.
    const annotationCellData = [
        { css: 'rowSelector', html: `<input type="checkbox" name="annotation[${annotationEntrySequence}].check" value="" />` },
        { css: 'annotationCode', html: `<input type="text" name="annotation[${annotationEntrySequence}].annotationCd" />` },
        { css: 'annotationNameEnglish', html: `<input type="text" name="annotation[${annotationEntrySequence}].annotationNmEn" />` },
        { css: 'argumentDataType', html: `<select name="annotation[${annotationEntrySequence}].argumentType">
                                            <option value=""></option>
                                            <option value="int">Integer</option>
                                            <option value="String">String</option>
                                            <option value="Long">Long Integer</option>
                                        </select>` },
        { css: 'argumentValueOne', html: `<input type="text" name="annotation[${annotationEntrySequence}].argument1" />` },
        { css: 'argumentValueTwo', html: `<input type="text" name="annotation[${annotationEntrySequence}].argument2" />` },
        { css: 'argumentValueThree', html: `<input type="text" name="annotation[${annotationEntrySequence}].argument3" />` },
        { css: 'javaClassPath', html: `<input type="text" name="annotation[${annotationEntrySequence}].classpathStr" />` }
    ];

    // Create and populate each cell in the new row using the defined data.
    annotationCellData.forEach((data, index) => {
        const cell = newAnnotationEntryRow.insertCell(index);
        configureCellContent(cell, data.css, data.html);
    });

    // Increment the insertion index for the next annotation row.
    nextAnnotationRowIndex++;
}