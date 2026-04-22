// This file defines Handlebars templates using an AMD format.
// It uses the 'define' function for module definition.
define ( ['handlebars/handlebars'], function ( Handlebars ) {


    // Initialize template variables.
    // 'template' holds the core Handlebars template function.
    // 'templates' will store all compiled templates, initializing it if it doesn't exist.
    var template = Handlebars.template,
        templates = Handlebars.templates = Handlebars.templates || {};

    /*
     * Define the 'comments/form' template.
     * This template generates a simple HTML form.
     */
    templates['comments/form'] = template ( {
        "compiler": [ 6, ">= 2.0.0-beta.1" ],
        "main": function ( depth0, helpers, partials, data ) {

            // Declare local variables used within the template's main function.
            var helper,
                functionType = "function",
                helperMissing = helpers.helperMissing,
                escapeExpression = this.escapeExpression;

            // Return the HTML string for the form.
            // It includes an escaped content helper.
            return "<form method=\"get\">"
                 + escapeExpression ( ( ( helper = ( helper = helpers.content || ( depth0 != null ? depth0.content : depth0 ) ) != null ? helper : helperMissing ), ( typeof helper === functionType ? helper.call ( depth0, { "name": "content", "hash": {}, "data": data } ) : helper ) ) )
                 + "</form>" ;
        },
        "useData": true
    } ) ;


    // Define the 'user/listItem' template.
    // This template generates an HTML list item for a user.
    templates [ 'user/listItem' ] = template ( {
        "compiler": [ 6, ">= 2.0.0-beta.1" ],
        "main": function ( depth0, helpers, partials, data ) {

            // Declare local variables, identical to the previous template's main function.
            var helper,
                functionType = "function",
                helperMissing = helpers.helperMissing,
                escapeExpression = this.escapeExpression;

            // Return the HTML string for the list item.
            // Also includes an escaped content helper.
            return "<li class=\"user\">"
                 + escapeExpression ( ( ( helper = ( helper = helpers.content || ( depth0 != null ? depth0.content : depth0 ) ) != null ? helper : helperMissing ), ( typeof helper === functionType ? helper.call ( depth0, { "name": "content", "hash": {}, "data": data } ) : helper ) ) )
                 + "</li>" ;
        },
        "useData": true
    } ) ;


    // The module exports the 'templates' object,
    // which contains all the compiled Handlebars templates.
    return templates ;


} ) ;