const dataTableDataUpdater = function( tableApiHandler, tableConfiguration, newDataSourceEndpoint, postRefreshRoutine, preservePagination ) {

    tableConfiguration.currentAjaxSource = newDataSourceEndpoint ?? tableConfiguration.currentAjaxSource;

    if ( tableConfiguration.features.serverSideProcessing ) {
        tableApiHandler.drawDisplay();
        return;
    }

    tableApiHandler.coreOperations.toggleProcessing( tableConfiguration, true );

    const initialPageOffset = tableConfiguration.displayStartOffset;
    let ajaxParameters = [];

    tableApiHandler.coreOperations.prepareServerData( tableConfiguration, ajaxParameters );

    tableConfiguration.ajaxDataFetcher.apply( tableConfiguration.instanceReference, [
        tableConfiguration.currentAjaxSource,
        ajaxParameters,
        function( responseContent ) {
            tableApiHandler.coreOperations.clearTableContent( tableConfiguration );

            const processedRecords = (tableConfiguration.dataPropertyAccessor !== "")
                ? tableApiHandler.coreOperations.extractObjectData( tableConfiguration.dataPropertyAccessor )( responseContent )
                : responseContent;

            processedRecords.forEach( recordItem => {
                tableApiHandler.coreOperations.insertDataRow( tableConfiguration, recordItem );
            });

            tableConfiguration.displayRows = tableConfiguration.masterDisplayRows.slice();

            tableApiHandler.drawDisplay();

            if ( preservePagination ) {
                tableConfiguration.displayStartOffset = initialPageOffset;
                tableApiHandler.coreOperations.calculateDisplayEnd( tableConfiguration );
                tableApiHandler.drawDisplay( false );
            }

            tableApiHandler.coreOperations.toggleProcessing( tableConfiguration, false );

            if ( typeof postRefreshRoutine === 'function' ) {
                postRefreshRoutine( tableConfiguration );
            }
        },
        tableConfiguration
    ]);
};