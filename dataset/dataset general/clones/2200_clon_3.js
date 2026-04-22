//----------------------------------------------------------
// Copyright (C) Microsoft Corporation. All rights reserved.
// Released under the Microsoft Office Extensible File License
// https://raw.github.com/stephen-hardy/xlsx.js/master/LICENSE.txt
// This file has been modified to demonstrate Type III code cloning.
// Original functionality is preserved, but structure, naming, and
// some implementation details have been significantly altered.
//----------------------------------------------------------

// Ensure JSZip is available. If not, attempt to load it via CommonJS 'require'.
// This is a crucial dependency for handling ZIP archives.
if ((typeof JSZip === 'undefined' || !JSZip) && typeof require === 'function') {
    // Dynamically import the 'node-zip' library if running in a Node.js-like environment.
    let JSZip = require('node-zip'); // Using 'let' for modern variable declaration.
}

/**
 * Processes Excel workbook data, either loading from a base64 string or
 * generating a new workbook based on provided structured data.
 * @param {string|object} workbookInput - Either a base64 encoded string of an XLSX file (for loading)
 *                                      or a structured JavaScript object representing the workbook (for saving).
 * @returns {object} An object containing processed data for loading, or a base64 string and helper for saving.
 */
function excelProcessor(workbookInput) {
    'use strict'; // Enforce strict mode for cleaner code and fewer errors.

    // Define constants for common values.
    const EXCEL_EPOCH_START = new Date(1900, 0, 0); // Excel's date system starts from Jan 1, 1900.
    const DAY_MILLISECONDS = 86400000; // Number of milliseconds in a day.
    const ALPHABET_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'; // Used for column conversions.
    const DEFAULT_CELL_FONT = 'Calibri';
    const DEFAULT_CELL_SIZE = 11;

    // Initialize core variables for workbook processing.
    let operationOutcome, // Stores the final result of the operation (loaded data or generated file).
        archiveHandler = new JSZip(), // Instance for managing the ZIP archive.
        archiveDuration, // Time taken for ZIP operations.
        processingDuration, // Time taken for data processing.
        xmlContentBuffer, // Temporary variable to hold XML string content.
        formatInfo, // Stores format code or type.
        idx, colIdx, cellIdx, // Loop counters.
        tempVar, // General purpose temporary variable.
        sheetCount, // Number of worksheets.
        sharedTextCollection, // Array for shared strings.
        cellStylingDefs, // Array for cell styles.
        lookupIndex, // General purpose index lookup.
        sheetDataMatrix, // Data for the current worksheet.
        cellValue, // Value of the current cell.
        cellStyleObject, // Style object for the current cell.
        borderDefinitions, // Array for border styles.
        singleBorderDef, // Individual border definition string.
        borderRefIdx, // Index of the border definition.
        fontDefinitions, // Array for font styles.
        singleFontDef, // Individual font definition string.
        fontRefIdx, // Index of the font definition.
        documentProperties, // Folder for document properties.
        excelCore, // Folder for core Excel content (xl).
        excelSheetContainer, // Folder for worksheets (xl/worksheets).
        currentSheet, // The current worksheet being processed.
        contentTypeManifests = [[], []], // Stores parts for Content_Types.xml.
        sheetPropertyNames = [], // Worksheet names for docProps/app.xml.
        excelRelationships = [], // Relationships for xl/_rels/workbook.xml.rels.
        sheetReferences = [], // Sheet entries for xl/workbook.xml.
        entityId, // Generic ID for various elements.
        columnMetadata, // Stores column-specific information (width, autoWidth).
        columnWidthsXml, // XML fragment for column widths.
        calculatedColumnWidth, // Calculated width for a column based on content.
        currentCell, // Reference to the current cell object.
        currentRow, // Reference to the current row array.
        mergedCellRanges, // Array of merged cell ranges.
        mergeOperationDetails, // Details for a merge operation.
        // Pre-defined number format codes.
        numberFormatCodes = [
            'General', '0', '0.00', '#,##0', '#,##0.00', , , , , '0%', '0.00%', '0.00E+00',
            '# ?/?', '# ??/??', 'mm-dd-yy', 'd-mmm-yy', 'd-mmm', 'mmm-yy', 'h:mm AM/PM',
            'h:mm:ss AM/PM', 'h:mm', 'h:mm:ss', 'm/d/yy h:mm', , , , , , , , , , , , , , , ,
            '#,##0 ;(#,##0)', '#,##0 ;[Red](#,##0)', '#,##0.00;(#,##0.00)', '#,##0.00;[Red](#,##0.00)',
            , , , , , 'mm:ss', '[h]:mm:ss', 'mmss.0', '##0.0E+0', '@'
        ];

    /**
     * Converts a 0-indexed column number to its Excel alphabetical representation (e.g., 0 -> A, 25 -> Z, 26 -> AA).
     * @param {number} colIndex - The 0-indexed column number.
     * @returns {string} The Excel-style alphabetical column identifier.
     */
    const columnIdxToAlpha = (colIndex) => {
        let temp = Math.floor(colIndex / ALPHABET_CHARS.length) - 1;
        let result = (temp > -1 ? columnIdxToAlpha(temp) : '') + ALPHABET_CHARS.charAt(colIndex % ALPHABET_CHARS.length);
        return result;
    };

    /**
     * Converts an Excel alphabetical column identifier to its 0-indexed column number (e.g., A -> 0, Z -> 25, AA -> 26).
     * @param {string} alphaStr - The Excel-style alphabetical column identifier.
     * @returns {number} The 0-indexed column number.
     */
    const alphaToColumnIdx = (alphaStr) => {
        let total = 0;
        const strLength = alphaStr.length;
        if (strLength === 2) {
            total = alphaToColumnIdx(alphaStr.charAt(0)) + 1; // Handle multi-character columns.
        }
        return total * ALPHABET_CHARS.length + ALPHABET_CHARS.indexOf(alphaStr.slice(-1));
    };

    /**
     * Converts between Excel's serial date number and JavaScript Date objects.
     * Excel dates are 1-based, with 1 representing Jan 1, 1900.
     * @param {number|Date} dateInput - A number representing an Excel date, or a JavaScript Date object.
     * @returns {number|Date} A JavaScript Date object if input was a number, or an Excel serial number if input was a Date object.
     */
    const excelDateConverter = (dateInput) => {
        const isDateType = dateInput instanceof Date;
        // Calculate timezone offset difference to adjust for 1900 epoch.
        const currentOffset = (isDateType ? dateInput.getTimezoneOffset() : (new Date()).getTimezoneOffset());
        const excelEpochOffset = EXCEL_EPOCH_START.getTimezoneOffset();
        const timezoneDiffMillis = (currentOffset - excelEpochOffset) * 60000;

        if (isDateType) {
            // Convert JS Date to Excel serial number.
            return ((dateInput - EXCEL_EPOCH_START - timezoneDiffMillis) / DAY_MILLISECONDS) + 1;
        } else {
            // Convert Excel serial number to JS Date.
            // Subtract 1 from input because Excel's date system starts at 1, not 0.
            return new Date(Number(EXCEL_EPOCH_START) - timezoneDiffMillis + (Number(dateInput) - 1) * DAY_MILLISECONDS);
        }
    };

    /**
     * Determines the precise type of a JavaScript object.
     * @param {*} value - The value to check.
     * @returns {string} The object type as a lowercase string (e.g., 'array', 'date', 'object').
     */
    const getObjectType = (value) => {
        // Using Object.prototype.toString for robust type checking.
        return Object.prototype.toString.call(value).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
    };

    /**
     * Extracts the value of a specified XML attribute from a given XML string fragment.
     * Assumes attribute values are enclosed in double quotes.
     * @param {string} xmlFragment - The XML string potentially containing the attribute.
     * @param {string} attributeName - The name of the attribute to extract.
     * @returns {string} The value of the attribute, or an empty string if not found.
     */
    const extractXmlAttribute = (xmlFragment, attributeName) => {
        const searchPattern = `${attributeName}="`;
        const startIdx = xmlFragment.indexOf(searchPattern);
        if (startIdx === -1) return ''; // Attribute not found.

        const valueStart = startIdx + searchPattern.length;
        const valueEnd = xmlFragment.indexOf('"', valueStart);
        return (valueEnd !== -1) ? xmlFragment.substring(valueStart, valueEnd) : '';
    };

    /**
     * Escapes special XML characters in a string to ensure it's safe for embedding in XML documents.
     * @param {*} inputString - The string to escape.
     * @returns {string} The escaped string, or an empty string if input is not a string.
     */
    const sanitizeXmlString = (inputString) => {
        if (typeof inputString !== 'string') return '';
        // Use a chain of replace calls for each special character.
        return inputString
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;'); // Using &apos; instead of &#x27;
    };

    /**
     * Unescapes XML entities back to their original characters.
     * @param {*} inputString - The string containing XML entities.
     * @returns {string} The unescaped string, or an empty string if input is not a string.
     */
    const restoreXmlString = (inputString) => {
        if (typeof inputString !== 'string') return '';
        // Order matters here: &amp; must be replaced first.
        return inputString
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&apos;/g, "'") // Handle &apos;
            .replace(/&#x27;/g, "'") // Handle &#x27;
            .replace(/&#10;/g, '\n'); // Handle newline entity.
    };

    // Main logic branch: Load existing workbook or Save new workbook.
    if (typeof workbookInput === 'string') { // Load operation: input is a base64 string.
        archiveDuration = Date.now();
        archiveHandler = archiveHandler.load(workbookInput, { base64: true });
        operationOutcome = { sheets: [], archiveLoadTime: Date.now() - archiveDuration };
        processingDuration = Date.now();
        sharedTextCollection = [];
        cellStylingDefs = [];

        // Process shared strings XML if available.
        xmlContentBuffer = archiveHandler.file('xl/sharedStrings.xml');
        if (xmlContentBuffer) {
            // Split by '<t.*?>' to isolate shared string values.
            const rawStrings = xmlContentBuffer.asText().split(/<t[^>]*?>/g);
            // Iterate from the end, skipping the first element which is before the first <t> tag.
            sharedTextCollection = rawStrings.slice(1).map(strPart => {
                const endIndex = strPart.indexOf('</t>');
                return restoreXmlString(strPart.substring(0, endIndex));
            });
        }

        // Extract document properties from docProps/core.xml.
        xmlContentBuffer = archiveHandler.file('docProps/core.xml');
        if (xmlContentBuffer) {
            const docXml = xmlContentBuffer.asText();
            // Helper function to extract content between tags.
            const extractTagContent = (xml, tagName) => {
                const startTag = `<${tagName}>`;
                const endTag = `</${tagName}>`;
                const start = xml.indexOf(startTag);
                if (start === -1) return '';
                const end = xml.indexOf(endTag, start + startTag.length);
                return (end !== -1) ? xml.substring(start + startTag.length, end) : '';
            };

            operationOutcome.creator = extractTagContent(docXml, 'dc:creator');
            operationOutcome.lastModifiedBy = extractTagContent(docXml, 'cp:lastModifiedBy');
            // Dates require special handling due to xsi:type attribute.
            const createdMatch = docXml.match(/<dcterms:created[^>]*>([^<]+)<\/dcterms:created>/);
            if (createdMatch && createdMatch[1]) operationOutcome.created = new Date(createdMatch[1]);
            const modifiedMatch = docXml.match(/<dcterms:modified[^>]*>([^<]+)<\/dcterms:modified>/);
            if (modifiedMatch && modifiedMatch[1]) operationOutcome.modified = new Date(modifiedMatch[1]);
        }

        // Get workbook information from xl/workbook.xml.
        xmlContentBuffer = archiveHandler.file('xl/workbook.xml');
        if (xmlContentBuffer) {
            const workbookXml = xmlContentBuffer.asText();
            const activeTabMatch = workbookXml.match(/activeTab="(\d+)"/);
            operationOutcome.activeSheetIndex = activeTabMatch ? Number(activeTabMatch[1]) : 0;

            // Extract sheet names and initialize sheet data.
            const sheetEntries = workbookXml.split('<sheet ').slice(1); // Skip content before first sheet.
            operationOutcome.sheets = sheetEntries.reverse().map(sheetXml => {
                const sheetName = extractXmlAttribute(sheetXml, 'name');
                return { name: sheetName, data: [] };
            });
        }

        // Get style information from xl/styles.xml.
        xmlContentBuffer = archiveHandler.file('xl/styles.xml');
        if (xmlContentBuffer) {
            const stylesXml = xmlContentBuffer.asText();
            // Process custom number formats.
            const customNumFmts = stylesXml.split('<numFmt ').slice(1).map(fmtPart => {
                return {
                    id: Number(extractXmlAttribute(fmtPart, 'numFmtId')),
                    code: extractXmlAttribute(fmtPart, 'formatCode')
                };
            });
            customNumFmts.forEach(fmt => { numberFormatCodes[fmt.id] = fmt.code; });

            // Process cell XFS (e.g., cell styles).
            const cellXfsSection = stylesXml.substring(stylesXml.indexOf('<cellXfs'));
            const xfEntries = cellXfsSection.split('<xf ').slice(1);
            cellStylingDefs = xfEntries.map(xfPart => {
                const numFmtId = Number(extractXmlAttribute(xfPart, 'numFmtId')) || 0; // Default to 0 if not found.
                const formatCode = numberFormatCodes[numFmtId] || 'General';
                let dataType;
                if (formatCode.includes('m') || formatCode.includes('d') || formatCode.includes('y')) {
                    dataType = 'date';
                } else if (formatCode.includes('0') || formatCode.includes('#')) {
                    dataType = 'number';
                } else if (formatCode === '@') {
                    dataType = 'string';
                } else {
                    dataType = 'unknown';
                }
                return { formatCode: formatCode, type: dataType };
            });
            // The original code used unshift, so we need to reverse if we used map.
            // My map approach processes in document order, so I need to reverse the result of map.
            cellStylingDefs.reverse();
        }

        // Get worksheet data from xl/worksheets/sheetX.xml.
        for (idx = 0; idx < operationOutcome.sheets.length; idx++) {
            const currentSheetId = idx + 1;
            xmlContentBuffer = archiveHandler.file(`xl/worksheets/sheet${currentSheetId}.xml`);
            if (!xmlContentBuffer) continue; // Skip if sheet file is missing.

            const sheetXml = xmlContentBuffer.asText();
            currentSheet = operationOutcome.sheets[idx];
            currentSheet.hasTable = sheetXml.includes('<tableParts '); // Check for table parts.

            // Extract dimension (e.g., A1:B2).
            const dimensionRef = extractXmlAttribute(sheetXml.substring(sheetXml.indexOf('<dimension')), 'ref');
            if (dimensionRef) {
                const lastCellRef = dimensionRef.split(':').pop(); // Get 'B2' from 'A1:B2'.
                const colAlpha = lastCellRef.match(/[a-zA-Z]+/g)?.[0] || 'A';
                const rowNum = Number(lastCellRef.match(/\d+/g)?.[0]) || 1;
                currentSheet.maxColumns = alphaToColumnIdx(colAlpha) + 1;
                currentSheet.maxRows = rowNum;
            } else {
                currentSheet.maxColumns = 0;
                currentSheet.maxRows = 0;
            }

            const rowXmlParts = sheetXml.split('<row ').slice(1); // Split into individual row XML fragments.
            currentSheet.data = Array(currentSheet.maxRows).fill(null).map(() => []); // Pre-allocate rows.

            rowXmlParts.forEach(rowPart => {
                const rowIndex = Number(extractXmlAttribute(rowPart, 'r')) - 1; // 0-indexed row.
                if (rowIndex < 0 || rowIndex >= currentSheet.maxRows) return; // Skip invalid row indices.

                currentRow = currentSheet.data[rowIndex];
                const cellXmlParts = rowPart.split('<c ').slice(1); // Split into individual cell XML fragments.

                cellXmlParts.forEach(cellPart => {
                    const cellRef = extractXmlAttribute(cellPart, 'r'); // e.g., "A1", "B1"
                    const cellColAlpha = cellRef.match(/[a-zA-Z]+/g)?.[0] || 'A';
                    const cellColIndex = alphaToColumnIdx(cellColAlpha); // 0-indexed column.

                    if (cellColIndex < 0 || cellColIndex >= currentSheet.maxColumns) return; // Skip invalid column indices.

                    const styleRefId = Number(extractXmlAttribute(cellPart, 's')) || 0;
                    const appliedStyle = cellStylingDefs[styleRefId] || { type: 'General', formatCode: 'General' };
                    let cellDataType = extractXmlAttribute(cellPart, 't') || appliedStyle.type;

                    let rawValue = '';
                    const valueStart = cellPart.indexOf('<v>');
                    const valueEnd = cellPart.indexOf('</v>');
                    if (valueStart !== -1 && valueEnd !== -1) {
                        rawValue = cellPart.substring(valueStart + 3, valueEnd);
                    }

                    cellValue = null; // Initialize cellValue to null.

                    switch (cellDataType) {
                        case 's': // Shared string.
                            cellValue = sharedTextCollection[Number(rawValue)];
                            break;
                        case 'b': // Boolean.
                            cellValue = (rawValue === '1');
                            break;
                        case 'date': // Date.
                            cellValue = excelDateConverter(Number(rawValue));
                            break;
                        case 'n': // Number.
                            cellValue = Number(rawValue);
                            break;
                        default: // General or unknown.
                            // Attempt to convert to number, otherwise keep as string.
                            cellValue = rawValue === '' ? null : (Number.isNaN(Number(rawValue)) ? rawValue : Number(rawValue));
                            break;
                    }

                    // Store the cell data in the row array.
                    currentRow[cellColIndex] = {
                        value: cellValue,
                        formatCode: appliedStyle.formatCode
                    };
                    // Optionally, could store original type here too: type: cellDataType
                });
            });
        }
        operationOutcome.processingTime = Date.now() - processingDuration;
    } else { // Save operation: input is a structured object.
        processingDuration = Date.now();
        sharedTextCollection = [[], 0]; // [unique_strings_array, total_string_count]

        // Create base ZIP structure and static files.
        archiveHandler.folder('_rels').file('.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
            <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
                <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
                <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
                <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
            </Relationships>`);
        documentProperties = archiveHandler.folder('docProps');

        excelCore = archiveHandler.folder('xl');
        excelCore.folder('theme').file('theme1.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
            <a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="Office Theme">
                <a:themeElements>
                    <a:clrScheme name="Office">
                        <a:dk1><a:sysClr val="windowText" lastClr="000000"/></a:dk1>
                        <a:lt1><a:sysClr val="window" lastClr="FFFFFF"/></a:lt1>
                        <a:dk2><a:srgbClr val="1F497D"/></a:dk2>
                        <a:lt2><a:srgbClr val="EEECE1"/></a:lt2>
                        <a:accent1><a:srgbClr val="4F81BD"/></a:accent1>
                        <a:accent2><a:srgbClr val="C0504D"/></a:accent2>
                        <a:accent3><a:srgbClr val="9BBB59"/></a:accent3>
                        <a:accent4><a:srgbClr val="8064A2"/></a:accent4>
                        <a:accent5><a:srgbClr val="4BACC6"/></a:accent5>
                        <a:accent6><a:srgbClr val="F79646"/></a:accent6>
                        <a:hlink><a:srgbClr val="0000FF"/></a:hlink>
                        <a:folHlink><a:srgbClr val="800080"/></a:folHlink>
                    </a:clrScheme>
                    <a:fontScheme name="Office">
                        <a:majorFont><a:latin typeface="Cambria"/><a:ea typeface=""/><a:cs typeface=""/><a:font script="Jpan" typeface="MS P????"/>
                            <a:font script="Hang" typeface="?? ??"/><a:font script="Hans" typeface="???"/><a:font script="Hant" typeface="????"/>
                            <a:font script="Arab" typeface="Times New Roman"/><a:font script="Hebr" typeface="Times New Roman"/>
                            <a:font script="Thai" typeface="Tahoma"/><a:font script="Ethi" typeface="Nyala"/><a:font script="Beng" typeface="Vrinda"/>
                            <a:font script="Gujr" typeface="Shruti"/><a:font script="Khmr" typeface="MoolBoran"/><a:font script="Knda" typeface="Tunga"/>
                            <a:font script="Guru" typeface="Raavi"/><a:font script="Cans" typeface="Euphemia"/><a:font script="Cher" typeface="Plantagenet Cherokee"/>
                            <a:font script="Yiii" typeface="Microsoft Yi Baiti"/><a:font script="Tibt" typeface="Microsoft Himalaya"/>
                            <a:font script="Thaa" typeface="MV Boli"/><a:font script="Deva" typeface="Mangal"/><a:font script="Telu" typeface="Gautami"/>
                            <a:font script="Taml" typeface="Latha"/><a:font script="Syrc" typeface="Estrangelo Edessa"/>
                            <a:font script="Orya" typeface="Kalinga"/><a:font script="Mlym" typeface="Kartika"/><a:font script="Laoo" typeface="DokChampa"/>
                            <a:font script="Sinh" typeface="Iskoola Pota"/><a:font script="Mong" typeface="Mongolian Baiti"/>
                            <a:font script="Viet" typeface="Times New Roman"/><a:font script="Uigh" typeface="Microsoft Uighur"/>
                            <a:font script="Geor" typeface="Sylfaen"/>
                        </a:majorFont>
                        <a:minorFont><a:latin typeface="Calibri"/><a:ea typeface=""/><a:cs typeface=""/><a:font script="Jpan" typeface="MS P????"/>
                            <a:font script="Hang" typeface="?? ??"/><a:font script="Hans" typeface="???"/><a:font script="Hant" typeface="????"/>
                            <a:font script="Arab" typeface="Arial"/><a:font script="Hebr" typeface="Arial"/>
                            <a:font script="Thai" typeface="Tahoma"/><a:font script="Ethi" typeface="Nyala"/><a:font script="Beng" typeface="Vrinda"/>
                            <a:font script="Gujr" typeface="Shruti"/><a:font script="Khmr" typeface="DaunPenh"/><a:font script="Knda" typeface="Tunga"/>
                            <a:font script="Guru" typeface="Raavi"/><a:font script="Cans" typeface="Euphemia"/><a:font script="Cher" typeface="Plantagenet Cherokee"/>
                            <a:font script="Yiii" typeface="Microsoft Yi Baiti"/><a:font script="Tibt" typeface="Microsoft Himalaya"/>
                            <a:font script="Thaa" typeface="MV Boli"/><a:font script="Deva" typeface="Mangal"/><a:font script="Telu" typeface="Gautami"/>
                            <a:font script="Taml" typeface="Latha"/><a:font script="Syrc" typeface="Estrangelo Edessa"/>
                            <a:font script="Orya" typeface="Kalinga"/><a:font script="Mlym" typeface="Kartika"/><a:font script="Laoo" typeface="DokChampa"/>
                            <a:font script="Sinh" typeface="Iskoola Pota"/><a:font script="Mong" typeface="Mongolian Baiti"/>
                            <a:font script="Viet" typeface="Arial"/><a:font script="Uigh" typeface="Microsoft Uighur"/>
                            <a:font script="Geor" typeface="Sylfaen"/>
                        </a:minorFont>
                    </a:fontScheme>
                    <a:fmtScheme name="Office">
                        <a:fillStyleLst>
                            <a:solidFill><a:schemeClr val="phClr"/></a:solidFill>
                            <a:gradFill rotWithShape="1"><a:gsLst><a:gs pos="0"><a:schemeClr val="phClr"><a:tint val="50000"/><a:satMod val="300000"/></a:schemeClr></a:gs><a:gs pos="35000"><a:schemeClr val="phClr"><a:tint val="37000"/><a:satMod val="300000"/></a:schemeClr></a:gs><a:gs pos="100000"><a:schemeClr val="phClr"><a:tint val="15000"/><a:satMod val="350000"/></a:schemeClr></a:gs></a:gsLst><a:lin ang="16200000" scaled="1"/></a:gradFill>
                            <a:gradFill rotWithShape="1"><a:gsLst><a:gs pos="0"><a:schemeClr val="phClr"><a:shade val="51000"/><a:satMod val="130000"/></a:schemeClr></a:gs><a:gs pos="80000"><a:schemeClr val="phClr"><a:shade val="93000"/><a:satMod val="130000"/></a:schemeClr></a:gs><a:gs pos="100000"><a:schemeClr val="phClr"><a:shade val="94000"/><a:satMod val="135000"/></a:schemeClr></a:gs></a:gsLst><a:lin ang="16200000" scaled="0"/></a:gradFill>
                        </a:fillStyleLst>
                        <a:lnStyleLst>
                            <a:ln w="9525" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="phClr"><a:shade val="95000"/><a:satMod val="105000"/></a:schemeClr></a:solidFill><a:prstDash val="solid"/></a:ln>
                            <a:ln w="25400" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:prstDash val="solid"/></a:ln>
                            <a:ln w="38100" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:prstDash val="solid"/></a:ln>
                        </a:lnStyleLst>
                        <a:effectStyleLst>
                            <a:effectStyle><a:effectLst><a:outerShdw blurRad="40000" dist="20000" dir="5400000" rotWithShape="0"><a:srgbClr val="000000"><a:alpha val="38000"/></a:srgbClr></a:outerShdw></a:effectLst></a:effectStyle>
                            <a:effectStyle><a:effectLst><a:outerShdw blurRad="40000" dist="23000" dir="5400000" rotWithShape="0"><a:srgbClr val="000000"><a:alpha val="35000"/></a:srgbClr></a:outerShdw></a:effectLst></a:effectStyle>
                            <a:effectStyle><a:effectLst><a:outerShdw blurRad="40000" dist="23000" dir="5400000" rotWithShape="0"><a:srgbClr val="000000"><a:alpha val="35000"/></a:srgbClr></a:outerShdw></a:effectLst><a:scene3d><a:camera prst="orthographicFront"><a:rot lat="0" lon="0" rev="0"/></a:camera><a:lightRig rig="threePt" dir="t"><a:rot lat="0" lon="0" rev="1200000"/></a:lightRig></a:scene3d><a:sp3d><a:bevelT w="63500" h="25400"/></a:sp3d></a:effectStyle>
                        </a:effectStyleLst>
                        <a:bgFillStyleLst>
                            <a:solidFill><a:schemeClr val="phClr"/></a:solidFill>
                            <a:gradFill rotWithShape="1"><a:gsLst><a:gs pos="0"><a:schemeClr val="phClr"><a:tint val="40000"/><a:satMod val="350000"/></a:schemeClr></a:gs><a:gs pos="40000"><a:schemeClr val="phClr"><a:tint val="45000"/><a:shade val="99000"/><a:satMod val="350000"/></a:schemeClr></a:gs><a:gs pos="100000"><a:schemeClr val="phClr"><a:shade val="20000"/><a:satMod val="255000"/></a:schemeClr></a:gs></a:gsLst><a:path path="circle"><a:fillToRect l="50000" t="-80000" r="50000" b="180000"/></a:path></a:gradFill>
                            <a:gradFill rotWithShape="1"><a:gsLst><a:gs pos="0"><a:schemeClr val="phClr"><a:tint val="80000"/><a:satMod val="300000"/></a:schemeClr></a:gs><a:gs pos="100000"><a:schemeClr val="phClr"><a:shade val="30000"/><a:satMod val="200000"/></a:schemeClr></a:gs></a:gsLst><a:path path="circle"><a:fillToRect l="50000" t="50000" r="50000" b="50000"/></a:path></a:gradFill>
                        </a:bgFillStyleLst>
                    </a:fmtScheme>
                </a:themeElements>
                <a:objectDefaults/><a:extraClrSchemeLst/>
            </a:theme>`);
        excelSheetContainer = excelCore.folder('worksheets');

        // Generate docProps/core.xml with dynamic content.
        const fileCreator = workbookInput.creator || 'XLSX.js Clone';
        const lastModifier = workbookInput.lastModifiedBy || 'XLSX.js Clone';
        const creationTime = (workbookInput.created || new Date()).toISOString();
        const modificationTime = (workbookInput.modified || new Date()).toISOString();

        documentProperties.file('core.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
            <cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties"
                xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/"
                xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
                <dc:creator>${sanitizeXmlString(fileCreator)}</dc:creator>
                <cp:lastModifiedBy>${sanitizeXmlString(lastModifier)}</cp:lastModifiedBy>
                <dcterms:created xsi:type="dcterms:W3CDTF">${creationTime}</dcterms:created>
                <dcterms:modified xsi:type="dcterms:W3CDTF">${modificationTime}</dcterms:modified>
            </cp:coreProperties>`);

        // Initialize style, border, and font collections.
        // Index 0 will be the default style/border/font.
        cellStylingDefs = ['default_xf_style_placeholder'];
        borderDefinitions = ['default_border_style_placeholder'];
        fontDefinitions = ['default_font_style_placeholder'];

        // Iterate through worksheets to generate their XML content.
        const worksheetsToProcess = [...workbookInput.worksheets].reverse(); // Process in reverse to match original unshift behavior for IDs.
        for (idx = 0; idx < worksheetsToProcess.length; idx++) {
            entityId = idx + 1; // Worksheet ID starts from 1.
            currentSheet = worksheetsToProcess[idx];
            sheetDataMatrix = currentSheet.data;

            let rowXmlFragments = [];
            columnMetadata = []; // Reset for each sheet.
            mergedCellRanges = [];

            // Iterate rows and cells to build XML content and collect shared strings/styles.
            for (let rowNum = 0; rowNum < sheetDataMatrix.length; rowNum++) {
                currentRow = sheetDataMatrix[rowNum] || []; // Ensure row is an array.
                let cellXmlInRow = [];

                for (let colNum = 0; colNum < currentRow.length; colNum++) {
                    currentCell = currentRow[colNum];
                    if (!currentCell || currentCell.isMergedPlaceholder) { // Handle empty cells or merged placeholders explicitly.
                        cellXmlInRow.push(`<c r="${columnIdxToAlpha(colNum)}${rowNum + 1}"/>`);
                        continue;
                    }

                    cellValue = currentCell.hasOwnProperty('value') ? currentCell.value : currentCell;
                    let cellTypeIndicator = ''; // 's' for shared string, 'b' for boolean, 'n' for number.
                    cellStyleObject = { // Extract relevant style properties.
                        borders: currentCell.borders,
                        hAlign: currentCell.hAlign,
                        vAlign: currentCell.vAlign,
                        bold: currentCell.bold,
                        italic: currentCell.italic,
                        fontName: currentCell.fontName,
                        fontSize: currentCell.fontSize,
                        formatCode: currentCell.formatCode || 'General'
                    };
                    calculatedColumnWidth = 0; // Reset width for current cell.

                    // Determine cell value type and handle shared strings/dates.
                    if (typeof cellValue === 'string' && !Number.isFinite(Number(cellValue))) {
                        // Value is a non-numeric string, store as shared string.
                        const sanitizedString = sanitizeXmlString(cellValue);
                        sharedTextCollection[1]++; // Increment total count.
                        lookupIndex = sharedTextCollection[0].indexOf(sanitizedString);
                        calculatedColumnWidth = cellValue.length; // Use original length for width.
                        if (lookupIndex === -1) {
                            lookupIndex = sharedTextCollection[0].push(sanitizedString) - 1;
                        }
                        cellValue = lookupIndex;
                        cellTypeIndicator = 's';
                    } else if (typeof cellValue === 'boolean') {
                        cellValue = cellValue ? 1 : 0;
                        cellTypeIndicator = 'b';
                        calculatedColumnWidth = 1;
                    } else if (getObjectType(cellValue) === 'date') {
                        cellValue = excelDateConverter(cellValue);
                        cellStyleObject.formatCode = currentCell.formatCode || 'mm-dd-yy';
                        calculatedColumnWidth = String(cellValue).length; // Approximate width.
                    } else if (cellValue === null || cellValue === undefined || typeof cellValue === 'object') {
                        // Unsupported object types or explicit null/undefined.
                        cellValue = null; // Ensure XML output is empty for these.
                    } else {
                        // Numbers or numeric strings.
                        calculatedColumnWidth = String(cellValue).length;
                        cellValue = Number(cellValue); // Ensure it's a number.
                        if (Number.isNaN(cellValue)) cellValue = null; // If conversion fails, set to null.
                    }

                    // Manage cell styles.
                    const styleSignature = JSON.stringify(cellStyleObject);
                    lookupIndex = cellStylingDefs.indexOf(styleSignature);
                    if (lookupIndex === -1) {
                        lookupIndex = cellStylingDefs.push(styleSignature) - 1;
                    }
                    const styleRef = lookupIndex > 0 ? ` s="${lookupIndex}"` : ''; // Don't apply style 0 explicitly.

                    // Update column metadata for auto-width.
                    if (!columnMetadata[colNum]) {
                        columnMetadata[colNum] = { autoWidthEnabled: false, maxWidth: 0 };
                    }
                    if (currentCell.autoWidth) {
                        columnMetadata[colNum].autoWidthEnabled = true;
                    }
                    if (calculatedColumnWidth > columnMetadata[colNum].maxWidth) {
                        columnMetadata[colNum].maxWidth = calculatedColumnWidth;
                    }

                    // Handle merged cells.
                    if (currentCell.colSpan > 1 || currentCell.rowSpan > 1) {
                        const startCellRef = `${columnIdxToAlpha(colNum)}${rowNum + 1}`;
                        let endCellRef;

                        if (currentCell.colSpan > 1) {
                            endCellRef = `${columnIdxToAlpha(colNum + currentCell.colSpan - 1)}${rowNum + 1}`;
                            // Fill in merged cells in the current row with placeholder.
                            for (let m = 1; m < currentCell.colSpan; m++) {
                                currentRow.splice(colNum + m, 0, { value: null, isMergedPlaceholder: true });
                            }
                            colNum += currentCell.colSpan - 1; // Advance column index past merged cells.
                        } else if (currentCell.rowSpan > 1) {
                            endCellRef = `${columnIdxToAlpha(colNum)}${rowNum + currentCell.rowSpan}`;
                            // Fill in merged cells in subsequent rows with placeholder.
                            for (let m = 1; m < currentCell.rowSpan; m++) {
                                if (!sheetDataMatrix[rowNum + m]) {
                                    sheetDataMatrix[rowNum + m] = [];
                                }
                                sheetDataMatrix[rowNum + m].splice(colNum, 0, { value: null, isMergedPlaceholder: true });
                            }
                        }
                        mergedCellRanges.push(`${startCellRef}:${endCellRef}`);
                        // Remove original cell's span properties to avoid re-processing.
                        delete currentCell.rowSpan;
                        delete currentCell.colSpan;
                    }

                    // Construct cell XML.
                    let cellXml = `<c r="${columnIdxToAlpha(colNum)}${rowNum + 1}"${styleRef}${cellTypeIndicator ? ` t="${cellTypeIndicator}"` : ''}>`;
                    if (currentCell.formula) {
                        cellXml += `<f>${sanitizeXmlString(currentCell.formula)}</f>`;
                    }
                    if (cellValue !== null) {
                        cellXml += `<v>${cellValue}</v>`;
                    }
                    cellXml += `</c>`;
                    cellXmlInRow.push(cellXml);
                }
                rowXmlFragments.push(`<row r="${rowNum + 1}" x14ac:dyDescent="0.25">${cellXmlInRow.join('')}</row>`);
            }

            // Generate column width definitions.
            let autoWidthColsXml = [];
            for (let c = 0; c < columnMetadata.length; c++) {
                if (columnMetadata[c] && columnMetadata[c].autoWidthEnabled) {
                    autoWidthColsXml.push(`<col min="${c + 1}" max="${c + 1}" width="${columnMetadata[c].maxWidth}" bestFit="1" customWidth="1"/>`);
                }
            }
            columnWidthsXml = autoWidthColsXml.length > 0 ? `<cols>${autoWidthColsXml.join('')}</cols>` : '';

            // Construct full worksheet XML.
            let maxColAlpha = columnIdxToAlpha(currentSheet.data.reduce((max, row) => Math.max(max, row.length), 0) - 1);
            let maxRowNumber = sheetDataMatrix.length;
            let dimensionRef = `A1:${maxColAlpha}${maxRowNumber}`;

            let worksheetXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
                <worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"
                    xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
                    xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
                    mc:Ignorable="x14ac" xmlns:x14ac="http://schemas.microsoft.com/office/spreadsheetml/2009/9/ac">
                    <dimension ref="${dimensionRef}"/>
                    <sheetViews><sheetView ${idx === workbookInput.activeWorksheet ? 'tabSelected="1" ' : ''}workbookViewId="0"/></sheetViews>
                    <sheetFormatPr defaultRowHeight="15" x14ac:dyDescent="0.25"/>
                    ${columnWidthsXml}
                    <sheetData>${rowXmlFragments.join('')}</sheetData>`;

            if (mergedCellRanges.length > 0) {
                worksheetXml += `<mergeCells count="${mergedCellRanges.length}">`;
                mergedCellRanges.forEach(range => { worksheetXml += `<mergeCell ref="${range}"/>`; });
                worksheetXml += `</mergeCells>`;
            }
            worksheetXml += `<pageMargins left="0.7" right="0.7" top="0.75" bottom="0.75" header="0.3" footer="0.3"/>`;

            if (currentSheet.hasTable) {
                worksheetXml += `<tableParts count="1"><tablePart r:id="rId1"/></tableParts>`;
            }
            excelSheetContainer.file(`sheet${entityId}.xml`, worksheetXml + `</worksheet>`);

            // Handle table XML if present.
            if (currentSheet.hasTable) {
                const tableId = entityId; // Use sheet ID for table ID.
                const firstRowData = currentSheet.data[0] || [];
                const tableColumnsXml = firstRowData
                    .filter(c => c && !c.isMergedPlaceholder) // Filter out placeholders and empty cells.
                    .map((colCell, colIndex) =>
                        `<tableColumn id="${colIndex + 1}" name="${sanitizeXmlString(colCell.hasOwnProperty('value') ? colCell.value : colCell)}"/>`
                    ).join('');

                const tableEndRef = `${columnIdxToAlpha(firstRowData.length - 1)}${sheetDataMatrix.length}`;
                const tableXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
                    <table xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" id="${tableId}"
                        name="Table${tableId}" displayName="Table${tableId}" ref="A1:${tableEndRef}" totalsRowShown="0">
                        <autoFilter ref="A1:${tableEndRef}"/>
                        <tableColumns count="${firstRowData.length}">${tableColumnsXml}</tableColumns>
                        <tableStyleInfo name="TableStyleMedium2" showFirstColumn="0" showLastColumn="0" showRowStripes="1" showColumnStripes="0"/>
                    </table>`;

                excelCore.folder('tables').file(`table${tableId}.xml`, tableXml);
                excelSheetContainer.folder('_rels').file(`sheet${entityId}.xml.rels`, `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
                    <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
                        <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/table" Target="../tables/table${tableId}.xml"/>
                    </Relationships>`);
                contentTypeManifests[1].push(`<Override PartName="/xl/tables/table${tableId}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.table+xml"/>`);
            }

            contentTypeManifests[0].push(`<Override PartName="/xl/worksheets/sheet${entityId}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`);
            sheetPropertyNames.push(sanitizeXmlString(currentSheet.name || `Sheet${entityId}`));
            excelRelationships.push(`<Relationship Id="rId${entityId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${entityId}.xml"/>`);
            sheetReferences.push(`<sheet name="${sanitizeXmlString(currentSheet.name || `Sheet${entityId}`)}" sheetId="${entityId}" r:id="rId${entityId}"/>`);
        }

        // Generate xl/styles.xml.
        let customNumFmtXml = [];
        let cellXfStylesXml = [];

        // Skip the initial placeholder 'default_xf_style_placeholder' at index 0.
        for (idx = 1; idx < cellStylingDefs.length; idx++) {
            cellStyleObject = JSON.parse(cellStylingDefs[idx]);

            // Handle number formatting.
            let currentNumFmtId = 0; // Default General format.
            if (cellStyleObject.formatCode !== 'General') {
                lookupIndex = numberFormatCodes.indexOf(cellStyleObject.formatCode);
                if (lookupIndex === -1) {
                    // Assign a new ID for custom format, starting from 164.
                    currentNumFmtId = 164 + customNumFmtXml.length;
                    customNumFmtXml.push(`<numFmt formatCode="${cellStyleObject.formatCode}" numFmtId="${currentNumFmtId}"/>`);
                    numberFormatCodes[currentNumFmtId] = cellStyleObject.formatCode; // Add to internal list.
                } else {
                    currentNumFmtId = lookupIndex;
                }
            }

            // Handle borders.
            borderRefIdx = 0; // Default border index.
            if (cellStyleObject.borders) {
                let borderParts = ['<border>'];
                const borderEdges = ['left', 'right', 'top', 'bottom', 'diagonal'];
                for (const edge of borderEdges) {
                    const edgeStyle = cellStyleObject.borders[edge];
                    if (edgeStyle) {
                        const colorValue = edgeStyle.length === 6 ? `FF${edgeStyle}` : edgeStyle; // Ensure ARGB.
                        borderParts.push(`<${edge} style="thin"><color rgb="${colorValue}"/></${edge}>`);
                    } else {
                        borderParts.push(`<${edge}/>`);
                    }
                }
                borderParts.push('</border>');
                singleBorderDef = borderParts.join('');

                lookupIndex = borderDefinitions.indexOf(singleBorderDef);
                if (lookupIndex === -1) {
                    borderRefIdx = borderDefinitions.push(singleBorderDef) - 1;
                } else {
                    borderRefIdx = lookupIndex;
                }
            }

            // Handle fonts.
            fontRefIdx = 0; // Default font index.
            if (cellStyleObject.bold || cellStyleObject.italic || cellStyleObject.fontSize || cellStyleObject.fontName) {
                let fontParts = ['<font>'];
                if (cellStyleObject.bold) fontParts.push('<b/>');
                if (cellStyleObject.italic) fontParts.push('<i/>');
                fontParts.push(`<sz val="${cellStyleObject.fontSize || DEFAULT_CELL_SIZE}"/>`);
                fontParts.push('<color theme="1"/>'); // Default theme color.
                fontParts.push(`<name val="${cellStyleObject.fontName || DEFAULT_CELL_FONT}"/>`);
                fontParts.push('<family val="2"/>'); // Generic font family.
                fontParts.push('</font>');
                singleFontDef = fontParts.join('');

                lookupIndex = fontDefinitions.indexOf(singleFontDef);
                if (lookupIndex === -1) {
                    fontRefIdx = fontDefinitions.push(singleFontDef) - 1;
                } else {
                    fontRefIdx = lookupIndex;
                }
            }

            // Construct cellXf XML entry.
            let xfAttrs = [
                `xfId="0" fillId="0" borderId="${borderRefIdx}" fontId="${fontRefIdx}" numFmtId="${currentNumFmtId}"`
            ];
            if (cellStyleObject.hAlign || cellStyleObject.vAlign) xfAttrs.push('applyAlignment="1"');
            if (currentNumFmtId > 0) xfAttrs.push('applyNumberFormat="1"');
            if (borderRefIdx > 0) xfAttrs.push('applyBorder="1"');
            if (fontRefIdx > 0) xfAttrs.push('applyFont="1"');

            let xfXml = `<xf ${xfAttrs.join(' ')}>`;
            if (cellStyleObject.hAlign || cellStyleObject.vAlign) {
                xfXml += '<alignment';
                if (cellStyleObject.hAlign) xfXml += ` horizontal="${cellStyleObject.hAlign}"`;
                if (cellStyleObject.vAlign) xfXml += ` vertical="${cellStyleObject.vAlign}"`;
                xfXml += '/>';
            }
            xfXml += '</xf>';
            cellXfStylesXml.push(xfXml);
        }

        const numFmtsSection = customNumFmtXml.length > 0
            ? `<numFmts count="${customNumFmtXml.length}">${customNumFmtXml.join('')}</numFmts>`
            : '';

        excelCore.file('styles.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
            <styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"
                xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
                mc:Ignorable="x14ac" xmlns:x14ac="http://schemas.microsoft.com/office/spreadsheetml/2009/9/ac">
                ${numFmtsSection}
                <fonts count="${fontDefinitions.length}" x14ac:knownFonts="1">
                    <font><sz val="${DEFAULT_CELL_SIZE}"/><color theme="1"/><name val="${DEFAULT_CELL_FONT}"/><family val="2"/><scheme val="minor"/></font>
                    ${fontDefinitions.slice(1).join('')}
                </fonts>
                <fills count="2">
                    <fill><patternFill patternType="none"/></fill>
                    <fill><patternFill patternType="gray125"/></fill>
                </fills>
                <borders count="${borderDefinitions.length}">
                    <border><left/><right/><top/><bottom/><diagonal/></border>
                    ${borderDefinitions.slice(1).join('')}
                </borders>
                <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
                <cellXfs count="${cellStylingDefs.length}">
                    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
                    ${cellXfStylesXml.join('')}
                </cellXfs>
                <cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
                <dxfs count="0"/>
                <tableStyles count="0" defaultTableStyle="TableStyleMedium2" defaultPivotStyle="PivotStyleLight16"/>
                <extLst><ext uri="{EB79DEF2-80B8-43e5-95BD-54CBDDF9020C}" xmlns:x14="http://schemas.microsoft.com/office/spreadsheetml/2009/9/main">
                    <x14:slicerStyles defaultSlicerStyle="SlicerStyleLight1"/></ext>
                </extLst>
            </styleSheet>`);

        // Generate [Content_Types].xml.
        archiveHandler.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
            <Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
                <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
                <Default Extension="xml" ContentType="application/xml"/>
                <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
                ${contentTypeManifests[0].reverse().join('')}
                <Override PartName="/xl/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>
                <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
                <Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/>
                ${contentTypeManifests[1].reverse().join('')}
                <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
                <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
            </Types>`);

        // Generate docProps/app.xml.
        documentProperties.file('app.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
            <Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"
                xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
                <Application>XLSX.js Clone Edition</Application>
                <DocSecurity>0</DocSecurity>
                <ScaleCrop>false</ScaleCrop>
                <HeadingPairs>
                    <vt:vector size="2" baseType="variant">
                        <vt:variant><vt:lpstr>Worksheets</vt:lpstr></vt:variant>
                        <vt:variant><vt:i4>${workbookInput.worksheets.length}</vt:i4></vt:variant>
                    </vt:vector>
                </HeadingPairs>
                <TitlesOfParts>
                    <vt:vector size="${sheetPropertyNames.length}" baseType="lpstr">
                        <vt:lpstr>${sheetPropertyNames.reverse().join('</vt:lpstr><vt:lpstr>')}</vt:lpstr>
                    </vt:vector>
                </TitlesOfParts>
                <Manager></Manager>
                <Company>Microsoft Corporation</Company>
                <LinksUpToDate>false</LinksUpToDate>
                <SharedDoc>false</SharedDoc>
                <HyperlinksChanged>false</HyperlinksChanged>
                <AppVersion>1.0</AppVersion>
            </Properties>`);

        // Generate xl/_rels/workbook.xml.rels.
        const relsCount = excelRelationships.length;
        excelCore.folder('_rels').file('workbook.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
            <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
                ${excelRelationships.reverse().join('')}
                <Relationship Id="rId${relsCount + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml"/>
                <Relationship Id="rId${relsCount + 2}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
                <Relationship Id="rId${relsCount + 3}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="theme/theme1.xml"/>
            </Relationships>`);

        // Generate xl/sharedStrings.xml.
        excelCore.file('sharedStrings.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
            <sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"
                count="${sharedTextCollection[1]}" uniqueCount="${sharedTextCollection[0].length}">
                ${sharedTextCollection[0].length > 0 ? `<si><t>${sharedTextCollection[0].join('</t></si><si><t>')}</t></si>` : ''}
            </sst>`);

        // Generate xl/workbook.xml.
        excelCore.file('workbook.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
            <workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"
                xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
                <fileVersion appName="xl" lastEdited="5" lowestEdited="5" rupBuild="9303"/>
                <workbookPr defaultThemeVersion="124226"/>
                <bookViews>
                    <workbookView ${workbookInput.activeWorksheet !== undefined ? `activeTab="${workbookInput.activeWorksheet}" ` : ''}xWindow="480" yWindow="60" windowWidth="18195" windowHeight="8505"/>
                </bookViews>
                <sheets>${sheetReferences.reverse().join('')}</sheets>
                <calcPr fullCalcOnLoad="1"/>
            </workbook>`);

        processingDuration = Date.now() - processingDuration;
        archiveDuration = Date.now();
        operationOutcome = {
            base64Content: archiveHandler.generate({ compression: 'DEFLATE' }),
            archiveGenerationTime: Date.now() - archiveDuration,
            dataProcessingTime: processingDuration,
            getDownloadLink: function() {
                return `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${this.base64Content}`;
            }
        };
    }
    return operationOutcome;
}

// Export for Node.js environments.
if (typeof exports === 'object' && typeof module === 'object') {
    module.exports = excelProcessor;
}