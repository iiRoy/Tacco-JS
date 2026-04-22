//----------------------------------------------------------
// Licensing information for this utility
// All rights reserved to original authors.
// Refer to the distributed license file for details.
//----------------------------------------------------------

if ((typeof CompressorKit === 'undefined' || !CompressorKit) && typeof acquireModule === 'function') {
  var CompressorKit = acquireModule('node-zip');
}

function spreadsheetProcessor(inputData) {
  'use strict'; // Version 2.3.2

  var finalOutcome,
    archiveObject = new CompressorKit(),
    archiveDuration,
    taskDuration,
    tempStr,
    formatInfo,
    outerIdx,
    innerIdx,
    tertiaryIdx,
    lengthVal,
    elemType,
    sheetRef,
    commonTexts,
    cellFormats,
    itemIdx,
    sheetContent,
    dataElement,
    currentStyle,
    edgeSpecs,
    singleEdge,
    edgeLookup,
    typefaceList,
    singleTypeface,
    typefaceLookup,
    documentProperties,
    excelRoot,
    excelSheetsFolder,
    activeSheet,
    mediaTypes = [[], []],
    propertyList = [],
    excelRelationships = [],
    sheetDefinitions = [],
    uniqueId,
    columnDefinitions,
    columnXmlFragments,
    columnDimension,
    currentCell,
    currentRow,
    mergedRanges,
    mergedSegment,
    numberFormats = [
      'General',
      '0',
      '0.00',
      '#,##0',
      '#,##0.00',
      ,
      ,
      ,
      ,
      '0%',
      '0.00%',
      '0.00E+00',
      '# ?/?',
      '# ??/??',
      'mm-dd-yy',
      'd-mmm-yy',
      'd-mmm',
      'mmm-yy',
      'h:mm AM/PM',
      'h:mm:ss AM/PM',
      'h:mm',
      'h:mm:ss',
      'm/d/yy h:mm',
      ,
      ,
      ,
      ,
      ,
      ,
      ,
      ,
      ,
      ,
      ,
      ,
      '#,##0 ;(#,##0)',
      '#,##0 ;[Red](#,##0)',
      '#,##0.00;(#,##0.00)',
      '#,##0.00;[Red](#,##0.00)',
      ,
      ,
      ,
      ,
      ,
      'mm:ss',
      '[h]:mm:ss',
      'mmss.0',
      '##0.0E+0',
      '@'
    ],
    letterSequence = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    standardTypefaceName = 'Calibri',
    standardTypefaceSize = 11;

  function columnToLetters(numVal) {
    var intermediateVal = Math.floor(numVal / 26) - 1;
    return (intermediateVal > -1 ? columnToLetters(intermediateVal) : '') + letterSequence.charAt(numVal % 26);
  }

  function lettersToColumn(charSeq) {
    var accumulatedVal = 0;
    if (charSeq.length === 2) {
      accumulatedVal = lettersToColumn(charSeq.charAt(0)) + 1;
    }
    return accumulatedVal * 26 + letterSequence.indexOf(charSeq.substr(-1));
  }

  function dateConverter(initialVal) {
    var d = new Date(1900, 0, 0),
      isObjType = typeof initialVal === 'object',
      timeAdjust = ((isObjType ? initialVal.getTimezoneOffset() : new Date().getTimezoneOffset()) - d.getTimezoneOffset()) * 60000;
    return isObjType ? (initialVal - d - timeAdjust) / 86400000 + 1 : new Date(+d - timeAdjust + (initialVal - 1) * 86400000);
  }

  function getObjectType(objParam) {
    return {}.toString.call(objParam).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
  }

  function extractAttribute(xmlSnippet, attributeName) {
    xmlSnippet = xmlSnippet.substr(xmlSnippet.indexOf(attributeName + '="') + attributeName.length + 2);
    return xmlSnippet.substring(0, xmlSnippet.indexOf('"'));
  }

  function sanitizeXmlString(rawStr) {
    return typeof rawStr === 'string'
      ? rawStr
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#x27;')
      : '';
  }

  function restoreXmlString(encodedStr) {
    return typeof encodedStr === 'string'
      ? encodedStr
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#x27;/g, "'")
          .replace(/&apos;/g, "'")
          .replace(/&#10;/g, '\n')
      : '';
  }

  if (typeof inputData === 'string') {
    // Process a file load operation
    archiveDuration = Date.now();
    archiveObject = archiveObject.load(inputData, { base64: true });
    finalOutcome = { sheetDefinitions: [], archiveDuration: Date.now() - archiveDuration };
    taskDuration = Date.now();
    commonTexts = [];
    cellFormats = [];

    if ((tempStr = archiveObject.file('xl/sharedStrings.xml'))) {
      // Parse shared string definitions
      tempStr = tempStr.asText().split(/<t.*?>/g);
      outerIdx = tempStr.length;
      while (--outerIdx) {
        commonTexts[outerIdx - 1] = restoreXmlString(tempStr[outerIdx].substring(0, tempStr[outerIdx].indexOf('</t>')));
      } // Skip the initial part before the first text element
    }
    if ((tempStr = archiveObject.file('docProps/core.xml'))) {
      // Extract document core properties
      tempStr = tempStr.asText();
      tempStr = tempStr.substr(tempStr.indexOf('<dc:creator>') + 12);
      finalOutcome.creator = tempStr.substring(0, tempStr.indexOf('</dc:creator>'));
      tempStr = tempStr.substr(tempStr.indexOf('<cp:lastModifiedBy>') + 19);
      finalOutcome.lastModifiedBy = tempStr.substring(0, tempStr.indexOf('</cp:lastModifiedBy>'));
      tempStr = tempStr.substr(tempStr.indexOf('<dcterms:created xsi:type="dcterms:W3CDTF">') + 43);
      finalOutcome.created = new Date(tempStr.substring(0, tempStr.indexOf('</dcterms:created>')));
      tempStr = tempStr.substr(tempStr.indexOf('<dcterms:modified xsi:type="dcterms:W3CDTF">') + 44);
      finalOutcome.modified = new Date(tempStr.substring(0, tempStr.indexOf('</dcterms:modified>')));
    }
    if ((tempStr = archiveObject.file('xl/workbook.xml'))) {
      // Retrieve workbook structure information
      tempStr = tempStr.asText();
      itemIdx = tempStr.indexOf('activeTab="');
      if (itemIdx > 0) {
        tempStr = tempStr.substr(itemIdx + 11); // Advance past attribute name
        finalOutcome.activeWorksheet = +tempStr.substring(0, tempStr.indexOf('"'));
      } else {
        finalOutcome.activeWorksheet = 0;
      }
      tempStr = tempStr.split('<sheet ');
      outerIdx = tempStr.length;
      while (--outerIdx) {
        // Skip the initial part
        uniqueId = tempStr[outerIdx].substr(tempStr[outerIdx].indexOf('name="') + 6);
        finalOutcome.sheetDefinitions.unshift({ name: uniqueId.substring(0, uniqueId.indexOf('"')), sheetContent: [] });
      }
    }
    if ((tempStr = archiveObject.file('xl/styles.xml'))) {
      // Obtain cell styling information
      tempStr = tempStr.asText().split('<numFmt ');
      outerIdx = tempStr.length;
      while (--outerIdx) {
        elemType = tempStr[outerIdx];
        numberFormats[+extractAttribute(elemType, 'numFmtId')] = extractAttribute(elemType, 'formatCode');
      }
      tempStr = tempStr[tempStr.length - 1];
      tempStr = tempStr.substr(tempStr.indexOf('cellXfs')).split('<xf ');
      outerIdx = tempStr.length;
      while (--outerIdx) {
        uniqueId = extractAttribute(tempStr[outerIdx], 'numFmtId');
        formatInfo = numberFormats[uniqueId];
        if (formatInfo.indexOf('m') > -1) {
          elemType = 'date';
        } else if (formatInfo.indexOf('0') > -1) {
          elemType = 'number';
        } else if (formatInfo === '@') {
          elemType = 'string';
        } else {
          elemType = 'unknown';
        }
        cellFormats.unshift({ formatCode: formatInfo, type: elemType });
      }
    }

    // Retrieve data for each worksheet
    outerIdx = finalOutcome.sheetDefinitions.length;
    while (outerIdx--) {
      tempStr = archiveObject.file('xl/worksheets/sheet' + (outerIdx + 1) + '.xml').asText().split('<row ');
      sheetRef = finalOutcome.sheetDefinitions[outerIdx];
      sheetRef.table = tempStr[0].indexOf('<tableParts ') > 0;
      elemType = extractAttribute(tempStr[0].substr(tempStr[0].indexOf('<dimension')), 'ref');
      elemType = elemType.substr(elemType.indexOf(':') + 1);
      sheetRef.maxCol = lettersToColumn(elemType.match(/[a-zA-Z]*/g)[0]) + 1;
      sheetRef.maxRow = +elemType.match(/\d*/g).join('');
      sheetRef = sheetRef.sheetContent;
      innerIdx = tempStr.length;
      while (--innerIdx) {
        // Skip the initial part before the first row
        currentRow = sheetRef[+extractAttribute(tempStr[innerIdx], 'r') - 1] = [];
        columnDefinitions = tempStr[innerIdx].split('<c ');
        tertiaryIdx = columnDefinitions.length;
        while (--tertiaryIdx) {
          // Skip the initial part before the first cell
          currentCell = columnDefinitions[tertiaryIdx];
          formatInfo = cellFormats[+extractAttribute(currentCell, 's')] || { type: 'General', formatCode: 'General' };
          elemType = extractAttribute(currentCell, 't') || formatInfo.type;
          dataElement = currentCell.substring(currentCell.indexOf('<v>') + 3, currentCell.indexOf('</v>'));
          dataElement = dataElement ? +dataElement : ''; // Convert to number if non-empty
          switch (elemType) {
            case 's':
              dataElement = commonTexts[dataElement];
              break;
            case 'b':
              dataElement = dataElement === 1;
              break;
            case 'date':
              dataElement = dateConverter(dataElement);
              break;
          }
          currentRow[lettersToColumn(extractAttribute(currentCell, 'r').match(/[a-zA-Z]*/g)[0])] = {
            value: dataElement,
            formatCode: formatInfo.formatCode
          };
        }
      }
    }

    finalOutcome.taskDuration = Date.now() - taskDuration;
  } else {
    // Initiate a file save operation
    taskDuration = Date.now();
    commonTexts = [[], 0];
    // Write static parts of the archive
    archiveObject
      .folder('_rels')
      .file(
        '.rels',
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>'
      );
    documentProperties = archiveObject.folder('docProps');

    excelRoot = archiveObject.folder('xl');
    excelRoot
      .folder('theme')
      .file(
        'theme1.xml',
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="Office Theme"><a:themeElements><a:clrScheme name="Office"><a:dk1><a:sysClr val="windowText" lastClr="000000"/></a:dk1><a:lt1><a:sysClr val="window" lastClr="FFFFFF"/></a:lt1><a:dk2><a:srgbClr val="1F497D"/></a:dk2><a:lt2><a:srgbClr val="EEECE1"/></a:lt2><a:accent1><a:srgbClr val="4F81BD"/></a:accent1><a:accent2><a:srgbClr val="C0504D"/></a:accent2><a:accent3><a:srgbClr val="9BBB59"/></a:accent3><a:accent4><a:srgbClr val="8064A2"/></a:accent4><a:accent5><a:srgbClr val="4BACC6"/></a:accent5><a:accent6><a:srgbClr val="F79646"/></a:accent6><a:hlink><a:srgbClr val="0000FF"/></a:hlink><a:folHlink><a:srgbClr val="800080"/></a:folHlink></a:clrScheme><a:fontScheme name="Office"><a:majorFont><a:latin typeface="Cambria"/><a:ea typeface=""/><a:cs typeface=""/><a:font script="Jpan" typeface="MS P????"/><a:font script="Hang" typeface="?? ??"/><a:font script="Hans" typeface="??"/><a:font script="Hant" typeface="????"/><a:font script="Arab" typeface="Times New Roman"/><a:font script="Hebr" typeface="Times New Roman"/><a:font script="Thai" typeface="Tahoma"/><a:font script="Ethi" typeface="Nyala"/><a:font script="Beng" typeface="Vrinda"/><a:font script="Gujr" typeface="Shruti"/><a:font script="Khmr" typeface="MoolBoran"/><a:font script="Knda" typeface="Tunga"/><a:font script="Guru" typeface="Raavi"/><a:font script="Cans" typeface="Euphemia"/><a:font script="Cher" typeface="Plantagenet Cherokee"/><a:font script="Yiii" typeface="Microsoft Yi Baiti"/><a:font script="Tibt" typeface="Microsoft Himalaya"/><a:font script="Thaa" typeface="MV Boli"/><a:font script="Deva" typeface="Mangal"/><a:font script="Telu" typeface="Gautami"/><a:font script="Taml" typeface="Latha"/><a:font script="Syrc" typeface="Estrangelo Edessa"/><a:font script="Orya" typeface="Kalinga"/><a:font script="Mlym" typeface="Kartika"/><a:font script="Laoo" typeface="DokChampa"/><a:font script="Sinh" typeface="Iskoola Pota"/><a:font script="Mong" typeface="Mongolian Baiti"/><a:font script="Viet" typeface="Times New Roman"/><a:font script="Uigh" typeface="Microsoft Uighur"/><a:font script="Geor" typeface="Sylfaen"/></a:majorFont><a:minorFont><a:latin typeface="Calibri"/><a:ea typeface=""/><a:cs typeface=""/><a:font script="Jpan" typeface="MS P????"/><a:font script="Hang" typeface="?? ??"/><a:font script="Hans" typeface="??"/><a:font script="Hant" typeface="????"/><a:font script="Arab" typeface="Arial"/><a:font script="Hebr" typeface="Arial"/><a:font script="Thai" typeface="Tahoma"/><a:font script="Ethi" typeface="Nyala"/><a:font script="Beng" typeface="Vrinda"/><a:font script="Gujr" typeface="Shruti"/><a:font script="Khmr" typeface="DaunPenh"/><a:font script="Knda" typeface="Tunga"/><a:font script="Guru" typeface="Raavi"/><a:font script="Cans" typeface="Euphemia"/><a:font script="Cher" typeface="Plantagenet Cherokee"/><a:font script="Yiii" typeface="Microsoft Yi Baiti"/><a:font script="Tibt" typeface="Microsoft Himalaya"/><a:font script="Thaa" typeface="MV Boli"/><a:font script="Deva" typeface="Mangal"/><a:font script="Telu" typeface="Gautami"/><a:font script="Taml" typeface="Latha"/><a:font script="Syrc" typeface="Estrangelo Edessa"/><a:font script="Orya" typeface="Kalinga"/><a:font script="Mlym" typeface="Kartika"/><a:font script="Laoo" typeface="DokChampa"/><a:font script="Sinh" typeface="Iskoola Pota"/><a:font script="Mong" typeface="Mongolian Baiti"/><a:font script="Viet" typeface="Arial"/><a:font script="Uigh" typeface="Microsoft Uighur"/><a:font script="Geor" typeface="Sylfaen"/></a:minorFont></a:fontScheme><a:fmtScheme name="Office"><a:fillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:gradFill rotWithShape="1"><a:gsLst><a:gs pos="0"><a:schemeClr val="phClr"><a:tint val="50000"/><a:satMod val="300000"/></a:schemeClr></a:gs><a:gs pos="35000"><a:schemeClr val="phClr"><a:tint val="37000"/><a:satMod val="300000"/></a:schemeClr></a:gs><a:gs pos="100000"><a:schemeClr val="phClr"><a:tint val="15000"/><a:satMod val="350000"/></a:schemeClr></a:gs></a:gsLst><a:lin ang="16200000" scaled="1"/></a:gradFill><a:gradFill rotWithShape="1"><a:gsLst><a:gs pos="0"><a:schemeClr val="phClr"><a:shade val="51000"/><a:satMod val="130000"/></a:schemeClr></a:gs><a:gs pos="80000"><a:schemeClr val="phClr"><a:shade val="93000"/><a:satMod val="130000"/></a:schemeClr></a:gs><a:gs pos="100000"><a:schemeClr val="phClr"><a:shade val="94000"/><a:satMod val="135000"/></a:schemeClr></a:gs></a:gsLst><a:lin ang="16200000" scaled="0"/></a:gradFill></a:fillStyleLst><a:lnStyleLst><a:ln w="9525" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="phClr"><a:shade val="95000"/><a:satMod val="105000"/></a:schemeClr></a:solidFill><a:prstDash val="solid"/></a:ln><a:ln w="25400" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:prstDash val="solid"/></a:ln><a:ln w="38100" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:prstDash val="solid"/></a:ln></a:lnStyleLst><a:effectStyleLst><a:effectStyle><a:effectLst><a:outerShdw blurRad="40000" dist="20000" dir="5400000" rotWithShape="0"><a:srgbClr val="000000"><a:alpha val="38000"/></a:srgbClr></a:outerShdw></a:effectLst></a:effectStyle><a:effectStyle><a:effectLst><a:outerShdw blurRad="40000" dist="23000" dir="5400000" rotWithShape="0"><a:srgbClr val="000000"><a:alpha val="35000"/></a:srgbClr></a:outerShdw></a:effectLst></a:effectStyle><a:effectStyle><a:effectLst><a:outerShdw blurRad="40000" dist="23000" dir="5400000" rotWithShape="0"><a:srgbClr val="000000"><a:alpha val="35000"/></a:srgbClr></a:outerShdw></a:effectLst><a:scene3d><a:camera prst="orthographicFront"><a:rot lat="0" lon="0" rev="0"/></a:camera><a:lightRig rig="threePt" dir="t"><a:rot lat="0" lon="0" rev="1200000"/></a:lightRig></a:scene3d><a:sp3d><a:bevelT w="63500" h="25400"/></a:sp3d></a:effectStyle></a:effectStyleLst><a:bgFillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:gradFill rotWithShape="1"><a:gsLst><a:gs pos="0"><a:schemeClr val="phClr"><a:tint val="40000"/><a:satMod val="350000"/></a:schemeClr></a:gs><a:gs pos="40000"><a:schemeClr val="phClr"><a:tint val="45000"/><a:shade val="99000"/><a:satMod val="350000"/></a:schemeClr></a:gs><a:gs pos="100000"><a:schemeClr val="phClr"><a:shade val="20000"/><a:satMod val="255000"/></a:schemeClr></a:gs></a:gsLst><a:path path="circle"><a:fillToRect l="50000" t="-80000" r="50000" b="180000"/></a:path></a:gradFill><a:gradFill rotWithShape="1"><a:gsLst><a:gs pos="0"><a:schemeClr val="phClr"><a:tint val="80000"/><a:satMod val="300000"/></a:schemeClr></a:gs><a:gs pos="100000"><a:schemeClr val="phClr"><a:shade val="30000"/><a:satMod val="200000"/></a:schemeClr></a:gs></a:gsLst><a:path path="circle"><a:fillToRect l="50000" t="50000" r="50000" b="50000"/></a:path></a:gradFill></a:bgFillStyleLst></a:fmtScheme></a:themeElements><a:objectDefaults/><a:extraClrSchemeLst/></a:theme>'
      );
    excelSheetsFolder = excelRoot.folder('worksheets');

    // Generate core document properties
    documentProperties.file(
      'core.xml',
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:creator>' +
        (inputData.creator || 'XLSX.js') +
        '</dc:creator><cp:lastModifiedBy>' +
        (inputData.lastModifiedBy || 'XLSX.js') +
        '</cp:lastModifiedBy><dcterms:created xsi:type="dcterms:W3CDTF">' +
        (inputData.created || new Date()).toISOString() +
        '</dcterms:created><dcterms:modified xsi:type="dcterms:W3CDTF">' +
        (inputData.modified || new Date()).toISOString() +
        '</dcterms:modified></cp:coreProperties>'
    );

    // Prepare style and font collections
    cellFormats = new Array(1);
    edgeSpecs = new Array(1);
    typefaceList = new Array(1);

    sheetRef = inputData.worksheets.length;
    while (sheetRef--) {
      // Process individual worksheets
      uniqueId = sheetRef + 1;
      // Construct sheetX.xml content
      activeSheet = inputData.worksheets[sheetRef];
      sheetContent = activeSheet.sheetContent;
      tempStr = '';
      columnDefinitions = [];
      mergedRanges = [];
      outerIdx = -1;
      lengthVal = sheetContent.length;
      while (++outerIdx < lengthVal) {
        innerIdx = -1;
        tertiaryIdx = sheetContent[outerIdx].length;
        tempStr += '<row r="' + (outerIdx + 1) + '" x14ac:dyDescent="0.25">';
        while (++innerIdx < tertiaryIdx) {
          currentCell = sheetContent[outerIdx][innerIdx];
          dataElement = currentCell.hasOwnProperty('value') ? currentCell.value : currentCell;
          elemType = '';
          currentStyle = {
            // Supported styling attributes
            borders: currentCell.borders,
            hAlign: currentCell.hAlign,
            vAlign: currentCell.vAlign,
            bold: currentCell.bold,
            italic: currentCell.italic,
            fontName: currentCell.fontName,
            fontSize: currentCell.fontSize,
            formatCode: currentCell.formatCode || 'General'
          };
          columnDimension = 0;
          if (dataElement && typeof dataElement === 'string' && !isFinite(dataElement)) {
            // String value processing
            dataElement = sanitizeXmlString(dataElement);
            commonTexts[1]++; // Increment total string count
            itemIdx = commonTexts[0].indexOf(dataElement);
            columnDimension = dataElement.length;
            if (itemIdx < 0) {
              itemIdx = commonTexts[0].push(dataElement) - 1;
            }
            dataElement = itemIdx;
            elemType = 's';
          } else if (typeof dataElement === 'boolean') {
            dataElement = dataElement ? 1 : 0;
            elemType = 'b';
            columnDimension = 1;
          } else if (getObjectType(dataElement) === 'date') {
            dataElement = dateConverter(dataElement);
            currentStyle.formatCode = currentCell.formatCode || 'mm-dd-yy';
            columnDimension = ('' + dataElement).length; // Convert to string for length
          } else if (typeof dataElement === 'object') {
            dataElement = null;
          } // Unsupported object type
          else {
            columnDimension = ('' + dataElement).length;
          } // Numeric or string-as-number

          // Standardize style signature and lookup
          currentStyle = JSON.stringify(currentStyle);
          itemIdx = cellFormats.indexOf(currentStyle);
          if (itemIdx < 0) {
            currentStyle = cellFormats.push(currentStyle) - 1;
          } else {
            currentStyle = itemIdx;
          }
          // Track column width for auto-sizing
          if (columnDefinitions[innerIdx] == null) {
            columnDefinitions[innerIdx] = { autoWidth: false, max: 0 };
          }
          if (currentCell.autoWidth) {
            columnDefinitions[innerIdx].autoWidth = true;
          }
          if (columnDimension > columnDefinitions[innerIdx].max) {
            columnDefinitions[innerIdx].max = columnDimension;
          }
          // Handle cell merging operations
          if (currentCell.colSpan > 1) {
            // Horizontal merge
            mergedRanges.push([
              columnToLetters(innerIdx) + (outerIdx + 1),
              columnToLetters(innerIdx + currentCell.colSpan - 1) + (outerIdx + 1)
            ]);
            mergedSegment = [innerIdx, 0];
            for (var m = 0; m < currentCell.colSpan - 1; m++) {
              mergedSegment.push(currentCell);
            }
            sheetContent[outerIdx].splice.apply(sheetContent[outerIdx], mergedSegment);
            tertiaryIdx += currentCell.colSpan - 1;
          } else if (currentCell.rowSpan > 1) {
            // Vertical merge
            for (var m = 1; m < currentCell.rowSpan; m++) {
              if (sheetContent[outerIdx + m]) {
                sheetContent[outerIdx + m].splice(innerIdx, 0, currentCell);
              } else {
                // Reached end of data, adjust rowSpan
                currentCell.rowSpan = m;
                break;
              }
            }
            mergedRanges.push([
              columnToLetters(innerIdx) + (outerIdx + 1),
              columnToLetters(innerIdx) + (outerIdx + currentCell.rowSpan)
            ]);
          }
          if (currentCell.rowSpan > 1 || currentCell.colSpan > 1) {
            // Clear merge properties to prevent re-use
            delete currentCell.value;
            delete currentCell.rowSpan;
            delete currentCell.colSpan;
          }
          tempStr +=
            '<c r="' +
            columnToLetters(innerIdx) +
            (outerIdx + 1) +
            '"' +
            (currentStyle ? ' s="' + currentStyle + '"' : '') +
            (elemType ? ' t="' + elemType + '"' : '');
          if (dataElement != null) {
            tempStr += (currentCell.formula ? '><f>' + currentCell.formula + '</f>' : '>') + '<v>' + dataElement + '</v></c>';
          } else {
            tempStr += '/>';
          }
        }
        tempStr += '</row>';
      }

      columnXmlFragments = [];
      for (outerIdx = 0; outerIdx < columnDefinitions.length; outerIdx++) {
        if (columnDefinitions[outerIdx].autoWidth) {
          columnXmlFragments.push(
            '<col min="',
            outerIdx + 1,
            '" max="',
            outerIdx + 1,
            '" width="',
            columnDefinitions[outerIdx].max,
            '" bestFit="1"/>'
          );
        }
      }
      // Wrap column definitions if they exist
      if (columnXmlFragments.length > 0) {
        columnXmlFragments = ['<cols>'].concat(columnXmlFragments, ['</cols>']).join('');
      }

      tempStr =
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" mc:Ignorable="x14ac" xmlns:x14ac="http://schemas.microsoft.com/office/spreadsheetml/2009/9/ac">' +
        '<dimension ref="A1:' +
        columnToLetters(sheetContent[0].length - 1) +
        sheetContent.length +
        '"/><sheetViews><sheetView ' +
        (sheetRef === inputData.activeWorksheet ? 'tabSelected="1" ' : '') +
        ' workbookViewId="0"/></sheetViews><sheetFormatPr defaultRowHeight="15" x14ac:dyDescent="0.25"/>' +
        columnXmlFragments +
        '<sheetData>' +
        tempStr +
        '</sheetData>';
      if (mergedRanges.length > 0) {
        tempStr += '<mergeCells count="' + mergedRanges.length + '">';
        for (outerIdx = 0; outerIdx < mergedRanges.length; outerIdx++) {
          tempStr += '<mergeCell ref="' + mergedRanges[outerIdx].join(':') + '"/>';
        }
        tempStr += '</mergeCells>';
      }
      tempStr += '<pageMargins left="0.7" right="0.7" top="0.75" bottom="0.75" header="0.3" footer="0.3"/>';
      if (activeSheet.table) {
        tempStr += '<tableParts count="1"><tablePart r:id="rId1"/></tableParts>';
      }
      excelSheetsFolder.file('sheet' + uniqueId + '.xml', tempStr + '</worksheet>');

      if (activeSheet.table) {
        outerIdx = -1;
        lengthVal = sheetContent[0].length;
        elemType = columnToLetters(sheetContent[0].length - 1) + sheetContent.length;
        tempStr =
          '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><table xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" id="' +
          uniqueId +
          '" name="Table' +
          uniqueId +
          '" displayName="Table' +
          uniqueId +
          '" ref="A1:' +
          elemType +
          '" totalsRowShown="0"><autoFilter ref="A1:' +
          elemType +
          '"/><tableColumns count="' +
          sheetContent[0].length +
          '">';
        while (++outerIdx < lengthVal) {
          tempStr +=
            '<tableColumn id="' +
            (outerIdx + 1) +
            '" name="' +
            (sheetContent[0][outerIdx].hasOwnProperty('value') ? sheetContent[0][outerIdx].value : sheetContent[0][outerIdx]) +
            '"/>';
        }
        tempStr += '</tableColumns><tableStyleInfo name="TableStyleMedium2" showFirstColumn="0" showLastColumn="0" showRowStripes="1" showColumnStripes="0"/></table>';

        excelRoot.folder('tables').file('table' + uniqueId + '.xml', tempStr);
        excelSheetsFolder
          .folder('_rels')
          .file(
            'sheet' + uniqueId + '.xml.rels',
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/table" Target="../tables/table' +
              uniqueId +
              '.xml"/></Relationships>'
          );
        mediaTypes[1].unshift(
          '<Override PartName="/xl/tables/table' +
            uniqueId +
            '.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.table+xml"/>'
        );
      }

      mediaTypes[0].unshift(
        '<Override PartName="/xl/worksheets/sheet' +
          uniqueId +
          '.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'
      );
      propertyList.unshift(sanitizeXmlString(activeSheet.name) || 'Sheet' + uniqueId);
      excelRelationships.unshift(
        '<Relationship Id="rId' +
          uniqueId +
          '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet' +
          uniqueId +
          '.xml"/>'
      );
      sheetDefinitions.unshift(
        '<sheet name="' + (sanitizeXmlString(activeSheet.name) || 'Sheet' + uniqueId) + '" sheetId="' + uniqueId + '" r:id="rId' + uniqueId + '"/>'
      );
    }

    // Generate xl/styles.xml content
    outerIdx = cellFormats.length;
    elemType = []; // Temporary for number formats
    while (--outerIdx) {
      // Skip the default style at index 0
      currentStyle = JSON.parse(cellFormats[outerIdx]);

      // Process number format for the cell style
      if (currentStyle.formatCode !== 'General') {
        itemIdx = numberFormats.indexOf(currentStyle.formatCode);
        if (itemIdx < 0) {
          itemIdx = 164 + elemType.length;
          elemType.push('<numFmt formatCode="' + currentStyle.formatCode + '" numFmtId="' + itemIdx + '"/>');
        }
        currentStyle.formatCode = itemIdx;
      } else {
        currentStyle.formatCode = 0;
      }

      // Process border declarations
      edgeLookup = 0;
      if (currentStyle.borders) {
        singleEdge = ['<border>'];
        // Order matters for border elements
        for (var edgeKey in { left: 0, right: 0, top: 0, bottom: 0, diagonal: 0 }) {
          if (currentStyle.borders[edgeKey]) {
            var colorValue = currentStyle.borders[edgeKey];
            // Ensure color has alpha component
            if (colorValue.length === 6) {
              colorValue = 'FF' + colorValue;
            }
            singleEdge.push('<', edgeKey, ' style="thin">', '<color rgb="', colorValue, '"/></', edgeKey, '>');
          } else {
            singleEdge.push('<', edgeKey, '/>');
          }
        }
        singleEdge.push('</border>');
        singleEdge = singleEdge.join('');
        // Reuse existing border definition if possible
        edgeLookup = edgeSpecs.indexOf(singleEdge);
        if (edgeLookup < 0) {
          edgeLookup = edgeSpecs.push(singleEdge) - 1;
        }
      }

      // Process font declarations
      typefaceLookup = 0;
      if (currentStyle.bold || currentStyle.italic || currentStyle.fontSize || currentStyle.fontName) {
        singleTypeface = ['<font>'];
        if (currentStyle.bold) {
          singleTypeface.push('<b/>');
        }
        if (currentStyle.italic) {
          singleTypeface.push('<i/>');
        }
        singleTypeface.push('<sz val="', currentStyle.fontSize || standardTypefaceSize, '"/>');
        singleTypeface.push('<color theme="1"/>');
        singleTypeface.push('<name val="', currentStyle.fontName || standardTypefaceName, '"/>');
        singleTypeface.push('<family val="2"/>', '</font>');
        singleTypeface = singleTypeface.join('');
        // Reuse existing font definition if possible
        typefaceLookup = typefaceList.indexOf(singleTypeface);
        if (typefaceLookup < 0) {
          typefaceLookup = typefaceList.push(singleTypeface) - 1;
        }
      }

      // Construct the cellXf style entry
      cellFormats[outerIdx] = [
        '<xf xfId="0" fillId="0" borderId="',
        edgeLookup,
        '" fontId="',
        typefaceLookup,
        '" numFmtId="',
        currentStyle.formatCode,
        '" ',
        (currentStyle.hAlign || currentStyle.vAlign ? 'applyAlignment="1" ' : ' '),
        (currentStyle.formatCode > 0 ? 'applyNumberFormat="1" ' : ' '),
        (edgeLookup > 0 ? 'applyBorder="1" ' : ' '),
        (typefaceLookup > 0 ? 'applyFont="1" ' : ' '),
        '>'
      ];
      if (currentStyle.hAlign || currentStyle.vAlign) {
        cellFormats[outerIdx].push('<alignment');
        if (currentStyle.hAlign) {
          cellFormats[outerIdx].push(' horizontal="', currentStyle.hAlign, '"');
        }
        if (currentStyle.vAlign) {
          cellFormats[outerIdx].push(' vertical="', currentStyle.vAlign, '"');
        }
        cellFormats[outerIdx].push('/>');
      }
      cellFormats[outerIdx].push('</xf>');
      cellFormats[outerIdx] = cellFormats[outerIdx].join('');
    }
    elemType = elemType.length ? '<numFmts count="' + elemType.length + '">' + elemType.join('') + '</numFmts>' : '';

    excelRoot.file(
      'styles.xml',
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" mc:Ignorable="x14ac" xmlns:x14ac="http://schemas.microsoft.com/office/spreadsheetml/2009/9/ac">' +
        elemType +
        '<fonts count="' +
        typefaceList.length +
        '" x14ac:knownFonts="1"><font><sz val="' +
        standardTypefaceSize +
        '"/><color theme="1"/><name val="' +
        standardTypefaceName +
        '"/><family val="2"/>' +
        '<scheme val="minor"/></font>' +
        typefaceList.join('') +
        '</fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills>' +
        '<borders count="' +
        edgeSpecs.length +
        '"><border><left/><right/><top/><bottom/><diagonal/></border>' +
        edgeSpecs.join('') +
        '</borders><cellStyleXfs count="1">' +
        '<xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="' +
        cellFormats.length +
        '"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>' +
        cellFormats.join('') +
        '</cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles><dxfs count="0"/>' +
        '<tableStyles count="0" defaultTableStyle="TableStyleMedium2" defaultPivotStyle="PivotStyleLight16"/>' +
        '<extLst><ext uri="{EB79DEF2-80B8-43e5-95BD-54CBDDF9020C}" xmlns:x14="http://schemas.microsoft.com/office/spreadsheetml/2009/9/main">' +
        '<x14:slicerStyles defaultSlicerStyle="SlicerStyleLight1"/></ext></extLst></styleSheet>'
    );

    // Write [Content_Types].xml
    archiveObject.file(
      '[Content_Types].xml',
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' +
        mediaTypes[0].join('') +
        '<Override PartName="/xl/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/><Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/>' +
        mediaTypes[1].join('') +
        '<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/></Types>'
    );

    // Write docProps/app.xml
    documentProperties.file(
      'app.xml',
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes"><Application>XLSX.js</Application><DocSecurity>0</DocSecurity><ScaleCrop>false</ScaleCrop><HeadingPairs><vt:vector size="2" baseType="variant"><vt:variant><vt:lpstr>Worksheets</vt:lpstr></vt:variant><vt:variant><vt:i4>' +
        inputData.worksheets.length +
        '</vt:i4></vt:variant></vt:vector></HeadingPairs><TitlesOfParts><vt:vector size="' +
        propertyList.length +
        '" baseType="lpstr"><vt:lpstr>' +
        propertyList.join('</vt:lpstr><vt:lpstr>') +
        '</vt:lpstr></vt:vector></TitlesOfParts><Manager></Manager><Company>Microsoft Corporation</Company><LinksUpToDate>false</LinksUpToDate><SharedDoc>false</SharedDoc><HyperlinksChanged>false</HyperlinksChanged><AppVersion>1.0</AppVersion></Properties>'
    );

    // Write xl/_rels/workbook.xml.rels
    excelRoot
      .folder('_rels')
      .file(
        'workbook.xml.rels',
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
          excelRelationships.join('') +
          '<Relationship Id="rId' +
          (excelRelationships.length + 1) +
          '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml"/>' +
          '<Relationship Id="rId' +
          (excelRelationships.length + 2) +
          '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>' +
          '<Relationship Id="rId' +
          (excelRelationships.length + 3) +
          '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="theme/theme1.xml"/></Relationships>'
      );

    // Write xl/sharedStrings.xml
    excelRoot.file(
      'sharedStrings.xml',
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="' +
        commonTexts[1] +
        '" uniqueCount="' +
        commonTexts[0].length +
        '"><si><t>' +
        commonTexts[0].join('</t></si><si><t>') +
        '</t></si></sst>'
    );

    // Write xl/workbook.xml
    excelRoot.file(
      'workbook.xml',
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' +
        '<fileVersion appName="xl" lastEdited="5" lowestEdited="5" rupBuild="9303"/><workbookPr defaultThemeVersion="124226"/><bookViews><workbookView ' +
        (inputData.activeWorksheet ? 'activeTab="' + inputData.activeWorksheet + '" ' : '') +
        'xWindow="480" yWindow="60" windowWidth="18195" windowHeight="8505"/></bookViews><sheets>' +
        sheetDefinitions.join('') +
        '</sheets><calcPr fullCalcOnLoad="1"/></workbook>'
    );

    taskDuration = Date.now() - taskDuration;
    archiveDuration = Date.now();
    finalOutcome = {
      base64: archiveObject.generate({ compression: 'DEFLATE' }),
      archiveDuration: Date.now() - archiveDuration,
      taskDuration: taskDuration,
      href: function () {
        return 'data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,' + this.base64;
      }
    };
  }
  return finalOutcome;
}

if (typeof moduleExports === 'object' && typeof currentModule === 'object') {
  currentModule.exports = spreadsheetProcessor;
} // For Node.js environments