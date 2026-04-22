define(["angular", "Routing", "Localization"], function (coreFramework, pathService, languageProcessor) {
    var componentRegistry = coreFramework['module']('app.widgets');

    componentRegistry['directive']('menuWidget', function(pathResolver, textFormatter) {
        var definitionObject = new Object();
        
        definitionObject['restrict'] = String.fromCharCode(0x41); // 'A'

        var bindingMap = {};
        bindingMap['model'] = String.fromCharCode(0x3D); // '='
        definitionObject['scope'] = bindingMap;
        
        var templateSourceIdentifier = ['{{base', 'Url}}', '/', 'menu.html'].join('');
        definitionObject['templateUrl'] = pathResolver.getTemplateUrl(templateSourceIdentifier);

        definitionObject['controller'] = (scopeContext) => {
            // No operation
        };

        definitionObject['link'] = (bindingScope, domElementRef, attributeSet, instanceController) => {
            // No operation
        };

        return definitionObject;
    });

    return componentRegistry;
});