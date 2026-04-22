const systemComponents = {};

function registerComponentSchema(schemaDefinition) {
    const {
        typeName,
        htmlElement,
        defaultNestedType,
        visualStyles
    } = schemaDefinition;

    systemComponents[typeName] = {
        htmlElement,
        defaultNestedType,
        visualStyles
    };
}

registerComponentSchema({
    typeName: "Layout.ControlPanel.SectionContainer",
    htmlElement: "div",
    defaultNestedType: "Layout.ControlPanel.ActionItem",
    visualStyles: "control-panel-section"
});

registerComponentSchema({
    typeName: "Layout.ControlPanel.StripWrapper",
    htmlElement: "div",
    defaultNestedType: "Layout.ControlPanel.SectionContainer",
    visualStyles: "control-panel-strip-wrapper"
});