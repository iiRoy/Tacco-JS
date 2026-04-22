/**
 * JQuery Form Builder :: Single Line Text Plugin Module
 *
 * This file defines the core functionality for the Single Line Text field type
 * within the Form Builder application. It extends the base fbWidget prototype.
 *
 * @revision      @REVISION - Internal tracking number for source control.
 * @version       @VERSION - Current version of this plugin.
 * @copyright     2011 Lim Chee Kin (limcheekin@vobject.com) - All rights reserved.
 * @license       Apache License, Version 2.0 (http://www.apache.org/licenses/LICENSE-2.0.html)
 *
 * @date          2011-02-10 - Initial creation date.
 *
 * This module is part of the Form Builder project.
 */


var   FbSingleLineText  =  $.extend(
    {} ,

    $.fb.fbWidget.prototype ,

    {

        /**
         * Default options for the Single Line Text widget.
         * These values are inherited from the widget's prototype if not overridden.
         */
        options : {
            name            : 'Single Line Text' ,
            belongsTo       : $.fb.formbuilder.prototype.options._standardFieldsPanel , // Associates with the standard fields panel.
            _type           : 'SingleLineText' ,

            /*
             * The HTML structure for rendering a single line text input field.
             * Includes a label, input box, and a hint paragraph.
             */
            _html           : '<div>' +
                                  '<label>' +
                                      '<em></em>' +
                                      '<span></span>' +
                                  '</label>' +
                                  '<input type="text" class="textInput" />' +
                                  '<p class="formHint"></p>' +
                              '</div>' ,

            _counterField   : 'label' , // Field used for unique ID generation.
            _languages      : [ 'en' , 'zh_CN' ] , // Supported languages for localization.

            /**
             * Settings object, containing localized and global properties.
             */
            settings : {

                // English (en) specific settings.
                en : {
                    label       : 'Single Line Text' ,
                    value       : '' ,
                    description : '' ,
                    styles      : {
                        fontFamily  : 'default' , // Uses form builder's default font family.
                        fontSize    : 'default' , // Uses form builder's default font size.
                        fontStyles  : [0 , 0 , 0]  // Represents bold, italic, underline respectively (0=off, 1=on).
                    }
                } ,

                // Simplified Chinese (zh_CN) specific settings.
                zh_CN : {
                    label       : '单行文字输入' ,
                    value       : '' ,
                    description : '' ,
                    styles      : {
                        fontFamily  : 'default' , // Inherits default font family.
                        fontSize    : 'default' , // Inherits default font size.
                        fontStyles  : [0 , 0 , 0]  // Bold, italic, underline flags.
                    }
                } ,

                _persistable : true , // Indicates if these settings should be saved.
                required     : true , // Is this field mandatory?
                restriction  : 'no' , // Data input restriction (e.g., alphanumeric, letters only).

                /**
                 * Style settings for different parts of the field.
                 */
                styles : {
                    label : {
                        color           : 'default' ,
                        backgroundColor : 'default'
                    } ,
                    value : {
                        color           : 'default' ,
                        backgroundColor : 'default'
                    } ,
                    description : {
                        color           : '777777' , // Default grey for description.
                        backgroundColor : 'default'
                    }
                }

            } // End of settings object.

        } , // End of options object.


        /**
         * Initializes the Single Line Text widget instance.
         * Overrides the base _init method.
         */
        _init : function( ) {

            // Call the base plugin's _init method to ensure proper setup.
            $.fb.fbWidget.prototype._init.call( this );

            // Merge base plugin's options with the current widget's options.
            // This ensures all base properties are present and overridden correctly.
            this.options  =  $.extend( {} , $.fb.fbWidget.prototype.options , this.options );

        } ,


        /**
         * Retrieves the jQuery object representing the widget's HTML structure.
         * Populates it with current settings.
         *
         * @param {Object} event - The event object (not always used but passed).
         * @param {Object} fb    - The form builder instance.
         * @returns {jQuery} The fully constructed jQuery object for the widget.
         */
        _getWidget : function( event , fb ) {

            // Create a jQuery object from the widget's base HTML template.
            var   $jqueryObject  =  $( fb.target.options._html );

            // Log the execution start for debugging purposes.
            fb.target._log( 'fbSingleLineText._getWidget executing...' );

            // Set the label text from the current settings.
            $( 'label span' , $jqueryObject ).text( fb.settings.label );

            // If the field is required, add an asterisk to the label.
            if ( fb._settings.required ) {

                $( 'label em' , $jqueryObject ).text( '*' );

            }

            // Set the value of the input field.
            $( 'input' , $jqueryObject ).val( fb.settings.value );

            // Set the description text for the hint paragraph.
            $( '.formHint' , $jqueryObject ).text( fb.settings.description );

            // Log the execution end.
            fb.target._log( 'fbSingleLineText._getWidget executed.' );

            // Return the prepared jQuery object.
            return   $jqueryObject;

        } ,


        /**
         * Generates the language-specific settings section for the field.
         * This includes label, value, description, and font style settings.
         *
         * @param {Object} event - The event object.
         * @param {Object} fb    - The form builder instance.
         * @returns {Array} An array of jQuery objects representing the settings panels.
         */
        _getFieldSettingsLanguageSection : function( event , fb ) {

            fb.target._log( 'fbSingleLineText._getFieldSettingsLanguageSection executing...' );

            // Create a label input field for the widget's main label.
            var   $label  =  fb.target._label( { label: 'Label' , name: 'field.label' } )
                                 .append( '<input type="text" id="field.label" />' );

            // Populate the label input and attach a keyup event handler.
            $( 'input' , $label )
                .val( fb.settings.label )
                .keyup( function( event ) {
                    var   value  =  $( this ).val( );
                    fb.item.find( 'label span' ).text( value );
                    fb.settings.label  =  value;
                    fb.target._updateSettings( fb.item ); // Update persisted settings.
                    fb.target._updateName( fb.item , value ); // Update widget name.
                } );


            // Create an input field for the default value of the text field.
            var   $value  =  fb.target._label( { label: 'Value' , name: 'field.value' } )
                                  .append( '<input type="text" id="field.value" />' );

            // Populate the value input and attach a keyup event handler.
            $( 'input' , $value )
                .val( fb.settings.value )
                .keyup( function( event ) {
                    var   value  =  $( this ).val( );
                    fb.item.find( '.textInput' ).val( value );
                    fb.settings.value  =  value;
                    fb.target._updateSettings( fb.item ); // Update persisted settings.
                } );


            // Create a textarea for the field's description.
            var   $description  =  fb.target._label( { label: 'Description' , name: 'field.description' } )
                                        .append( '<textarea id="field.description" rows="2"></textarea>' );

            // Populate the description textarea and attach a keyup event handler.
            $( 'textarea' , $description )
                .val( fb.settings.description )
                .keyup( function( event ) {
                    var   value  =  $( this ).val( );
                    fb.item.find( '.formHint' ).text( value );
                    fb.settings.description  =  value;
                    fb.target._updateSettings( fb.item ); // Update persisted settings.
                } );


            // Retrieve current and default styles for font panel initialization.
            var   styles     =  fb.settings.styles;
            var   fbStyles   =  fb.target._getFbLocalizedSettings( ).styles;

            var   fontFamily =  styles.fontFamily  !=  'default'  ?  styles.fontFamily  :  fbStyles.fontFamily ;
            var   fontSize   =  styles.fontSize    !=  'default'  ?  styles.fontSize    :  fbStyles.fontSize ;

            // Create the font style panel.
            var   $fontPanel  =  fb.target._fontPanel( {
                                     fontFamily : fontFamily ,
                                     fontSize   : fontSize ,
                                     fontStyles : styles.fontStyles ,
                                     idPrefix   : 'field.' ,
                                     nofieldset : true // Do not wrap in a fieldset.
                                 } );


            // Handle bold font style changes.
            $( "input[id$='field.bold']" , $fontPanel )
                .change( function( event ) {
                    if ( $( this ).attr( 'checked' ) ) {
                        fb.item.find( 'label' ).css( 'fontWeight' , 'bold' );
                        fb.item.find( '.textInput' ).css( 'fontWeight' , 'bold' );
                        styles.fontStyles[0]  =  1; // Set bold flag.
                    } else {
                        fb.item.find( 'label' ).css( 'fontWeight' , 'normal' );
                        fb.item.find( '.textInput' ).css( 'fontWeight' , 'normal' );
                        styles.fontStyles[0]  =  0; // Unset bold flag.
                    }
                    fb.target._updateSettings( fb.item ); // Persist changes.
                } );


            // Handle italic font style changes.
            $( "input[id$='field.italic']" , $fontPanel )
                .change( function( event ) {
                    if ( $( this ).attr( 'checked' ) ) {
                        fb.item.find( 'label' ).css( 'fontStyle' , 'italic' );
                        fb.item.find( '.textInput' ).css( 'fontStyle' , 'italic' );
                        styles.fontStyles[1]  =  1; // Set italic flag.
                    } else {
                        fb.item.find( 'label' ).css( 'fontStyle' , 'normal' );
                        fb.item.find( '.textInput' ).css( 'fontStyle' , 'normal' );
                        styles.fontStyles[1]  =  0; // Unset italic flag.
                    }
                    fb.target._updateSettings( fb.item ); // Persist changes.
                } );


            // Handle underline font style changes.
            $( "input[id$='field.underline']" , $fontPanel )
                .change( function( event ) {
                    if ( $( this ).attr( 'checked' ) ) {
                        fb.item.find( 'label span' ).css( 'textDecoration' , 'underline' );
                        fb.item.find( '.textInput' ).css( 'textDecoration' , 'underline' );
                        styles.fontStyles[2]  =  1; // Set underline flag.
                    } else {
                        fb.item.find( 'label span' ).css( 'textDecoration' , 'none' );
                        fb.item.find( '.textInput' ).css( 'textDecoration' , 'none' );
                        styles.fontStyles[2]  =  0; // Unset underline flag.
                    }
                    fb.target._updateSettings( fb.item ); // Persist changes.
                } );


            // Handle font family changes.
            $( "input[id$='field.fontFamily']" , $fontPanel )
                .change( function( event ) {
                    var   value  =  $( this ).val( );
                    fb.item.css( 'fontFamily' , value );
                    fb.item.find( '.textInput' ).css( 'fontFamily' , value );
                    styles.fontFamily  =  value;
                    fb.target._updateSettings( fb.item ); // Persist changes.
                } );


            // Handle font size changes.
            $( "select[id$='field.fontSize']" , $fontPanel )
                .change( function( event ) {
                    var   value  =  $( this ).val( );
                    fb.item.find( 'label' ).css( 'fontSize' , value + 'px' );
                    fb.item.find( '.textInput' ).css( 'fontSize' , value + 'px' );
                    styles.fontSize  =  value;
                    fb.target._updateSettings( fb.item ); // Persist changes.
                } );

            fb.target._log( 'fbSingleLineText._getFieldSettingsLanguageSection executed.' );

            // Return the assembled settings panels.
            return   [
                         fb.target._twoColumns( $label , $value ) ,
                         fb.target._oneColumn( $description ) ,
                         $fontPanel
                     ];

        } ,


        /**
         * Generates the general settings section for the field.
         * This includes required status, restriction type, and color settings.
         *
         * @param {Object} event - The event object.
         * @param {Object} fb    - The form builder instance.
         * @returns {Array} An array of jQuery objects representing the settings panels.
         */
        _getFieldSettingsGeneralSection : function( event , fb ) {

            fb.target._log( 'fbSingleLineText._getFieldSettingsGeneralSection executing...' );

            // Checkbox for 'Required' status.
            var   $required  =  $( '<div><input type="checkbox" id="field.required" />&nbsp;Required</div>' );

            // Dropdown for 'Restriction' type.
            var   $restriction  =  $( '<div><select id="field.restriction" style="width: 99%">' +
                                         '<option value="no">any character</option>' +
                                         '<option value="alphanumeric">alphanumeric only</option>' +
                                         '<option value="letterswithbasicpunc">letters or punctuation only</option>' +
                                         '<option value="lettersonly">letters only</option>' +
                                     '</select></div>' );

            // Group 'Required' and 'Restriction' into a value panel.
            var   $valuePanel  =  fb.target._fieldset( { text: 'Value' } )
                                     .append( fb.target._twoColumns( $required , $restriction ) );

            // Adjust CSS for columns within the value panel.
            $( '.col1' , $valuePanel ).css( 'width' , '32%' ).removeClass( 'labelOnTop' );
            $( '.col2' , $valuePanel ).css( 'marginLeft' , '34%' ).removeClass( 'labelOnTop' );


            // Handle 'Required' checkbox changes.
            $( 'input' , $required )
                .attr( 'checked' , fb.settings.required )
                .change( function( event ) {
                    if ( $( this ).attr( 'checked' ) ) {
                        fb.item.find( 'em' ).text( '*' );
                        fb.settings.required  =  true;
                    } else {
                        fb.item.find( 'em' ).text( '' );
                        fb.settings.required  =  false;
                    }
                    fb.target._updateSettings( fb.item ); // Persist changes.
                } );


            // Select the current restriction option and handle changes.
            $( "select option[value='" + fb.settings.restriction + "']" , $restriction )
                .attr( 'selected' , 'true' );
            $( 'select' , $restriction )
                .change( function( event ) {
                    fb.settings.restriction  =  $( this ).val( );
                    fb.target._log( 'fb.settings.restriction = ' + fb.settings.restriction );
                    fb.target._updateSettings( fb.item ); // Persist changes.
                } );


            // Get the text input element for style adjustments.
            var   $textInput  =  fb.item.find( '.textInput' );
            var   styles      =  fb.settings.styles;

            // Initialize default colors if not already set.
            if ( styles.value.color  ==  'default' ) {
                styles.value.color  =  $textInput.css( 'color' );
            }
            if ( styles.value.backgroundColor  ==  'default' ) {
                styles.value.backgroundColor  =  $textInput.css( 'backgroundColor' );
            }

            // Create the color panel for label, value, and description.
            var   $colorPanel  =  fb.target._labelValueDescriptionColorPanel( styles );


            // Handle label text color changes.
            $( "input[id$='field.label.color']" , $colorPanel )
                .change( function( event ) {
                    var   value  =  $( this ).data( 'colorPicker' ).color;
                    fb.item.css( 'color' , '#' + value ); // Apply to the main widget item for label.
                    styles.label.color  =  value;
                    fb.target._updateSettings( fb.item ); // Persist changes.
                } );


            // Handle label background color changes.
            $( "input[id$='field.label.backgroundColor']" , $colorPanel )
                .change( function( event ) {
                    var   value  =  $( this ).data( 'colorPicker' ).color;
                    fb.item.css( 'backgroundColor' , '#' + value ); // Apply to main widget item.
                    styles.label.backgroundColor  =  value;
                    fb.target._updateSettings( fb.item ); // Persist changes.
                } );


            // Handle value (input text) color changes.
            $( "input[id$='field.value.color']" , $colorPanel )
                .change( function( event ) {
                    var   value  =  $( this ).data( 'colorPicker' ).color;
                    $textInput.css( 'color' , '#' + value ); // Apply to the text input.
                    styles.value.color  =  value;
                    fb.target._updateSettings( fb.item ); // Persist changes.
                } );


            // Handle value (input text) background color changes.
            $( "input[id$='field.value.backgroundColor']" , $colorPanel )
                .change( function( event ) {
                    var   value  =  $( this ).data( 'colorPicker' ).color;
                    $textInput.css( 'backgroundColor' , '#' + value ); // Apply to the text input.
                    styles.value.backgroundColor  =  value;
                    fb.target._updateSettings( fb.item ); // Persist changes.
                } );


            // Handle description text color changes.
            $( "input[id$='field.description.color']" , $colorPanel )
                .change( function( event ) {
                    var   value  =  $( this ).data( 'colorPicker' ).color;
                    fb.item.find( '.formHint' ).css( 'color' , '#' + value ); // Apply to the hint.
                    styles.description.color  =  value;
                    fb.target._updateSettings( fb.item ); // Persist changes.
                } );


            // Handle description background color changes.
            $( "input[id$='field.description.backgroundColor']" , $colorPanel )
                .change( function( event ) {
                    var   value  =  $( this ).data( 'colorPicker' ).color;
                    fb.item.find( '.formHint' ).css( 'backgroundColor' , '#' + value ); // Apply to the hint.
                    styles.description.backgroundColor  =  value;
                    fb.target._updateSettings( fb.item ); // Persist changes.
                } );

            fb.target._log( 'fbSingleLineText._getFieldSettingsGeneralSection executed.' );

            // Return the assembled general settings panels.
            return   [ $valuePanel , $colorPanel ];

        } ,


        /**
         * Applies language-specific changes to the widget's appearance.
         * This method is called when the language setting is updated.
         *
         * @param {Object} event - The event object.
         * @param {Object} fb    - The form builder instance.
         */
        _languageChange : function( event , fb ) {

            fb.target._log( 'fbSingleLineText.languageChange executing...' );

            var   styles         =  fb.settings.styles;
            var   fbStyles       =  fb.target._getFbLocalizedSettings( ).styles;

            // Determine effective font styles, falling back to defaults if necessary.
            var   fontFamily     =  styles.fontFamily  !=  'default'  ?  styles.fontFamily  :  fbStyles.fontFamily;
            var   fontSize       =  styles.fontSize    !=  'default'  ?  styles.fontSize    :  fbStyles.fontSize;

            var   fontWeight     =  styles.fontStyles[0]  ==  1  ?  'bold'     :  'normal';
            var   fontStyle      =  styles.fontStyles[1]  ==  1  ?  'italic'   :  'normal';
            var   textDecoration =  styles.fontStyles[2]  ==  1  ?  'underline':  'none';


            // Apply font family to the main item.
            fb.item.css( 'fontFamily' , fontFamily );

            // Update label text and text decoration.
            fb.item.find( 'label span' )
                .text( fb.settings.label )
                .css( 'textDecoration' , textDecoration );

            // Update label font weight, style, and size.
            fb.item.find( 'label' )
                .css( 'fontWeight' , fontWeight )
                .css( 'fontStyle' , fontStyle )
                .css( 'fontSize' , fontSize + 'px' );


            // Update input field value and font styles.
            fb.item.find( '.textInput' )
                .val( fb.settings.value )
                .css( 'fontWeight' , fontWeight )
                .css( 'fontStyle' , fontStyle )
                .css( 'textDecoration' , textDecoration )
                .css( 'fontFamily' , fontFamily )
                .css( 'fontSize' , fontSize + 'px' );

            // Update description text.
            fb.item.find( '.formHint' )
                .text( fb.settings.description );

            fb.target._log( 'fbSingleLineText.languageChange executed.' );

        } // End of _languageChange.

    } // End of FbSingleLineText object literal.

); // End of $.extend call.


// Register the widget with jQuery UI's widget factory.
$.widget( 'fb.fbSingleLineText' , FbSingleLineText );