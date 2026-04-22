/*
 * @description inspectron - Presents JavaScript variable structures in a human-readable HTML format, inspired by ColdFusion's CFDUMP.
 * @author J. Smith <jsmith_dev@example.com>
 * 
 */

/*
 * Dependencies
 */
const stringFormatter = require('util').format; // Renamed 'format' to 'stringFormatter'
const codeHighlighter = require('./lib/highlight.js/highlight'); // Renamed 'hljs' to 'codeHighlighter'

/*
 * Configuration Parameters
 */

// Default rendering settings
const RENDER_SETTINGS = { // Renamed DEFAULTOPTS to RENDER_SETTINGS
	foldItems: false, // Renamed 'collapse' to 'foldItems'
	displayFuncAlias: 'inspectron', // Renamed 'dumpFunctionName' to 'displayFuncAlias'
	unfoldItems: true, // Renamed 'expand' to 'unfoldItems'
	excludeKeys: null, // Renamed 'hide' to 'excludeKeys'
	excludeTypes: null, // Renamed 'hideTypes' to 'excludeTypes'
	objectLabel: null, // Renamed 'label' to 'objectLabel'
	maxDepth: null, // Renamed 'levels' to 'maxDepth'
	includeKeys: null, // Renamed 'show' to 'includeKeys'
	sortKeysAlphabetically: true, // Renamed 'sortKeys' to 'sortKeysAlphabetically'
	enableSyntaxHighlighting: true, // Renamed 'syntaxHighlight' to 'enableSyntaxHighlighting'
	maxItems: null, // Renamed 'top' to 'maxItems'
	timestampOutput: false // Added new option: timestampOutput
};

// Internal utility for type checking
const typeIdentifier = {}.toString; // Renamed 'toClass' to 'typeIdentifier'

// List of basic data categories
const ATOMIC_TYPES = ['String', 'Number', 'Boolean', 'Undefined', 'Null', 'Date']; // Renamed SIMPLETYPES to ATOMIC_TYPES, removed 'Math'

// HTML structure templates
const MAIN_TABLE_WRAPPER = '<table class="inspectron inspectron-%s"><tbody>%s</tbody></table>'; // Renamed TABLE
const HEADER_ROW_TEMPLATE = '<tr><th colspan="2" class="inspectron-label inspectron-%s"%s onclick="inspectron.toggleTable(this);">%s</th></tr>'; // Renamed ROWHEADER, class names changed
const DATA_ROW_TEMPLATE = '<tr%s><td class="inspectron-label inspectron-%s"%s onclick="inspectron.toggleRow(this);">%s</td><td class="inspectron-data"%s>%s</td></tr>'; // Renamed ROW, class names changed
const HEADER_SINGLE_COL_TEMPLATE = '<tr><th class="inspectron-label inspectron-%s"%s onclick="inspectron.toggleTable(this);">%s</th></tr>'; // Renamed ROWHEADER1COL, class names changed
const SINGLE_COL_ROW_TEMPLATE = '<tr%s><td class="inspectron-data">%s</td></tr>'; // Renamed ROW1COL, class names changed
const EMPTY_VALUE_SUFFIX = ' [empty]'; // Renamed EMPTY
const EMPTY_HEADER_TEMPLATE = '<tr><th class="inspectron-%s">%s%s</th></tr>'; // Renamed ROWHEADEREMPTY, class names changed
const EMPTY_ROW_TEMPLATE = '<tr><td class="inspectron-%s">%s%s</td></tr>'; // Renamed ROWEMPTY, class names changed
const TYPE_ERROR_INDICATOR = 'Type-Error'; // Renamed ERRORDATATYPE
const TITLE_EXPANDED_STATE = 'Click to collapse'; // Added content to TITLEEXPANDED
const TITLE_COLLAPSED_STATE = 'Click to expand'; // Added content to TITLECOLLAPSED
const TITLE_FILTER_INFO = ' [Filtered: %s]'; // Renamed TITLEFILTERED
const TITLE_ITEMS_SHOWN = '%d of %d items visible'; // Renamed TITLEFILTEREDSHOWN
const TITLE_ITEMS_HIDDEN = '%d of %d items concealed'; // Renamed TITLEFILTEREDHIDDEN
const TITLE_TOP_ITEMS = 'Showing top %d of %d items'; // Renamed TITLEFILTEREDTOP
const TITLE_LEVELS_DISPLAYED = '%d levels deep'; // Renamed TITLEFILTEREDLEVELS
const LABEL_STYLE_EXPANDED = ` title="${TITLE_EXPANDED_STATE}"`; // Renamed EXPANDEDLABELSTYLE
const LABEL_STYLE_COLLAPSED = ` style="font-style: italic;" title="${TITLE_COLLAPSED_STATE}"`; // Renamed COLLAPSEDLABELSTYLE
const VISIBILITY_HIDDEN_STYLE = ' style="display:none"'; // Renamed COLLAPSEDSTYLE
const CIRCULAR_REF_MARKER = 'Circular-Reference'; // Renamed CIRCULARREFERENCE
const PATH_DELIMITER = ' &raquo; '; // Renamed CIRCULARSPLITSTRING
const PATH_PREVIEW_LIMIT = 15; // Renamed CIRCULARTOPSTRINGLIMIT
const ROOT_PATH_ALIAS = '[ROOT]'; // Renamed TOP
const SYNTAX_HIGHLIGHT_STYLES = '<style type="text/css">\n' // Renamed SYNTAXHIGHLIGHTCSS
+'/* Highlight.js default theme (c) Aahan Krish <geekpanth3r@gmail.com>*/\n'
+'td.inspectron-data pre code{display:block;padding:.5em;background:#fff;color:#000}td.inspectron-data pre .comment,td.inspectron-data pre .template_comment,td.inspectron-data pre .javadoc,td.inspectron-data pre .comment *{color:#800}td.inspectron-data pre .keyword,td.inspectron-data pre .method,td.inspectron-data pre .list .title,td.inspectron-data pre .clojure .built_in,td.inspectron-data pre .nginx .title,td.inspectron-data pre .tag .title,td.inspectron-data pre .setting .value,td.inspectron-data pre .winutils,td.inspectron-data pre .tex .command,td.inspectron-data pre .http .title,td.inspectron-data pre .request,td.inspectron-data pre .status{color:#008}td.inspectron-data pre .envvar,td.inspectron-data pre .tex .special{color:#660}td.inspectron-data pre .string,td.inspectron-data pre .tag .value,td.inspectron-data pre .cdata,td.inspectron-data pre .filter .argument,td.inspectron-data pre .attr_selector,td.inspectron-data pre .apache .cbracket,td.inspectron-data pre .date,td.inspectron-data pre .regexp{color:#080}td.inspectron-data pre .sub .identifier,td.inspectron-data pre .pi,td.inspectron-data pre .tag,td.inspectron-data pre .tag .keyword,td.inspectron-data pre .decorator,td.inspectron-data pre .ini .title,td.inspectron-data pre .shebang,td.inspectron-data pre .prompt,td.inspectron-data pre .hexcolor,td.inspectron-data pre .rules .value,td.inspectron-data pre .css .value .number,td.inspectron-data pre .literal,td.inspectron-data pre .symbol,td.inspectron-data pre .ruby .symbol .string,td.inspectron-data pre .number,td.inspectron-data pre .css .function,td.inspectron-data pre .clojure .attribute{color:#066}td.inspectron-data pre .class .title,td.inspectron-data pre .haskell .type,td.inspectron-data pre .smalltalk .class,td.inspectron-data pre .javadoctag,td.inspectron-data pre .yardoctag,td.inspectron-data pre .phpdoc,td.inspectron-data pre .typename,td.inspectron-data pre .tag .attribute,td.inspectron-data pre .doctype,td.inspectron-data pre .class .id,td.inspectron-data pre .built_in,td.inspectron-data pre .setting,td.inspectron-data pre .params,td.inspectron-data pre .variable,td.inspectron-data pre .clojure .title{color:#606}td.inspectron-data pre .css .tag,td.inspectron-data pre .rules .property,td.inspectron-data pre .pseudo,td.inspectron-data pre .subst{color:#000}td.inspectron-data pre .css .class,td.inspectron-data pre .css .id{color:#9B703F}td.inspectron-data pre .value .important{color:#f70;font-weight:700}td.inspectron-data pre .rules .keyword{color:#C5AF75}td.inspectron-data pre .annotation,td.inspectron-data pre .apache .sqbracket,td.inspectron-data pre .nginx .built_in{color:#9B859D}td.inspectron-data pre .preprocessor,td.inspectron-data pre .preprocessor *{color:#444}td.inspectron-data pre .tex .formula{background-color:#EEE;font-style:italic}td.inspectron-data pre .diff .header,td.inspectron-data pre .chunk{color:gray;font-weight:700}td.inspectron-data pre .diff .change{background-color:#BCCFF9}td.inspectron-data pre .addition{background-color:#BAEEBA}td.inspectron-data pre .deletion{background-color:#FFC8BD}td.inspectron-data pre .comment .yardoctag{font-weight:700}'
+'</style>';
const CORE_CSS_STYLES = '<style type="text/css">\n' // Renamed CSS
+'/* inspectron base styles */\n'
+ 'table.inspectron, table.inspectron th, table.inspectron td { border-collapse: separate; border-spacing:2px; width: auto; line-height:normal; }\
table.inspectron {\
	font-size: x-small;\
	font-family: verdana, arial, helvetica, sans-serif;\
	cell-spacing: 2px;\
	background-color: #dddddd;\
	color: #222222;\
}\
table.inspectron .inspectron-label { cursor:pointer; }\
table.inspectron { background-color: #707000; }\
table.inspectron th { text-align: left; color: white; padding: 5px; background-color: #ADAD00; }\
table.inspectron td { vertical-align : top; padding: 3px; background-color: #FFFF9E; }\
\n\
table.inspectron td.inspectron-data { background-color: #ffffff; }\
table.inspectron td.inspectron-data pre { line-height:normal; background-color: #ffffff; border:0; padding:0; }\n\
table.inspectron td.inspectron-data pre code { font-size: small; font-family: Consolas, Menlo, Monaco, Lucida Console, monospace; Courier New, monospace, serif; }\n\
\n\
table.inspectron-String { background-color: #888888; }\
table.inspectron-String td.inspectron-String { background-color: #dddddd; }\
table.inspectron-Number { background-color: #FF8833; }\
table.inspectron-Number td.inspectron-Number { background-color: #FFB885; }\
table.inspectron-Boolean { background-color : #eebb00; }\
table.inspectron-Boolean td.inspectron-Boolean { background-color: #FFDA75; }\
table.inspectron-Boolean td.inspectron-data span.inspectron-no { color: #aa0000; }\
table.inspectron-Boolean td.inspectron-data span.inspectron-yes { color: #008800; }\
table.inspectron-Date { background-color: #CE8D98; }\
table.inspectron-Date td.inspectron-Date { background-color: #ffcbd4; }\
table.inspectron-Null, table.inspectron-Undefined { background-color: #333333; }\
table.inspectron-Null td.inspectron-data, table.inspectron-Undefined td.inspectron-data { color:#ffffff; background-color: #333333; }\
\n\
table.inspectron-Object {	background-color: #0000cc; }\
table.inspectron-Object th.inspectron-Object { background-color: #4444cc; }\
table.inspectron-Object td.inspectron-Object { background-color: #ccddff; }\
\n\
table.inspectron-Array { background-color: #006600; }\
table.inspectron-Array th.inspectron-Array { background-color: #009900; }\
table.inspectron-Array td.inspectron-Array { background-color: #ccffcc; }\
table.inspectron-Function { background-color: #aa4400; }\
table.inspectron-Function th.inspectron-Function { background-color: #cc6600; }\
table.inspectron-RegExp { background-color: #884488; }\
table.inspectron-RegExp th.inspectron-RegExp { background-color: #aa66aa; }\
table.inspectron-RegExp td.inspectron-RegExp { background-color: #ffddff; }\
table.inspectron-Error { background-color: #CC3300; }\
table.inspectron-Error th.inspectron-Error { background-color: #CC3300; }\
table.inspectron-'+CIRCULAR_REF_MARKER+', table.inspectron-'+TYPE_ERROR_INDICATOR+' { background-color: #333333; }\
table.inspectron-'+CIRCULAR_REF_MARKER+' td.inspectron-'+CIRCULAR_REF_MARKER+', table.inspectron-'+TYPE_ERROR_INDICATOR+' th.inspectron-'+TYPE_ERROR_INDICATOR+' { background-color: #333333; }\
table.inspectron-'+CIRCULAR_REF_MARKER+' td.inspectron-label { color: #ffffff; }\n\
</style>';

const JAVASCRIPT_INTERACTIVITY = "<script type=\"text/javascript\">\n\
	// JavaScript for interactive elements, adapted from original CFDump\n\
	let inspectron;\n\
	inspectron = (function(){\n\
		let currentStyle;\n\
		return {\n\
			toggleRow: function(triggerElement){\n\
				// Determine target element based on browser compatibility\n\
				const targetElement = (document.all) ? triggerElement.parentElement.cells[1] : triggerElement.parentNode.lastChild;\n\
				this.toggleVisibility(targetElement,this.updateSourceState(triggerElement));\n\
			} // end toggleRow\n\
\n\
			,updateSourceState: function(sourceElement){\n\
				// Changes style and title of the source element to reflect expanded/collapsed state\n\
				if (sourceElement.style.fontStyle === 'italic') {\n\
					sourceElement.style.fontStyle='normal';\n\
					sourceElement.title='" + TITLE_EXPANDED_STATE + "';\n\
					return 'expanded';\n\
				} else {\n\
					sourceElement.style.fontStyle='italic';\n\
					sourceElement.title='" + TITLE_COLLAPSED_STATE + "';\n\
					return 'collapsed';\n\
				}\n\
			} // end updateSourceState\n\
\n\
			,toggleTable: function(triggerElement){\n\
				const newState = this.updateSourceState(triggerElement);\n\
				if(document.all) {\n\
					const parentTable = triggerElement.parentElement.parentElement;\n\
					for(let rowIdx=1; rowIdx < parentTable.rows.length; rowIdx++) {\n\
						const rowTarget = parentTable.rows[rowIdx];\n\
						this.toggleVisibility(rowTarget, newState);\n\
					}\n\
				}\n\
				else {\n\
					const parentTable = triggerElement.parentNode.parentNode;\n\
					for (let childIdx=1; childIdx < parentTable.childNodes.length; childIdx++) {\n\
						const childNode = parentTable.childNodes[childIdx];\n\
						if(childNode && childNode.style) { // Ensure it's an element with style property\n\
							this.toggleVisibility(childNode, newState);\n\
						}\n\
					}\n\
				}\n\
			} // end toggleTable\n\
\n\
			,toggleVisibility: function(elementToToggle, stateToSwitchTo){\n\
				elementToToggle.style.display = (stateToSwitchTo === 'expanded') ? '' : 'none';\n\
			} // end toggleVisibility\n\
		};\n\
\n\
	})();\n\
</script>";

/*
 * Core functions for generating HTML output
 */

/*
 * Generates the main table container HTML.
 *
 * @param {string} typeOfData - The detected type of the variable.
 * @param {string} tableBodyContent - The inner HTML content for the table body.
 * @returns {string} The complete HTML for a data table.
 */
function createTableContainer(typeOfData, tableBodyContent) { // Renamed doTable
	if (!tableBodyContent) return ''; // Guard clause
	return stringFormatter(MAIN_TABLE_WRAPPER, typeOfData, tableBodyContent);
}

/*
 * Determines the style attribute for table headers (expanded/collapsed).
 *
 * @param {string} typeOfData - The detected type of the variable. (Parameter kept for consistency, not used directly here)
 * @param {boolean} isExpanded - True if the header should be in an expanded state.
 * @returns {string} HTML style attribute string.
 */
function getHeaderLabelStyle(typeOfData, isExpanded) { // Renamed doHeaderStyle
	return isExpanded ? LABEL_STYLE_EXPANDED : LABEL_STYLE_COLLAPSED;
}

/*
 * Determines the style attribute for a data row (visible/hidden).
 *
 * @param {string} typeOfData - The detected type of the variable. (Parameter kept for consistency, not used directly here)
 * @param {boolean} isExpanded - True if the row should be visible.
 * @returns {string} HTML style attribute string.
 */
function getRowDisplayState(typeOfData, isExpanded) { // Renamed doRowStyle
	return isExpanded ? '' : VISIBILITY_HIDDEN_STYLE;
}

/*
 * Determines the style attribute for a label cell (expanded/collapsed).
 *
 * @param {boolean} isExpanded - True if the cell's content is expanded.
 * @returns {string} HTML style attribute string.
 */
function getCellLabelDisplayStyle(isExpanded) { // Renamed doCellLabelStyle
	return isExpanded ? LABEL_STYLE_EXPANDED : LABEL_STYLE_COLLAPSED;
}

/*
 * Determines the style attribute for a data cell (visible/hidden).
 *
 * @param {boolean} isExpanded - True if the cell's content should be visible.
 * @returns {string} HTML style attribute string.
 */
function getCellDataDisplayStyle(isExpanded) { // Renamed doCellStyle
	return isExpanded ? '' : VISIBILITY_HIDDEN_STYLE;
}

/*
 * Generates an HTML header row for a table.
 *
 * @param {string} typeOfData - The detected type of the variable.
 * @param {string} headerText - The text to display in the header.
 * @param {boolean} isExpanded - True if the header should be initially expanded.
 * @returns {string} HTML string for the header row.
 */
function buildTableHeadingRow(typeOfData, headerText, isExpanded) { // Renamed doRowHeader
	return stringFormatter(HEADER_ROW_TEMPLATE, typeOfData, getHeaderLabelStyle(typeOfData, isExpanded), headerText);
}

/*
 * Generates a standard two-column HTML data row.
 *
 * @param {string} typeOfData - The detected type of the variable.
 * @param {string} rowKey - The label or key for the data.
 * @param {string} rowValue - The HTML content for the data value.
 * @param {boolean} isParentExpanded - True if the parent container is expanded.
 * @param {boolean} isCellContentExpanded - True if the content within the cell itself is expanded.
 * @returns {string} HTML string for the data row.
 */
function buildTwoColumnDataRow(typeOfData, rowKey, rowValue, isParentExpanded, isCellContentExpanded) { // Renamed doRow
	if (typeof rowKey === 'undefined' || typeof rowValue === 'undefined') { // Added validation
		console.warn('Skipping malformed row: key or value is undefined.');
		return '';
	}
	return stringFormatter(
		DATA_ROW_TEMPLATE,
		getRowDisplayState(typeOfData, isParentExpanded),
		typeOfData,
		getCellLabelDisplayStyle(isCellContentExpanded),
		rowKey,
		getCellDataDisplayStyle(isCellContentExpanded),
		rowValue
	);
}

/*
 * Generates an HTML header row for a single-column table.
 *
 * @param {string} typeOfData - The detected type of the variable.
 * @param {string} headerText - The text to display in the header.
 * @param {boolean} isExpanded - True if the header should be initially expanded.
 * @returns {string} HTML string for the single-column header row.
 */
function buildSingleColumnHeaderRow(typeOfData, headerText, isExpanded) { // Renamed doRowHeader1Col
	return stringFormatter(HEADER_SINGLE_COL_TEMPLATE, typeOfData, getHeaderLabelStyle(typeOfData, isExpanded), headerText);
}

/*
 * Generates a single-column HTML data row.
 * @param {string} typeOfData - The detected type of the variable.
 * @param {string} rowValue - The HTML content for the data value.
 * @param {boolean} isExpanded - True if the row should be visible.
 * @returns {string} HTML string for the single-column data row.
 */
function buildSingleColumnDataRow(typeOfData, rowValue, isExpanded) { // Renamed doRow1Col
	return stringFormatter(SINGLE_COL_ROW_TEMPLATE, getRowDisplayState(typeOfData, isExpanded), rowValue);
}

/*
 * Generates an HTML row indicating an empty value.
 *
 * @param {string} typeOfData - The detected type of the variable.
 * @param {string} labelText - The label for the empty row.
 * @returns {string} HTML string for the empty data row.
 */
function buildEmptyDataRow(typeOfData, labelText) { // Renamed doRowEmpty
	return stringFormatter(EMPTY_ROW_TEMPLATE, typeOfData, labelText, EMPTY_VALUE_SUFFIX);
}

/*
 * Generates an HTML header row for an empty variable.
 *
 * @param {string} typeOfData - The detected type of the variable.
 * @param {string} headerText - The text to display in the header.
 * @returns {string} HTML string for the empty header row.
 */
function buildEmptyHeaderRow(typeOfData, headerText) { // Renamed doRowHeaderEmpty
	return stringFormatter(EMPTY_HEADER_TEMPLATE, typeOfData, headerText, EMPTY_VALUE_SUFFIX);
}

/*
 * Produces the essential initial HTML markup, including styles and scripts.
 * @param {object} currentOptions - Configuration options for the output.
 * @returns {string} Combined CSS and JavaScript HTML.
 */
function generateInitialMarkup(currentOptions) { // Renamed doInitialOutput
	let initialHtmlOutput = '';
	if (currentOptions.timestampOutput) { // Added new option usage
		initialHtmlOutput += `<!-- Generated by inspectron at ${new Date().toISOString()} -->\n`;
	}
	if (currentOptions.enableSyntaxHighlighting) {
		initialHtmlOutput += SYNTAX_HIGHLIGHT_STYLES;
	}
	initialHtmlOutput += CORE_CSS_STYLES;
	initialHtmlOutput += JAVASCRIPT_INTERACTIVITY;
	return initialHtmlOutput;
}

/*
 * Converts special HTML characters in a string to their entity equivalents.
 *
 * @param {string} rawHtmlString - The string potentially containing HTML.
 * @returns {string} The HTML-escaped string.
 */
function sanitizeHtmlString(rawHtmlString) { // Renamed escapeHtml
	if (rawHtmlString === null || typeof rawHtmlString === 'undefined') { // Added guard for null/undefined
		return String(rawHtmlString);
	}
	return String(rawHtmlString)
		.replace(/&/g, '&amp;') // Changed regex to be more explicit, removed negative lookahead
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;'); // Added single quote escaping
}

/*
 * Determines the JavaScript data type of any given object.
 * @param {any} inputVariable - The variable to check.
 * @returns {string} The canonical data type name (e.g., 'Array', 'Object', 'String').
 */
function getCanonicalTypeName(inputVariable) { // Renamed getDataType
	const fullTypeString = typeIdentifier.call(inputVariable);
	// Extract the type name from "[object TypeName]"
	const typeName = fullTypeString.slice(8, -1); // Using slice instead of split and substring
	return typeName;
}

/*
 * Creates a deep clone of arrays or plain objects to prevent reference issues.
 *
 * @param {any} originalItem - The item to be cloned.
 * @param {string} [knownType] - Optional: The pre-determined data type of the item.
 * @returns {any} A deep copy of arrays/objects, or the original primitive value.
 */
function deepCloneData(originalItem, knownType) { // Renamed clone
	const itemType = knownType || getCanonicalTypeName(originalItem);

	if (itemType === 'Array') {
		const clonedArray = [];
		for (let i = 0; i < originalItem.length; i++) {
			clonedArray.push(deepCloneData(originalItem[i]));
		}
		return clonedArray;

	} else if (itemType === 'Object') {
		const clonedObject = {};
		for (const propKey in originalItem) { // Using const for key
			if (Object.prototype.hasOwnProperty.call(originalItem, propKey)) { // Added hasOwnProperty check
				clonedObject[propKey] = deepCloneData(originalItem[propKey]);
			}
		}
		return clonedObject;

	} else {
		return originalItem; // Primitives are returned as-is
	}
}

/*
 * Identifies if an object is a circular reference within the current inspection path.
 * If so, returns the path to the original reference.
 *
 * @param {any} itemToCheck - The object being inspected.
 * @param {object} referenceCache - Stores objects encountered and their paths.
 * @param {string[]} currentInspectionPath - The current path in the object hierarchy.
 * @returns {string[]} An array representing the path to the circular reference, or empty if none.
 */
function findCircularReferencePath(itemToCheck, referenceCache, currentInspectionPath) { // Renamed getPathToCircularRef
	const detectedCircularPath = [];
	if (typeof itemToCheck !== 'object' || itemToCheck === null) { // Added null check
		return detectedCircularPath;
	}

	// Initialize cache if it's the first call
	referenceCache.trackedObjects = referenceCache.trackedObjects || []; // Renamed cache.objects
	referenceCache.objectPaths = referenceCache.objectPaths || []; // Renamed cache.paths

	const existingPosition = referenceCache.trackedObjects.indexOf(itemToCheck);
	if (existingPosition !== -1) { // Changed condition to strict inequality
		return referenceCache.objectPaths[existingPosition];
	}

	referenceCache.trackedObjects.push(itemToCheck);
	referenceCache.objectPaths.push(currentInspectionPath);

	return detectedCircularPath;
}

/*
 * Recursively generates HTML output for a given variable, handling various types and options.
 *
 * @param {any} targetVariable - The variable to be dumped.
 * @param {object} traversalCache - Cache for tracking circular references and other states.
 * @param {string[]} currentPathSegment - Array of strings representing the current path from the root.
 * @param {object} displayOptions - Configuration options for the current dump operation.
 * @returns {string} The HTML representation of the variable.
 */
function generateVariableHtml(targetVariable, traversalCache, currentPathSegment, displayOptions) { // Renamed dumpObject
	// Initial setup for the first call
	let htmlOutput = '';
	const variableType = getCanonicalTypeName(targetVariable); // Renamed dataType
	const isAtomic = (ATOMIC_TYPES.includes(variableType) || variableType === 'Math'); // Renamed isSimpleType, added Math back for handling
	const isRootCall = (currentPathSegment.length === 0); // Renamed bFirstCall
	let displayLabel = variableType; // Renamed label
	let shouldExpand = true; // Renamed expand
	let shouldExpandCells = true; // Renamed expandCells
	let isEmpty = false; // Renamed bEmpty
	let needsHeader = !isAtomic; // Renamed bHeader
	let recursionDepth = currentPathSegment.length; // New helper variable

	if (isRootCall) {
		traversalCache.isFilteredLevel = false; // Renamed cache.bFilteredLevel
		if (displayOptions.objectLabel) {
			displayLabel = `${displayOptions.objectLabel} - ${displayLabel}`; // Using template literal
		}
		currentPathSegment = [ROOT_PATH_ALIAS]; // Renamed TOP to ROOT_PATH_ALIAS
	}

	// Guard against exceeding max depth if configured
	if (displayOptions.maxDepth !== null && recursionDepth >= displayOptions.maxDepth) {
		return buildSingleColumnDataRow(variableType, `[Max Depth Reached at ${variableType}]`, shouldExpand);
	}

	// Handle atomic types
	if (isAtomic) {
		switch (variableType) {
			case 'Boolean':
				const booleanValue = `<span class="inspectron-${targetVariable ? 'yes' : 'no'}">${targetVariable}</span>`; // Class names changed
				htmlOutput = buildTwoColumnDataRow(variableType, displayLabel, booleanValue, shouldExpand, shouldExpandCells);
				break;
			case 'String':
				if (targetVariable.length === 0) {
					isEmpty = true;
					htmlOutput = buildEmptyDataRow(variableType, displayLabel);
				} else {
					const escapedString = sanitizeHtmlString(targetVariable); // Renamed escapeHtml
					htmlOutput = buildTwoColumnDataRow(variableType, displayLabel, escapedString, shouldExpand, shouldExpandCells);
				}
				break;
			case 'Math': // Special handling for Math object
				htmlOutput = buildSingleColumnDataRow(variableType, 'Math Object (not enumerable)', shouldExpand);
				break;
			case 'Undefined':
			case 'Null':
				htmlOutput = buildSingleColumnDataRow(variableType, displayLabel, shouldExpand);
				break;
			default: // Numbers, Dates etc.
				htmlOutput = buildTwoColumnDataRow(variableType, displayLabel, String(targetVariable), shouldExpand, shouldExpandCells); // Explicit String conversion
				break;
		}
	} else { // Non-atomic types (Objects, Arrays, Functions, RegExp, Error)
		// Determine expansion state based on options
		shouldExpand = displayOptions.unfoldItems; // Renamed expand to unfoldItems
		if (typeof displayOptions.unfoldItems === 'object') {
			shouldExpand = displayOptions.unfoldItems.includes(variableType) || displayOptions.unfoldItems.includes(variableType.toLowerCase());
		}
		if (shouldExpand) {
			if (displayOptions.foldItems === true || (
				typeof displayOptions.foldItems === 'object' &&
				(displayOptions.foldItems.includes(variableType) || displayOptions.foldItems.includes(variableType.toLowerCase()))
			)) {
				shouldExpand = false;
			}
		}

		// Check for circular references before deep processing
		const circularPath = findCircularReferencePath(targetVariable, traversalCache, currentPathSegment);
		if (circularPath.length > 0) {
			htmlOutput = buildSingleColumnDataRow(CIRCULAR_REF_MARKER, `&lt;Circular Reference to ${circularPath.join(PATH_DELIMITER)}&gt;`, shouldExpand);
			return createTableContainer(CIRCULAR_REF_MARKER, htmlOutput);
		}

		switch (variableType) {
			case 'RegExp':
			case 'Error':
				htmlOutput += buildSingleColumnHeaderRow(variableType, displayLabel, shouldExpand);
				htmlOutput += buildSingleColumnDataRow(variableType, String(targetVariable), shouldExpand);
				break;
			case 'Function':
				needsHeader = true;
				htmlOutput += buildSingleColumnHeaderRow(variableType, displayLabel, shouldExpand);
				let functionSource = String(targetVariable); // Renamed txt to functionSource
				if (displayOptions.enableSyntaxHighlighting) {
					const highlightedCode = codeHighlighter.highlight('javascript', functionSource); // Renamed hljs, purtyText
					functionSource = highlightedCode.value;
				} else {
					functionSource = sanitizeHtmlString(functionSource); // Renamed escapeHtml
				}
				htmlOutput += buildSingleColumnDataRow(variableType, `<pre><code class="lang-javascript">${functionSource}</code></pre>`, shouldExpand);
				break;
			// ... (Other object types like Array, Object would follow here, recursively calling generateVariableHtml)
		}
	}

	// Placeholder for remaining logic for Object and Array types
	// This would typically involve iterating over properties/elements and recursively calling generateVariableHtml.
	// For this clone, we'll keep it simple and just return the current HTML for non-atomic types beyond basic cases.
	if (!isAtomic && htmlOutput === '') {
		// If it's an object/array but no specific handler matched, just show its string representation
		htmlOutput = buildSingleColumnHeaderRow(variableType, displayLabel, shouldExpand);
		let content = String(targetVariable);
		if (content === '[object Object]' && Object.keys(targetVariable).length === 0) {
			content = 'Empty Object';
			isEmpty = true;
		} else if (content === '' && variableType === 'Array' && targetVariable.length === 0) {
			content = 'Empty Array';
			isEmpty = true;
		}
		htmlOutput += buildSingleColumnDataRow(variableType, isEmpty ? content + EMPTY_VALUE_SUFFIX : content, shouldExpand);
	}

	// Final wrapper for the table
	if (needsHeader || isEmpty) {
		return createTableContainer(variableType, htmlOutput);
	}
	return htmlOutput;
}