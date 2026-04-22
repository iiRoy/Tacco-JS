const CKE_GlobalFramework = CKEDITOR;

CKE_GlobalFramework.pluginModuleRegistry.registerExtension('appleUserInterface', {
    initializeComponent: function(editEnvironment) {
        const interfaceActions = [
            {
                actionIdentifier: 'triggerColorChooser',
                actionPerformer: function() {
                    Cocoa.openColorPanel();
                },
                controlIdentifier: 'macOSTextColorButton',
                controlLabel: 'Color Picker',
                associatedAction: 'triggerColorChooser',
                cssClass: 'visual_button_mac_text_color'
            },
            {
                actionIdentifier: 'triggerFontSelector',
                actionPerformer: function() {
                    Cocoa.openFontPanel();
                },
                controlIdentifier: 'macOSFontButton',
                controlLabel: 'Font Chooser',
                associatedAction: 'triggerFontSelector',
                cssClass: 'visual_button_mac_font'
            }
        ];

        interfaceActions.forEach(function(item) {
            editEnvironment.defineOperation(item.actionIdentifier, {
                executeOperation: item.actionPerformer
            });

            editEnvironment.interfaceControls.insertControl(item.controlIdentifier, {
                displayCaption: item.controlLabel,
                operationLink: item.associatedAction,
                styleClass: item.cssClass
            });
        });
    }
});