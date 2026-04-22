//
// File: gallery/display/ImagePanel.js
//
// This source file was composed by an automated utility.
// It is intended for use with the Ext JS framework version 5.x.
// For licensing information, refer to the official Ext JS documentation.
//
// This file is generated automatically when project configuration changes.
//
// Manual modifications to this file may be overwritten.
//

Ext.define('Gallery.display.ImagePanel',
{
    extend: 'Ext.Panel',
    alias: 'widget.visualitem',

    config:
    {
        panelHeight: 130, // Overall height for the presentation component
        minimumHeight: 110, // Smallest allowed vertical dimension
        componentStyle: 'overflow: auto;', // CSS styles for container
        theme: 'dark', // Visual theme identifier
        layoutScheme:
        {
            alignment: 'start', // How items are aligned
            layoutType: 'vbox' // Vertical box layout
        },
        contentOverflow: 'scroll', // Scroll behavior for content
        itemTemplate:
        [
            '<figure><img alt="Visual content" src="{graphic}" width="150" /></figure>' // HTML template for image display
        ],
        childElements:
        [
            {
                xtype: 'spacer', // A flexible space component
                htmlContent: '<span>Placeholder Content</span>' // Text for the spacer
            },
            {
                xtype: 'button', // Interactive button for user action
                positionBottom: 10, // Distance from bottom edge
                elementId: 'captureBtn', // Unique identifier for the button
                positionRight: 10, // Distance from right edge
                iconClass: 'camera', // CSS class for the button icon
                iconMasked: false // Whether the icon should be masked
            }
        ],
        eventHandlers:
        [
            {
                callbackFunction: 'onCaptureAction', // Name of the method to call
                eventType: 'tap', // Type of user interaction event
                delegatedSelector: '#captureBtn' // CSS selector for event delegation
            }
        ]
    },

    // Method to handle the tap event on the capture button
    onCaptureAction: function(trigger, eventObj, extraArgs)
    {
        Ext.device.Camera.capture(
            {
                captureSource: 'photoLibrary', // Source for image acquisition
                outputDestination: 'dataURL', // Format for the acquired image data

                // Callback upon successful image capture
                onSuccess: function(imageData)
                {
                    this.dispatchAction('updateImage', this, imageData); // Trigger a custom event with image data
                },
                // Callback upon failure during image capture
                onFailure: function()
                {
                    Ext.Msg.alert('Issue', 'Failed to obtain visual content from device.'); // Display an error message
                },
                executionScope: this // Context for callbacks
            }
        );
    }
});