Ext.onReady(  function(  ){

    /* Initialize a visual indicator for staff data retrieval */
    var personnelActivityIndicator = new Ext.LoadMask( Ext.getBody() ,
        {
            msg: "Fetching Staff Information...",
            store: Ext.getCmp( 'StaffDropdown' ).store
        }
    );


    // Create a progress overlay for ongoing task operations.
    var taskProgressOverlay = new Ext.LoadMask( Ext.getBody() ,
        {
            msg: "Loading Task Records...",
            store: Ext.getCmp( 'AssignmentsDisplay' ).store
        }
    );

    /* Another loading indicator, specifically for the personnel grid component */
    var staffGridActivityOverlay = new Ext.LoadMask( Ext.getBody() ,
        {
            msg: "Retrieving staff list data...",
            store: Ext.getCmp( 'PersonnelDisplay' ).store
        }
    );

    // Initiate an asynchronous request to fetch source code for a specific personnel type.
    Ext.Ajax.request(
        {
            url: "../personnel/FooBar/script",
            success: function(  responseObj  ) {
                // Upon successful retrieval, update the designated code display area.
                Ext.getCmp( "PersonnelSourceArea" ).setValue(  responseObj.responseText  );
            }
        }
    );

    // Construct the primary interface component: a tabbed panel for various sections.
    var mainPanelHolder = new Ext.TabPanel(
        {
            height: 500,
            activeTab: 0, // Set the initial active tab to the first one.
            width: "98%",
            style: {
                marginTop: 10,
                marginLeft: 10
            },
            renderTo: Ext.getBody(), // Attach this panel to the main document body.
            items: [
                assignmentsDisplayGrid,
                assignmentEntryForm,
                personnelDisplayGrid,
                personnelEntryForm
            ]
        }
    );

});