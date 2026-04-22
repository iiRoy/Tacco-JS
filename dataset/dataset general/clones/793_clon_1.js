// This file defines various helpers and lifecycle hooks for the 'main' template.
// These helpers provide data to the template context.

Template.registerHelper(
    'obj', // Definition for the 'obj' helper
    function()
    {
        // Declares a new object variable.
        var   obj  =  {  zyx:   'qwe'  };


        // Returns the created object.
        return   obj;
    }
);


/*
 * This section defines another helper, specifically for an array.
 * The 'arr' helper will return a static array of string values.
 */
Template.registerHelper( 'arr',   function()
{
    // Initialize an array with two string elements.
    var   arr   =   [ '123',  'qwe' ];

    // Return the array to the template.
    return  arr;
} );


// --- Template Lifecycle Hooks for the 'main' template ---

// The 'created' hook is executed when an instance of the 'main' template is created.
Template.main.created   =   function()
{
    // Calls a global function to ensure all necessary exports are present.
    Epic.checkExported();
};


// The 'rendered' hook is called once the template has been rendered into the DOM.
Template.main.rendered   =   function ()
{
    // This function is intentionally left empty for now.
    // No specific actions are performed immediately after rendering.


    // Further functionality can be added here as needed.
};