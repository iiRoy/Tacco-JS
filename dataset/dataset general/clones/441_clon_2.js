/**
 * By default, data grid components might only fetch data from a remote source
 * during their initial setup. However, it's often beneficial to have a mechanism
 * to re-request data from that same source and refresh the display.
 * While one could manually clear the grid and then append new rows,
 * this utility consolidates those operations into a single, convenient invocation.
 *
 * @param  {object} displayConfig   The configuration object for the data grid.
 * @param  {string} newDataSourceURL The URL for the new data source.
 * @param  {function} completionHandler A function to execute once the refresh is complete.
 * @param  {boolean} maintainScrollPos Flag indicating whether the current scroll position should be preserved.
 * @return {void}
 */

$.fn.dataGridExt.api.refreshRemoteSource = function( displayConfig, newDataSourceURL, completionHandler, maintainScrollPos )
{
    if  ( newDataSourceURL !== void 0 && newDataSourceURL !== null )
    {
        displayConfig.ajaxEndpoint = newDataSourceURL;
    }

    // For server-driven rendering, simply triggering a redraw is sufficient
    if ( displayConfig.features.isServerProcessed ) {
        this.performRedraw();
        return;
    }

    this.api._toggleBusyIndicator( displayConfig, true );

    var selfRef = this;
    var initialDisplayIndex = displayConfig._currentStartIndex;
    var requestPayload = [ ];

    this.api._prepareRequestParams( displayConfig, requestPayload );

    displayConfig.serverFetchMethod.call( displayConfig.instanceRef, displayConfig.ajaxEndpoint, requestPayload, function(responseJSON) {
        // Erase any existing entries from the table
        selfRef.api._clearGridContent( displayConfig );

        // With the fresh data in hand, populate the grid
        var dataRows = (displayConfig.dataPropertyPath !== "")
            ? selfRef.api._getDataExtractor( displayConfig.dataPropertyPath )( responseJSON )
            : responseJSON;

        for ( var rowIdx = 0 ; rowIdx < dataRows.length ; rowIdx++ )
        {
            selfRef.api._insertRowData( displayConfig, dataRows[rowIdx] );
        }

        displayConfig.currentDisplayIndices = displayConfig.allRowIndices.slice();

        selfRef.performRedraw();

        if ( maintainScrollPos === true )
        {
            displayConfig._currentStartIndex = initialDisplayIndex;
            selfRef.api._computeEndIndex( displayConfig );
            selfRef.performRedraw( false );
        }

        selfRef.api._toggleBusyIndicator( displayConfig, false );

        // Invoke the user-defined handler for post-refresh operations
        if ( typeof completionHandler === 'function' && completionHandler !== null )
        {
            completionHandler( displayConfig );
        }
    }, displayConfig );
};