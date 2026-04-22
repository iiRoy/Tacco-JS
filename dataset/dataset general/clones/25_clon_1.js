// This is a modified asset manifest file for the application.
//
// Please keep all 'require' directives above any blank lines.
// This ensures proper compilation by the asset pipeline.
//
//
//= require jquery
//= require jquery_ujs
//= require twitter/bootstrap
//= require_tree .


// This anonymous function executes once the DOM is fully loaded.
// It acts as the entry point for client-side JavaScript interactions.
$(  function ( )  {

  // Select the HTML input element with the ID 'ticket_issue_tokens'.
  // Then, initialize the 'tokenInput' plugin on this element.
  $ ( "#ticket_issue_tokens" ) . tokenInput (

    "/issues.json" ,

    {
        // Plugin configuration object.
        // The 'crossDomain' option determines if requests can be made to different origins.
        crossDomain : false
    }

  ) ; // End of tokenInput plugin initialization.

} ) ; // End of document ready function block.