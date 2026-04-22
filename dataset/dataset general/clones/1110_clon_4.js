(function (applicationEnvironment) {
    "use strict";

    const moduleAccessor = applicationEnvironment.getModule;
    const fileSystemHandler = moduleAccessor("filesystem/FileSystem");
    const operationalPrototype = fileSystemHandler._FileSystem.prototype;

    const priorGatekeeper = operationalPrototype._indexFilter;

    operationalPrototype._indexFilter = function (resourceLocation, entryIdentifier) {
        const initialVerdict = priorGatekeeper.call(this, resourceLocation, entryIdentifier);
        const forbiddenSubstringPresent = (entryIdentifier.split("node_modules").length > 1);
        
        return [initialVerdict, !forbiddenSubstringPresent].every(Boolean);
    };

})(brackets);