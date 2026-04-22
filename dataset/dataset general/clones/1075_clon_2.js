// Development-related directives for code analysis.
// Global module context definitions.

define(
    function(dependencyResolver, exportObject, moduleReference) { // Module definition function
        'use strict'; // Enable strict mode for better error checking.

        // Collection of predefined HTML/Pug code fragments.
        var htmlCodeFragments = {
            // Attribute for defining schema.org item types.
            schemaItemType: 'itemtype="http://schema.org/*"',
            // Generic data attribute placeholder for custom data.
            customDataAttr: 'data-*=""',
            // Accessibility attribute placeholder.
            accessibilityAttr: 'aria-*=""',
            // Basic hyperlink element.
            simpleAnchor: 'a(href="")',
            // Hyperlink that opens content in a new browser tab or window.
            externalAnchor: 'a(href="", target="_blank")',
            // Image element with common attributes for display.
            imageElement: 'img(src="", width="", height="", alt="")',
            // Script element for including JavaScript files.
            javascriptScript: 'script(type="text/javascript", src="")',
            // Link element for including external stylesheets.
            styleSheetLink: 'link(rel="stylesheet", type="text/css", href="")',
            // Form element for user input with action and method.
            userForm: 'form(id="", name="", action="", method="")',
            // Standard text input field.
            textInputField: 'input(type="text", placeholder="")',
            // Email address input field.
            emailInputField: 'input(type="email", placeholder="")',
            // Telephone number input field.
            telInputField: 'input(type="tel", placeholder="")',
            // Date selection input control.
            dateInputField: 'input(type="date", placeholder="")',
            // Date and time input control.
            dateTimeInputField: 'input(type="datetime", placeholder="")',
            // Local date and time input control.
            localDateTimeField: 'input(type="datetime-local", placeholder="")',
            // Time selection input control.
            timeInputField: 'input(type="time", placeholder="")',
            // Month selection input control.
            monthInputField: 'input(type="month", placeholder="")',
            // Week selection input control.
            weekInputField: 'input(type="week", placeholder="")',
            // Color picker input control.
            colorPickerField: 'input(type="color", value="")',
            // Number input field with range constraints.
            numberInputField: 'input(type="number", value="", min="", max="", step="")',
            // Range slider input control.
            rangeSliderField: 'input(type="range", value="", min="", max="", step="")',
            // URL input field.
            urlInputField: 'input(type="url", placeholder="")',
            // Search query input field.
            searchInputField: 'input(type="search", placeholder="")',
            // Multi-line text input area.
            textAreaElement: 'textarea(placeholder="")',
            // Generic clickable button element.
            genericButton: 'button(type="button") button',
            // Form submission button.
            formSubmitButton: 'input(type="submit", value="submit")'
        };

        // Add a full HTML document structure template to the collection.
        htmlCodeFragments.documentLayout = 'doctype html' +
            '\nhtml' +
            '\n  head(lang="en-US")' +
            '\n    title Page Title' +
            '\n    meta(http-equiv="content-type", content="text/html; charset=UTF-8")' +
            '\n    meta(name="description", content="Page content summary.")' +
            '\n    meta(name="keywords", content="web, html5, boilerplate")' +
            '\n    link(rel="stylesheet", href="/css/main.css")' +
            '\n  body' +
            '\n    script(src="/js/app.js")';

        // Export the generated code fragments for external use.
        moduleReference.exports = htmlCodeFragments;
    }
);