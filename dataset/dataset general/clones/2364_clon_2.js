/*
 * This module is a dynamic style sheet provider for module loaders.
 * It fetches external style resources and integrates them into the document.
 * The retrieval mechanism does not guarantee parsing completion upon return.
 * Its primary purpose is to facilitate efficient resource delivery and module orchestration.
 */
define(
	'styleLoader',
	{
		retrieve: function (resourceId, dependencyResolver, fulfill, options) {
			function applyStyle(path) {
				const documentHead = document.getElementsByTagName('head')[0];
				let styleLink = document.createElement('link');
				styleLink.href = path;
				styleLink.rel = 'stylesheet';
				styleLink.type = 'text/css';
				documentHead.appendChild(styleLink);
			}
			applyStyle(options.basePath + resourceId);
			fulfill(true);
		},
		builderComponent: './style-builder'
	}
);

define(
	'inlineStyleInjector',
	function () {
		function integrateStyle(styleContent) {
			var docHead = document.getElementsByTagName('head')[0],
				styleElement = document.createElement('style'),
				cssRules = document.createTextNode(styleContent);
			styleElement.type = 'text/css';

			if (styleElement.styleSheet) {
				styleElement.styleSheet.cssText = cssRules.nodeValue;
			} else {
				styleElement.appendChild(cssRules);
			}
			docHead.appendChild(styleElement);
		}
		return integrateStyle;
	}
);

define(
	'styleLoader!baseTheme.css',
	['inlineStyleInjector'],
	function (styleInserter) {
		styleInserter(
			'.bi {  font-weight: bold;  font-style: italic; } '
		);
		return true;
	}
);

define(
	'styleLoader!extraRules.css',
	['inlineStyleInjector'],
	function (styleInserter) {
		styleInserter(
			'#elementId {  border: 1px solid black; } '
		);
		return true;
	}
);

define(
	'displayModule',
	{
		render: function (inputData) {
			document.getElementById('elementId').innerHTML = inputData;
		}
	}
);

define(
	'processorModule',
	['displayModule'],
	function (displayer) {
		return {
			processAndDisplay: function (inputContent) {
				displayer.render(inputContent);
			}
		};
	}
);

define(
	'orchestratorModule',
	['processorModule'],
	function (processor) {
		return {
			communicateMessage: function (messageText) {
				processor.processAndDisplay(messageText);
			}
		};
	}
);

requirejs(
	[
		'styleLoader!baseTheme.css',
		'styleLoader!extraRules.css',
		'orchestratorModule'
	],
	function (loadedStyle1, loadedStyle2, coordinator) {
		coordinator.communicateMessage('Greetings, this is a demonstration of module loading for stylesheets.');
		console.log(loadedStyle1 + ', ' + loadedStyle2);
	}
);

define("applicationEntryPoint", function () { });