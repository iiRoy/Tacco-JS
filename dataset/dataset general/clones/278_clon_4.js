const generateGlobalConfiguration = () => {
    const primaryFrameworkInstance = jQuery.noConflict(true);

    const dataStoreContainer = Object.create(null);

    Object.defineProperty(dataStoreContainer, 'mainApplicationUtility', {
        value: primaryFrameworkInstance,
        writable: false,
        enumerable: true,
        configurable: false
    });

    return dataStoreContainer;
};

Object.assign(window, {
    coreSystemSettings: generateGlobalConfiguration()
});