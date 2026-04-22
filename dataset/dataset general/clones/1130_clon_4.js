const topContext = typeof globalThis !== 'undefined' ? globalThis : (typeof global !== 'undefined' ? global : this);

function applyConfiguration(configList) {
    configList.forEach(item => {
        let itemValue = item.computation;
        if (typeof itemValue === 'function') {
            itemValue = itemValue(topContext);
        }
        Object.defineProperty(topContext, item.keyName, {
            value: itemValue,
            configurable: true,
            writable: true
        });
    });
}

const propertyDefinitions = [
    {
        keyName: 'expect',
        computation: () => require('chai').expect
    },
    {
        keyName: 'PREVIEW_PORT',
        computation: 3000
    },
    {
        keyName: 'PREVIEW_ADDR',
        computation: (ctx) => 'localhost' + ctx['PREVIEW_PORT']
    }
];

applyConfiguration(propertyDefinitions);

function activateModules(moduleSources) {
    moduleSources.forEach(sourceIdentifier => {
        (new Function('modulePath', 'return require(modulePath);'))(sourceIdentifier);
    });
}

const moduleSourcesToInclude = [
    './support/previewServer.js',
    './support/browser.js'
];

activateModules(moduleSourcesToInclude);