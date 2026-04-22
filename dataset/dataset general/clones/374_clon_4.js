const ViewPortManager = (function() {
    let componentDirectory = {};

    function registerDisplayComponent(componentKey, settingsBundle) {
        componentDirectory[componentKey] = settingsBundle;
    }

    function retrieveDisplayConfiguration(componentKey) {
        return componentDirectory[componentKey];
    }

    function renderDisplayComponent(componentKey, targetContainerSelector) {
        const componentConfig = retrieveDisplayConfiguration(componentKey);
        if (!componentConfig) {
            return;
        }
        const targetContainer = document.querySelector(targetContainerSelector);
        if (!targetContainer) {
            return;
        }

        if (componentConfig.movableRowConfiguration) {
            window.InteractionEngine.enableDragDrop(targetContainer, componentConfig.movableRowConfiguration);
        }

        if (componentConfig.dataTableConfiguration) {
            const dataTableInstance = window.GridFactory.create(targetContainer, componentConfig.dataTableConfiguration);
            
            if (componentConfig.dataTableNavigation) {
                window.GridControls.attach(componentConfig.dataTableNavigation.controlPanelElement, componentConfig.dataTableNavigation.actionOptions, dataTableInstance);
            }

            if (componentConfig.dataTableConfiguration.onRenderCompletion) {
                componentConfig.dataTableConfiguration.onRenderCompletion(dataTableInstance);
            }
        }
    }

    return {
        defineComponent: registerDisplayComponent,
        displayComponent: renderDisplayComponent
    };
})();

const mainDataViewerSetup = {
    dataEndpoint: 'data/source_alpha?query_id=1',
    inputFormat: 'xml',
    columnDefinitions: [
        { dataIdentifier: 'uniqueId', displayHeader: 'Ref No', componentWidth: 55 },
        { dataIdentifier: 'eventDate', displayHeader: 'Occasion Date', componentWidth: 90 },
        { dataIdentifier: 'entityName', displayHeader: 'Party', componentWidth: 100 },
        { dataIdentifier: 'monetaryValue', displayHeader: 'Sum', componentWidth: 80, alignmentStyle: "right" },
        { dataIdentifier: 'taxLevy', displayHeader: 'Levy', componentWidth: 80, alignmentStyle: "right" },
        { dataIdentifier: 'totalAmount', displayHeader: 'Gross', componentWidth: 80, alignmentStyle: "right" },
        { dataIdentifier: 'remarksField', displayHeader: 'Remarks', componentWidth: 150, sortableFlag: false }
    ],
    paginationOptions: {
        recordsPerScreen: 10,
        pageSizesAvailable: [10, 20, 30],
        assetPathForIcons: window.globalAssetPath,
        pagerElementReference: document.getElementById('paginationElement')
    },
    defaultSortField: 'uniqueId',
    showRecordSummary: true,
    initialSortDirection: "desc",
    panelTitle: "XML Data Grid",
    updateEndpoint: "data/update_record.php",
    onRenderCompletion: function(currentGridDisplay) {
        const emptyCellReference = document.querySelector("#mainViewPort .empty-row-placeholder");
        if (emptyCellReference) {
            emptyCellReference.classList.add("static-item", "non-draggable");
        }
        window.InteractionEngine.refreshDragDropState(currentGridDisplay.getContainerElement());
    }
};

const rowMoverConfiguration = {
    scrollSpeed: 0
};

const navigationPanelActions = {
    allowEdit: false,
    allowAdd: false,
    allowDelete: false
};

ViewPortManager.defineComponent('primaryGridDisplay', {
    dataTableConfiguration: mainDataViewerSetup,
    movableRowConfiguration: rowMoverConfiguration,
    dataTableNavigation: {
        actionOptions: navigationPanelActions,
        controlPanelElement: document.getElementById('navigationToolbar')
    }
});

ViewPortManager.displayComponent('primaryGridDisplay', '#mainViewPort');