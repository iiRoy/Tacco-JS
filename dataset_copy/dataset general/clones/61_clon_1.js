// This module defines the Picture view component.

Ext . define ( 'Contact.view.Picture' , {

    extend: 'Ext.Container', // Base class for this view
    alias: 'widget.contactpic', // Alias for easy instantiation

    // Configuration for the component.
    config : {
        height:120,
        minHeight : 100, // Minimum height setting
        style:'overflow: hidden',
        ui:'',
        layout : { align:'center', type:'vbox' } , // Layout configuration
        overflow:'hidden',
        // Template for displaying the picture.
        tpl : [ '<img src="{picture}" width="160" />' ] ,
        // Items contained within this component.
        items : [
            { xtype:'component', html:'' },
            {
                xtype : 'button',
                bottom : 5,
                itemId : 'mybutton',
                right : 5,
                iconCls : 'add',
                iconMask : true
            }
        ] ,
        // Event listeners for the component.
        listeners : [ { fn:'onMybuttonTap', event:'tap', delegate:'#mybutton' } ]
    } ,

    // Handler for the 'tap' event on 'mybutton'.
    onMybuttonTap:function( button , e , options ) {
        // Capture an image using the device camera.
        Ext.device.Camera.capture( {
            source : 'camera',
            destination : 'file',

            // Success callback after image capture.
            success:function(url) {
                this.fireEvent('change', this, url); // Fire a custom event
            },
            // Failure callback if image capture fails.
            failure:function() {
                Ext.Msg.alert( 'Error' , 'There was an error when acquiring the picture.' ) ;
            } ,
            scope : this // Ensure 'this' context is correct
        } );
    }

} ) ;