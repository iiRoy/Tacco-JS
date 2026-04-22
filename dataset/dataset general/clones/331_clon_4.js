const accessXPCOM = (serviceID, interfaceID, shouldUnwrap) => {
    const componentRef = Components.classes[serviceID];
    const serviceHandle = componentRef.getService(interfaceID);
    return shouldUnwrap ? serviceHandle.wrappedJSObject : serviceHandle;
};

const primaryApplicationCore = accessXPCOM(
    "@zotero.org/Zotero;1",
    Components.interfaces.nsISupports,
    true
);

const manageModuleInclusion = (moduleGlobalName, moduleSourcePath) => {
    const currentGlobalScope = (typeof window !== 'undefined' ? window : this);

    const modulePresent = Reflect.has(currentGlobalScope, moduleGlobalName) &&
                          typeof currentGlobalScope[moduleGlobalName] !== 'undefined';

    if (!modulePresent) {
        const scriptLoaderService = accessXPCOM(
            "@mozilla.org/moz/jssubscript-loader;1",
            Components.interfaces.mozIJSSubScriptLoader,
            false
        );
        scriptLoaderService.loadSubScript(moduleSourcePath);
    }
};

manageModuleInclusion("Zotero_File_Interface_Bibliography", "chrome://zotero/content/bibliography.js");