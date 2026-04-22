/*
 * This DataTables API extension method allows reloading data from an Ajax source.
 * DataTables typically processes sAjaxSource only during initialization.
 * This utility function provides a way to refresh the table's data dynamically
 * from a specified or existing Ajax endpoint without manual clear/add operations.
 *
 * @param {object}   oSettings       DataTables settings object.
 * @param {string}   sNewSource      Optional: New URL for the Ajax data source. If null/undefined, uses existing.
 * @param {function} fnCallback      Optional: Callback function to execute after data has been reloaded.
 * @param {boolean}  bStandingRedraw Optional: If true, attempts to maintain current paging position.
 * @returns {void}
 */
$.fn.dataTableExt.oApi.fnReloadAjax = function( oSettings, sNewSource, fnCallback, bStandingRedraw )
{
  // Check if a new Ajax source URL is provided.
  if ( sNewSource !== undefined
    && sNewSource !== null )
  {
    oSettings.sAjaxSource = sNewSource; // Update the settings with the new source.
  }


  /*
   * For server-side processing, a simple redraw is sufficient
   * as the server will handle data retrieval based on current state.
   */
  if (oSettings.oFeatures.bServerSide)
  {
    this.fnDraw(); // Trigger a redraw to fetch new data from the server.
    return;
  }

  // Indicate that the table is currently processing data.
  this.oApi._fnProcessingDisplay(oSettings, true);

  var that   = this; // Store reference to 'this' (DataTables instance)
  var iStart = oSettings._iDisplayStart; // Preserve the current display start index.
  var aData  = [];   // Initialize an array for server parameters.

  this.oApi._fnServerParams(oSettings, aData); // Add any custom server parameters.

  oSettings.fnServerData.call(
    oSettings.oInstance,
    oSettings.sAjaxSource,
    aData,
    function (json) {
      // Clear all existing rows from the table before adding new data.
      that.oApi._fnClearTable(oSettings);

      // Determine the actual data array from the JSON response.
      var aData = (oSettings.sAjaxDataProp !== "")
        ? that.oApi._fnGetObjectDataFn(oSettings.sAjaxDataProp)(json)
        : json;

      // Iterate through the received data and add each item as a new row.
      for (var i = 0; i < aData.length; i++) {
        that.oApi._fnAddData(oSettings, aData[i]);
      }

      // Re-initialize display array to reflect the new data.
      oSettings.aiDisplay = oSettings.aiDisplayMaster.slice();

      // Redraw the table with the new data.
      that.fnDraw();

      // If standing redraw is requested, attempt to maintain the current page.
      if (bStandingRedraw === true) {
        oSettings._iDisplayStart = iStart; // Restore the original display start.
        that.oApi._fnCalculateEnd(oSettings); // Recalculate end index.
        that.fnDraw(false); // Redraw without resetting paging.
      }

      // Turn off the processing indicator.
      that.oApi._fnProcessingDisplay(oSettings, false);

      // Execute the user-defined callback function, if provided.
      if (typeof fnCallback == 'function' && fnCallback !== null) {
        fnCallback(oSettings);
      }
    },
    oSettings
  );
};