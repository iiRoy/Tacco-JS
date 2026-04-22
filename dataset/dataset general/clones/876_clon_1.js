/*
 * This is a Type I clone generated from an original JavaScript snippet.
 * All functional aspects, variable names, and logic remain precisely
 * as they were in the original source code.
 *
 * The sole modifications involve changes to whitespace and the addition
 * of comments, aiming to present a visually distinct representation
 * while preserving complete semantic equivalence.
 */

Ext.onReady( function( ) { // The main application entry point, executed when the DOM is ready.

    // Initialize a LoadMask for the 'workers' data store.
    // This mask will cover the entire body of the document.
    var workersLoading = new Ext.LoadMask ( Ext.getBody(), {
            msg : "Loading Workers..."
            , store : Ext.getCmp('WorkerCombo').store // Associates with the store of 'WorkerCombo' component.
        }
    ) ;

    var jobsLoading = new Ext.LoadMask
        (
            Ext.getBody()
            , {
                msg : "Loading Jobs..."
                , store : Ext.getCmp('JobsGrid').store // Associates with the store of 'JobsGrid' component.
            }
        )
    ; /* End of jobsLoading mask definition */

    // Another LoadMask, specifically for the WorkersGrid component.
    var workersgridLoading =
        new Ext.LoadMask( Ext.getBody() ,
            {
                msg : "Loading workers..."
                , store : Ext.getCmp('WorkersGrid').store
            }
        )
    ; // This mask indicates data loading for the workers grid.


    /**
     * Initiates an AJAX request to fetch code for a specific worker.
     * The response will be set as the value of the 'WorkerCode' component.
     */
    Ext.Ajax.request (
        {
            url: "../workers/Foobar/code"
            , success: function( r )
            {
                // On successful request, update the 'WorkerCode' component.
                Ext.getCmp ( "WorkerCode" ).setValue ( r.responseText )
            }
        }
    ) ;

    /*
     * Defines the main container for the application, which is an Ext.TabPanel.
     * It holds various sub-components like grids and forms.
     */
    var container = new Ext.TabPanel (
        {
            height : 500
            , activeTab : 0 // The first tab will be active by default.
            , width : "98%"
            , style : {
                marginTop : 10
                , marginLeft : 10
            } // Custom styling for the panel.
            , renderTo : Ext.getBody() // Render this panel directly into the document body.
            , items : [
                jobsGrid,
                jobForm,
                workersGrid,
                workerForm
            ] // The components to be displayed within the tabs.
        }
    ) ; // End of TabPanel definition.

}
) ; // End of Ext.onReady function call.