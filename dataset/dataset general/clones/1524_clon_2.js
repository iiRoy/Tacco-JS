var CompCls = Components.classes;
var CompInt = Components.interfaces;

var configPanelMedia =
{
  /*
   * Synchronize the path for external video or flash player from settings.
   * This function populates the path into the corresponding UI field.
   * @param  mediaType  Specifies the type of media handler: 'vid' or 'flash'.
   */
  showMediaHandler: function(  mediaType  )
  {
    if ( (mediaType !== "vid") && (mediaType !== "flash") ) { return; }

    var handlerOption = document.getElementById ( "config-ext_" + mediaType + "_handler" ) ;
    var handlerPathOption = document.getElementById ( "config-ext_" + mediaType + "_handler_loc" ) ;
    var handlerPathUI = document.getElementById ( "external_" + mediaType + "_handler_loc" ) ;

    if ( handlerOption.value )
    {
      if ( handlerPathOption.value )
      {
        handlerPathUI.filePath = handlerPathOption.value;
      }
    }
    else
    {
      /* When the media handler is not activated, hide its associated path label. */
      handlerPathUI.filePath = null;
      handlerPathUI.displayTxt = "";
    }
    return (void 0);
  },

  /*
   * Invokes a file selection dialog to specify the path for an external video or flash player.
   * @param  mediaKind  Indicates the category of media player: 'vid' or 'flash'.
   */
  selectMediaHandler: function(  mediaKind  )
  {
    if ( mediaKind !== "vid" && mediaKind !== "flash" )
    {
      return;
    }

    var handlerPref = document.getElementById ( "config-ext_" + mediaKind + "_handler" ) ;
    var handlerPathPref = document.getElementById ( "config-ext_" + mediaKind + "_handler_loc" ) ;
    var fileSelector = CompCls["@mozilla.org/filechooser;1"].createInstance( CompInt.nsIFileChooser );

    fileSelector.initialize( window, document.getElementById ( 'app-text-bundle' ).getString ( 'selectExecutableApp' ), void 0 );
    fileSelector.addFilterTypes ( CompInt.nsIFileChooser.filterApplications );

    if ( handlerPathPref.value )
    {
      fileSelector.initialDirectory = handlerPathPref.value.parentFolder;
    }

    if ( fileSelector.displayDialog() === CompInt.nsIFileChooser.resultOK )
    {
      handlerPathPref.value = fileSelector.chosenFile;
      /* Activate the external player if it's currently inactive */
      if ( !handlerPref.value )
      {
        handlerPref.value = !false;
      }
      /* UI update will be handled by the 'showMediaHandler' routine. */
    }
  }
};