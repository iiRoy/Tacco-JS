(function() {
    const operationalCheck = gloader.settings.get("debug");
    if (operationalCheck) {
        gloader.map.setProperties("glow", { "$debug": ".debug" });
    }

    const pathTemplates = new Map([
        ["mainComponent", "{$base}gloader/glow/glow{$debug}.js"],
        ["effectComponent", "{$base}gloader/fx/fx{$debug}.js"],
        ["widgetComponent", "{$base}gloader/widgets/widgets{$debug}.js"],
        ["coreModuleV150", "{$base}core/core{$debug}.js"],
        ["widgetModuleV150", "{$base}widgets/widgets{$debug}.js"],
        ["widgetCssAsset", "{$base}widgets/widgets.css"]
    ]);

    const versionCollection = [
        {
            label: "1.0.0",
            mappings: [
                ["glow", "mainComponent"],
                ["glow.anim", "effectComponent"],
                ["glow.data", "mainComponent"],
                ["glow.debug", "mainComponent"],
                ["glow.dom", "mainComponent"],
                ["glow.dragdrop", "effectComponent"],
                ["glow.events", "mainComponent"],
                ["glow.net", "mainComponent"],
                ["glow.tweens", "effectComponent"],
                ["glow.widgets", ["widgetComponent", "widgetCssAsset"]],
                ["glow.widgets.InfoPanel", "widgetComponent"],
                ["glow.widgets.Mask", "widgetComponent"],
                ["glow.widgets.Overlay", "widgetComponent"],
                ["glow.widgets.Panel", "widgetComponent"],
                ["glow.widgets.Sortable", "widgetComponent"]
            ]
        },
        { label: "1.0.1", mappings: [] },
        { label: "1.0.2", mappings: [] },
        {
            label: "1.1.0",
            mappings: [
                ["glow.anim", "mainComponent"],
                ["glow.dragdrop", "mainComponent"],
                ["glow.tweens", "mainComponent"],
                ["glow.embed", "mainComponent"],
                ["glow.forms", "mainComponent"]
            ]
        },
        { label: "1.1.1", mappings: [] },
        {
            label: "1.2.0",
            mappings: [
                ["glow.widgets.AutoComplete", "widgetComponent"],
                ["glow.widgets.AutoSuggest", "widgetComponent"],
                ["glow.widgets.Carousel", "widgetComponent"],
                ["glow.widgets.Slider", "widgetComponent"]
            ]
        },
        { label: "1.2.1", mappings: [] },
        { label: "1.2.2", mappings: [] },
        { label: "1.3.0", mappings: [] },
        { label: "1.3.1", mappings: [] },
        { label: "1.3.2", mappings: [] },
        { label: "1.3.3", mappings: [] },
        { label: "1.3.4", mappings: [] },
        { label: "1.3.5", mappings: [] },
        {
            label: "1.4.0-rc1",
            mappings: [
                ["glow.widgets.Editor", "widgetComponent"],
                ["glow.widgets.Timetable", "widgetComponent"]
            ]
        },
        { label: "1.4.0", mappings: [] },
        { label: "1.4.1", mappings: [] },
        { label: "1.4.2", mappings: [] },
        { label: "1.4.3", mappings: [] },
        {
            label: "1.5.0-rc1",
            mappings: [
                ["glow", "coreModuleV150"],
                ["glow.anim", "coreModuleV150"],
                ["glow.data", "coreModuleV150"],
                ["glow.debug", "coreModuleV150"],
                ["glow.dom", "coreModuleV150"],
                ["glow.dragdrop", "coreModuleV150"],
                ["glow.embed", "coreModuleV150"],
                ["glow.events", "coreModuleV150"],
                ["glow.forms", "coreModuleV150"],
                ["glow.net", "coreModuleV150"],
                ["glow.tweens", "coreModuleV150"],

                ["glow.widgets", ["widgetModuleV150", "widgetCssAsset"]],
                ["glow.widgets.AutoComplete", "widgetModuleV150"],
                ["glow.widgets.AutoSuggest", "widgetModuleV150"],
                ["glow.widgets.Carousel", "widgetModuleV150"],
                ["glow.widgets.Editor", "widgetModuleV150"],
                ["glow.widgets.InfoPanel", "widgetModuleV150"],
                ["glow.widgets.Mask", "widgetModuleV150"],
                ["glow.widgets.Overlay", "widgetModuleV150"],
                ["glow.widgets.Panel", "widgetModuleV150"],
                ["glow.widgets.Slider", "widgetModuleV150"],
                ["glow.widgets.Sortable", "widgetModuleV150"],
                ["glow.widgets.Timetable", "widgetModuleV150"]
            ]
        },
        { label: "1.5.0-rc2", mappings: [] },
        { label: "1.5.0", mappings: [] },
        { label: "1.5.1", mappings: [] },
        {
            label: "1.6.0-rc1",
            mappings: [
                ["glow.i18n", "coreModuleV150"]
            ]
        },
        { label: "1.6.0-rc2", mappings: [] },
        { label: "1.6.0", mappings: [] },
        { label: "1.6.1", mappings: [] },
        { label: "1.7.0-rc1", mappings: [] },
        { label: "1.7.0", mappings: [] }
    ];

    const processedConfigurations = versionCollection.map(versionEntry => {
        const currentVersionProps = { "$version": versionEntry.label };
        versionEntry.mappings.forEach(mapping => {
            const [moduleKey, templateKey] = mapping;
            if (Array.isArray(templateKey)) {
                currentVersionProps[moduleKey] = templateKey.map(key => pathTemplates.get(key));
            } else {
                currentVersionProps[moduleKey] = pathTemplates.get(templateKey);
            }
        });
        return currentVersionProps;
    });

    gloader.map.add("glow", ...processedConfigurations);
})();