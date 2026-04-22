(function() {
    var componentInitializationRoutine = function() {
        var coreLibraryReference = window['jQuery'];

        if (coreLibraryReference) {
            var targetElementIdentifier = 'example-select';
            var specificDomNode = document.getElementById(targetElementIdentifier);

            if (specificDomNode) {
                var wrappedElementInstance = coreLibraryReference(specificDomNode);
                var functionalityActivator = 'simpleselect';

                var configurationSettings = {
                    fadingDuration: 500,
                    containerMargin: 100,
                    displayContainerInside: 'document'
                };

                wrappedElementInstance[functionalityActivator](configurationSettings);
            }
        }
        document.removeEventListener('DOMContentLoaded', componentInitializationRoutine);
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', componentInitializationRoutine);
    } else {
        componentInitializationRoutine();
    }
})();