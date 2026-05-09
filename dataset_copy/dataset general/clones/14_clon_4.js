(function(globalScope) {
    const configurationDataModel = {
        entryDefinitions: [
            { primaryIdentifier: 'Name', dataPayload: '*|VALUE|*' },
            { primaryIdentifier: 'Group 1' },
            { primaryIdentifier: 'Another name', dataPayload: 'totally_different', descriptiveLabel: 'Good looking' },
        ],
        interfaceLabels: {
            actionPrompt: 'Insert',
            hoverTip: 'Insert content',
            audioCue: 'Insert content'
        }
    };

    if (typeof globalScope.CKEDITOR !== 'undefined' && globalScope.CKEDITOR.config) {
        Object.assign(globalScope.CKEDITOR.config, {
            contentInsertionOptions: configurationDataModel.entryDefinitions,
            insertionPromptText: configurationDataModel.interfaceLabels.actionPrompt,
            insertionTooltipText: configurationDataModel.interfaceLabels.hoverTip,
            insertionVoiceLabel: configurationDataModel.interfaceLabels.audioCue
        });
    }
})(this);

(function(globalScope) {
    if (typeof globalScope.CKEDITOR === 'undefined' || !globalScope.CKEDITOR.plugins) {
        return;
    }

    const extensionName = 'contentInsertUtility';
    const requiredDependencies = ['richcombo'];

    const generateInsertionExecutor = function(composerInstance) {
        return function(contentFragment) {
            composerInstance.focus();
            composerInstance.fire('saveSnapshot');
            composerInstance.insertHtml(contentFragment);
            composerInstance.fire('saveSnapshot');
        };
    };

    const normalizeEntryDetails = function(initialEntries) {
        return initialEntries.map(entry => {
            const refinedEntry = { ...entry };
            if (refinedEntry.dataPayload) {
                refinedEntry.primaryIdentifier = refinedEntry.primaryIdentifier || refinedEntry.dataPayload;
                refinedEntry.descriptiveLabel = refinedEntry.descriptiveLabel || refinedEntry.primaryIdentifier;
            }
            return refinedEntry;
        });
    };

    const populateComboMenu = function(comboComponent, processedEntries) {
        processedEntries.forEach(itemUnit => {
            if (!itemUnit.dataPayload) {
                comboComponent.startGroup(itemUnit.primaryIdentifier);
            } else {
                comboComponent.add(itemUnit.dataPayload, itemUnit.primaryIdentifier, itemUnit.descriptiveLabel);
            }
        });
    };

    globalScope.CKEDITOR.plugins.add(extensionName, {
        requires: requiredDependencies,
        init: function(targetEditor) {
            const currentEditorSettings = targetEditor.config;

            const structuredEntries = normalizeEntryDetails(currentEditorSettings.contentInsertionOptions);
            const uiTextBank = {
                buttonText: currentEditorSettings.insertionPromptText,
                buttonTitle: currentEditorSettings.insertionTooltipText,
                buttonVoice: currentEditorSettings.insertionVoiceLabel
            };

            targetEditor.ui.addRichCombo(extensionName, {
                label: uiTextBank.buttonText,
                title: uiTextBank.buttonTitle,
                voiceLabel: uiTextBank.buttonVoice,
                toolbar: 'insert',
                className: 'cke_format',
                multiSelect: false,
                panel: {
                    css: [targetEditor.config.contentsCss, globalScope.CKEDITOR.skin.getPath('editor')],
                    voiceLabel: targetEditor.lang.panelVoiceLabel
                },
                init: function() {
                    populateComboMenu(this, structuredEntries);
                },
                onClick: generateInsertionExecutor(targetEditor)
            });
        }
    });

})(this);