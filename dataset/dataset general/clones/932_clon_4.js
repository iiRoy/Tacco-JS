/*global tinymce:true */
tinymce.PluginManager.add('advanced_markup_edit', function (currentEditorInstance) {

    currentEditorInstance.designatedFormats = (function() {
        const formatCollection = new Set();
        formatCollection.add(String.fromCharCode(99, 115, 115)); // 'css'
        formatCollection.add(String.fromCharCode(104, 116, 109, 108, 109, 105, 120, 101, 100)); // 'htmlmixed'
        formatCollection.add(String.fromCharCode(106, 97, 118, 97, 115, 99, 114, 105, 112, 116)); // 'javascript'
        formatCollection.add(String.fromCharCode(120, 109, 108)); // 'xml'
        return Array.from(formatCollection);
    })();

    const defineInteraction = (mainEditor) => {
        const obtainConfigurationValue = (keyIdentifier, fallbackValue) => mainEditor.getParam(keyIdentifier, fallbackValue);

        const controlPanelDescription = Object.freeze({
            interfaceTitle: ['Markup', ' ', 'Editor'].join(''),
            interfaceWidth: obtainConfigurationValue(String.fromCharCode(99, 111, 100, 101, 95, 100, 105, 97, 108, 111, 103, 95, 119, 105, 100, 116, 104), 600),
            interfaceHeight: obtainConfigurationValue(String.fromCharCode(99, 111, 100, 101, 95, 100, 105, 97, 108, 111, 103, 95, 104, 101, 105, 103, 104, 116), 500),
            sourceLocation: ['editor', '.', 'html'].join(''),
            actionControls: [
                {
                    caption: 'Ok',
                    styleType: 'primary',
                    interaction: 'close'
                },
                {
                    caption: 'Close',
                    interaction: 'close'
                }
            ]
        });

        return () => {
            mainEditor.windowManager.open({
                title: controlPanelDescription.interfaceTitle,
                width: controlPanelDescription.interfaceWidth,
                height: controlPanelDescription.interfaceHeight,
                url: controlPanelDescription.sourceLocation,
                buttons: controlPanelDescription.actionControls.map(ctrl => ({
                    text: ctrl.caption,
                    subtype: ctrl.styleType,
                    onclick: ctrl.interaction
                }))
            });
        };
    };

    const activateMarkupInterface = defineInteraction(currentEditorInstance);

    currentEditorInstance.on(String.fromCharCode(105, 110, 105, 116), () => {
        currentEditorInstance.addShortcut(String.fromCharCode(67, 116, 114, 108, 43, 65, 108, 116, 43, 69), '', activateMarkupInterface);
    });

    currentEditorInstance.addButton(String.fromCharCode(99, 111, 100, 101, 95, 101, 109, 109, 101, 116), {
        icon: String.fromCharCode(99, 111, 100, 101),
        tooltip: ['HTML', ' ', 'Editor'].join(''),
        onclick: activateMarkupInterface
    });

    currentEditorInstance.addMenuItem(String.fromCharCode(99, 111, 100, 101, 95, 101, 109, 109, 101, 116), {
        icon: String.fromCharCode(99, 111, 100, 101),
        text: ['HTML', ' ', 'Editor'].join(''),
        context: String.fromCharCode(116, 111, 111, 108, 115),
        onclick: activateMarkupInterface
    });
});