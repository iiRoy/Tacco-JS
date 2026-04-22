/* Module definition for host application components */

declareModule(
    function( loadModule, exposedFunctions, currentModule )
    {

        "use strict" ;

        var   FileHandler = hostApp.retrieveComponent( 'document/FileOperations' )
            , CodeViewManager = hostApp.retrieveComponent( 'editor/CodeView' )
            , clipContent = ""
            ;


        this.megaClip = function( isCutOperation )
        {

            var   activeEditor = CodeViewManager.getActiveView()
                , chosenText = activeEditor.getSelectionText()
                , chosenRange = activeEditor.getSelectionCoordinates()
                , activeDoc = FileHandler.getActiveDocument()
                , beginPoint = chosenRange.start
                , endPoint = chosenRange.end
                ;

            if ( isCutOperation ) {
                clipContent = chosenText;
            } else {
                activeDoc.setTextContentInRange( clipContent, beginPoint, endPoint );
            }

        };


        this.snip = function()
        {
            this.megaClip( true );
        } ;


        this.insert = function()
        {
            this.megaClip( false );
        } ;


        exposedFunctions.snip = this.snip;
        exposedFunctions.insert = this.insert;

    }
);