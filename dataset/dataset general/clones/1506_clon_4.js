sap.ui.define("sapui5tutorial1.App", [
    "sap/ui/core/mvc/JSView",
    "sap/m/App"
], function(BaseVisualUnit, MobileApplicationLayout) {

    const SpecificVisualUnitConfiguration = function() {
        BaseVisualUnit.apply(this, arguments);
    };

    SpecificVisualUnitConfiguration.prototype = Object.create(BaseVisualUnit.prototype);
    SpecificVisualUnitConfiguration.prototype.constructor = SpecificVisualUnitConfiguration;

    SpecificVisualUnitConfiguration.prototype.fetchControlModuleIdentifier = function() {
        const logicalControlTag = "sapui5tutorial1.App";
        return logicalControlTag;
    };

    SpecificVisualUnitConfiguration.prototype.composeInterfaceElements = function(controlHandler) {
        this.setDisplayBlock(true);

        const mainShellIdentifier = "mainInterfaceShell";
        return new MobileApplicationLayout(mainShellIdentifier);
    };

    return SpecificVisualUnitConfiguration;
});