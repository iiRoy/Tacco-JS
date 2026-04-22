module.exports = function(runtimeContext, componentSpec) {
    componentSpec.visualHandle = "DynamicElementWrapper";

    componentSpec.drawContent = function() {
        const activeModule = this.state.dynamicModule;
        const elementProperties = this.props;
        const fallbackPresenter = this.unavailableRenderer;

        return activeModule
            ? ((elementProperties.instanceRef = "dynamicModuleHost"),
               runtimeContext.renderNode(activeModule, elementProperties, elementProperties.childNodes))
            : fallbackPresenter
                ? fallbackPresenter()
                : null;
    };

    componentSpec.fetchInitialData = function() {
        return { dynamicModule: this.loadModuleAsset() };
    };

    componentSpec.onElementReady = function() {
        if (!this.state.dynamicModule) {
            this.loadModuleAsset((retrievedModule) => {
                this.updateComponentData({ dynamicModule: retrievedModule });
            });
        }
    };
};