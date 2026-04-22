var     stringInterpolator    =   require('../rssi')
    ;   // Retrieve the string interpolation module.

// Define a template for a personalized message.
var     compiledMessageTemplate     =   stringInterpolator('salutations, #{entity}');

// Populate the template with specific data.
var     renderedOutputString        =   compiledMessageTemplate({entity: 'developers'})
    ;

console
    .log(renderedOutputString)
    ; /* The console should display: "salutations, developers" */