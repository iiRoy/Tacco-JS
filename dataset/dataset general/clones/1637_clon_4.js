const retrieveComponentCanonicalName = (componentSource) => {
    const stringRepresentation = String(componentSource);
    const initialSpacePosition = stringRepresentation.indexOf(' ');
    const finalBracketPosition = stringRepresentation.lastIndexOf(']');

    if (initialSpacePosition === -1 || finalBracketPosition === -1 || initialSpacePosition >= finalBracketPosition) {
        return stringRepresentation;
    }
    return stringRepresentation.substring(initialSpacePosition + 1, finalBracketPosition);
};

const createInstanceFromConstructor = (constructorReference, initialConfiguration) => {
    return initialConfiguration ? new constructorReference(initialConfiguration) : new constructorReference();
};

const obtainConfiguredComponent = (componentConstructor, initializationArguments, configurationSettings) => {
    const environmentRegistry = application.globals;
    const namespaceLookupKey = 'proose.settings.namespace';
    const activeComponentNamespace = environmentRegistry.get(namespaceLookupKey);

    const componentRawIdentifier = retrieveComponentCanonicalName(componentConstructor);
    const fullyQualifiedComponentIdentifier = `${activeComponentNamespace}.${componentRawIdentifier}`;

    let resolvedComponent = environmentRegistry.get(fullyQualifiedComponentIdentifier);

    if (!resolvedComponent) {
        const newlyConstructedComponent = createInstanceFromConstructor(componentConstructor, initializationArguments);

        const javaRuntimeClassHandle = newlyConstructedComponent.getClass();
        const availableMethods = javaRuntimeClassHandle.getMethods();

        const methodDispatchTable = new Map();
        Array.prototype.forEach.call(availableMethods, (methodDescriptor) => {
            methodDispatchTable.set(String(methodDescriptor.getName()), methodDescriptor);
        });

        Object.entries(configurationSettings).forEach(([settingKey, settingValue]) => {
            const correspondingMethod = methodDispatchTable.get(settingKey);
            if (correspondingMethod) {
                correspondingMethod.invoke(newlyConstructedComponent, settingValue);
            }
        });

        resolvedComponent = application.getGlobal(fullyQualifiedComponentIdentifier, newlyConstructedComponent);
    }

    return resolvedComponent;
};