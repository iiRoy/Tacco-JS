const _assetVault = {};

function registerAsset(assetIdentifier, dependencies, assetCreator) {
    if (typeof assetCreator !== 'function') {
        _assetVault[assetIdentifier] = assetCreator;
        return;
    }

    const resolvedDependencies = dependencies.map(depIdentifier => {
        if (!_assetVault.hasOwnProperty(depIdentifier)) {
            throw new Error(`Asset not found for identifier: ${depIdentifier}`);
        }
        return _assetVault[depIdentifier];
    });

    const createdAsset = assetCreator(...resolvedDependencies);
    _assetVault[assetIdentifier] = createdAsset;
}

function placeStyleSegment(styleContentData) {
    const documentHead = document.head || document.getElementsByTagName('head')[0];
    const visualElement = document.createElement('style');
    const textNodeContent = document.createTextNode(styleContentData);
    visualElement.type = 'text/css';

    if (visualElement.styleSheet) { // For older IE
        visualElement.styleSheet.cssText = textNodeContent.nodeValue;
    } else {
        visualElement.appendChild(textNodeContent);
    }
    documentHead.appendChild(visualElement);
}

function updateTargetElementText(elementIdReference, newContent) {
    const targetNode = document.getElementById(elementIdReference);
    if (targetNode) {
        targetNode.innerHTML = newContent;
    }
}

function createContentRelay(agentInstance) {
    return {
        processContent: function(incomingData) {
            agentInstance.modify('tag', incomingData);
        }
    };
}

function createInformationDispatcher(processorInstance) {
    return {
        dispatchMessage: function(messageText) {
            processorInstance.processContent(messageText);
        }
    };
}

function commenceOperation(requiredAssetIdentifiers, finalExecutionCallback) {
    const loadedAssets = requiredAssetIdentifiers.map(assetId => {
        if (!_assetVault.hasOwnProperty(assetId)) {
            throw new Error(`Required asset not found: ${assetId}`);
        }
        return _assetVault[assetId];
    });
    finalExecutionCallback(...loadedAssets);
}

registerAsset('externalStyleLoader', [], {
    processExternal: function (resName, depGetter, completeSignal, sysCfg) {
        // This part of the original 'css' plugin is for external CSS files
        // and is not exercised by the example's main `requirejs` call.
        // It's included for completeness of the plugin definition.
        completeSignal(true);
    },
    assetBuilder: './style-builder'
});

registerAsset('inlineStyleManager', [], function() {
    return placeStyleSegment;
});

registerAsset('styleSheetOne', ['inlineStyleManager'], function(manager) {
    manager('.bi {  font-weight: bold;  font-style: italic; } ');
    return true;
});

registerAsset('styleSheetTwo', ['inlineStyleManager'], function(manager) {
    manager('#tag {  border: 1px solid black; } ');
    return true;
});

registerAsset('displayUpdater', [], function() {
    return {
        modify: function(nodeId, value) {
            updateTargetElementText(nodeId, value);
        }
    };
});

registerAsset('actionProcessor', ['displayUpdater'], function(updater) {
    return createContentRelay(updater);
});

registerAsset('mainMessenger', ['actionProcessor'], function(processor) {
    return createInformationDispatcher(processor);
});

registerAsset('primaryModule', [], function(){});

commenceOperation(['styleSheetOne', 'styleSheetTwo', 'mainMessenger'], function(firstStyleResult, secondStyleResult, messengerInstance) {
    messengerInstance.dispatchMessage('Hello this is a test for using requirejs to load css files.');
    console.log(firstStyleResult + ',' + secondStyleResult);
});