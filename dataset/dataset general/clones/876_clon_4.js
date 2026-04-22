(function() {

    Ext.define('Application.CoreInitializer', {
        config: {
            indicatorSettings: [],
            dataFetchSettings: [],
            mainLayoutSettings: null
        },

        constructor: function(cfg) {
            this.initConfig(cfg);
        },

        activateVisualFeedback: function() {
            var feedbackInstances = {};
            this.getIndicatorSettings().forEach(function(setting) {
                var targetElement = Ext.getBody();
                var targetStore = Ext.getCmp(setting.componentIdentifier).store;
                feedbackInstances[setting.alias] = new Ext.LoadMask(targetElement, {
                    msg: setting.messageText,
                    store: targetStore
                });
            });
        },

        retrieveRemoteData: function() {
            this.getDataFetchSettings().forEach(function(setting) {
                Ext.Ajax.request({
                    url: setting.resourcePath,
                    success: function(responsePayload) {
                        Ext.getCmp(setting.targetComponentIdentifier).setValue(responsePayload.responseText);
                    },
                });
            });
        },

        constructUserInterface: function() {
            var layoutConfig = this.getMainLayoutSettings();
            var contentPanels = layoutConfig.childIdentifiers.map(function(panelId) {
                return Ext.getCmp(panelId);
            });

            new Ext.TabPanel({
                height: layoutConfig.dimensions.height,
                activeTab: layoutConfig.activeTabIndex,
                width: layoutConfig.dimensions.width,
                style: {
                    marginTop: layoutConfig.spacing.topMargin,
                    marginLeft: layoutConfig.spacing.leftMargin,
                },
                renderTo: Ext.getBody(),
                items: contentPanels
            });
        },

        launchApplicationSequence: function() {
            this.activateVisualFeedback();
            this.retrieveRemoteData();
            this.constructUserInterface();
        }
    });

    var workerSelectorElement = Ext.create('Ext.form.ComboBox', {
        id: 'workerSelectorId',
        store: Ext.create('Ext.data.Store', { fields: ['key', 'display'] }),
        hidden: true, renderTo: Ext.getBody()
    });

    var jobGridElement = Ext.create('Ext.grid.Panel', {
        id: 'jobListingId',
        store: Ext.create('Ext.data.Store', { fields: ['jobKey', 'jobName'] }),
        hidden: true, renderTo: Ext.getBody()
    });

    var staffGridElement = Ext.create('Ext.grid.Panel', {
        id: 'staffOverviewId',
        store: Ext.create('Ext.data.Store', { fields: ['staffKey', 'staffName'] }),
        hidden: true, renderTo: Ext.getBody()
    });

    var codeDisplayArea = Ext.create('Ext.form.field.TextArea', {
        id: 'codeViewerId',
        hidden: true, renderTo: Ext.getBody()
    });

    var jobDisplayPanel = Ext.create('Ext.grid.Panel', {
        id: 'jobDisplayPanel',
        title: 'Job View',
        layout: 'fit', items: []
    });

    var taskEntryForm = Ext.create('Ext.form.Panel', {
        id: 'taskEntryForm',
        title: 'Task Input',
        layout: 'fit', items: []
    });

    var personnelGrid = Ext.create('Ext.grid.Panel', {
        id: 'personnelGrid',
        title: 'Personnel List',
        layout: 'fit', items: []
    });

    var staffMemberForm = Ext.create('Ext.form.Panel', {
        id: 'staffMemberForm',
        title: 'Staff Details',
        layout: 'fit', items: []
    });

    var maskConfigurationSet = [
        { alias: 'personnelLoaderCue', messageText: "Loading Personnel Data...", componentIdentifier: 'workerSelectorId' },
        { alias: 'assignmentLoaderCue', messageText: "Loading Assignment Records...", componentIdentifier: 'jobListingId' },
        { alias: 'staffViewLoaderCue', messageText: "Loading Staff Directory...", componentIdentifier: 'staffOverviewId' }
    ];

    var ajaxConfigurationSet = [
        { resourcePath: "../workers/Foobar/code", targetComponentIdentifier: 'codeViewerId' }
    ];

    var mainInterfaceConfiguration = {
        dimensions: { height: 500, width: "98%" },
        activeTabIndex: 0,
        spacing: { topMargin: 10, leftMargin: 10 },
        childIdentifiers: ['jobDisplayPanel', 'taskEntryForm', 'personnelGrid', 'staffMemberForm']
    };

    Ext.onReady(function() {
        var appManagerInstance = Ext.create('Application.CoreInitializer', {
            indicatorSettings: maskConfigurationSet,
            dataFetchSettings: ajaxConfigurationSet,
            mainLayoutSettings: mainInterfaceConfiguration
        });

        appManagerInstance.launchApplicationSequence();
    });

})();