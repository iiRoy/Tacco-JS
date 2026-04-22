/*
 * This file serves as the primary export module for the application's UI components
 * and configuration utilities. It consolidates various modules for easier access.
 *
 * All components are exported directly from their respective paths.
 */



exports.Container = require( './components/container.jsx' ); // Main layout container component.
exports.Row       = require( './components/row.jsx' );       // Row component for grid layouts.
exports.Col       = require( './components/col.jsx' );        // Column component, typically used within a Row.


/**
 *  Below are a collection of UI components, many of which are enhanced with Radium
 *  for dynamic styling capabilities. These form the core interactive elements.
 *  Each component is imported and re-exported here for module consumers.
 */

exports.Button           = require( './components/button.jsx' );           // A standard button component.
exports.Form             = require( './components/form.jsx' );             // Wrapper for HTML forms.
exports.Input            = require( './components/input.jsx' );            // General purpose text input field.
exports.InputGroup       = require( './components/input-group.jsx' );       // Component for grouping inputs with addons.
exports.InputGroupAddon  = require( './components/input-group-addon.jsx' );  // Addon for input groups (e.g., icons, text).
exports.Textarea         = require( './components/textarea.jsx' );         // Multi-line text input area.
exports.StaticControl    = require( './components/static-control.jsx' );    // For displaying static form data.
exports.HelpText         = require( './components/help-text.jsx' );         // Contextual help text for form elements.
exports.Tabs             = require( './components/Tabs.jsx' );             // Tabbed navigation or content display.



// Global settings and utility functions for application configuration.
exports.settings          = require( './settings.js' );                    // Application-wide settings object.
exports.configureSettings = require( './util/configure-settings' );       // Function to initialize or modify settings.

// End of module exports.