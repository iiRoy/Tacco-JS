/*
*
* @description nodedump - Outputs variables in a visual, easy to read format based on ColdFusion's CFDUMP tag
* @author Andrew Hewitt <ragamufin@gmail.com>
*
*/

//
// requires
//
var format = require('util').format; // Using util.format for string formatting
var hljs = require('./lib/highlight.js/highlight'); // Syntax highlighting library

/*
*
* constants
*
*/

// Default configuration options for nodedump
var DEFAULTOPTS = {
    collapse: false,
    dumpFunctionName: 'nodedump',
    expand: true,
    hide: null,
    hideTypes: null,
    label: null,
    levels: null,
    show: null,
    sortKeys: true,
    syntaxHighlight: true,
    top: null
};

// Internal utility for determining object class type
var toClass = {}.toString;

// List of data types considered 'simple' for direct output
var SIMPLETYPES = ['String', 'Number', 'Boolean', 'Undefined', 'Null', 'Date', 'Math'];

// HTML output constants for table structure
var TABLE = '<table class="nodedump nodedump-%s"><tbody>%s</tbody></table>';
var ROWHEADER = '<tr><th colspan="2" class="nodedump-label nodedump-%s"%s onclick="nodedump.toggleTable(this);">%s</th></tr>';
var ROW = '<tr%s><td class="nodedump-label nodedump-%s"%s onclick="nodedump.toggleRow(this);">%s</td><td class="nodedump-data"%s>%s</td></tr>';
var ROWHEADER1COL = '<tr><th class="nodedump-label nodedump-%s"%s onclick="nodedump.toggleTable(this);">%s</th></tr>';
var ROW1COL = '<tr%s><td class="nodedump-data">%s</td></tr>';
var EMPTY = ' [empty]';
var ROWHEADEREMPTY = '<tr><th class="nodedump-%s">%s%s</th></tr>';
var ROWEMPTY = '<tr><td class="nodedump-%s">%s%s</td></tr>';

// Error data type constant
var ERRORDATATYPE = 'Error-thrown';

// Title constants for expanded/collapsed states
var TITLEEXPANDED = '';
var TITLECOLLAPSED = '';
var TITLEFILTERED = ' [Filtered - %s]';
var TITLEFILTEREDSHOWN = '%d of %d items shown';
var TITLEFILTEREDHIDDEN = '%d of %d items hidden';
var TITLEFILTEREDTOP = 'Top %d of %d items shown';
var TITLEFILTEREDLEVELS = '%d levels shown';

// Styles for expanded/collapsed labels and rows
var EXPANDEDLABELSTYLE = ' title="' + TITLEEXPANDED + '"';
var COLLAPSEDLABELSTYLE = ' style="font-style: italic;" title="' + TITLECOLLAPSED + '"';
var COLLAPSEDSTYLE = ' style="display:none"';

// Constants for circular references
var CIRCULARREFERENCE = 'Circular-Reference';
var CIRCULARSPLITSTRING = ' &raquo; ';
var CIRCULARTOPSTRINGLIMIT = 12;
var TOP = '[TOP]';

// CSS for syntax highlighting (Google Code style)
var SYNTAXHIGHLIGHTCSS = '<style type="text/css">\n'
    + '/* Google Code style (c) Aahan Krish <geekpanth3r@gmail.com>*/\n'
    + 'td.nodedump-data pre code{display:block;padding:.5em;background:#fff;color:#000}td.nodedump-data pre .comment,td.nodedump-data pre .template_comment,td.nodedump-data pre .javadoc,td.nodedump-data pre .comment *{color:#800}td.nodedump-data pre .keyword,td.nodedump-data pre .method,td.nodedump-data pre .list .title,td.nodedump-data pre .clojure .built_in,td.nodedump-data pre .nginx .title,td.nodedump-data pre .tag .title,td.nodedump-data pre .setting .value,td.nodedump-data pre .winutils,td.nodedump-data pre .tex .command,td.nodedump-data pre .http .title,td.nodedump-data pre .request,td.nodedump-data pre .status{color:#008}td.nodedump-data pre .envvar,td.nodedump-data pre .tex .special{color:#660}td.nodedump-data pre .string,td.nodedump-data pre .tag .value,td.nodedump-data pre .cdata,td.nodedump-data pre .filter .argument,td.nodedump-data pre .attr_selector,td.nodedump-data pre .apache .cbracket,td.nodedump-data pre .date,td.nodedump-data pre .regexp{color:#080}td.nodedump-data pre .sub .identifier,td.nodedump-data pre .pi,td.nodedump-data pre .tag,td.nodedump-data pre .tag .keyword,td.nodedump-data pre .decorator,td.nodedump-data pre .ini .title,td.nodedump-data pre .shebang,td.nodedump-data pre .prompt,td.nodedump-data pre .hexcolor,td.nodedump-data pre .rules .value,td.nodedump-data pre .css .value .number,td.nodedump-data pre .literal,td.nodedump-data pre .symbol,td.nodedump-data pre .ruby .symbol .string,td.nodedump-data pre .number,td.nodedump-data pre .css .function,td.nodedump-data pre .clojure .attribute{color:#066}td.nodedump-data pre .class .title,td.nodedump-data pre .haskell .type,td.nodedump-data pre .smalltalk .class,td.nodedump-data pre .javadoctag,td.nodedump-data pre .yardoctag,td.nodedump-data pre .phpdoc,td.nodedump-data pre .typename,td.nodedump-data pre .tag .attribute,td.nodedump-data pre .doctype,td.nodedump-data pre .class .id,td.nodedump-data pre .built_in,td.nodedump-data pre .setting,td.nodedump-data pre .params,td.nodedump-data pre .variable,td.nodedump-data pre .clojure .title{color:#606}td.nodedump-data pre .css .tag,td.nodedump-data pre .rules .property,td.nodedump-data pre .pseudo,td.nodedump-data pre .subst{color:#000}td.nodedump-data pre .css .class,td.nodedump-data pre .css .id{color:#9B703F}td.nodedump-data pre .value .important{color:#f70;font-weight:700}td.nodedump-data pre .rules .keyword{color:#C5AF75}td.nodedump-data pre .annotation,td.nodedump-data pre .apache .sqbracket,td.nodedump-data pre .nginx .built_in{color:#9B859D}td.nodedump-data pre .preprocessor,td.nodedump-data pre .preprocessor *{color:#444}td.nodedump-data pre .tex .formula{background-color:#EEE;font-style:italic}td.nodedump-data pre .diff .header,td.nodedump-data pre .chunk{color:gray;font-weight:700}td.nodedump-data pre .diff .change{background-color:#BCCFF9}td.nodedump-data pre .addition{background-color:#BAEEBA}td.nodedump-data pre .deletion{background-color:#FFC8BD}td.nodedump-data pre .comment .yardoctag{font-weight:700}'
    + '</style>';

// Main CSS for nodedump tables
var CSS = '<style type="text/css">\n'
    + '/* nodedump styles */\n'
    + 'table.nodedump, table.nodedump th, table.nodedump td { border-collapse: separate; border-spacing:2px; width: auto; line-height:normal; }\
table.nodedump {\
	font-size: x-small;\
	font-family: verdana, arial, helvetica, sans-serif;\
	cell-spacing: 2px;\
	background-color: #dddddd;\
	color: #222222;\
}\
table.nodedump .nodedump-label { cursor:pointer; }\
--table.nodedump td, table.nodedump th { background-color: #eeeeee; }\
--table.nodedump { background-color: #aaaaaa; }\
--table.nodedump th { text-align: left; color: white; padding: 5px; background-color: #cccccc; }\
--table.nodedump td { vertical-align : top; padding: 3px; background-color: #eeeeee; }\
table.nodedump { background-color: #707000; }\
table.nodedump th { text-align: left; color: white; padding: 5px; background-color: #ADAD00; }\
table.nodedump td { vertical-align : top; padding: 3px; background-color: #FFFF9E; }\
\n\
table.nodedump td.nodedump-data { background-color: #ffffff; }\
table.nodedump td.nodedump-data pre { line-height:normal; background-color: #ffffff; border:0; padding:0; }\n\
table.nodedump td.nodedump-data pre code { font-size: small; font-family: Consolas, Menlo, Monaco, Lucida Console, monospace; Courier New, monospace, serif; }\n\
\n\
table.nodedump-String { background-color: #888888; }\
table.nodedump-String td.nodedump-String { background-color: #dddddd; }\
table.nodedump-Number { background-color: #FF8833; }\
table.nodedump-Number td.nodedump-Number { background-color: #FFB885; }\
table.nodedump-Boolean { background-color : #eebb00; }\
table.nodedump-Boolean td.nodedump-Boolean { background-color: #FFDA75; }\
table.nodedump-Boolean td.nodedump-data span.nodedump-no { color: #aa0000; }\
table.nodedump-Boolean td.nodedump-data span.nodedump-yes { color: #008800; }\
table.nodedump-Date { background-color: #CE8D98; }\
table.nodedump-Date td.nodedump-Date { background-color: #ffcbd4; }\
table.nodedump-Math td.nodedump-data { color: white; font-weight: bold; background-color: #ADAD00; }\
table.nodedump-Null, table.nodedump-Undefined { background-color: #333333; }\
table.nodedump-Null td.nodedump-data, table.nodedump-Undefined td.nodedump-data { color:#ffffff; background-color: #333333; }\
\n\
table.nodedump-Object {	background-color: #0000cc; }\
table.nodedump-Object th.nodedump-Object { background-color: #4444cc; }\
table.nodedump-Object td.nodedump-Object { background-color: #ccddff; }\
\n\
table.nodedump-Array { background-color: #006600; }\
table.nodedump-Array th.nodedump-Array { background-color: #009900; }\
table.nodedump-Array td.nodedump-Array { background-color: #ccffcc; }\
table.nodedump-Function { background-color: #aa4400; }\
table.nodedump-Function th.nodedump-Function { background-color: #cc6600; }\
table.nodedump-RegExp { background-color: #884488; }\
table.nodedump-RegExp th.nodedump-RegExp { background-color: #aa66aa; }\
table.nodedump-RegExp td.nodedump-RegExp { background-color: #ffddff; }\
table.nodedump-Error { background-color: #CC3300; }\
table.nodedump-Error th.nodedump-Error { background-color: #CC3300; }\
table.nodedump-' + CIRCULARREFERENCE + ', table.nodedump-' + ERRORDATATYPE + ' { background-color: #333333; }\
table.nodedump-' + CIRCULARREFERENCE + ' td.nodedump-' + CIRCULARREFERENCE + ', table.nodedump-' + ERRORDATATYPE + ' th.nodedump-' + ERRORDATATYPE + ' { background-color: #333333; }\
table.nodedump-' + CIRCULARREFERENCE + ' td.nodedump-label { color: #ffffff; }\n\
</style>';

// JavaScript for toggling table and row visibility
var JS = "<script type=\"text/javascript\">\n\
	// based on CFDump's js\n\
	var nodedump;\n\
	nodedump = (function(){\n\
		var style;\n\
		return {\n\
			toggleRow: function(source){\n\
				var target = (document.all) ? source.parentElement.cells[1] : source.parentNode.lastChild;\n\
				this.toggleTarget(target,this.toggleSource(source));\n\
			} // end toggleRow\n\
\n\
			,toggleSource: function(source){\n\
				if (source.style.fontStyle == 'italic') {\n\
					source.style.fontStyle='normal';\n\
					source.title='" + TITLEEXPANDED + "';\n\
					return 'open';\n\
				} else {\n\
					source.style.fontStyle='italic';\n\
					source.title='" + TITLECOLLAPSED + "';\n\
					return 'closed';\n\
				}\n\
			} // end toggleSource\n\
\n\
			,toggleTable: function(source){\n\
				var switchToState=this.toggleSource(source);\n\
				if(document.all) {\n\
					var table=source.parentElement.parentElement;\n\
					for(var i=1;i<table.rows.length;i++) {\n\
						target=table.rows[i];\n\
						this.toggleTarget(target,switchToState);\n\
					}\n\
				}\n\
				else {\n\
					var table=source.parentNode.parentNode;\n\
					for (var i=1;i<table.childNodes.length;i++) {\n\
						target=table.childNodes[i];\n\
						if(target.style) {\n\
							this.toggleTarget(target,switchToState);\n\
						}\n\
					}\n\
				}\n\
			} // end toggleTable\n\
\n\
			,toggleTarget: function(target,switchToState){\n\
				target.style.display = (switchToState == 'open') ? '' : 'none';\n\
			} // end toggleTarget\n\
		};\n\
\n\
	})();\n\
</script>";

/*
 * Methods for building the output HTML
 */

/*
 * Creates an HTML table string.
 *
 * @param {string} dataType The data type for styling the table.
 * @param {string} data The inner HTML content for the table body.
 * @returns {string} The formatted HTML table.
 */
function doTable(dataType, data) {
    return format(TABLE, dataType, data);
}

/*
 * Builds the style attribute for table headers, determining if it should be expanded or collapsed.
 *
 * @param {string} dataType The data type (currently unused but kept for consistency).
 * @param {Boolean} expand Flag indicating whether the header should be expanded.
 * @returns {String} The appropriate style string (EXPANDEDLABELSTYLE or COLLAPSEDLABELSTYLE).
 */
function doHeaderStyle(dataType, expand) {
    return expand ? EXPANDEDLABELSTYLE : COLLAPSEDLABELSTYLE;
}

/*
 * Builds the style attribute for a table row, determining its visibility.
 *
 * @param {string} dataType The data type (currently unused but kept for consistency).
 * @param {Boolean} expand Flag indicating whether the row should be expanded (visible).
 * @returns {String} The appropriate style string (empty or COLLAPSEDSTYLE).
 */
function doRowStyle(dataType, expand) {
    return expand ? '' : COLLAPSEDSTYLE;
}

/*
 * Builds the style attribute for a label cell.
 *
 * @param {Boolean} expand Flag indicating whether the cell's content is expanded.
 * @returns {String} The appropriate style string (EXPANDEDLABELSTYLE or COLLAPSEDLABELSTYLE).
 */
function doCellLabelStyle(expand) {
    return expand ? EXPANDEDLABELSTYLE : COLLAPSEDLABELSTYLE;
}

/*
 * Builds the style attribute for a data cell.
 *
 * @param {Boolean} expand Flag indicating whether the cell should be visible.
 * @returns {String} The appropriate style string (empty or COLLAPSEDSTYLE).
 */
function doCellStyle(expand) {
    return expand ? '' : COLLAPSEDSTYLE;
}

/*
 * Builds a two-column header row for a table.
 *
 * @param {string} dataType The data type for styling.
 * @param {string} data The content for the header.
 * @param {Boolean} expand Flag for initial expansion state.
 * @returns {string} The formatted HTML table header row.
 */
function doRowHeader(dataType, data, expand) {
    return format(ROWHEADER, dataType, doHeaderStyle(dataType, expand), data);
}

/*
 * Builds a standard two-column table row.
 *
 * @param {string} dataType The data type for styling.
 * @param {string} key The label/key for the row.
 * @param {string} data The value/data for the row.
 * @param {Boolean} expand Flag for initial row visibility.
 * @param {Boolean} expandCell Flag for initial label cell expansion state.
 * @returns {string} The formatted HTML table row.
 */
function doRow(dataType, key, data, expand, expandCell) {
    return format(
        ROW,
        doRowStyle(dataType, expand),
        dataType,
        doCellLabelStyle(expandCell),
        key,
        doCellStyle(expandCell),
        data
    );
}

/*
 * Builds a one-column header row for a table.
 *
 * @param {string} dataType The data type for styling.
 * @param {string} data The content for the header.
 * @param {Boolean} expand Flag for initial expansion state.
 * @returns {string} The formatted HTML table header row (1 column).
 */
function doRowHeader1Col(dataType, data, expand) {
    return format(ROWHEADER1COL, dataType, doHeaderStyle(dataType, expand), data);
}

/*
 * Builds a one-column table row.
 * @param {string} dataType The data type for styling.
 * @param {string} data The content for the row.
 * @param {Boolean} expand Flag for initial row visibility.
 * @returns {string} The formatted HTML table row (1 column).
 */
function doRow1Col(dataType, data, expand) {
    return format(ROW1COL, doRowStyle(dataType, expand), data);
}

/*
 * Builds an empty table row (for simple types with no value).
 *
 * @param {string} dataType The data type for styling.
 * @param {string} data The content for the row.
 * @returns {string} The formatted HTML empty row.
 */
function doRowEmpty(dataType, data) {
    return format(ROWEMPTY, dataType, data, EMPTY);
}

/*
 * Builds a header row for empty variables.
 *
 * @param {string} dataType The data type for styling.
 * @param {string} data The content for the header.
 * @returns {string} The formatted HTML empty header row.
 */
function doRowHeaderEmpty(dataType, data) {
    return format(ROWHEADEREMPTY, dataType, data, EMPTY);
}

/*
 * Outputs the initial markup necessary, including CSS and JavaScript.
 *
 * @param {object} options Configuration options, specifically for syntax highlighting.
 * @returns {string} Combined CSS and JS strings.
 */
function doInitialOutput(options) {
    return (options.syntaxHighlight ? SYNTAXHIGHLIGHTCSS : '') + CSS + JS;
}

/*
 * Encodes HTML special characters in a string to prevent XSS and display raw HTML.
 *
 * @param {string} html The string to be HTML-escaped.
 * @returns {string} The HTML-escaped string.
 */
function escapeHtml(html) {
    return String(html)
        .replace(/&(?!\w+;)/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

/*
 * Determines the JavaScript data type of an object.
 *
 * @param {any} obj The object to check.
 * @returns {string} The data type as a string (e.g., 'Array', 'Object', 'String').
 */
function getDataType(obj) {
    var dataType = toClass.call(obj);
    dataType = dataType.split(' ')[1];
    dataType = dataType.substring(0, dataType.length - 1);

    return dataType;
}

/*
 * Clones variables to prevent pass-by-reference issues for objects and arrays.
 * Simple types are returned directly.
 *
 * @param {any} orig The original variable to clone.
 * @param {string} [dataType] Optional: The data type of 'orig', if already known.
 * @returns {any} A clone of the original variable.
 */
function clone(orig, dataType) {
    if (!dataType) {
        dataType = getDataType(orig);
    }

    if (dataType == 'Array') {
        var newArray = [];
        for (var i = 0; i < orig.length; i++) {
            newArray.push(orig[i]);
        }
        return newArray;
    } else if (dataType == 'Object') {
        var newObject = {};
        for (var key in orig) {
            newObject[key] = clone(orig[key]);
        }
        return newObject;
    } else {
        return orig;
    }
}

/*
 * Checks for circular references and returns the path to the original object if found.
 *
 * @param {any} obj The current object being processed.
 * @param {object} cache A cache object to store seen objects and their paths.
 * @param {array} currentPath The current path in the object hierarchy.
 * @returns {Array} An array representing the path to the circular reference, or empty if none.
 */
function getPathToCircularRef(obj, cache, currentPath) {
    var circPath = [];
    if (typeof obj != 'object') {
        return circPath;
    }

    if (!cache.objects) {
        cache.objects = [];
        cache.paths = [];
    }

    var pos = cache.objects.indexOf(obj);
    if (pos >= 0) {
        circPath = cache.paths[pos];
    }

    cache.objects.push(obj);
    cache.paths.push(currentPath);

    return circPath;
}

/*
 * Recursively generates the HTML output for a given object.
 * This is the core dumping function.
 *
 * @param {any} obj The variable to dump.
 * @param {object} cache Cache for tracking circular references and filtered levels.
 * @param {array} currentPath The current path in the object hierarchy (for circular ref tracking).
 * @param {object} options Configuration options for dumping.
 * @returns {string} The HTML representation of the dumped object.
 */
function dumpObject(obj, cache, currentPath, options) {
    // Initialize variables for the current dump operation
    var data = '';
    var dataType = getDataType(obj);
    var isSimpleType = (SIMPLETYPES.indexOf(dataType) >= 0);
    var bFirstCall = (currentPath.length == 0);
    var label = dataType;
    var expand = true;
    var expandCells = true; // Controls expansion of individual cells, not rows

    // Handle the very first call to dumpObject
    if (bFirstCall) {
        var topPath = TOP;
        cache.bFilteredLevel = false; // Reset filtered level flag
        if (options.label) {
            label = options.label + ' - ' + label;
            /*
            // Original code had commented out logic for topPath, keeping as is for Type I
            topPath += ' ' + options.label;
            if(topPath.length > CIRCULARTOPSTRINGLIMIT)
                topPath = topPath.substr(0, CIRCULARTOPSTRINGLIMIT) + '...';
            topPath += ' - ' + dataType;
            */
        }
        currentPath = [topPath]; // Initialize path for circular reference tracking
    }

    var bEmpty = false; // Flag to indicate if the current item is empty
    var bHeader = !isSimpleType; // Determine if a header row is needed

    // Process simple data types
    if (isSimpleType) {
        switch (dataType) {
            case 'Boolean':
                // Output boolean values with specific styling for true/false
                var val = '<span class="' + (obj ? 'nodedump-yes' : 'nodedump-no') + '">' + obj + '</span>';
                data = doRow(dataType, label, val, expand, expandCells);
                break;
            case 'String':
                // Handle string type, check for emptiness
                if (obj.length === 0) {
                    bEmpty = true;
                } else {
                    var val = escapeHtml(obj); // Escape HTML to display raw string
                    // Original code had commented out syntax highlighting for strings, keeping as is
                    // var val = '<pre><code class="lang-html">' + hljs.highlight('xml', obj).value + '</code></pre>';
                    data = doRow(dataType, label, val, expand, expandCells);
                }
                break;
            case 'Math':
            case 'Undefined':
            case 'Null':
                // These types don't have a specific value to display, just a label
                data = doRow1Col(dataType, label, expand);
                break;
            default:
                // Default handling for other simple types (e.g., Number, Date)
                data = doRow(dataType, label, obj.toString(), expand, expandCells);
                break;
        }
    } else { // Process non-simple (complex) data types
        // Determine if the current section should be expanded or collapsed
        expand = options.expand;
        if (typeof options.expand == 'object') {
            expand = expand.indexOf(dataType) > -1 || expand.indexOf(dataType.toLowerCase()) > -1;
        }
        if (expand) {
            if (options.collapse == true || (
                typeof options.collapse == 'object'
                && (options.collapse.indexOf(dataType) > -1 || options.collapse.indexOf(dataType.toLowerCase()) > -1)
            )) {
                expand = false;
            }
        }

        switch (dataType) {
            case 'RegExp':
            case 'Error':
                // For RegExp and Error objects, display their string representation
                bHeader = true; // Ensure a header is generated
                data += doRowHeader1Col(dataType, label, expand);
                data += doRow1Col(dataType, obj.toString(), expand);
                break;
            case 'Function':
                // For Function objects, display their source code
                bHeader = true;
                data += doRowHeader1Col(dataType, label, expand);
                var txt = obj.toString();
                if (options.syntaxHighlight) {
                    // Apply syntax highlighting if enabled
                    var purtyText = hljs.highlight('javascript', txt);
                    //var purtyText = hljs.highlightAuto(txt); // Alternative auto-highlighting
                    txt = purtyText.value;
                } else {
                    // Otherwise, just escape HTML characters
                    txt = escapeHtml(obj.toString());
                }
                data += doRow1Col(dataType, '<pre><code class="lang-javascript">' + txt + '</code></pre>', expand);
                // Original code had commented out plain escaped code, keeping as is
                // data += doRow1Col(dataType, '<pre><code>'+escapeHtml(obj.toString())+'</code></pre>', expand);
                break;
            // ... (rest of dumpObject logic would follow here for Array, Object, etc.)
            // The provided snippet ends abruptly here.
        }
    }
    // ... (the rest of the dumpObject function would continue)
    // The snippet provided is incomplete for dumpObject.
    // I will stop here as the request is to clone the provided code.