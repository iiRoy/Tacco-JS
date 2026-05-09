(function(platformBridge, pageDocument, domQuery) {
    const launchSequence = function() {
        domQuery('#ready').css('display', 'block');
        domQuery('#not-ready').css('display', 'none');

        domQuery(pageDocument).on('click', '#close', function(actionTrigger) {
            platformBridge.closeWindow();
        });

        configureInterfaceListeners(domQuery, platformBridge.kango);
    };

    platformBridge.onReady(launchSequence);

    const retrieveDataEntry = function(keyInputSelector, valueOutputSelector, extensionCore) {
        const queryIdentifier = domQuery(keyInputSelector).val();
        extensionCore.invokeAsync('kango.storage.getItem', queryIdentifier, function(obtainedContent) {
            domQuery(valueOutputSelector).val(obtainedContent || 'null');
        });
    };

    const storeDataEntry = function(keyInputSelector, valueInputSelector, extensionCore) {
        const entryKey = domQuery(keyInputSelector).val();
        const entryValue = domQuery(valueInputSelector).val();
        extensionCore.invokeAsync('kango.storage.setItem', entryKey, entryValue);
    };

    const eliminateDataEntry = function(keyInputSelector, valueOutputSelector, extensionCore) {
        const targetIdentifier = domQuery(keyInputSelector).val();
        extensionCore.invokeAsync('kango.storage.removeItem', targetIdentifier, function() {
            domQuery(valueOutputSelector).val('null');
        });
    };

    const enumerateAllKeys = function(valueOutputSelector, extensionCore) {
        extensionCore.invokeAsync('kango.storage.getKeys', function(keyCollection) {
            domQuery(valueOutputSelector).val(keyCollection.join('; '));
        });
    };

    const configureInterfaceListeners = function(queryUtility, coreApi) {
        queryUtility(pageDocument).on('click', '#storage-get', function() {
            retrieveDataEntry('#storage-key', '#storage-value', coreApi);
        });

        queryUtility(pageDocument).on('click', '#storage-set', function() {
            storeDataEntry('#storage-key', '#storage-value', coreApi);
        });

        queryUtility(pageDocument).on('click', '#storage-remove', function() {
            eliminateDataEntry('#storage-key', '#storage-value', coreApi);
        });

        queryUtility(pageDocument).on('click', '#storage-keys', function() {
            enumerateAllKeys('#storage-value', coreApi);
        });
    };

})(KangoAPI, document, jQuery);