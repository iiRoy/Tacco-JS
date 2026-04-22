/*
 * This module defines a custom widget using Dojo's declare system.
 * It combines _WidgetBase, _TemplatedMixin, and _WidgetsInTemplateMixin
 * to create a templated widget with embedded widgets.
 * The widget's HTML template is loaded from the 'sample.html' file.
 */
define(
  // List of required modules for this widget definition.
  [
    "dojo/_base/declare",            // Core utility for creating classes.
    "dijit/_WidgetBase",             // The fundamental base class for all Dijit widgets.
    "dijit/_TemplatedMixin",         // A mixin to enable templating capabilities for widgets.
    "dijit/_WidgetsInTemplateMixin", // A mixin to allow parsing and instantiating other widgets within a template.
    "dojo/text!./sample.html",       // The text plugin to load the HTML template as a string.
    "dijit/form/Button"              // Although listed, this module is not directly instantiated in *this* code fragment.
  ],

  // The callback function that receives the loaded module references.
  function (
    declare,                       // Reference to dojo/_base/declare.
    _WidgetBase,                   // Reference to dijit/_WidgetBase.
    _TemplatedMixin,               // Reference to dijit/_TemplatedMixin.
    _WidgetsInTemplateMixin,       // Reference to dijit/_WidgetsInTemplateMixin.
    template                       // The loaded HTML content from sample.html.
  ) {
    // Return the new widget class definition.
    return declare(
      // The array of base classes and mixins from which this widget inherits.
      [
        _WidgetBase,               // Inherit core widget functionality.
        _TemplatedMixin,           // Add template processing.
        _WidgetsInTemplateMixin    // Enable widget parsing within the template.
      ],
      {
        // Widget properties and methods.

        /**
         * Specifies the HTML string to be used as the widget's template.
         * This value is populated by the dojo/text! plugin.
         */
        templateString: template,

        /**
         * A custom method that will be called when a specific event occurs,
         * for example, a button click within the template.
         */
        click: function ( ) {
          // Log a message to the browser's console.
          console.log( "Clicked..." );
        } // End of click method definition
      }
    ); // End of declare call
  } // End of define callback function
); // End of define call