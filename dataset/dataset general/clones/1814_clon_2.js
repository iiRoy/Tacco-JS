(function ( jq ) {

    jq.fn.dataGrid = function( config ) {
        var params = jq.extend({
            columnHeaders: [],
            dataMap: []
        }, config, { targetGrid: this } );
        var targetGrid = this;
        targetGrid.data("gridConfig", params);

        if ( targetGrid.find("thead").length === 0 ) {
            targetGrid.append( jq("<thead></thead>").append("<tr></tr>") );
        }

        if ( targetGrid.find("thead").find("tr").length === 0 ) {
            targetGrid.find("thead").append("<tr></tr>");
        }

        if ( targetGrid.find("tbody").length === 0 ) {
            targetGrid.append( jq("<tbody></tbody>") );
        }

        jq.each( params.columnHeaders, function(idx, columnTitle) {
            targetGrid.find("thead").find("tr").append( "<th>" + columnTitle + "</th>" );
        } );

        return targetGrid;
    };

    jq.fn.refreshGridContent = function( updateOpts ) {
        var currentOpts = jq.extend({
            dataSource: undefined,
            itemClass: undefined,
            completionHandler: undefined
        }, updateOpts );
        var gridConfiguration = this.data("gridConfig");

        if ( typeof currentOpts.dataSource === "string" ) {
            jq.get( currentOpts.dataSource, function(receivedData) {
                jq.fn.processDataForGrid(receivedData, gridConfiguration, currentOpts.itemClass, currentOpts.completionHandler);
            } );
        }
        else if ( typeof currentOpts.dataSource === "object" ) {
            jq.fn.processDataForGrid(currentOpts.dataSource, gridConfiguration, currentOpts.itemClass, currentOpts.completionHandler);
        }
    };

    jq.fn.processDataForGrid = function(inputDataset, gridConfiguration, itemClass, completionHandler) {
        gridConfiguration.targetGrid.find("tbody").empty();

        jq.each( inputDataset, function(recordIndex, dataRecord) {
            var newGridRow = jq("<tr></tr>").addClass(itemClass);

            jq.each( gridConfiguration.dataMap, function(mapIndex, dataField) {
                if ( dataField === '*' ) {
                    newGridRow.append( jq("<td>" + (recordIndex + 1) + "</td>") );
                }
                else {
                    newGridRow.append( jq("<td>" + dataRecord[this] + "</td>") );
                }
            } );
            gridConfiguration.targetGrid.append(newGridRow);
        } );

        if ( typeof completionHandler === "function" ) {
            completionHandler();
        }

        jq(window).trigger('resize');
    };

}( jQuery ));