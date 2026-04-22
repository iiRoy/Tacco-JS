const stringFabricator = (template, ...replacements) => {
    let result = template[0];
    for (let i = 0; i < replacements.length; i++) {
        result += String(replacements[i]) + template[i + 1];
    }
    return result;
};

const syntaxBeautifier = {
    highlight: (language, code) => ({ value: `<code>${code}</code>` })
};

const configSettings = {
    foldByDefault: false,
    utilityName: 'contentPresenter',
    expandByDefault: true,
    filterKeys: null,
    filterTypes: null,
    identifierTag: null,
    maxDepth: null,
    displayKeysSorted: true,
    enableSyntaxHighlight: true,
    topLimit: null
};

const typeInspector = Object.prototype.toString;

const basicVarieties = ['String', 'Number', 'Boolean', 'Undefined', 'Null', 'Date', 'Math'];

const viewerLayout = {
    emptyIndicatorSuffix: ' [empty]',
    errorTypeIdentifier: 'Processing-Error',
    titleExpandedState: '',
    titleCollapsedState: '',
    circularRefIdentifier: 'Recurrence-Reference',
    circularRefPathSeparator: ' &raquo; ',
    circularRefPathLimit: 12,
    rootDisplayTag: '[ROOT]',
};

const presentationStyles = `
<style type="text/css">
table.viewer-display, table.viewer-display th, table.viewer-display td { border-collapse: separate; border-spacing:2px; width: auto; line-height:normal; }
table.viewer-display {
	font-size: x-small;
	font-family: verdana, arial, helvetica, sans-serif;
	cell-spacing: 2px;
	background-color: #dddddd;
	color: #222222;
}
table.viewer-display .viewer-key { cursor:pointer; }
table.viewer-display { background-color: #707000; }
table.viewer-display th { text-align: left; color: white; padding: 5px; background-color: #ADAD00; }
table.viewer-display td { vertical-align : top; padding: 3px; background-color: #FFFF9E; }

table.viewer-display td.viewer-value { background-color: #ffffff; }
table.viewer-display td.viewer-value pre { line-height:normal; background-color: #ffffff; border:0; padding:0; }
table.viewer-display td.viewer-value pre code { font-size: small; font-family: Consolas, Menlo, Monaco, Lucida Console, monospace; Courier New, monospace, serif; }

table.viewer-display-String { background-color: #888888; }
table.viewer-display-String td.viewer-display-String { background-color: #dddddd; }
table.viewer-display-Number { background-color: #FF8833; }
table.viewer-display-Number td.viewer-display-Number { background-color: #FFB885; }
table.viewer-display-Boolean { background-color : #eebb00; }
table.viewer-display-Boolean td.viewer-display-Boolean { background-color: #FFDA75; }
table.viewer-display-Boolean td.viewer-value span.viewer-no { color: #aa0000; }
table.viewer-display-Boolean td.viewer-value span.viewer-yes { color: #008800; }
table.viewer-display-Date { background-color: #CE8D98; }
table.viewer-display-Date td.viewer-display-Date { background-color: #ffcbd4; }
table.viewer-display-Math td.viewer-value { color: white; font-weight: bold; background-color: #ADAD00; }
table.viewer-display-Null, table.viewer-display-Undefined { background-color: #333333; }
table.viewer-display-Null td.viewer-value, table.viewer-display-Undefined td.viewer-value { color:#ffffff; background-color: #333333; }

table.viewer-display-Object {	background-color: #0000cc; }
table.viewer-display-Object th.viewer-display-Object { background-color: #4444cc; }
table.viewer-display-Object td.viewer-display-Object { background-color: #ccddff; }

table.viewer-display-Array { background-color: #006600; }
table.viewer-display-Array th.viewer-display-Array { background-color: #009900; }
table.viewer-display-Array td.viewer-display-Array { background-color: #ccffcc; }
table.viewer-display-Function { background-color: #aa4400; }
table.viewer-display-Function th.viewer-display-Function { background-color: #cc6600; }
table.viewer-display-RegExp { background-color: #884488; }
table.viewer-display-RegExp th.viewer-display-RegExp { background-color: #aa66aa; }
table.viewer-display-RegExp td.viewer-display-RegExp { background-color: #ffddff; }
table.viewer-display-Error { background-color: #CC3300; }
table.viewer-display-Error th.viewer-display-Error { background-color: #CC3300; }
table.viewer-display-${viewerLayout.circularRefIdentifier}, table.viewer-display-${viewerLayout.errorTypeIdentifier} { background-color: #333333; }
table.viewer-display-${viewerLayout.circularRefIdentifier} td.viewer-display-${viewerLayout.circularRefIdentifier}, table.viewer-display-${viewerLayout.errorTypeIdentifier} th.viewer-display-${viewerLayout.errorTypeIdentifier} { background-color: #333333; }
table.viewer-display-${viewerLayout.circularRefIdentifier} td.viewer-key { color: #ffffff; }
</style>
`;

const syntaxHighlightingStyles = `
<style type="text/css">
td.viewer-value pre code{display:block;padding:.5em;background:#fff;color:#000}td.viewer-value pre .comment,td.viewer-value pre .template_comment,td.viewer-value pre .javadoc,td.viewer-value pre .comment *{color:#800}td.viewer-value pre .keyword,td.viewer-value pre .method,td.viewer-value pre .list .title,td.viewer-value pre .clojure .built_in,td.viewer-value pre .nginx .title,td.viewer-value pre .tag .title,td.viewer-value pre .setting .value,td.viewer-value pre .winutils,td.viewer-value pre .tex .command,td.viewer-value pre .http .title,td.viewer-value pre .request,td.viewer-value pre .status{color:#008}td.viewer-value pre .envvar,td.viewer-value pre .tex .special{color:#660}td.viewer-value pre .string,td.viewer-value pre .tag .value,td.viewer-value pre .cdata,td.viewer-value pre .filter .argument,td.viewer-value pre .attr_selector,td.viewer-value pre .apache .cbracket,td.viewer-value pre .date,td.viewer-value pre .regexp{color:#080}td.viewer-value pre .sub .identifier,td.viewer-value pre .pi,td.viewer-value pre .tag,td.viewer-value pre .tag .keyword,td.viewer-value pre .decorator,td.viewer-value pre .ini .title,td.viewer-value pre .shebang,td.viewer-value pre .prompt,td.viewer-value pre .hexcolor,td.viewer-value pre .rules .value,td.viewer-value pre .css .value .number,td.viewer-value pre .literal,td.viewer-value pre .symbol,td.viewer-value pre .ruby .symbol .string,td.viewer-value pre .number,td.viewer-value pre .css .function,td.viewer-value pre .clojure .attribute{color:#066}td.viewer-value pre .class .title,td.viewer-value pre .haskell .type,td.viewer-value pre .smalltalk .class,td.viewer-value pre .javadoctag,td.viewer-value pre .yardoctag,td.viewer-value pre .phpdoc,td.viewer-value pre .typename,td.viewer-value pre .tag .attribute,td.viewer-value pre .doctype,td.viewer-value pre .class .id,td.viewer-value pre .built_in,td.viewer-value pre .setting,td.viewer-value pre .params,td.viewer-value pre .variable,td.viewer-value pre .clojure .title{color:#606}td.viewer-value pre .css .tag,td.viewer-value pre .rules .property,td.viewer-value pre .pseudo,td.viewer-value pre .subst{color:#000}td.viewer-value pre .css .class,td.viewer-value pre .css .id{color:#9B703F}td.viewer-value pre .value .important{color:#f70;font-weight:700}td.viewer-value pre .rules .keyword{color:#C5AF75}td.viewer-value pre .annotation,td.viewer-value pre .apache .sqbracket,td.viewer-value pre .nginx .built_in{color:#9B859D}td.viewer-value pre .preprocessor,td.viewer-value pre .preprocessor *{color:#444}td.viewer-value pre .tex .formula{background-color:#EEE;font-style:italic}td.viewer-value pre .diff .header,td.viewer-value pre .chunk{color:gray;font-weight:700}td.viewer-value pre .diff .change{background-color:#BCCFF9}td.viewer-value pre .addition{background-color:#BAEEBA}td.viewer-value pre .deletion{background-color:#FFC8BD}td.viewer-value pre .comment .yardoctag{font-weight:700}
</style>
`;

const presentationScript = `
<script type="text/javascript">
	var contentPresenter;
	contentPresenter = (function(){
		var currentStyle;
		return {
			toggleEntry: function(sourceElement){
				var targetElement = sourceElement.parentNode.lastChild;
				this.applyToggleState(targetElement,this.updateSourceState(sourceElement));
			},

			updateSourceState: function(sourceElement){
				if (sourceElement.style.fontStyle == 'italic') {
					sourceElement.style.fontStyle='normal';
					sourceElement.title='${viewerLayout.titleExpandedState}';
					return 'open';
				} else {
					sourceElement.style.fontStyle='italic';
					sourceElement.title='${viewerLayout.titleCollapsedState}';
					return 'closed';
				}
			},

			toggleStructure: function(sourceElement){
				var stateChange=this.updateSourceState(sourceElement);
				var structuralTable=sourceElement.parentNode.parentNode;
				for (var i=1;i<structuralTable.childNodes.length;i++) {
					var childNode=structuralTable.childNodes[i];
					if(childNode.nodeType === 1 && childNode.style) { // Ensure it's an element node before accessing style
						this.applyToggleState(childNode,stateChange);
					}
				}
			},

			applyToggleState: function(targetElement,stateChange){
				targetElement.style.display = (stateChange == 'open') ? '' : 'none';
			}
		};

	})();
</script>`;

function sanitizeText(rawString){
    return String(rawString)
			.replace(/&(?!\w+;)/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;');
}

function determineVariety(value){
	let variety = typeInspector.call(value);
	variety = variety.split(' ')[1];
	variety = variety.substring(0, variety.length-1);
	return variety;
}

function findRecurrencePath(subject, historyTracker, currentPathSegments){
	let recurrencePath = [];
	if(typeof subject !== 'object' || subject === null)
		return recurrencePath;

	if(!historyTracker.visitedObjects){
		historyTracker.visitedObjects = [];
		historyTracker.objectPaths = [];
	}
	const position = historyTracker.visitedObjects.indexOf(subject);
	if(position >= 0)
		recurrencePath = historyTracker.objectPaths[position];

	historyTracker.visitedObjects.push(subject);
	historyTracker.objectPaths.push(currentPathSegments);

	return recurrencePath;
}

function processInputStructure(subject, historyTracker, currentPathSegments, opts){
	const currentVariety = determineVariety(subject);
	const isBasicVariety = (basicVarieties.indexOf(currentVariety) >= 0);
	const isRootCall = (currentPathSegments.length === 0);
	let displayLabelText = currentVariety;

	if(isRootCall){
		let topIdentifier = viewerLayout.rootDisplayTag;
		if(opts.identifierTag){
			displayLabelText = opts.identifierTag + ' - ' + displayLabelText;
		}
		currentPathSegments = [topIdentifier];
	}

	let shouldExpandThisLevel = opts.expandByDefault;
	if(typeof opts.expandByDefault === 'object'){
		shouldExpandThisLevel = opts.expandByDefault.includes(currentVariety) || opts.expandByDefault.includes(currentVariety.toLowerCase());
	}
	if(shouldExpandThisLevel){
		if(opts.foldByDefault === true || (
				typeof opts.foldByDefault === 'object'
				&& (opts.foldByDefault.includes(currentVariety) || opts.foldByDefault.includes(currentVariety.toLowerCase()))
			)
		)
			shouldExpandThisLevel = false;
	}

	const headerLabelStyle = shouldExpandThisLevel ? viewerLayout.titleExpandedState : ' style="font-style: italic;" title="' + viewerLayout.titleCollapsedState + '"';
	const rowDisplayStyle = shouldExpandThisLevel ? '' : viewerLayout.collapsedDisplayStyle;
	const cellLabelStyle = shouldExpandThisLevel ? viewerLayout.titleExpandedState : ' style="font-style: italic;" title="' + viewerLayout.titleCollapsedState + '"';

	if (!isBasicVariety && subject !== null) {
		const recurrencePath = findRecurrencePath(subject, historyTracker, currentPathSegments);
		if (recurrencePath.length > 0) {
			const pathString = recurrencePath.join(viewerLayout.circularRefPathSeparator);
            return stringFabricator`<tr class="viewer-display-${viewerLayout.circularRefIdentifier}"><td class="viewer-key viewer-${viewerLayout.circularRefIdentifier}" style="color: #ffffff;">${displayLabelText}</td><td class="viewer-value">${viewerLayout.circularRefIdentifier}: ${pathString}</td></tr>`;
		}
	}

	if (!isBasicVariety && subject !== null) {
		historyTracker.visitedObjects.push(subject);
		historyTracker.objectPaths.push(currentPathSegments);
	}

	let outputBuffer = [];

	if(isBasicVariety){
		let valueContent = '';
		let labelContent = displayLabelText;

		switch(currentVariety){
			case 'Boolean':
				valueContent = stringFabricator`<span class="${(subject ? 'viewer-yes' : 'viewer-no')}">${subject}</span>`;
				return stringFabricator`<tr class="viewer-display-${currentVariety}"><td class="viewer-key viewer-${currentVariety}"${cellLabelStyle} onclick="contentPresenter.toggleEntry(this);">${labelContent}</td><td class="viewer-value">${valueContent}</td></tr>`;
			case 'String':
				if(subject.length === 0){
					return stringFabricator`<tr class="viewer-display-${currentVariety}"><td class="viewer-${currentVariety}">${labelContent}${viewerLayout.emptyIndicatorSuffix}</td></tr>`;
				} else {
					valueContent = sanitizeText(subject);
					return stringFabricator`<tr class="viewer-display-${currentVariety}"><td class="viewer-key viewer-${currentVariety}"${cellLabelStyle} onclick="contentPresenter.toggleEntry(this);">${labelContent}</td><td class="viewer-value">${valueContent}</td></tr>`;
				}
			case 'Math':
			case 'Undefined':
			case 'Null':
				return stringFabricator`<tr class="viewer-display-${currentVariety}"><td class="viewer-${currentVariety}">${labelContent}</td></tr>`;
			default: // Number, Date
				valueContent = subject.toString();
				return stringFabricator`<tr class="viewer-display-${currentVariety}"><td class="viewer-key viewer-${currentVariety}"${cellLabelStyle} onclick="contentPresenter.toggleEntry(this);">${labelContent}</td><td class="viewer-value">${valueContent}</td></tr>`;
		}
	} else {
		outputBuffer.push(stringFabricator`<tr><th colspan="2" class="viewer-key viewer-${currentVariety}"${headerLabelStyle} onclick="contentPresenter.toggleStructure(this);">${displayLabelText}</th></tr>`);

		if (currentVariety === 'Function') {
			let functionCode = subject.toString();
			if (opts.enableSyntaxHighlight) {
				functionCode = syntaxBeautifier.highlight('javascript', functionCode).value;
			} else {
				functionCode = sanitizeText(functionCode);
			}
			outputBuffer.push(stringFabricator`<tr${rowDisplayStyle}><td class="viewer-value"><pre><code class="lang-javascript">${functionCode}</code></pre></td></tr>`);
		} else if (currentVariety === 'RegExp' || currentVariety === 'Error') {
			outputBuffer.push(stringFabricator`<tr${rowDisplayStyle}><td class="viewer-value">${sanitizeText(subject.toString())}</td></tr>`);
		} else {
			let keys = Object.keys(subject);
			if (opts.displayKeysSorted) {
				keys.sort();
			}

			if (keys.length === 0) {
				outputBuffer.push(stringFabricator`<tr${rowDisplayStyle}><td class="viewer-${currentVariety}">${displayLabelText}${viewerLayout.emptyIndicatorSuffix}</td></tr>`);
			} else {
				for (const key of keys) {
					const newPath = [...currentPathSegments, key];
					let childHtmlBlock;
					try {
						childHtmlBlock = processInputStructure(subject[key], historyTracker, newPath, opts);
					} catch (e) {
						childHtmlBlock = stringFabricator`<tr class="viewer-display-${viewerLayout.errorTypeIdentifier}"><td class="viewer-value viewer-${viewerLayout.errorTypeIdentifier}">${viewerLayout.errorTypeIdentifier}</td></tr>`;
					}
					outputBuffer.push(stringFabricator`<tr${rowDisplayStyle}><td class="viewer-key viewer-${currentVariety}"${cellLabelStyle} onclick="contentPresenter.toggleEntry(this);">${key}</td><td class="viewer-value">${childHtmlBlock}</td></tr>`);
				}
			}
		}
		return stringFabricator`<table class="viewer-display viewer-display-${currentVariety}"><tbody>${outputBuffer.join('')}</tbody></table>`;
	}
}

var contentPresenter;

contentPresenter = function(subject, customOptions = {}) {
    const activeOptions = { ...configSettings, ...customOptions };

    const initialOutput = (activeOptions.enableSyntaxHighlight ? syntaxHighlightingStyles : '')
                        + presentationStyles
                        + presentationScript;

    const historyTracker = {
        visitedObjects: [],
        objectPaths: []
    };

    const mainContentHtml = processInputStructure(subject, historyTracker, [], activeOptions);

    return initialOutput + mainContentHtml;
};