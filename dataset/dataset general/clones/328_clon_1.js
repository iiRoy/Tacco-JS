/*
 *  InPlaceRichEditor, version 1.3.3
 *
 *  Author: Sebastien Grosjean (http://www.zencocoon.com, http://seb.box.re)
 *
 *  Contributors:
 *    Neil Rickards, Robert Muzslai, Andrew Petersen, Brian Hansen, Brian French,
 *    Dan Dalf, Anton Mostovoy, Hans-Peter, Filipe Pina, Min Kim, Rudi Boutinaud,
 *    Joaquin Miguez, E. Vrolijk - RedAnt Solutions, Tony Cuny, yasmary, Bernd Binder
 *
 *  InPlaceRichEditor is freely distributable under the terms of an MIT-style license.
 *  For details, please refer to the inPlaceRichEditor web site: http://inplacericheditor.box.re/
 */


if ( typeof Ajax.InPlaceEditor == 'undefined' )
{
  throw ( "InPlaceRichEditor requires including script.aculo.us' controls.js library" );
}


if ( typeof tinyMCE == 'undefined' )
{
  throw ( "InPlaceRichEditor requires including moxiecode' tiny_mce.js library and proper initialization" );
}


// --- TinyMCE Editor Manager Modifications ---

tinymce.EditorManager.oldAdd = tinymce.EditorManager.add;


tinymce.EditorManager.add = function ( ed )
{

  // Hook into the onInit event for TinyMCE
  ed.onInit.add ( function ( ed )
  {
    $( ed.id ).fire ( 'tinymce:onInit', ed );
  } );

  // Call the original add method
  return tinymce.EditorManager.oldAdd ( ed );

};



// --- InPlaceRichEditor Class Definition ---

Ajax.InPlaceRichEditor = Class.create ( Ajax.InPlaceEditor, {

  // This class extends InPlaceEditor with a few key changes:
  // - Adds support for the 'formIdSuffix' option.
  // - Removes the deprecated options layer.
  // - Integrates TinyMCE initialization.

  initialize : function ( element, url, options, tinymce_options )
  {
    this.url          = url;
    this.element      = element = $( element ); // Ensure element is a Prototype extended element
    this.prepareOptions ( );
    this.tinymceOptions = Object.clone ( tinymce_options );
    this._controls    = { };

    // The original `arguments.callee.dealWithDeprecatedOptions(options)` has been removed.

    Object.extend ( this.options, options || { } );

    this.prepareTinymceSave ( );

    if ( !this.options.formId && this.element.id )
    {
      this.options.formId = this.element.id + '-' + this.options.formIdSuffix;

      if ( $( this.options.formId ) )
      {
        this.options.formId = '';
      }
    }


    if ( this.options.externalControl )
    {
      this.options.externalControl = $( this.options.externalControl );
    }

    if ( !this.options.externalControl )
    {
      this.options.externalControlOnly = false;
    }


    this._originalBackground  = this.element.getStyle ( 'background-color' ) || 'transparent';
    this.element.title        = this.options.clickToEditText;

    this._boundCancelHandler  = this.handleFormCancellation.bind ( this );
    this._boundComplete       = ( this.options.onComplete || Prototype.emptyFunction ).bind ( this );
    this._boundFailureHandler = this.handleAJAXFailure.bind ( this );
    this._boundSubmitHandler  = this.handleFormSubmission.bind ( this );
    this._boundWrapperHandler = this.wrapUp.bind ( this );

    this.registerListeners ( );

    if ( this.options.editOnBlank && this.getText ( ).length == 0 )
    {
      this.enterEditMode ( );
    }

  },


  createControl : function ( $super, mode, handler, extraClasses )
  {
    // Only call super if TinyMCE save is not enabled
    if ( !this.options.tinymceSave )
    {
      $super ( mode, handler, extraClasses );
    }

  },


  createEditField : function ( )
  {
    var text = ( this.options.loadTextURL ? this.options.loadingText : this.getText ( ) );
    var fld;

    fld = document.createElement ( 'textarea' );

    fld.id        = this.element.id + '-' + this.options.textareaIdSuffix;
    fld.rows      = 3;
    fld.cols      = 40;
    fld.name      = this.options.paramName;
    fld.value     = text; // Text is now directly assigned, no HTML breaks conversion.
    fld.className = this.options.editorClassName;

    // TODO: Consider adding onBlur support if needed for TinyMCE integration
    // if ( this.options.submitOnBlur )
    //   fld.onblur = this._boundSubmitHandler;

    this._controls.editor = fld;

    if ( this.options.loadTextURL )
    {
      this.loadExternalText ( );
    }

    this._form.appendChild ( this._controls.editor );

  },


  enterEditMode : function ( $super, e )
  {
    // If tinymceToElementSize option is enabled, capture element dimensions
    if ( this.options.tinymceToElementSize )
    {
      var elementDimensions = this.element.getDimensions ( );
    }

    // Call the original enterEditMode method
    $super ( e );

    // Initialize TinyMCE
    this.tinymce = new tinymce.Editor ( this._controls.editor.id, this.tinymceOptions );

    this.tinymce.onInit.add ( function ( ed )
    {
      if ( this._form.hasClassName ( this.options.loadingClassName ) )
      {
        this.tinymce.setProgressState ( 1 );
      }
    }.bind ( this ) );

    this.tinymce.inplacericheditor = this;

    // Apply element dimensions to TinyMCE if option is set
    if ( this.options.tinymceToElementSize )
    {
      this.tinymce.settings.height = elementDimensions.height;
      this.tinymce.settings.width  = elementDimensions.width;
    }

    this.tinymce.render ( );

  },


  getText : function ( )
  {
    // Retrieve the innerHTML of the element
    return this.element.innerHTML;
  },


  handleAJAXFailure : function ( $super, transport )
  {
    $super ( transport );

    // Revert TinyMCE content on AJAX failure
    this.tinymce.setContent ( this.element.innerHTML );

  },


  handleFormSubmission : function ( $super, e )
  {
    // Save TinyMCE content before submitting the form
    this.tinymce.save ( );

    // Call the original form submission handler
    $super ( e );

  },


  removeForm : function ( $super )
  {
    // Attempt to remove TinyMCE instance, handle potential errors
    try
    {
      this.tinymce.remove ( );
    }
    catch ( e )
    {
      // Ignore errors during TinyMCE removal
    }

    // Call the original removeForm method
    $super ( );

  },


  // TODO: OPTIMIZATION: Integrating a `onLoadExternalText` callback into the base
  // InPlaceEditor would simplify this code and allow for easier extensions.
  loadExternalText : function ( )
  {
    this._form.addClassName ( this.options.loadingClassName );
    this._controls.editor.disabled = true;

    var options = Object.extend ( { method : 'get' }, this.options.ajaxOptions );

    Object.extend ( options, {

      parameters : 'editorId=' + encodeURIComponent ( this.element.id ),

      onComplete : function ( )
      {
        this.tinymce.setProgressState ( 0 );
      }.bind ( this ),

      onSuccess : function ( transport )
      {
        this._form.removeClassName ( this.options.loadingClassName );
        var text = transport.responseText;

        if ( this.options.stripLoadedTextTags )
        {
          text = text.stripTags ( );
        }

        this._controls.editor.value = text;
        this.tinymce.setContent ( text );
        this._controls.editor.disabled = false;
        this.postProcessEditField ( );

      }.bind ( this ),

      onFailure : this._boundFailureHandler

    } );

    new Ajax.Request ( this.options.loadTextURL, options );

  },


  postProcessEditField : function ( )
  {
    var fpc = this.options.fieldPostCreation;

    // Observe TinyMCE's onInit event to apply post-creation actions
    $( this._controls.editor.id ).observe ( 'tinymce:onInit', function ( event )
    {
      if ( fpc )
      {
        if ( fpc == 'focus' )
        {
          event.memo.focus ( );
        }
        else if ( fpc == 'activate' )
        {
          event.memo.execCommand ( 'SelectAll' );
        }
      }
    } );

  },


  prepareTinymceSave : function ( )
  {
    if ( this.options.tinymceSave )
    {
      if ( this.tinymceOptions.theme == 'simple' )
      {
        this.options.tinymceSave = false;
        return;
      }

      // Check if the save button and plugin are configured for TinyMCE
      if ( ( !( this.tinymceOptions.theme_advanced_buttons1 && this.tinymceOptions.theme_advanced_buttons1.match ( /(^|,)save(,|$)/ ) ) &&
             !( this.tinymceOptions.theme_advanced_buttons2 && this.tinymceOptions.theme_advanced_buttons2.match ( /(^|,)save(,|$)/ ) ) &&
             !( this.tinymceOptions.theme_advanced_buttons3 && this.tinymceOptions.theme_advanced_buttons3.match ( /(^|,)save(,|$)/ ) ) ) ||
           ( this.tinymceOptions.plugins == undefined || !this.tinymceOptions.plugins.match ( /(^|,)save(,|$)/ ) ) )
      {
        throw ( "InPlaceRichEditor' tinymceSave option require at least the save button and the save plugin in tinyMCE initialization." );
      }

      if ( this.options.onTinymceSave )
      {
        this.tinymceOptions.save_onsavecallback = this.options.onTinymceSave;
      }

      if ( this.options.onTinymceCancel )
      {
        this.tinymceOptions.save_oncancelcallback = this.options.onTinymceCancel;
      }
    }

  },


  prepareOptions : function ( )
  {
    this.options = Object.clone ( Ajax.InPlaceRichEditor.DefaultOptions );
    Object.extend ( this.options, Ajax.InPlaceRichEditor.DefaultCallbacks );

    [ this._extraDefaultOptions ].flatten ( ).compact ( ).each ( function ( defs )
    {
      Object.extend ( this.options, defs );
    }.bind ( this ) );

  }

} );


// --- Static Properties and Default Options ---

Object.extend ( Ajax.InPlaceRichEditor, {

  // The 'size', 'cols', 'rows', and 'autoRows' options are no longer used.
  DefaultOptions : Object.extend ( Object.clone ( Ajax.InPlaceEditor.DefaultOptions ), {
    editorClassName      : 'editor_field',
    fieldPostCreation    : 'focus', // Default action after field creation (e.g., 'focus', 'activate')
    formClassName        : 'inplacericheditor-form',
    formIdSuffix         : 'inplacericheditor',
    loadingClassName     : 'inplacericheditor-loading',
    savingClassName      : 'inplacericheditor-saving',
    textareaIdSuffix     : 'textarea-inplacericheditor',
    tinymceSave          : false, // Enable/disable TinyMCE save plugin integration
    tinymceToElementSize : false  // Adjust TinyMCE size to the target element's dimensions
  } ),


  DefaultCallbacks : Object.extend ( Object.clone ( Ajax.InPlaceEditor.DefaultCallbacks ), {
    // Callback for TinyMCE's save button
    onTinymceSave   : function ( ed ) { ed.inplacericheditor._boundSubmitHandler ( ); },
    // Callback for TinyMCE's cancel button
    onTinymceCancel : function ( ed ) { ed.inplacericheditor._boundCancelHandler ( ); }
  } )

} );