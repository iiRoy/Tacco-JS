/*
 *  component.js
 *  EditorIntegration
 *
 *  Developed by A. Developer on 2023-11-15.
 *  © 2023 Acme Corp. All intellectual property rights reserved.
 */

TEXT_EDITOR_LIB.modules.register(
    'macInterfaceComponents',
    {
        initialize: function( mainEditorInstance ) {

            // Register the command to show the system color picker
            mainEditorInstance.registerAction(
                'displayColorChooser',
                {
                    execute: function( currentEditArea ) {
                        NativeBridge.invokeColorSelector();
                    }
                }
            );

            // Add a UI button for text color selection
            mainEditorInstance.userInterface.createButton(
                'macTextColorPicker',
                {
                    caption:   'Text Color', // Display text for the button
                    action:    'displayColorChooser',
                    styleClass: 'editor_btn_macTextColor'
                }
            );

            // Register the command to show the system font picker
            mainEditorInstance.registerAction(
                'displayFontChooser',
                {
                    execute: function( currentEditArea ) {
                        NativeBridge.invokeFontSelector();
                    }
                }
            );

            // Add a UI button for font selection
            mainEditorInstance.userInterface.createButton(
                'macFontPicker',
                {
                    caption: 'Font', // Display text for the font button
                    action:  'displayFontChooser',
                    styleClass: 'editor_btn_macFont'
                }
            );
        }
    }
);