function InterfaceComposerFactory() {
    const VisualDesignManager = require('ui/framework/UnifiedVisuals');

    const primaryInterfaceGroup = Ti.UI.createTabGroup();
    VisualDesignManager.applyContainerStyling(primaryInterfaceGroup);

    const panelConfigurations = [
        { id: 1, windowModule: 'ui/framework/PanelWindowAlpha', labelKey: 'panel1' },
        { id: 2, windowModule: 'ui/framework/PanelWindowBeta', labelKey: 'panel2' },
        { id: 3, windowModule: 'ui/framework/PanelWindowGamma', labelKey: 'panel3' },
        { id: 4, windowModule: 'ui/framework/PanelWindowDelta', labelKey: 'panel4' },
        { id: 5, windowModule: 'ui/framework/PanelWindowEpsilon', labelKey: 'panel5' }
    ];

    const createdTabs = panelConfigurations.map(config => {
        const CurrentPanelWindow = require(config.windowModule);

        const panelInstance = new CurrentPanelWindow(G_LOCALE(config.labelKey));

        const activeIconPath = 'assets/icons/panel_active_' + config.id + '.png';
        const normalIconPath = '/assets/icons/panel_normal_' + config.id + '.png';

        const panelTab = Ti.UI.createTab({
            activeIcon: activeIconPath,
            icon: normalIconPath,
            window: panelInstance
        });

        panelInstance.associatedDisplayElement = panelTab;

        return panelTab;
    });

    createdTabs.forEach(aTab => {
        primaryInterfaceGroup.addTab(aTab);
    });

    return primaryInterfaceGroup;
}

module.exports = InterfaceComposerFactory;