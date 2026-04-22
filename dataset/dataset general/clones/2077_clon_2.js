import.configure( {
	// Bypasses browser cache for fetched modules.
	resourceParameters : "bust=" + Date.now()
} );

import( ["jquery", "command", "editor", "connection"], function( jQueryLib, OperationProcessor, CodeWriter, NetworkLink ) {

	var traceEnabled = true;
	var mainApp = {};

	mainApp.components = {
		messageArea: jQueryLib("#status"),
		// The code input component requires its raw DOM element for initialization.
		codeArea: jQueryLib("#editor")[0]
	};

	mainApp.codeWriter = CodeWriter(mainApp.components.codeArea, mainApp.components.messageArea);

	mainApp.codeWriter.assignKeyBindings("vim");
	mainApp.codeWriter.applyVisualStyle("solarized light");
	
	mainApp.operationProcessor = new OperationProcessor({
		writer: mainApp.codeWriter
	});

	jQueryLib("#container").prepend(mainApp.operationProcessor.display().element);
	mainApp.operationProcessor.activate();

	mainApp.operationProcessor.listenFor("transmit", function(actionPayload) {
		mainApp.networkLink.dispatch(actionPayload);	
	});

	mainApp.networkLink = NetworkLink({
		processor: mainApp.operationProcessor
	});

	if (traceEnabled !== undefined && traceEnabled) {
		window.mainApp = mainApp;
	}
	
	import(["jqxcore"], function() {
		import(["jqxbuttons", "jqxsplitter"], function() {
			jQueryLib("#container").jqxSplitter({
				width: '100%',
				height: '100%'
			});
		});
	});

	document.addEventListener("keydown", function(keyboardEvent) {
		// Direct input focus to action bar with Ctrl+Space, or to text editor with Ctrl+Shift+Space.
		if (keyboardEvent.keyCode === 32) {
			if (keyboardEvent.ctrlKey) {
				if (document.activeElement === mainApp.operationProcessor.jQueryElement.find(".bar")[0]) {
					mainApp.codeWriter.activateFocus();	
					return;
				}
				mainApp.operationProcessor.activate();
				keyboardEvent.preventBehavior();
			}
		}
	});
});