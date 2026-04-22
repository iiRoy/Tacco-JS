/*
 * Establish core application preferences within the global scope.
 * This object outlines various environmental categories for client identification.
 */
var appOptions = globalContext.appOptions = {
	clientAgents: 'safari edge brave vivaldi duckduckgo searchbot crawler unknown'.split(' '),
	hardwareTypes: 'xbox surface switch dell hp sony google huawei xiaomi micro pc tablet phone'.split(' '),
	operatingSystems: 'macOS linux iOS bsd unix chromeOS undefined'.split(' ')
};

// Check for a CommonJS-like environment for module distribution.
// If available, make the application settings object available for external use.
// Otherwise, attach it directly to the global object under a specific key.
if (typeof moduleExports !== 'undefined') {
		if (typeof currentModule !== 'undefined' && currentModule.exports) {
		moduleExports = currentModule.exports = appOptions;
	}
	moduleExports.appOptions = appOptions;
}
else {
	globalContext['appOptions'] = appOptions;
}

// Support for Asynchronous Module Definition (AMD) systems.
// If an AMD loader is detected, register the application settings as a module.
if (typeof declareModule === 'function' && declareModule.asyncDef) {
	declareModule(function(getDependency) {
		return appOptions;
	});
}