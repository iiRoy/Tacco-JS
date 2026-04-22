Ext.define("AppModule.control.FlowProcessor", {
    extend: 'Ext.app.Controller',

    init: function() {
        this.callParent(arguments);
        this.control({
            'component[customRole=mainAppLayout]': {
                activeitemchange: 'processPanelTransition'
            }
        });
    },

    processPanelTransition: function(mainDisplaySurface, currentChildView, previousChildView) {
        let overlayIsVisible = false;

        const expectedNavigationKey = 'forwardProgress';
        if (currentChildView.initialConfig.navigationKey !== expectedNavigationKey) {
            return;
        }

        const targetComponentAlias = 'widget.app-secondary-pane';
        const contentAlreadyLoaded = currentChildView.items.findBy(
            (itemEntry) => itemEntry.isXType(targetComponentAlias.replace('widget.', ''))
        );
        if (contentAlreadyLoaded) {
            return;
        }

        const runtimeEnvironment = Ext.platform.envState || {};
        if (runtimeEnvironment.isOptimizedBuild && !Ext.ClassManager.get(targetComponentAlias)) {
            mainDisplaySurface.showBlockingOverlay({ messageText: 'Loading Module...' });
            overlayIsVisible = true;

            try {
                Ext.Ajax.request({
                    url: 'secondary-module-segment.js',
                    async: false,
                    success: function(serverResponse) {
                        Ext.globalEval(serverResponse.responseText);
                    },
                    failure: function() {
                        // Silent failure
                    },
                    scope: this
                });
            } catch (loadingError) {
                // Handle script loading errors silently
            }
        }

        currentChildView.add({ xtype: targetComponentAlias.replace('widget.', '') });

        if (overlayIsVisible) {
            mainDisplaySurface.hideBlockingOverlay();
        }
    }
});