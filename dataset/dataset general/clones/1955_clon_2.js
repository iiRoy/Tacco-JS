/*
 * @description visual-output - Presents data in a clear, formatted display, mimicking ColdFusion's CFDUMP
 * @author Avery Harding <avery.harding@example.com>
 *
 */

/*
 *
 * dependencies
 */
// var utilityModule = require('util');
var stringFormatter = require('util').format;
// var stringFormatter = require('text-formatter').stringFormatter;
var codeHighlighter = require('./lib/highlight.js/highlight');

/*
 * configuration values
 */

// Default configuration settings
var DEFAULT_CONFIG = {
	fold: false
	,outputMethodName: 'visualOutput'
	,unfold: true
	,conceal:null
	,concealTypes:null
	,caption:null
	,depths: null
	,reveal:null
	,sortProperties: true
	,codeColoring:true
	,limitDisplay:null
};

// used to ascertain the type of a variable
var typeInspector = {}.toString;

// collection of elementary types
var BASIC_TYPES = ['String','Number','Boolean','Undefined','Null','Date','Math'];

// output-related literal strings
var HTML_TABLE_WRAPPER = '<table class="visual-output visual-output-%s"><tbody>%s</tbody></table>';
var TABLE_HEADER_ROW = '<tr><th colspan="2" class="visual-output-caption visual-output-%s"%s onclick="dataVisualizer.toggleTable(this);">%s</th></tr>';
var DATA_ROW_TEMPLATE = '<tr%s><td class="visual-output-caption visual-output-%s"%s onclick="dataVisualizer.toggleRow(this);">%s</td><td class="visual-output-data"%s>%s</td></tr>';
var SINGLE_COL_HEADER_ROW = '<tr><th class="visual-output-caption visual-output-%s"%s onclick="dataVisualizer.toggleTable(this);">%s</th></tr>';
var SINGLE_COL_DATA_ROW = '<tr%s><td class="visual-output-data">%s</td></tr>';
var EMPTY_INDICATOR = ' [empty]';
var EMPTY_HEADER_ROW = '<tr><th class="visual-output-%s">%s%s</th></tr>';
var EMPTY_DATA_ROW = '<tr><td class="visual-output-%s">%s%s</td></tr>';
var TYPE_ERROR_STATE = 'Error-Occurred';
var CAPTION_UNFOLDED = '';
var CAPTION_FOLDED = '';
var CAPTION_FILTERED = ' [Filtered - %s]';
var CAPTION_FILTERED_SHOWN = '%d of %d items displayed';
var CAPTION_FILTERED_HIDDEN = '%d of %d items concealed';
var CAPTION_FILTERED_TOP = 'Top %d of %d items displayed';
var CAPTION_FILTERED_DEPTHS = '%d levels displayed';
var STYLE_UNFOLDED_LABEL = ' title="' +  CAPTION_UNFOLDED + '"';
var STYLE_FOLDED_LABEL = ' style="font-style: italic;" title="' + CAPTION_FOLDED + '"';
var STYLE_HIDDEN = ' style="display:none"';
var CIRCULAR_REF_MARKER = 'Circular-Link';
var CIRCULAR_SEPARATOR = ' &raquo; ';
var CIRCULAR_PREVIEW_LIMIT = 12;
var ROOT_ELEMENT_LABEL = '[ROOT]';
var HIGHLIGHT_CSS_STYLES = '<style type="text/css">\n'
+'/* Code style (c) Aahan Krish <geekpanth3r@gmail.com>*/\n'
+'td.visual-output-data pre code{display:block;padding:.5em;background:#fff;color:#000}td.visual-output-data pre .comment,td.visual-output-data pre .template_comment,td.visual-output-data pre .javadoc,td.visual-output-data pre .comment *{color:#800}td.visual-output-data pre .keyword,td.visual-output-data pre .method,td.visual-output-data pre .list .title,td.visual-output-data pre .clojure .built_in,td.visual-output-data pre .nginx .title,td.visual-output-data pre .tag .title,td.visual-output-data pre .setting .value,td.visual-output-data pre .winutils,td.visual-output-data pre .tex .command,td.visual-output-data pre .http .title,td.visual-output-data pre .request,td.visual-output-data pre .status{color:#008}td.visual-output-data pre .envvar,td.visual-output-data pre .tex .special{color:#660}td.visual-output-data pre .string,td.visual-output-data pre .tag .value,td.visual-output-data pre .cdata,td.visual-output-data pre .filter .argument,td.visual-output-data pre .attr_selector,td.visual-output-data pre .apache .cbracket,td.visual-output-data pre .date,td.visual-output-data pre .regexp{color:#080}td.visual-output-data pre .sub .identifier,td.visual-output-data pre .pi,td.visual-output-data pre .tag,td.visual-output-data pre .tag .keyword,td.visual-output-data pre .decorator,td.visual-output-data pre .ini .title,td.visual-output-data pre .shebang,td.visual-output-data pre .prompt,td.visual-output-data pre .hexcolor,td.visual-output-data pre .rules .value,td.visual-output-data pre .css .value .number,td.visual-output-data pre .literal,td.visual-output-data pre .symbol,td.visual-output-data pre .ruby .symbol .string,td.visual-output-data pre .number,td.visual-output-data pre .css .function,td.visual-output-data pre .clojure .attribute{color:#066}td.visual-output-data pre .class .title,td.visual-output-data pre .haskell .type,td.visual-output-data pre .smalltalk .class,td.visual-output-data pre .javadoctag,td.visual-output-data pre .yardoctag,td.visual-output-data pre .phpdoc,td.visual-output-data pre .typename,td.visual-output-data pre .tag .attribute,td.visual-output-data pre .doctype,td.visual-output-data pre .class .id,td.visual-output-data pre .built_in,td.visual-output-data pre .setting,td.visual-output-data pre .params,td.visual-output-data pre .variable,td.visual-output-data pre .clojure .title{color:#606}td.visual-output-data pre .css .tag,td.visual-output-data pre .rules .property,td.visual-output-data pre .pseudo,td.visual-output-data pre .subst{color:#000}td.visual-output-data pre .css .class,td.visual-output-data pre .css .id{color:#9B703F}td.visual-output-data pre .value .important{color:#f70;font-weight:700}td.visual-output-data pre .rules .keyword{color:#C5AF75}td.visual-output-data pre .annotation,td.visual-output-data pre .apache .sqbracket,td.visual-output-data pre .nginx .built_in{color:#9B859D}td.visual-output-data pre .preprocessor,td.visual-output-data pre .preprocessor *{color:#444}td.visual-output-data pre .tex .formula{background-color:#EEE;font-style:italic}td.visual-output-data pre .diff .header,td.visual-output-data pre .chunk{color:gray;font-weight:700}td.visual-output-data pre .diff .change{background-color:#BCCFF9}td.visual-output-data pre .addition{background-color:#BAEEBA}td.visual-output-data pre .deletion{background-color:#FFC8BD}td.visual-output-data pre .comment .yardoctag{font-weight:700}'
+'</style>';
var MAIN_CSS_STYLES = '<style type="text/css">\n'
+'/* visual-output base styles */\n'
+ 'table.visual-output, table.visual-output th, table.visual-output td { border-collapse: separate; border-spacing:2px; width: auto; line-height:normal; }\
table.visual-output {\
	font-size: x-small;\
	font-family: verdana, arial, helvetica, sans-serif;\
	cell-spacing: 2px;\
	background-color: #dddddd;\
	color: #222222;\
}\
table.visual-output .visual-output-caption { cursor:pointer; }\
--table.visual-output td, table.visual-output th { background-color: #eeeeee; }\
--table.visual-output { background-color: #aaaaaa; }\
--table.visual-output th { text-align: left; color: white; padding: 5px; background-color: #cccccc; }\
--table.visual-output td { vertical-align : top; padding: 3px; background-color: #eeeeee; }\
table.visual-output { background-color: #707000; }\
table.visual-output th { text-align: left; color: white; padding: 5px; background-color: #ADAD00; }\
table.visual-output td { vertical-align : top; padding: 3px; background-color: #FFFF9E; }\
\n\
table.visual-output td.visual-output-data { background-color: #ffffff; }\
table.visual-output td.visual-output-data pre { line-height:normal; background-color: #ffffff; border:0; padding:0; }\n\
table.visual-output td.visual-output-data pre code { font-size: small; font-family: Consolas, Menlo, Monaco, Lucida Console, monospace; Courier New, monospace, serif; }\n\
\n\
table.visual-output-String { background-color: #888888; }\
table.visual-output-String td.visual-output-String { background-color: #dddddd; }\
table.visual-output-Number { background-color: #FF8833; }\
table.visual-output-Number td.visual-output-Number { background-color: #FFB885; }\
table.visual-output-Boolean { background-color : #eebb00; }\
table.visual-output-Boolean td.visual-output-Boolean { background-color: #FFDA75; }\
table.visual-output-Boolean td.visual-output-data span.visual-output-no { color: #aa0000; }\
table.visual-output-Boolean td.visual-output-data span.visual-output-yes { color: #008800; }\
table.visual-output-Date { background-color: #CE8D98; }\
table.visual-output-Date td.visual-output-Date { background-color: #ffcbd4; }\
table.visual-output-Math td.visual-output-data { color: white; font-weight: bold; background-color: #ADAD00; }\
table.visual-output-Null, table.visual-output-Undefined { background-color: #333333; }\
table.visual-output-Null td.visual-output-data, table.visual-output-Undefined td.visual-output-data { color:#ffffff; background-color: #333333; }\
\n\
table.visual-output-Object {	background-color: #0000cc; }\
table.visual-output-Object th.visual-output-Object { background-color: #4444cc; }\
table.visual-output-Object td.visual-output-Object { background-color: #ccddff; }\
\n\
table.visual-output-Array { background-color: #006600; }\
table.visual-output-Array th.visual-output-Array { background-color: #009900; }\
table.visual-output-Array td.visual-output-Array { background-color: #ccffcc; }\
table.visual-output-Function { background-color: #aa4400; }\
table.visual-output-Function th.visual-output-Function { background-color: #cc6600; }\
table.visual-output-RegExp { background-color: #884488; }\
table.visual-output-RegExp th.visual-output-RegExp { background-color: #aa66aa; }\
table.visual-output-RegExp td.visual-output-RegExp { background-color: #ffddff; }\
table.visual-output-Error { background-color: #CC3300; }\
table.visual-output-Error th.visual-output-Error { background-color: #CC3300; }\
table.visual-output-'+CIRCULAR_REF_MARKER+', table.visual-output-'+TYPE_ERROR_STATE+' { background-color: #333333; }\
table.visual-output-'+CIRCULAR_REF_MARKER+' td.visual-output-'+CIRCULAR_REF_MARKER+', table.visual-output-'+TYPE_ERROR_STATE+' th.visual-output-'+TYPE_ERROR_STATE+' { background-color: #333333; }\
table.visual-output-'+CIRCULAR_REF_MARKER+' td.visual-output-caption { color: #ffffff; }\n\
</style>';

var TOGGLE_SCRIPT = "<script type=\"text/javascript\">\n\
	// inspired by CFDump's JS functionality\n\
	var dataVisualizer;\n\
	dataVisualizer = (function(){\n\
		var visualStyle;\n\
		return {\n\
			toggleRow: function(triggerElement){\n\
				var affectedElement = (document.all) ? triggerElement.parentElement.cells[1] : triggerElement.parentNode.lastChild;\n\
				this.controlVisibility(affectedElement,this.updateTriggerState(triggerElement));\n\
			} // end toggleRow\n\
\n\
			,updateTriggerState: function(triggerElement){\n\
				if (triggerElement.style.fontStyle == 'italic') {\n\
					triggerElement.style.fontStyle='normal';\n\
					triggerElement.title='" + CAPTION_UNFOLDED + "';\n\
					return 'open';\n\
				} else {\n\
					triggerElement.style.fontStyle='italic';\n\
					triggerElement.title='" + CAPTION_FOLDED + "';\n\
					return 'closed';\n\
				}\n\
			} // end updateTriggerState\n\
\n\
			,toggleTable: function(triggerElement){\n\
				var newDisplayState=this.updateTriggerState(triggerElement);\n\
				if(document.all) {\n\
					var containerTable=triggerElement.parentElement.parentElement;\n\
					for(var idx=1;idx<containerTable.rows.length;idx++) {\n\
						affectedElement=containerTable.rows[idx];\n\
						this.controlVisibility(affectedElement,newDisplayState);\n\
					}\n\
				}\n\
				else {\n\
					var containerTable=triggerElement.parentNode.parentNode;\n\
					for (var idx=1;idx<containerTable.childNodes.length;idx++) {\n\
						affectedElement=containerTable.childNodes[idx];\n\
						if(affectedElement.style) {\n\
							this.controlVisibility(affectedElement,newDisplayState);\n\
						}\n\
					}\n\
				}\n\
			} // end toggleTable\n\
\n\
			,controlVisibility: function(affectedElement,newDisplayState){\n\
				affectedElement.style.display = (newDisplayState == 'open') ? '' : 'none';\n\
			} // end controlVisibility\n\
		};\n\
\n\
	})();\n\
</script>";

/*
 * Functions responsible for generating the visual output
 */

/*
 * Produces the HTML table structure.
 *
 * @param {string} typeId - The data type identifier.
 * @param {string} contentHtml - The inner HTML body for the table.
 * @returns {string} The complete HTML table string.
 */
function createTableMarkup(typeId, contentHtml){
    return stringFormatter(HTML_TABLE_WRAPPER, typeId, contentHtml);
}

/*
 * Constructs the style attribute for table headers.
 *
 * @param {string} itemType - The type of the item.
 * @param {Boolean} isExpanded - Indicates if the header should be expanded.
 * @returns {String|STYLE_UNFOLDED_LABEL|STYLE_FOLDED_LABEL} The style attribute string.
 */
function generateHeaderStyleAttr(itemType, isExpanded){
	return isExpanded ? STYLE_UNFOLDED_LABEL : STYLE_FOLDED_LABEL;
}

/*
 * Constructs the style attribute for a table row.
 *
 * @param {string} itemType - The type of the item.
 * @param {Boolean} isExpanded - Indicates if the row should be expanded.
 * @returns {STYLE_HIDDEN|String} The style attribute string.
 */
function generateRowStyleAttr(itemType, isExpanded){
	return isExpanded ? '' : STYLE_HIDDEN;
}

/*
 * Constructs the style attribute for a label cell.
 *
 * @param {Boolean} isExpanded - Indicates if the cell's content should be expanded.
 * @returns {String|STYLE_FOLDED_LABEL|STYLE_UNFOLDED_LABEL} The style attribute string.
 */
function generateLabelCellStyleAttr(isExpanded){
	return isExpanded ? STYLE_UNFOLDED_LABEL : STYLE_FOLDED_LABEL;
}

/*
 * Constructs the style attribute for a data cell.
 *
 * @param {Boolean} isExpanded - Indicates if the cell's content should be expanded.
 * @returns {String|STYLE_HIDDEN} The style attribute string.
 */
function generateDataCellStyleAttr(isExpanded){
	return isExpanded ? '' : STYLE_HIDDEN;
}

/*
 * Creates the header row of a table.
 *
 * @param {string} itemType - The data type.
 * @param {string} headerContent - The content for the header cell.
 * @param {Boolean} isExpanded - Indicates if the header should be expanded.
 * @returns {string} The HTML string for the header row.
 */
function createHeaderRowMarkup(itemType, headerContent, isExpanded){
	return stringFormatter(TABLE_HEADER_ROW, itemType, generateHeaderStyleAttr(itemType, isExpanded), headerContent);
}

/*
 * Creates a standard two-column data row.
 *
 * @param {string} itemType - The data type.
 * @param {string} propertyKey - The key/label for the data.
 * @param {string} valueContent - The data value content.
 * @param {Boolean} isExpanded - Indicates if the row should be expanded.
 * @param {Boolean} isCellExpanded - Indicates if the cell's content should be expanded.
 * @returns {string} The HTML string for the data row.
 */
function createDataRowMarkup(itemType, propertyKey, valueContent, isExpanded, isCellExpanded){
    return stringFormatter(
		DATA_ROW_TEMPLATE
		, generateRowStyleAttr(itemType, isExpanded)
		, itemType
		, generateLabelCellStyleAttr(isCellExpanded)
		, propertyKey
		, generateDataCellStyleAttr(isCellExpanded)
		, valueContent
	);
}

/*
 * Creates the header row for a single-column table.
 *
 * @param {string} itemType - The data type.
 * @param {string} headerContent - The content for the header cell.
 * @param {Boolean} isExpanded - Indicates if the header should be expanded.
 * @returns {string} The HTML string for the single-column header row.
 */
function createSingleColHeaderRowMarkup(itemType, headerContent, isExpanded){
    return stringFormatter(SINGLE_COL_HEADER_ROW, itemType, generateHeaderStyleAttr(itemType, isExpanded), headerContent);
}

/*
 * Creates a single-column data row.
 * @param {string} itemType - The data type.
 * @param {string} valueContent - The data value content.
 * @param {Boolean} isExpanded - Indicates if the row should be expanded.
 * @returns {string} The HTML string for the single-column data row.
 */
function createSingleColDataRowMarkup(itemType, valueContent, isExpanded){
    return stringFormatter(SINGLE_COL_DATA_ROW, generateRowStyleAttr(itemType, isExpanded), valueContent);
}

/*
 * Creates an empty data row.
 *
 * @param {string} itemType - The data type.
 * @param {string} emptyLabel - The label indicating emptiness.
 * @returns {string} The HTML string for the empty row.
 */
function createEmptyRowMarkup(itemType, emptyLabel){
    return stringFormatter(EMPTY_DATA_ROW, itemType, emptyLabel, EMPTY_INDICATOR);
}

/*
 * Creates an empty header row for variables.
 *
 * @param {string} itemType - The data type.
 * @param {string} emptyLabel - The label indicating emptiness.
 * @returns {string} The HTML string for the empty header row.
 */
function createEmptyHeaderRowMarkup(itemType, emptyLabel){
    return stringFormatter(EMPTY_HEADER_ROW, itemType, emptyLabel, EMPTY_INDICATOR);
}

/*
 * Generates the initial markup required for the output.
 * @param {object} configSettings - Configuration options.
 * @returns {MAIN_CSS_STYLES|TOGGLE_SCRIPT|HIGHLIGHT_CSS_STYLES|String} The concatenated HTML/CSS/JS.
 */
function prepareInitialHtml(configSettings){
    return (configSettings.codeColoring? HIGHLIGHT_CSS_STYLES : '') + MAIN_CSS_STYLES + TOGGLE_SCRIPT;
}

/*
 * Escapes HTML characters in a string to prevent XSS.
 *
 * @param {string} rawHtml - The raw HTML string.
 * @returns {string} The sanitized HTML string.
 */
function sanitizeHtmlString(rawHtml){
    return String(rawHtml)
			.replace(/&(?!\w+;)/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;');
};

/*
 * Determines the precise data type of any given variable.
 * @param {any} inputVar - The variable to inspect.
 * @returns {string} The determined data type (e.g., 'String', 'Array', 'Object').
 */
function determineVariableType(inputVar){
	var itemType = typeInspector.call( inputVar );
	itemType = itemType.split(' ')[1];
	itemType = itemType.substring(0, itemType.length-1);

	return itemType;
}

/*
 * Creates a deep copy of variables to prevent unintended reference modifications.
 *
 * @param {any} originalItem - The item to be cloned.
 * @param {optional|string} [itemType] - The data type of the item (optional, will be determined if not provided).
 * @returns {clone.newArray|Array|clone.originalItem} The deep-copied item.
 */
function deepCopy(originalItem, itemType){
	if(!itemType)
		itemType = determineVariableType(originalItem);

	if(itemType == 'Array'){
		var copiedArray = [];
		for(var idx = 0; idx < originalItem.length; idx++)
			copiedArray.push(originalItem[idx]);

		return copiedArray;

	} else if(itemType == 'Object') {
		var copiedObject = {};
		for(var propKey in originalItem)
			copiedObject[propKey] = deepCopy(originalItem[propKey]);

		return copiedObject;

	} else
		return originalItem;
}

/*
 * Identifies and returns the path to an original variable if the current one is a circular reference.
 *
 * @param {any} currentItem - The object being currently processed.
 * @param {object} referenceCache - Cache of visited objects and their paths.
 * @param {array} tracePath - The current path to the object.
 * @returns {Array} An array representing the path to the circular reference, or empty if not circular.
 */
function findCircularReferencePath(currentItem, referenceCache, tracePath){
	var circularReferencePath = [];
	if(typeof currentItem != 'object')
		return circularReferencePath;

	if(!referenceCache.objects){
		referenceCache.objects = [];
		referenceCache.paths = [];
	}
	var positionIndex = referenceCache.objects.indexOf(currentItem);
	if(positionIndex >= 0)
		circularReferencePath = referenceCache.paths[positionIndex];

	referenceCache.objects.push(currentItem);
	referenceCache.paths.push(tracePath);

	return circularReferencePath;
}

/*
 * Recursively processes and renders variable output into HTML.
 *
 * @param {any} targetObject - The object to be processed.
 * @param {objects} visitedRefs - Cache for circular reference detection.
 * @param {array} objectPath - The current path to the object within the data structure.
 * @param {objects} renderOptions - Rendering configuration options.
 * @returns {string} The generated HTML output for the object.
 */
function processAndRenderObject(targetObject, visitedRefs, objectPath, renderOptions){
	// perform this on the very first invocation
	var outputContent = '';
	var itemType = determineVariableType(targetObject);
	var isBasicKind = (BASIC_TYPES.indexOf(itemType) >= 0);
	var isInitialCall = (objectPath.length == 0);
	var displayLabel = itemType;
	var shouldExpand = true;
	var shouldExpandCells = true;

	if(isInitialCall){
		var rootPathIndicator = ROOT_ELEMENT_LABEL;
		visitedRefs.bFilteredLevel = false;
		if(renderOptions.caption){
			displayLabel = renderOptions.caption + ' - ' + displayLabel;
			/*rootPathIndicator += ' ' + renderOptions.caption;
			if(rootPathIndicator.length > CIRCULAR_PREVIEW_LIMIT)
				rootPathIndicator = rootPathIndicator.substr(0, CIRCULAR_PREVIEW_LIMIT) + '...';
			rootPathIndicator += ' - ' + itemType;*/
		}
		objectPath = [rootPathIndicator];
	}

	var isEmpty = false;
	var hasHeader = !isBasicKind;

	if(isBasicKind){ // Elementary data types

		switch(itemType){
			case 'Boolean':
				var displayValue = '<span class="'+(targetObject ? 'visual-output-yes' : 'visual-output-no')+'">' + targetObject + '</span>';
				outputContent = createDataRowMarkup(itemType, displayLabel, displayValue, shouldExpand, shouldExpandCells);
			break;
			case 'String':
				if(targetObject.length === 0)
					isEmpty = true;
				else {
					var displayValue = sanitizeHtmlString(targetObject);
					//var displayValue = '<pre><code class="lang-html">' + codeHighlighter.highlight('xml', targetObject).value + '</code></pre>';
					outputContent = createDataRowMarkup(itemType, displayLabel, displayValue, shouldExpand, shouldExpandCells);
				}
			break;
			case 'Math':
			case 'Undefined':
			case 'Null':
				outputContent = createSingleColDataRowMarkup(itemType, displayLabel, shouldExpand);
			break;
			default:
				outputContent = createDataRowMarkup(itemType, displayLabel, targetObject.toString(), shouldExpand, shouldExpandCells);
			break;
		}

	} else { // Complex data types

		// determine if it should be unfolded/folded
		shouldExpand = renderOptions.unfold;
		if(typeof renderOptions.unfold == 'object'){
			shouldExpand = shouldExpand.indexOf(itemType) > -1 || shouldExpand.indexOf(itemType.toLowerCase()) > -1;
		}
		if(shouldExpand){
			if(renderOptions.fold == true || (
					typeof renderOptions.fold == 'object'
					&& (renderOptions.fold.indexOf(itemType) > -1 || renderOptions.fold.indexOf(itemType.toLowerCase()) > -1)
				)
			)
				shouldExpand = false;
		}

		switch(itemType){
			case 'RegExp':
			case 'Error':
				outputContent += createSingleColHeaderRowMarkup(itemType, displayLabel, shouldExpand);
				outputContent += createSingleColDataRowMarkup(itemType, targetObject.toString(), shouldExpand);
			break;
			case 'Function':
				hasHeader = true;
				outputContent += createSingleColHeaderRowMarkup(itemType, displayLabel, shouldExpand);
				var codeText = targetObject.toString();
				if(renderOptions.codeColoring){
					var formattedCode = codeHighlighter.highlight('javascript', codeText);
					//var formattedCode = codeHighlighter.highlightAuto(codeText);
					codeText = formattedCode.value;
				} else {
					var codeText = sanitizeHtmlString(targetObject.toString());
				}

				outputContent += createSingleColDataRowMarkup(itemType, '<pre><code class="lang-javascript">'+codeText+'</code></pre>', shouldExpand);
				//outputContent += createSingleColDataRowMarkup(itemType, '<pre><code>'+sanitizeHtmlString(targetObject.toString())+'</code></pre>', shouldExpand);