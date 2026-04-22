if ((typeof DataPackager === 'undefined' || !DataPackager) && typeof require === 'function') {
    var DataPackager = require('node-zip');
}

class SpreadsheetDocument {
    constructor() {
        this.documentSheets = [];
        this.activeSheetIndex = 0;
        this.documentCreator = 'SpreadsheetApp';
        this.lastModifier = 'SpreadsheetApp';
        this.creationTimestamp = new Date();
        this.modificationTimestamp = new Date();
    }
}

class WorksheetData {
    constructor(sheetName = 'Sheet') {
        this.sheetName = sheetName;
        this.cellGrid = []; // Array of arrays of CellEntry objects
        this.hasTable = false;
        this.maxColumnIndex = 0;
        this.maxRowIndex = 0;
        this.mergedCellRegions = []; // Array of { start: 'A1', end: 'B2' }
    }
}

class CellEntry {
    constructor(value = null) {
        this.cellValue = value;
        this.displayFormat = 'General';
        this.hasBold = false;
        this.hasItalic = false;
        this.fontFamily = 'Calibri';
        this.fontSizePoints = 11;
        this.horizontalAlignment = null; // 'left', 'center', 'right'
        this.verticalAlignment = null; // 'top', 'center', 'bottom'
        this.edgeBorders = null; // { left: 'FF000000', right: 'FF000000', ... }
        this.cellFormula = null; // e.g., 'SUM(A1:A5)'
        this.columnSpan = 1;
        this.rowSpan = 1;
        this.autoWidth = false; // Indicates if this column should auto-adjust width based on this cell
    }
}

const numeralFormats = [
    'General', '0', '0.00', '#,##0', '#,##0.00', , , , , '0%', '0.00%', '0.00E+00', '# ?/?', '# ??/??', 'mm-dd-yy', 'd-mmm-yy', 'd-mmm', 'mmm-yy', 'h:mm AM/PM', 'h:mm:ss AM/PM',
    'h:mm', 'h:mm:ss', 'm/d/yy h:mm', , , , , , , , , , , , , , , , , '#,##0 ;(#,##0)', '#,##0 ;[Red](#,##0)', '#,##0.00;(#,##0.00)', '#,##0.00;[Red](#,##0.00)', , , , , 'mm:ss', '[h]:mm:ss', 'mmss.0', '##0.0E+0', '@'
];

const alphabeticMap = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const defaultCharacterFont = 'Calibri';
const defaultCharacterSize = 11;

// Helper to get type of an object
function retrieveKind(item) {
    return Object.prototype.toString.call(item).slice(8, -1).toLowerCase();
}

// Helper for converting column index to label (0 -> A, 25 -> Z, 26 -> AA)
function indexToColumnLabel(idx) {
    let resultLabel = '';
    let currentIdx = idx;
    do {
        resultLabel = alphabeticMap.charAt(currentIdx % 26) + resultLabel;
        currentIdx = Math.floor(currentIdx / 26) - 1;
    } while (currentIdx >= 0);
    return resultLabel;
}

// Helper for converting column label to index (A -> 0, Z -> 25, AA -> 26)
function columnLabelToIndex(label) {
    let numericalValue = 0;
    for (let pos = 0; pos < label.length; pos++) {
        numericalValue = numericalValue * 26 + alphabeticMap.indexOf(label.charAt(pos)) + 1;
    }
    return numericalValue - 1;
}

// Helper for converting Excel date serial to JavaScript Date object, and vice versa
const EXCEL_EPOCH_DIFF_MS = 2209161600000; // Difference between 1900-01-01 (Excel) and 1970-01-01 (Unix)
const MS_PER_DAY = 86400000;

function excelSerialToDate(serial) {
    if (typeof serial !== 'number' || isNaN(serial)) {
        return null;
    }
    // Excel's 1900 leap year bug: Excel treats 1900 as a leap year, so Jan 1, 1900 is day 1, Jan 2 is day 2, Feb 29, 1900 is day 60.
    // However, 1900 was not a leap year. So, dates before Mar 1, 1900 are off by 1.
    // We add 1 to serial to account for Excel's 1-based indexing for dates, and subtract 1 for the 1900 leap year bug for dates after Feb 28, 1900.
    const adjustedSerial = serial > 60 ? serial - 1 : serial; // Adjust for 1900 leap year bug
    const milliseconds = (adjustedSerial - 1) * MS_PER_DAY; // Subtract 1 because Excel day 1 is 1900-01-01
    return new Date(milliseconds + EXCEL_EPOCH_DIFF_MS);
}

function dateToExcelSerial(dateObject) {
    if (!(dateObject instanceof Date) || isNaN(dateObject.getTime())) {
        return null;
    }
    const millisecondsSinceExcelEpoch = dateObject.getTime() - EXCEL_EPOCH_DIFF_MS;
    let serial = millisecondsSinceExcelEpoch / MS_PER_DAY + 1; // Add 1 because Excel day 1 is 1900-01-01
    // Adjust for 1900 leap year bug
    if (serial >= 60) { // If date is Mar 1, 1900 or later
        serial += 1;
    }
    return serial;
}

// Helper to extract an XML attribute value
function procureAttribute(xmlFragment, attributeName) {
    const regex = new RegExp(`${attributeName}="([^"]*)"`);
    const match = xmlFragment.match(regex);
    return match ? match[1] : null;
}

// Helper for XML escaping
function transformXmlText(textVal) {
    if (typeof textVal !== 'string') return '';
    return textVal.replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
}

// Helper for XML unescaping
function restoreXmlText(escapedVal) {
    if (typeof escapedVal !== 'string') return '';
    return escapedVal.replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#x27;/g, "'")
        .replace(/&apos;/g, "'")
        .replace(/&#10;/g, '\n');
}

// Main processing unit
function executeSpreadsheetOperation(inputPayload) {
    'use strict';

    let operationResult;
    let zipUtility = new DataPackager();
    let zipLoadDuration, processingDuration;

    // Read Operation
    if (typeof inputPayload === 'string') {
        zipLoadDuration = Date.now();
        zipUtility = zipUtility.load(inputPayload, { base64: true });
        operationResult = new SpreadsheetDocument();
        operationResult.documentSheets = []; // Reset for parsed sheets
        zipLoadDuration = Date.now() - zipLoadDuration;
        processingDuration = Date.now();

        let sharedTextStore = [];
        let styleRegistry = [];

        // Parse shared strings
        let sharedStringsFile = zipUtility.file('xl/sharedStrings.xml');
        if (sharedStringsFile) {
            const rawXml = sharedStringsFile.asText();
            const textNodes = rawXml.match(/<t[^>]*>.*?<\/t>/g) || [];
            sharedTextStore = textNodes.map(node => {
                const contentMatch = node.match(/<t[^>]*>(.*?)<\/t>/);
                return contentMatch ? restoreXmlText(contentMatch[1]) : '';
            });
        }

        // Parse core properties
        let corePropsFile = zipUtility.file('docProps/core.xml');
        if (corePropsFile) {
            const rawXml = corePropsFile.asText();
            operationResult.documentCreator = rawXml.match(/<dc:creator>(.*?)<\/dc:creator>/)?.[1] || 'Unknown';
            operationResult.lastModifier = rawXml.match(/<cp:lastModifiedBy>(.*?)<\/cp:lastModifiedBy>/)?.[1] || 'Unknown';
            const createdStamp = rawXml.match(/<dcterms:created[^>]*>([^<]*)<\/dcterms:created>/)?.[1];
            if (createdStamp) operationResult.creationTimestamp = new Date(createdStamp);
            const modifiedStamp = rawXml.match(/<dcterms:modified[^>]*>([^<]*)<\/dcterms:modified>/)?.[1];
            if (modifiedStamp) operationResult.modificationTimestamp = new Date(modifiedStamp);
        }

        // Parse workbook structure
        let workbookFile = zipUtility.file('xl/workbook.xml');
        if (workbookFile) {
            const rawXml = workbookFile.asText();
            const activeTabMatch = rawXml.match(/activeTab="(\d+)"/);
            operationResult.activeSheetIndex = activeTabMatch ? parseInt(activeTabMatch[1], 10) : 0;

            const sheetElements = rawXml.match(/<sheet[^>]*>/g) || [];
            // The original code uses unshift in a while(--i) loop, which reverses the order.
            // To replicate the final order, we collect and then reverse for the push.
            const tempSheets = [];
            sheetElements.forEach(sheetElem => {
                const sheetName = procureAttribute(sheetElem, 'name');
                tempSheets.push(new WorksheetData(sheetName));
            });
            operationResult.documentSheets = tempSheets.reverse();
        }

        // Parse styles
        let stylesFile = zipUtility.file('xl/styles.xml');
        if (stylesFile) {
            const rawXml = stylesFile.asText();
            const customNumFmtElements = rawXml.match(/<numFmt[^>]*\/>/g) || [];
            customNumFmtElements.forEach(fmtElem => {
                const formatId = parseInt(procureAttribute(fmtElem, 'numFmtId'), 10);
                const formatCode = procureAttribute(fmtElem, 'formatCode');
                numeralFormats[formatId] = formatCode;
            });

            const xfElements = rawXml.match(/<xf[^>]*>/g) || [];
            const collectedStyles = [];
            xfElements.forEach(xfElem => {
                const formatId = parseInt(procureAttribute(xfElem, 'numFmtId'), 10);
                const formatCode = numeralFormats[formatId] || 'General';
                let cellStyleType;
                if (formatCode.includes('m') || formatCode.includes('d') || formatCode.includes('y')) {
                    cellStyleType = 'date';
                } else if (formatCode.includes('0') || formatCode.includes('#')) {
                    cellStyleType = 'number';
                } else if (formatCode === '@') {
                    cellStyleType = 'string';
                } else {
                    cellStyleType = 'unknown';
                }
                collectedStyles.push({ formatCode: formatCode, valueType: cellStyleType });
            });
            // Original processes 'cellXfs' from last to first and unshifts.
            // This means the first element in the XML becomes the last in the array.
            // My collectedStyles are in XML order, so reverse them to match the original's effective indexing.
            styleRegistry = collectedStyles.reverse();
        }

        // Parse worksheets
        for (let sheetIdx = 0; sheetIdx < operationResult.documentSheets.length; sheetIdx++) {
            let currentSheet = operationResult.documentSheets[sheetIdx];
            let sheetXmlFile = zipUtility.file(`xl/worksheets/sheet${sheetIdx + 1}.xml`);
            if (!sheetXmlFile) continue;

            const rawSheetXml = sheetXmlFile.asText();
            currentSheet.hasTable = rawSheetXml.includes('<tableParts ');

            const dimensionRef = procureAttribute(rawSheetXml.match(/<dimension[^>]*>/)?.[0] || '', 'ref');
            if (dimensionRef) {
                const parts = dimensionRef.split(':');
                const lastCellRef = parts[parts.length - 1];
                const colLabelMatch = lastCellRef.match(/[a-zA-Z]+/);
                const rowNumMatch = lastCellRef.match(/\d+/);
                if (colLabelMatch) currentSheet.maxColumnIndex = columnLabelToIndex(colLabelMatch[0]) + 1;
                if (rowNumMatch) currentSheet.maxRowIndex = parseInt(rowNumMatch[0], 10);
            }

            const rowElements = rawSheetXml.match(/<row[^>]*>.*?<\/row>/g) || [];
            rowElements.forEach(rowElem => {
                const rowIndex = parseInt(procureAttribute(rowElem, 'r'), 10) - 1;
                if (!currentSheet.cellGrid[rowIndex]) {
                    currentSheet.cellGrid[rowIndex] = [];
                }

                const cellElements = rowElem.match(/<c[^>]*>.*?<\/c>/g) || [];
                cellElements.forEach(cellElem => {
                    const cellRef = procureAttribute(cellElem, 'r');
                    const cellColLabel = cellRef.match(/[a-zA-Z]+/)?.[0];
                    const colIndex = columnLabelToIndex(cellColLabel);

                    const styleIndex = parseInt(procureAttribute(cellElem, 's'), 10) || 0;
                    const cellStyleDefinition = styleRegistry[styleIndex] || { valueType: 'General', formatCode: 'General' };
                    const cellValueType = procureAttribute(cellElem, 't') || cellStyleDefinition.valueType;

                    let rawValue = cellElem.match(/<v>(.*?)<\/v>/)?.[1];
                    let processedValue = null;

                    if (rawValue !== undefined) {
                        switch (cellValueType) {
                            case 's': // Shared string
                                processedValue = sharedTextStore[parseInt(rawValue, 10)];
                                break;
                            case 'b': // Boolean
                                processedValue = rawValue === '1';
                                break;
                            case 'date': // Date
                                processedValue = excelSerialToDate(parseFloat(rawValue));
                                break;
                            case 'n': // Number
                                processedValue = parseFloat(rawValue);
                                break;
                            default: // General, String (if not shared)
                                processedValue = rawValue;
                                break;
                        }
                    }

                    const cellObject = new CellEntry(processedValue);
                    cellObject.displayFormat = cellStyleDefinition.formatCode;
                    currentSheet.cellGrid[rowIndex][colIndex] = cellObject;
                });
            });
        }

        operationResult.processingTime = Date.now() - processingDuration;
        operationResult.zipTime = zipLoadDuration;
    }
    // Write Operation
    else {
        processingDuration = Date.now();
        const workbookInfo = inputPayload; // Renaming 'file' to 'workbookInfo' for clarity

        let stringCollection = new Map(); // Stores unique strings and their indices
        let stringCount = 0; // Total count of strings, including duplicates
        let definedStyles = new Map(); // Stores stringified style objects and their indices
        let styleDefinitionsXml = ['<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>']; // Default style
        let borderDefinitionsXml = ['<border><left/><right/><top/><bottom/><diagonal/></border>']; // Default border
        let fontDefinitionsXml = ['<font><sz val="' + defaultCharacterSize + '"/><color theme="1"/><name val="' + defaultCharacterFont + '"/><family val="2"/><scheme val="minor"/></font>']; // Default font
        let customNumberFormatsXml = [];

        const sheetMetadatas = [];
        const sheetRelationships = [];
        const sheetContentTypes = [];

        // Pre-process all sheets to gather shared strings and styles
        workbookInfo.worksheets.forEach((sheetInput, sheetIndex) => {
            sheetInput.data.forEach((rowInput, rowIndex) => {
                rowInput.forEach((cellInput, colIndex) => {
                    const cellVal = cellInput.cellValue;
                    let styleSignature = JSON.stringify({
                        displayFormat: cellInput.displayFormat || 'General',
                        hasBold: cellInput.hasBold || false,
                        hasItalic: cellInput.hasItalic || false,
                        fontFamily: cellInput.fontFamily || defaultCharacterFont,
                        fontSizePoints: cellInput.fontSizePoints || defaultCharacterSize,
                        horizontalAlignment: cellInput.horizontalAlignment,
                        verticalAlignment: cellInput.verticalAlignment,
                        edgeBorders: cellInput.edgeBorders
                    });

                    if (!definedStyles.has(styleSignature)) {
                        definedStyles.set(styleSignature, styleDefinitionsXml.length);
                        // Generate XML for this new style
                        const styleObject = JSON.parse(styleSignature);

                        let formatId = 0;
                        if (styleObject.displayFormat !== 'General') {
                            let existingFormatId = numeralFormats.indexOf(styleObject.displayFormat);
                            if (existingFormatId < 0) {
                                existingFormatId = 164 + customNumberFormatsXml.length;
                                customNumberFormatsXml.push(`<numFmt formatCode="${styleObject.displayFormat}" numFmtId="${existingFormatId}"/>`);
                            }
                            formatId = existingFormatId;
                        }

                        let borderId = 0;
                        if (styleObject.edgeBorders) {
                            let borderXmlParts = ['<border>'];
                            const borderSides = ['left', 'right', 'top', 'bottom', 'diagonal'];
                            borderSides.forEach(side => {
                                if (styleObject.edgeBorders[side]) {
                                    let color = styleObject.edgeBorders[side];
                                    if (color.length === 6) color = 'FF' + color; // Add alpha if missing
                                    borderXmlParts.push(`<${side} style="thin"><color rgb="${color}"/></${side}>`);
                                } else {
                                    borderXmlParts.push(`<${side}/>`);
                                }
                            });
                            borderXmlParts.push('</border>');
                            const borderXml = borderXmlParts.join('');
                            borderId = borderDefinitionsXml.indexOf(borderXml);
                            if (borderId < 0) borderId = borderDefinitionsXml.push(borderXml) - 1;
                        }

                        let fontId = 0;
                        if (styleObject.hasBold || styleObject.hasItalic || styleObject.fontSizePoints !== defaultCharacterSize || styleObject.fontFamily !== defaultCharacterFont) {
                            let fontXmlParts = ['<font>'];
                            if (styleObject.hasBold) fontXmlParts.push('<b/>');
                            if (styleObject.hasItalic) fontXmlParts.push('<i/>');
                            fontXmlParts.push(`<sz val="${styleObject.fontSizePoints || defaultCharacterSize}"/>`);
                            fontXmlParts.push('<color theme="1"/>');
                            fontXmlParts.push(`<name val="${styleObject.fontFamily || defaultCharacterFont}"/>`);
                            fontXmlParts.push('<family val="2"/></font>');
                            const fontXml = fontXmlParts.join('');
                            fontId = fontDefinitionsXml.indexOf(fontXml);
                            if (fontId < 0) fontId = fontDefinitionsXml.push(fontXml) - 1;
                        }

                        let alignmentAttrs = '';
                        if (styleObject.horizontalAlignment || styleObject.verticalAlignment) {
                            alignmentAttrs = '<alignment';
                            if (styleObject.horizontalAlignment) alignmentAttrs += ` horizontal="${styleObject.horizontalAlignment}"`;
                            if (styleObject.verticalAlignment) alignmentAttrs += ` vertical="${styleObject.verticalAlignment}"`;
                            alignmentAttrs += '/>';
                        }

                        styleDefinitionsXml.push(
                            `<xf xfId="0" fillId="0" borderId="${borderId}" fontId="${fontId}" numFmtId="${formatId}" ` +
                            `${(styleObject.horizontalAlignment || styleObject.verticalAlignment) ? 'applyAlignment="1" ' : ''}` +
                            `${formatId > 0 ? 'applyNumberFormat="1" ' : ''}` +
                            `${borderId > 0 ? 'applyBorder="1" ' : ''}` +
                            `${fontId > 0 ? 'applyFont="1" ' : ''}` +
                            `>${alignmentAttrs}</xf>`
                        );
                    }

                    if (retrieveKind(cellVal) === 'string' && isNaN(cellVal)) { // Is a non-numeric string
                        const escapedStr = transformXmlText(cellVal);
                        if (!stringCollection.has(escapedStr)) {
                            stringCollection.set(escapedStr, stringCollection.size);
                        }
                        stringCount++;
                    }
                });
            });
        });

        // Add static files
        zipUtility.folder('_rels').file('.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
    <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
    <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
    <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`);
        zipUtility.folder('docProps');
        zipUtility.folder('xl').folder('theme').file('theme1.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="Office Theme"><a:themeElements><a:clrScheme name="Office"><a:dk1><a:sysClr val="windowText" lastClr="000000"/></a:dk1><a:lt1><a:sysClr val="window" lastClr="FFFFFF"/></a:lt1><a:dk2><a:srgbClr val="1F497D"/></a:dk2><a:lt2><a:srgbClr val="EEECE1"/></a:lt2><a:accent1><a:srgbClr val="4F81BD"/></a:accent1><a:accent2><a:srgbClr val="C0504D"/></a:accent2><a:accent3><a:srgbClr val="9BBB59"/></a:accent3><a:accent4><a:srgbClr val="8064A2"/></a:accent4><a:accent5><a:srgbClr val="4BACC6"/></a:accent5><a:accent6><a:srgbClr val="F79646"/></a:accent6><a:hlink><a:srgbClr val="0000FF"/></a:hlink><a:folHlink><a:srgbClr val="800080"/></a:folHlink></a:clrScheme><a:fontScheme name="Office"><a:majorFont><a:latin typeface="Cambria"/><a:ea typeface=""/><a:cs typeface=""/><a:font script="Jpan" typeface="MS P????"/><a:font script="Hang" typeface="?? ??"/><a:font script="Hans" typeface="??"/><a:font script="Hant" typeface="????"/><a:font script="Arab" typeface="Times New Roman"/><a:font script="Hebr" typeface="Times New Roman"/><a:font script="Thai" typeface="Tahoma"/><a:font script="Ethi" typeface="Nyala"/><a:font script="Beng" typeface="Vrinda"/><a:font script="Gujr" typeface="Shruti"/><a:font script="Khmr" typeface="MoolBoran"/><a:font script="Knda" typeface="Tunga"/><a:font script="Guru" typeface="Raavi"/><a:font script="Cans" typeface="Euphemia"/><a:font script="Cher" typeface="Plantagenet Cherokee"/><a:font script="Yiii" typeface="Microsoft Yi Baiti"/><a:font script="Tibt" typeface="Microsoft Himalaya"/><a:font script="Thaa" typeface="MV Boli"/><a:font script="Deva" typeface="Mangal"/><a:font script="Telu" typeface="Gautami"/><a:font script="Taml" typeface="Latha"/><a:font script="Syrc" typeface="Estrangelo Edessa"/><a:font script="Orya" typeface="Kalinga"/><a:font script="Mlym" typeface="Kartika"/><a:font script="Laoo" typeface="DokChampa"/><a:font script="Sinh" typeface="Iskoola Pota"/><a:font script="Mong" typeface="Mongolian Baiti"/><a:font script="Viet" typeface="Times New Roman"/><a:font script="Uigh" typeface="Microsoft Uighur"/><a:font script="Geor" typeface="Sylfaen"/></a:majorFont><a:minorFont><a:latin typeface="Calibri"/><a:ea typeface=""/><a:cs typeface=""/><a:font script="Jpan" typeface="MS P????"/><a:font script="Hang" typeface="?? ??"/><a:font script="Hans" typeface="??"/><a:font script="Hant" typeface="????"/><a:font script="Arab" typeface="Arial"/><a:font script="Hebr" typeface="Arial"/><a:font script="Thai" typeface="Tahoma"/><a:font script="Ethi" typeface="Nyala"/><a:font script="Beng" typeface="Vrinda"/><a:font script="Gujr" typeface="Shruti"/><a:font script="Khmr" typeface="DaunPenh"/><a:font script="Knda" typeface="Tunga"/><a:font script="Guru" typeface="Raavi"/><a:font script="Cans" typeface="Euphemia"/><a:font script="Cher" typeface="Plantagenet Cherokee"/><a:font script="Yiii" typeface="Microsoft Yi Baiti"/><a:font script="Tibt" typeface="Microsoft Himalaya"/><a:font script="Thaa" typeface="MV Boli"/><a:font script="Deva" typeface="Mangal"/><a:font script="Telu" typeface="Gautami"/><a:font script="Taml" typeface="Latha"/><a:font script="Syrc" typeface="Estrangelo Edessa"/><a:font script="Orya" typeface="Kalinga"/><a:font script="Mlym" typeface="Kartika"/><a:font script="Laoo" typeface="DokChampa"/><a:font script="Sinh" typeface="Iskoola Pota"/><a:font script="Mong" typeface="Mongolian Baiti"/><a:font script="Viet" typeface="Arial"/><a:font script="Uigh" typeface="Microsoft Uighur"/><a:font script="Geor" typeface="Sylfaen"/></a:minorFont></a:fontScheme><a:fmtScheme name="Office"><a:fillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:gradFill rotWithShape="1"><a:gsLst><a:gs pos="0"><a:schemeClr val="phClr"><a:tint val="50000"/><a:satMod val="300000"/></a:schemeClr></a:gs><a:gs pos="35000"><a:schemeClr val="phClr"><a:tint val="37000"/><a:satMod val="300000"/></a:schemeClr></a:gs><a:gs pos="100000"><a:schemeClr val="phClr"><a:tint val="15000"/><a:satMod val="350000"/></a:schemeClr></a:gs></a:gsLst><a:lin ang="16200000" scaled="1"/></a:gradFill><a:gradFill rotWithShape="1"><a:gsLst><a:gs pos="0"><a:schemeClr val="phClr"><a:shade val="51000"/><a:satMod val="130000"/></a:schemeClr></a:gs><a:gs pos="80000"><a:schemeClr val="phClr"><a:shade val="93000"/><a:satMod val="130000"/></a:schemeClr></a:gs><a:gs pos="100000"><a:schemeClr val="phClr"><a:shade val="94000"/><a:satMod val="135000"/></a:schemeClr></a:gs></a:gsLst><a:lin ang="16200000" scaled="0"/></a:gradFill></a:fillStyleLst><a:lnStyleLst><a:ln w="9525" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="phClr"><a:shade val="95000"/><a:satMod val="105000"/></a:schemeClr></a:solidFill><a:prstDash val="solid"/></a:ln><a:ln w="25400" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:prstDash val="solid"/></a:ln><a:ln w="38100" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:prstDash val="solid"/></a:ln></a:lnStyleLst><a:effectStyleLst><a:effectStyle><a:effectLst><a:outerShdw blurRad="40000" dist="20000" dir="5400000" rotWithShape="0"><a:srgbClr val="000000"><a:alpha val="38000"/></a:srgbClr></a:outerShdw></a:effectLst></a:effectStyle><a:effectStyle><a:effectLst><a:outerShdw blurRad="40000" dist="23000" dir="5400000" rotWithShape="0"><a:srgbClr val="000000"><a:alpha val="35000"/></a:srgbClr></a:outerShdw></a:effectLst></a:effectStyle><a:effectStyle><a:effectLst><a:outerShdw blurRad="40000" dist="23000" dir="5400000" rotWithShape="0"><a:srgbClr val="000000"><a:alpha val="35000"/></a:srgbClr></a:outerShdw></a:effectLst><a:scene3d><a:camera prst="orthographicFront"><a:rot lat="0" lon="0" rev="0"/></a:camera><a:lightRig rig="threePt" dir="t"><a:rot lat="0" lon="0" rev="1200000"/></a:lightRig></a:scene3d><a:sp3d><a:bevelT w="63500" h="25400"/></a:sp3d></a:effectStyle></a:effectStyleLst><a:bgFillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:gradFill rotWithShape="1"><a:gsLst><a:gs pos="0"><a:schemeClr val="phClr"><a:tint val="40000"/><a:satMod val="350000"/></a:schemeClr></a:gs><a:gs pos="40000"><a:schemeClr val="phClr"><a:tint val="45000"/><a:shade val="99000"/><a:satMod val="350000"/></a:schemeClr></a:gs><a:gs pos="100000"><a:schemeClr val="phClr"><a:shade val="20000"/><a:satMod val="255000"/></a:schemeClr></a:gs></a:gsLst><a:path path="circle"><a:fillToRect l="50000" t="-80000" r="50000" b="180000"/></a:path></a:gradFill><a:gradFill rotWithShape="1"><a:gsLst><a:gs pos="0"><a:schemeClr val="phClr"><a:tint val="80000"/><a:satMod val="300000"/></a:schemeClr></a:gs><a:gs pos="100000"><a:schemeClr val="phClr"><a:shade val="30000"/><a:satMod val="200000"/></a:schemeClr></a:gs></a:gsLst><a:path path="circle"><a:fillToRect l="50000" t="50000" r="50000" b="50000"/></a:path></a:gradFill></a:bgFillStyleLst></a:fmtScheme></a:themeElements><a:objectDefaults/><a:extraClrSchemeLst/></a:theme>`);

        // Generate dynamic files for each worksheet
        for (let sheetIndex = workbookInfo.worksheets.length - 1; sheetIndex >= 0; sheetIndex--) {
            const currentSheetInput = workbookInfo.worksheets[sheetIndex];
            const sheetId = sheetIndex + 1;
            const sheetGrid = currentSheetInput.data;
            const sheetRowsXml = [];
            let columnDimensions = [];
            let sheetMergeCells = [];
            let maxActualCol = 0;
            let maxActualRow = 0;

            // Deep clone sheetGrid to allow modification for merges without affecting original data
            let mutableSheetGrid = sheetGrid.map(row => row.map(cell => ({ ...cell })));

            for (let rowIndex = 0; rowIndex < mutableSheetGrid.length; rowIndex++) {
                const rowCells = mutableSheetGrid[rowIndex];
                if (!rowCells) continue; // Skip if row doesn't exist

                let cellsInRowXml = [];
                for (let colIndex = 0; colIndex < rowCells.length; colIndex++) {
                    const cellInput = rowCells[colIndex];
                    if (!cellInput) continue; // Skip empty cells in sparse rows or those covered by merges

                    maxActualCol = Math.max(maxActualCol, colIndex);
                    maxActualRow = Math.max(maxActualRow, rowIndex);

                    const cellVal = cellInput.cellValue;
                    const styleSignature = JSON.stringify({
                        displayFormat: cellInput.displayFormat || 'General',
                        hasBold: cellInput.hasBold || false,
                        hasItalic: cellInput.hasItalic || false,
                        fontFamily: cellInput.fontFamily || defaultCharacterFont,
                        fontSizePoints: cellInput.fontSizePoints || defaultCharacterSize,
                        horizontalAlignment: cellInput.horizontalAlignment,
                        verticalAlignment: cellInput.verticalAlignment,
                        edgeBorders: cellInput.edgeBorders
                    });
                    const styleId = definedStyles.get(styleSignature);

                    let cellType = '';
                    let displayValue = '';
                    let columnWidth = 0;

                    if (retrieveKind(cellVal) === 'string' && isNaN(cellVal)) {
                        cellType = 's'; // Shared string
                        displayValue = stringCollection.get(transformXmlText(cellVal));
                        columnWidth = cellVal.length;
                    } else if (retrieveKind(cellVal) === 'boolean') {
                        cellType = 'b';
                        displayValue = cellVal ? 1 : 0;
                        columnWidth = 1;
                    } else if (retrieveKind(cellVal) === 'date') {
                        cellInput.displayFormat = cellInput.displayFormat || 'mm-dd-yy'; // Default date format
                        displayValue = dateToExcelSerial(cellVal);
                        columnWidth = String(displayValue).length; // Estimate width
                    } else if (cellVal !== null && cellVal !== undefined) {
                        displayValue = cellVal;
                        columnWidth = String(cellVal).length;
                    }

                    if (!columnDimensions[colIndex]) {
                        columnDimensions[colIndex] = { autoWidth: false, maxWidth: 0 };
                    }
                    if (cellInput.autoWidth) {
                        columnDimensions[colIndex].autoWidth = true;
                    }
                    if (columnWidth > columnDimensions[colIndex].maxWidth) {
                        columnDimensions[colIndex].maxWidth = columnWidth;
                    }

                    const currentCellRef = indexToColumnLabel(colIndex) + (rowIndex + 1);

                    if (cellInput.columnSpan > 1 || cellInput.rowSpan > 1) {
                        const endCol = indexToColumnLabel(colIndex + cellInput.columnSpan - 1);
                        const endRow = rowIndex + cellInput.rowSpan;
                        sheetMergeCells.push({ start: currentCellRef, end: endCol + endRow });

                        // Mark merged cells as null in the mutable grid to prevent duplicate processing
                        for (let r = 0; r < cellInput.rowSpan; r++) {
                            for (let c = 0; c < cellInput.columnSpan; c++) {
                                if (r === 0 && c === 0) continue; // Skip original cell
                                if (mutableSheetGrid[rowIndex + r]) { // Ensure row exists
                                    mutableSheetGrid[rowIndex + r][colIndex + c] = null; // Mark as covered by merge
                                }
                            }
                        }
                    }

                    let cellXml = `<c r="${currentCellRef}" s="${styleId}"`;
                    if (cellType) cellXml += ` t="${cellType}"`;
                    if (displayValue !== '') {
                        cellXml += `>${cellInput.cellFormula ? `<f>${cellInput.cellFormula}</f>` : ''}<v>${displayValue}</v></c>`;
                    } else {
                        cellXml += '/>';
                    }
                    cellsInRowXml.push(cellXml);
                }
                if (cellsInRowXml.length > 0) {
                    sheetRowsXml.push(`<row r="${rowIndex + 1}" x14ac:dyDescent="0.25">${cellsInRowXml.join('')}</row>`);
                }
            }

            let columnWidthsXml = [];
            for (let i = 0; i < columnDimensions.length; i++) {
                if (columnDimensions[i] && columnDimensions[i].autoWidth) {
                    columnWidthsXml.push(`<col min="${i + 1}" max="${i + 1}" width="${columnDimensions[i].maxWidth}" customWidth="1" bestFit="1"/>`);
                }
            }
            let colsXml = columnWidthsXml.length > 0 ? `<cols>${columnWidthsXml.join('')}</cols>` : '';

            let mergeCellsXml = '';
            if (sheetMergeCells.length > 0) {
                mergeCellsXml = `<mergeCells count="${sheetMergeCells.length}">`;
                mergeCellsXml += sheetMergeCells.map(merge => `<mergeCell ref="${merge.start}:${merge.end}"/>`).join('');
                mergeCellsXml += '</mergeCells>';
            }

            let worksheetContent = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" mc:Ignorable="x14ac" xmlns:x14ac="http://schemas.microsoft.com/office/spreadsheetml/2009/9/ac">
    <dimension ref="A1:${indexToColumnLabel(maxActualCol)}${maxActualRow + 1}"/>
    <sheetViews><sheetView ${sheetIndex === workbookInfo.activeWorksheet ? 'tabSelected="1" ' : ''}workbookViewId="0"/></sheetViews>
    <sheetFormatPr defaultRowHeight="15" x14ac:dyDescent="0.25"/>
    ${colsXml}
    <sheetData>${sheetRowsXml.join('')}</sheetData>
    ${mergeCellsXml}
    <pageMargins left="0.7" right="0.7" top="0.75" bottom="0.75" header="0.3" footer="0.3"/>`;

            if (currentSheetInput.hasTable) {
                worksheetContent += '<tableParts count="1"><tablePart r:id="rId1"/></tableParts>';
                zipUtility.folder('xl/tables').file(`table${sheetId}.xml`, `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<table xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" id="${sheetId}" name="Table${sheetId}" displayName="Table${sheetId}" ref="A1:${indexToColumnLabel(maxActualCol)}${maxActualRow + 1}" totalsRowShown="0">
    <autoFilter ref="A1:${indexToColumnLabel(maxActualCol)}${maxActualRow + 1}"/>
    <tableColumns count="${maxActualCol + 1}">${
        currentSheetInput.data[0] ? currentSheetInput.data[0].map((cell, cIdx) => `<tableColumn id="${cIdx + 1}" name="${transformXmlText(cell.cellValue || '')}"/>`).join('') : ''
    }</tableColumns>
    <tableStyleInfo name="TableStyleMedium2" showFirstColumn="0" showLastColumn="0" showRowStripes="1" showColumnStripes="0"/>
</table>`);
                zipUtility.folder(`xl/worksheets/_rels`).file(`sheet${sheetId}.xml.rels`, `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
    <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/table" Target="../tables/table${sheetId}.xml"/>
</Relationships>`);
                sheetContentTypes.unshift(`<Override PartName="/xl/tables/table${sheetId}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.table+xml"/>`);
            }
            zipUtility.folder('xl/worksheets').file(`sheet${sheetId}.xml`, worksheetContent + '</worksheet>');

            sheetContentTypes.unshift(`<Override PartName="/xl/worksheets/sheet${sheetId}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`);
            sheetMetadatas.unshift(transformXmlText(currentSheetInput.sheetName || `Sheet${sheetId}`));
            sheetRelationships.unshift(`<Relationship Id="rId${sheetId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${sheetId}.xml"/>`);
        }

        // Finalize styles.xml
        const customNumFmtsXml = customNumberFormatsXml.length ? `<numFmts count="${customNumberFormatsXml.length}">${customNumberFormatsXml.join('')}</numFmts>` : '';
        zipUtility.folder('xl').file('styles.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" mc:Ignorable="x14ac" xmlns:x14ac="http://schemas.microsoft.com/office/spreadsheetml/2009/9/ac">
    ${customNumFmtsXml}
    <fonts count="${fontDefinitionsXml.length}" x14ac:knownFonts="1">${fontDefinitionsXml.join('')}</fonts>
    <fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills>
    <borders count="${borderDefinitionsXml.length}">${borderDefinitionsXml.join('')}</borders>
    <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
    <cellXfs count="${styleDefinitionsXml.length}">${styleDefinitionsXml.join('')}</cellXfs>
    <cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles><dxfs count="0"/>
    <tableStyles count="0" defaultTableStyle="TableStyleMedium2" defaultPivotStyle="PivotStyleLight16"/>
    <extLst><ext uri="{EB79DEF2-80B8-43e5-95BD-54CBDDF9020C}" xmlns:x14="http://schemas.microsoft.com/office/spreadsheetml/2009/9/main">
    <x14:slicerStyles defaultSlicerStyle="SlicerStyleLight1"/></ext></extLst>
</styleSheet>`);

        // Finalize [Content_Types].xml
        zipUtility.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
    <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
    <Default Extension="xml" ContentType="application/xml"/>
    <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
    ${sheetContentTypes.join('')}
    <Override PartName="/xl/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>
    <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
    <Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/>
    <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
    <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>`);

        // Finalize docProps/app.xml
        zipUtility.folder('docProps').file('app.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
    <Application>SpreadsheetApp</Application><DocSecurity>0</DocSecurity><ScaleCrop>false</ScaleCrop>
    <HeadingPairs><vt:vector size="2" baseType="variant"><vt:variant><vt:lpstr>Worksheets</vt:lpstr></vt:variant><vt:variant><vt:i4>${workbookInfo.worksheets.length}</vt:i4></vt:variant></vt:vector></HeadingPairs>
    <TitlesOfParts><vt:vector size="${sheetMetadatas.length}" baseType="lpstr"><vt:lpstr>${sheetMetadatas.join('</vt:lpstr><vt:lpstr>')}</vt:lpstr></vt:vector></TitlesOfParts>
    <Manager></Manager><Company>Microsoft Corporation</Company><LinksUpToDate>false</LinksUpToDate><SharedDoc>false</SharedDoc><HyperlinksChanged>false</HyperlinksChanged><AppVersion>1.0</AppVersion>
</Properties>`);

        // Finalize xl/_rels/workbook.xml.rels
        zipUtility.folder('xl/_rels').file('workbook.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
    ${sheetRelationships.join('')}
    <Relationship Id="rId${sheetRelationships.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml"/>
    <Relationship Id="rId${sheetRelationships.length + 2}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
    <Relationship Id="rId${sheetRelationships.length + 3}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="theme/theme1.xml"/>
</Relationships>`);

        // Finalize xl/sharedStrings.xml
        zipUtility.folder('xl').file('sharedStrings.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="${stringCount}" uniqueCount="${stringCollection.size}">
    ${Array.from(stringCollection.keys()).map(str => `<si><t>${str}</t></si>`).join('')}
</sst>`);

        // Finalize xl/workbook.xml
        zipUtility.folder('xl').file('workbook.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
    <fileVersion appName="xl" lastEdited="5" lowestEdited="5" rupBuild="9303"/><workbookPr defaultThemeVersion="124226"/>
    <bookViews><workbookView ${workbookInfo.activeWorksheet !== undefined ? `activeTab="${workbookInfo.activeWorksheet}" ` : ''}xWindow="480" yWindow="60" windowWidth="18195" windowHeight="8505"/></bookViews>
    <sheets>${sheetRelationships.map((_, idx) => `<sheet name="${transformXmlText(workbookInfo.worksheets[idx].sheetName || `Sheet${idx + 1}`)}" sheetId="${idx + 1}" r:id="rId${idx + 1}"/>`).join('')}</sheets>
    <calcPr fullCalcOnLoad="1"/>
</workbook>`);

        // Finalize docProps/core.xml
        zipUtility.folder('docProps').file('core.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
    <dc:creator>${transformXmlText(workbookInfo.creator || 'SpreadsheetApp')}</dc:creator>
    <cp:lastModifiedBy>${transformXmlText(workbookInfo.lastModifiedBy || 'SpreadsheetApp')}</cp:lastModifiedBy>
    <dcterms:created xsi:type="dcterms:W3CDTF">${(workbookInfo.created || new Date()).toISOString()}</dcterms:created>
    <dcterms:modified xsi:type="dcterms:W3CDTF">${(workbookInfo.modified || new Date()).toISOString()}</dcterms:modified>
</cp:coreProperties>`);

        processingDuration = Date.now() - processingDuration;
        zipLoadDuration = Date.now();
        const generatedBase64 = zipUtility.generate({ compression: 'DEFLATE' });
        zipLoadDuration = Date.now() - zipLoadDuration;
        operationResult = {
            base64: generatedBase64,
            zipTime: zipLoadDuration,
            processingTime: processingDuration,
            href: function() { return 'data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,' + this.base64; }
        };
    }
    return operationResult;
}

if (typeof exports === 'object' && typeof module === 'object') { module.exports = executeSpreadsheetOperation; }