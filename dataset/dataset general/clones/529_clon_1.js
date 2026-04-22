/*
 * THIS IS A GENERATED FILE. DO NOT EDIT MANUALLY.
 * This file is a Type I clone of the original MicrosoftMvcValidation.js.
 * Extensive modifications to whitespace and comments have been made.
 *
 * Original Copyright (C) Microsoft Corporation. All rights reserved.
 * Original file: MicrosoftMvcValidation.js
 */

// Ensure the Sys.Mvc namespace is properly registered within the application.
// This is a standard pattern for organizing JavaScript code in ASP.NET AJAX.
Type. registerNamespace ( 'Sys.Mvc' ) ;

/* ============================================================================
 * Sys.Mvc.Validation
 * ----------------------------------------------------------------------------
 * A utility function to create a new Validation object.
 * This typically represents a single validation rule applied to a field.
 ============================================================================ */
Sys.Mvc.$create_Validation = function Sys_Mvc_Validation ()
{
    return { } ; // Returns a simple empty object, likely to be extended later.
}

/* ============================================================================
 * Sys.Mvc.JsonValidationField
 * ----------------------------------------------------------------------------
 * A factory function for creating JSON validation field objects.
 * These objects hold metadata about a field for validation purposes.
 ============================================================================ */
Sys.Mvc.$create_JsonValidationField = function Sys_Mvc_JsonValidationField()
{
    return {} ;
}

/* ============================================================================
 * Sys.Mvc.JsonValidationOptions
 * ----------------------------------------------------------------------------
 * A factory function for creating JSON validation options objects.
 * These objects encapsulate the overall validation configuration for a form.
 ============================================================================ */
Sys.Mvc.$create_JsonValidationOptions = function Sys_Mvc_JsonValidationOptions()
{
    return {} ;
}

/* ============================================================================
 * Sys.Mvc.JsonValidationRule
 * ----------------------------------------------------------------------------
 * A factory function for creating JSON validation rule objects.
 * Each object defines a specific validation rule, like "required" or "numeric".
 ============================================================================ */
Sys.Mvc.$create_JsonValidationRule = function Sys_Mvc_JsonValidationRule()
{
    return {} ;
}

/* ============================================================================
 * Sys.Mvc.ValidationContext
 * ----------------------------------------------------------------------------
 * A factory function for creating validation context objects.
 * The context provides information relevant to the current validation operation.
 ============================================================================ */
Sys.Mvc.$create_ValidationContext = function Sys_Mvc_ValidationContext()
{
    return {} ;
}


/* ============================================================================
 * Sys.Mvc.NumberValidator
 * ----------------------------------------------------------------------------
 * Implements a validator specifically for numeric input.
 * It checks if a given string value can be parsed as a number.
 ============================================================================ */

Sys.Mvc.NumberValidator = function Sys_Mvc_NumberValidator ()
{
    // The constructor is intentionally left empty as initialization
    // logic is handled elsewhere or not required for this simple validator.
}

// Static method to create an instance of NumberValidator and its delegate.
Sys.Mvc.NumberValidator.create = function Sys_Mvc_NumberValidator$create (rule)
{
    /// <param name="rule" type="Sys.Mvc.JsonValidationRule">
    /// The JSON rule object which might contain specific parameters for validation.
    /// </param>
    /// <returns type="Sys.Mvc.Validator"></returns>
    // Create a delegate to the validate method, binding it to a new instance.
    return Function.createDelegate (new Sys.Mvc.NumberValidator() , new Sys.Mvc.NumberValidator().validate) ;
}

Sys.Mvc.NumberValidator.prototype =
{

    // The core validation logic for numeric values.
    validate: function Sys_Mvc_NumberValidator$validate (value, context)
    {
        /// <param name="value" type="String">
        /// The input string value to be validated.
        /// </param>
        /// <param name="context" type="Sys.Mvc.ValidationContext">
        /// The validation context, providing additional information if needed.
        /// </param>
        /// <returns type="Object"></returns>
        // If the value is null or empty, it's considered valid (or not applicable for numeric check).
        if ( Sys.Mvc._validationUtil.stringIsNullOrEmpty (value) )
        {
            return true ;
        }

        // Attempt to parse the value as a number using locale-aware parsing.
        var n = Number.parseLocale (value) ;

        // Return true if it's a valid number, false otherwise (e.g., if isNaN(n) is true).
        return ( ! isNaN (n) ) ;
    }
}


/* ============================================================================
 * Sys.Mvc.FormContext
 * ----------------------------------------------------------------------------
 * Manages validation for an entire HTML form.
 * It tracks fields, errors, and interaction with the validation summary.
 ============================================================================ */
Sys.Mvc.FormContext = function Sys_Mvc_FormContext (formElement, validationSummaryElement)
{
    /// <param name="formElement" type="Object" domElement="true">
    /// The DOM element representing the form.
    /// </param>
    /// <param name="validationSummaryElement" type="Object" domElement="true">
    /// The DOM element where validation summary messages will be displayed.
    /// </param>
    /// <field name="_validationSummaryErrorCss" type="String" static="true">
    /// CSS class for error state of validation summary.
    /// </field>
    /// <field name="_validationSummaryValidCss" type="String" static="true">
    /// CSS class for valid state of validation summary.
    /// </field>
    /// <field name="_formValidationTag" type="String" static="true">
    /// A unique tag used to store this FormContext on the form element.
    /// </field>
    /// <field name="_onClickHandler" type="Sys.UI.DomEventHandler">
    /// Handler for form click events.
    /// </field>
    /// <field name="_onSubmitHandler" type="Sys.UI.DomEventHandler">
    /// Handler for form submit events.
    /// </field>
    /// <field name="_errors" type="Array">
    /// Array to store current form-level error messages.
    /// </field>
    /// <field name="_submitButtonClicked" type="Object" domElement="true">
    /// Reference to the submit button that was clicked, if any.
    /// </field>
    /// <field name="_validationSummaryElement" type="Object" domElement="true">
    /// The validation summary DOM element.
    /// </field>
    /// <field name="_validationSummaryULElement" type="Object" domElement="true">
    /// The UL element within the validation summary where messages are listed.
    /// </field>
    /// <field name="fields" type="Array" elementType="FieldContext">
    /// An array of FieldContext objects associated with this form.
    /// </field>
    /// <field name="_formElement" type="Object" domElement="true">
    /// The actual DOM element of the form.
    /// </field>
    /// <field name="replaceValidationSummary" type="Boolean">
    /// Flag indicating whether the validation summary contents should be replaced.
    /// </field>

    this._errors = [ ] ;
    this.fields = new Array (0) ;
    this._formElement = formElement ;
    this._validationSummaryElement = validationSummaryElement ;

    // Attach this FormContext instance directly to the form DOM element for easy retrieval.
    formElement [ Sys.Mvc.FormContext._formValidationTag ] = this ;

    // If a validation summary element is provided, try to find its <ul> child.
    if ( validationSummaryElement )
    {
        var ulElements = validationSummaryElement.getElementsByTagName ( 'ul' ) ;
        if ( ulElements.length > 0 )
        {
            this._validationSummaryULElement = ulElements [0] ;
        }
    }

    // Create delegates for event handlers to ensure 'this' context is correct.
    this._onClickHandler = Function.createDelegate ( this, this._form_OnClick ) ;
    this._onSubmitHandler = Function.createDelegate ( this, this._form_OnSubmit ) ;
}

// Static method: Called when the application loads, to process initial validation metadata.
Sys.Mvc.FormContext._Application_Load = function Sys_Mvc_FormContext$_Application_Load ()
{
    var allFormOptions = window.mvcClientValidationMetadata ;

    // Check if any client validation metadata exists on the window object.
    if ( allFormOptions )
    {
        // Process each set of form options.
        while ( allFormOptions.length > 0 )
        {
            var thisFormOptions = allFormOptions.pop() ;
            Sys.Mvc.FormContext._parseJsonOptions ( thisFormOptions ) ;
        }
    }
}

// Static method: Retrieves form elements by name that are descendants of a given form.
Sys.Mvc.FormContext._getFormElementsWithName = function Sys_Mvc_FormContext$_getFormElementsWithName (formElement, name)
{
    /// <param name="formElement" type="Object" domElement="true">
    /// The parent form element to search within.
    /// </param>
    /// <param name="name" type="String">
    /// The 'name' attribute of the elements to find.
    /// </param>
    /// <returns type="Array" elementType="Object" elementDomElement="true"></returns>

    var allElementsWithNameInForm = [] ;
    var allElementsWithName = document.getElementsByName (name) ;

    // Iterate through all elements with the given name found in the document.
    for ( var i = 0 ; i < allElementsWithName.length ; i ++ )
    {
        var thisElement = allElementsWithName [ i ] ;

        // Check if the found element is actually a descendant of the specified form.
        if ( Sys.Mvc.FormContext._isElementInHierarchy ( formElement, thisElement ) )
        {
            Array.add ( allElementsWithNameInForm, thisElement ) ;
        }
    }
    return allElementsWithNameInForm ;
}

// Static method: Retrieves the FormContext instance associated with a given form element.
Sys.Mvc.FormContext.getValidationForForm = function Sys_Mvc_FormContext$getValidationForForm (formElement)
{
    /// <param name="formElement" type="Object" domElement="true">
    /// The form DOM element.
    /// </param>
    /// <returns type="Sys.Mvc.FormContext"></returns>
    // Access the FormContext directly from the form element using the stored tag.
    return formElement [ Sys.Mvc.FormContext._formValidationTag ] ;
}

// Static method: Checks if a child element is within the DOM hierarchy of a parent element.
Sys.Mvc.FormContext._isElementInHierarchy = function Sys_Mvc_FormContext$_isElementInHierarchy (parent, child)
{
    /// <param name="parent" type="Object" domElement="true">
    /// The potential parent element.
    /// </param>
    /// <param name="child" type="Object" domElement="true">
    /// The potential child element.
    /// </param>
    /// <returns type="Boolean"></returns>

    // Traverse up the parent chain from the child.
    while ( child )
    {
        // If the parent is found in the chain, return true.
        if ( parent === child )
        {
            return true ;
        }
        child = child.parentNode ; // Move to the next parent.
    }
    return false ; // Parent not found in hierarchy.
}

// Static method: Parses JSON validation options and initializes a FormContext.
Sys.Mvc.FormContext._parseJsonOptions = function Sys_Mvc_FormContext$_parseJsonOptions (options)
{
    /// <param name="options" type="Sys.Mvc.JsonValidationOptions">
    /// The JSON object containing validation options for a form.
    /// </param>
    /// <returns type="Sys.Mvc.FormContext"></returns>

    var formElement = $get ( options.FormId ) ;
    var validationSummaryElement = ( ! Sys.Mvc._validationUtil.stringIsNullOrEmpty (options.ValidationSummaryId) ) ? $get ( options.ValidationSummaryId ) : null ;

    var formContext = new Sys.Mvc.FormContext ( formElement, validationSummaryElement ) ;
    formContext.enableDynamicValidation() ;
    formContext.replaceValidationSummary = options.ReplaceValidationSummary ;

    // Iterate through each field defined in the JSON options.
    for ( var i = 0 ; i < options.Fields.length ; i ++ )
    {
        var field = options.Fields [ i ] ;
        var fieldElements = Sys.Mvc.FormContext._getFormElementsWithName ( formElement, field.FieldName ) ;
        var validationMessageElement = ( ! Sys.Mvc._validationUtil.stringIsNullOrEmpty (field.ValidationMessageId) ) ? $get ( field.ValidationMessageId ) : null ;

        var fieldContext = new Sys.Mvc.FieldContext ( formContext ) ;
        Array.addRange ( fieldContext.elements, fieldElements ) ;
        fieldContext.validationMessageElement = validationMessageElement ;
        fieldContext.replaceValidationMessageContents = field.ReplaceValidationMessageContents ;

        // Iterate through each validation rule for the current field.
        for ( var j = 0 ; j < field.ValidationRules.length ; j ++ )
        {
            var rule = field.ValidationRules [ j ] ;
            var validator = Sys.Mvc.ValidatorRegistry.getValidator ( rule ) ;

            if ( validator )
            {
                var validation = Sys.Mvc.$create_Validation() ;
                validation.fieldErrorMessage = rule.ErrorMessage ;
                validation.validator = validator ;
                Array.add ( fieldContext.validations, validation ) ;
            }
        }
        fieldContext.enableDynamicValidation() ;
        Array.add ( formContext.fields, fieldContext ) ;
    }

    // Register a callback for form submission validation.
    var registeredValidatorCallbacks = formElement.validationCallbacks ;
    if ( ! registeredValidatorCallbacks )
    {
        registeredValidatorCallbacks = [] ;
        formElement.validationCallbacks = registeredValidatorCallbacks ;
    }
    registeredValidatorCallbacks.push ( Function.createDelegate ( null, function ()
    {
        return Sys.Mvc._validationUtil.arrayIsNullOrEmpty ( formContext.validate ( 'submit' ) ) ;
    } ) ) ;

    return formContext ;
}

Sys.Mvc.FormContext.prototype =
{
    _onClickHandler: null,
    _onSubmitHandler: null,
    _submitButtonClicked: null,
    _validationSummaryElement: null,
    _validationSummaryULElement: null,
    _formElement: null,
    replaceValidationSummary: false,

    // Adds a single error message to the form's error list.
    addError: function Sys_Mvc_FormContext$addError (message)
    {
        /// <param name="message" type="String">
        /// The error message to add.
        /// </param>
        this.addErrors ( [ message ] ) ;
    },

    // Adds multiple error messages to the form's error list.
    addErrors: function Sys_Mvc_FormContext$addErrors (messages)
    {
        /// <param name="messages" type="Array" elementType="String">
        /// An array of error messages to add.
        /// </param>
        if ( ! Sys.Mvc._validationUtil.arrayIsNullOrEmpty (messages) )
        {
            Array.addRange ( this._errors, messages ) ;
            this._onErrorCountChanged() ;
        }
    },

    // Clears all error messages from the form.
    clearErrors: function Sys_Mvc_FormContext$clearErrors()
    {
        Array.clear ( this._errors ) ;
        this._onErrorCountChanged() ;
    },

    // Displays the current error messages in the validation summary.
    _displayError: function Sys_Mvc_FormContext$_displayError()
    {
        if ( this._validationSummaryElement )
        {
            if ( this._validationSummaryULElement )
            {
                Sys.Mvc._validationUtil.removeAllChildren ( this._validationSummaryULElement ) ;
                for ( var i = 0 ; i < this._errors.length ; i ++ )
                {
                    var liElement = document.createElement ( 'li' ) ;
                    Sys.Mvc._validationUtil.setInnerText ( liElement, this._errors [ i ] ) ;
                    this._validationSummaryULElement.appendChild ( liElement ) ;
                }
            }
            Sys.UI.DomElement.removeCssClass ( this._validationSummaryElement, Sys.Mvc.FormContext._validationSummaryValidCss ) ;
            Sys.UI.DomElement.addCssClass ( this._validationSummaryElement, Sys.Mvc.FormContext._validationSummaryErrorCss ) ;
        }
    },

    // Displays a success state (no errors) in the validation summary.
    _displaySuccess: function Sys_Mvc_FormContext$_displaySuccess()
    {
        var validationSummaryElement = this._validationSummaryElement ;
        if ( validationSummaryElement )
        {
            var validationSummaryULElement = this._validationSummaryULElement ;
            if ( validationSummaryULElement )
            {
                validationSummaryULElement.innerHTML = '' ;
            }
            Sys.UI.DomElement.removeCssClass ( validationSummaryElement, Sys.Mvc.FormContext._validationSummaryErrorCss ) ;
            Sys.UI.DomElement.addCssClass ( validationSummaryElement, Sys.Mvc.FormContext._validationSummaryValidCss ) ;
        }
    },

    // Enables dynamic validation by attaching event handlers to the form.
    enableDynamicValidation: function Sys_Mvc_FormContext$enableDynamicValidation()
    {
        Sys.UI.DomEvent.addHandler ( this._formElement, 'click', this._onClickHandler ) ;
        Sys.UI.DomEvent.addHandler ( this._formElement, 'submit', this._onSubmitHandler ) ;
    },

    // Finds the submit button that was clicked, if any.
    _findSubmitButton: function Sys_Mvc_FormContext$_findSubmitButton (element)
    {
        /// <param name="element" type="Object" domElement="true">
        /// The DOM element that triggered the event.
        /// </param>
        /// <returns type="Object" domElement="true"></returns>
        if ( element.disabled )
        {
            return null ;
        }
        var tagName = element.tagName.toUpperCase() ;
        var inputElement = element ;

        if ( tagName === 'INPUT' )
        {
            var type = inputElement.type ;
            if ( type === 'submit' || type === 'image' )
            {
                return inputElement ;
            }
        }
        else if ( (tagName === 'BUTTON') && (inputElement.type === 'submit') )
        {
            return inputElement ;
        }
        return null ;
    },

    // Handles the form's click event to identify the clicked submit button.
    _form_OnClick: function Sys_Mvc_FormContext$_form_OnClick (e)
    {
        /// <param name="e" type="Sys.UI.DomEvent">
        /// The DOM event object.
        /// </param>
        this._submitButtonClicked = this._findSubmitButton ( e.target ) ;
    },

    // Handles the form's submit event, performing validation.
    _form_OnSubmit: function Sys_Mvc_FormContext$_form_OnSubmit (e)
    {
        /// <param name="e" type="Sys.UI.DomEvent">
        /// The DOM event object.
        /// </param>
        var form = e.target ;
        var submitButton = this._submitButtonClicked ;

        // If a submit button was clicked and it has disableValidation set, skip validation.
        if ( submitButton && submitButton.disableValidation )
        {
            return ;
        }

        var errorMessages = this.validate ( 'submit' ) ;

        // If there are errors, prevent the default form submission.
        if ( ! Sys.Mvc._validationUtil.arrayIsNullOrEmpty (errorMessages) )
        {
            e.preventDefault() ;
        }
    },

    // Called when the error count changes, to update the UI.
    _onErrorCountChanged: function Sys_Mvc_FormContext$_onErrorCountChanged()
    {
        if ( ! this._errors.length )
        {
            this._displaySuccess() ;
        }
        else
        {
            this._displayError() ;
        }
    },

    // Validates all fields within the form.
    validate: function Sys_Mvc_FormContext$validate (eventName)
    {
        /// <param name="eventName" type="String">
        /// The name of the event triggering validation (e.g., 'submit', 'blur').
        /// </param>
        /// <returns type="Array" elementType="String"></returns>
        var fields = this.fields ;
        var errors = [] ;

        for ( var i = 0 ; i < fields.length ; i ++ )
        {
            var field = fields [ i ] ;

            // Only validate active (non-disabled) fields.
            if ( ! field.elements [ 0 ].disabled )
            {
                var thisErrors = field.validate ( eventName ) ;
                if ( thisErrors )
                {
                    Array.addRange ( errors, thisErrors ) ;
                }
            }
        }

        // If configured, update the validation summary with the new errors.
        if ( this.replaceValidationSummary )
        {
            this.clearErrors() ;
            this.addErrors ( errors ) ;
        }

        return errors ;
    }
}


/* ============================================================================
 * Sys.Mvc.FieldContext
 * ----------------------------------------------------------------------------
 * Manages validation for a single input field or group of related inputs.
 * It handles displaying messages and applying CSS classes.
 ============================================================================ */
Sys.Mvc.FieldContext = function Sys_Mvc_FieldContext (formContext)
{
    /// <param name="formContext" type="Sys.Mvc.FormContext">
    /// The parent FormContext this field belongs to.
    /// </param>
    /// <field name="_hasTextChangedTag" type="String" static="true">
    /// Tag to mark if field text has changed.
    /// </field>
    /// <field name="_hasValidationFiredTag" type="String" static="true">
    /// Tag to mark if validation has fired for this field.
    /// </field>
    /// <field name="_inputElementErrorCss" type="String" static="true">
    /// CSS class for error state of input element.
    /// </field>
    /// <field name="_inputElementValidCss" type="String" static="true">
    /// CSS class for valid state of input element.
    /// </field>
    /// <field name="_validationMessageErrorCss" type="String" static="true">
    /// CSS class for error state of validation message.
    /// </field>
    /// <field name="_validationMessageValidCss" type="String" static="true">
    /// CSS class for valid state of validation message.
    /// </field>
    /// <field name="_onBlurHandler" type="Sys.UI.DomEventHandler">
    /// Handler for blur events.
    /// </field>
    /// <field name="_onChangeHandler" type="Sys.UI.DomEventHandler">
    /// Handler for change events.
    /// </field>
    /// <field name="_onInputHandler" type="Sys.UI.DomEventHandler">
    /// Handler for input events.
    /// </field>
    /// <field name="_onPropertyChangeHandler" type="Sys.UI.DomEventHandler">
    /// Handler for propertychange events (IE specific).
    /// </field>
    /// <field name="_errors" type="Array">
    /// Array to store current field-level error messages.
    /// </field>
    /// <field name="defaultErrorMessage" type="String">
    /// Default error message for the field.
    /// </field>
    /// <field name="elements" type="Array" elementType="Object" elementDomElement="true">
    /// An array of DOM elements associated with this field (e.g., radio buttons).
    /// </field>
    /// <field name="formContext" type="Sys.Mvc.FormContext">
    /// The FormContext instance this field belongs to.
    /// </field>
    /// <field name="replaceValidationMessageContents" type="Boolean">
    /// Flag indicating whether the validation message contents should be replaced.
    /// </field>
    /// <field name="validationMessageElement" type="Object" domElement="true">
    /// The DOM element where the validation message for this field is displayed.
    /// </field>
    /// <field name="validations" type="Array" elementType="Validation">
    /// An array of Validation objects (rules) for this field.
    /// </field>

    this._errors = [ ] ;
    this.elements = new Array (0) ;
    this.validations = new Array (0) ;
    this.formContext = formContext ;

    // Create delegates for event handlers.
    this._onBlurHandler = Function.createDelegate ( this, this._element_OnBlur ) ;
    this._onChangeHandler = Function.createDelegate ( this, this._element_OnChange ) ;
    this._onInputHandler = Function.createDelegate ( this, this._element_OnInput ) ;
    this._onPropertyChangeHandler = Function.createDelegate ( this, this._element_OnPropertyChange ) ;
}

Sys.Mvc.FieldContext.prototype =
{
    _onBlurHandler: null,
    _onChangeHandler: null,
    _onInputHandler: null,
    _onPropertyChangeHandler: null,

    defaultErrorMessage: null,
    formContext: null,
    replaceValidationMessageContents: false,
    validationMessageElement: null,

    // Adds a single error message to the field's error list.
    addError: function Sys_Mvc_FieldContext$addError (message)
    {
        /// <param name="message" type="String">
        /// The error message to add.
        /// </param>
        this.addErrors ( [ message ] ) ;
    },

    // Adds multiple error messages to the field's error list.
    addErrors: function Sys_Mvc_FieldContext$addErrors (messages)
    {
        /// <param name="messages" type="Array" elementType="String">
        /// An array of error messages to add.
        /// </param>
        if ( ! Sys.Mvc._validationUtil.arrayIsNullOrEmpty (messages) )
        {
            Array.addRange ( this._errors, messages ) ;
            this._onErrorCountChanged() ;
        }
    },

    // Clears all error messages for this field.
    clearErrors: function Sys_Mvc_FieldContext$clearErrors()
    {
        Array.clear ( this._errors ) ;
        this._onErrorCountChanged() ;
    },

    // Displays the current error messages for the field.
    _displayError: function Sys_Mvc_FieldContext$_displayError()
    {
        var validationMessageElement = this.validationMessageElement ;
        if ( validationMessageElement )
        {
            // If configured, replace the content of the validation message element.
            if ( this.replaceValidationMessageContents )
            {
                Sys.Mvc._validationUtil.setInnerText ( validationMessageElement, this._errors [ 0 ] ) ;
            }
            // Apply error CSS classes.
            Sys.UI.DomElement.removeCssClass ( validationMessageElement, Sys.Mvc.FieldContext._validationMessageValidCss ) ;
            Sys.UI.DomElement.addCssClass ( validationMessageElement, Sys.Mvc.FieldContext._validationMessageErrorCss ) ;
        }

        var elements = this.elements ;
        for ( var i = 0 ; i < elements.length ; i ++ )
        {
            var element = elements [ i ] ;
            // Apply error CSS classes to the input elements.
            Sys.UI.DomElement.removeCssClass ( element, Sys.Mvc.FieldContext._inputElementValidCss ) ;
            Sys.UI.DomElement.addCssClass ( element, Sys.Mvc.FieldContext._inputElementErrorCss ) ;
        }
    },

    // Displays a success state (no errors) for the field.
    _displaySuccess: function Sys_Mvc_FieldContext$_displaySuccess()
    {
        var validationMessageElement = this.validationMessageElement ;
        if ( validationMessageElement )
        {
            // If configured, clear the content of the validation message element.
            if ( this.replaceValidationMessageContents )
            {
                Sys.Mvc._validationUtil.setInnerText ( validationMessageElement, '' ) ;
            }
            // Apply valid CSS classes.
            Sys.UI.DomElement.removeCssClass ( validationMessageElement, Sys.Mvc.FieldContext._validationMessageErrorCss ) ;
            Sys.UI.DomElement.addCssClass ( validationMessageElement, Sys.Mvc.FieldContext._validationMessageValidCss ) ;
        }

        var elements = this.elements ;
        for ( var i = 0 ; i < elements.length ; i ++ )
        {
            var element = elements [ i ] ;
            // Apply valid CSS classes to the input elements.
            Sys.UI.DomElement.removeCssClass ( element, Sys.Mvc.FieldContext._inputElementErrorCss ) ;
            Sys.UI.DomElement.addCssClass ( element, Sys.Mvc.FieldContext._inputElementValidCss ) ;
        }
    },

    // Handles the blur event for an input element.
    _element_OnBlur: function Sys_Mvc_FieldContext$_element_OnBlur (e)
    {
        /// <param name="e" type="Sys.UI.DomEvent">
        /// The DOM event object.
        /// </param>
        // Validate if text has changed or validation has previously fired.
        if ( e.target [ Sys.Mvc.FieldContext._hasTextChangedTag ] || e.target [ Sys.Mvc.FieldContext._hasValidationFiredTag ] )
        {
            this.validate ( 'blur' ) ;
        }
    },

    // Handles the change event for an input element.
    _element_OnChange: function Sys_Mvc_FieldContext$_element_OnChange (e)
    {
        /// <param name="e" type="Sys.UI.DomEvent">
        /// The DOM event object.
        /// </param>
        e.target [ Sys.Mvc.FieldContext._hasTextChangedTag ] = true ; // Mark that the text has changed.
    },

    // Handles the input event for an input element (modern browsers).
    _element_OnInput: function Sys_Mvc_FieldContext$_element_OnInput (e)
    {
        /// <param name="e" type="Sys.UI.DomEvent">
        /// The DOM event object.
        /// </param>
        e.target [ Sys.Mvc.FieldContext._hasTextChangedTag ] = true ; // Mark that the text has changed.
        if ( e.target [ Sys.Mvc.FieldContext._hasValidationFiredTag ] )
        {
            this.validate ( 'input' ) ; // Re-validate if validation has already fired.
        }
    },

    // Handles the propertychange event for an input element (IE specific).
    _element_OnPropertyChange: function Sys_Mvc_FieldContext$_element_OnPropertyChange (e)
    {
        /// <param name="e" type="Sys.UI.DomEvent">
        /// The DOM event object.
        /// </param>
        if ( e.rawEvent.propertyName === 'value' )
        {
            e.target [ Sys.Mvc.FieldContext._hasTextChangedTag ] = true ; // Mark that the text has changed.
            if ( e.target [ Sys.Mvc.FieldContext._hasValidationFiredTag ] )
            {
                this.validate ( 'input' ) ; // Re-validate if validation has already fired.
            }
        }
    },

    // Enables dynamic validation for the field by attaching event handlers.
    enableDynamicValidation: function Sys_Mvc_FieldContext$enableDynamicValidation()
    {
        var elements = this.elements ;
        for ( var i = 0 ; i < elements.length ; i ++ )
        {
            var element = elements [ i ] ;

            // Attach propertychange for IE compatibility, otherwise input event.
            if ( Sys.Mvc._validationUtil.elementSupportsEvent ( element, 'onpropertychange' ) )
            {
                var compatMode = document.documentMode ;
                if ( compatMode && compatMode >= 8 )
                {
                    Sys.UI.DomEvent.addHandler ( element, 'propertychange', this._onPropertyChangeHandler ) ;
                }
            }
            else
            {
                Sys.UI.DomEvent.addHandler ( element, 'input', this._onInputHandler ) ;
            }
            // Attach change and blur events for all browsers.
            Sys.UI.DomEvent.addHandler ( element, 'change', this._onChangeHandler ) ;
            Sys.UI.DomEvent.addHandler ( element, 'blur', this._onBlurHandler ) ;
        }
    },

    // Helper function to get the error string from a validator's return value.
    _getErrorString: function Sys_Mvc_FieldContext$_getErrorString (validatorReturnValue, fieldErrorMessage)
    {
        /// <param name="validatorReturnValue" type="Object">
        /// The value returned by a validator (true, false, or error message string).
        /// </param>