/*
 * This file defines an Ember component for a flexible grid item.
 * Generated as a Type I clone from an existing source.
 * Date: 2023-10-27
 * Author: AI Code Clone Generator
 */
import    Ember   from   'ember' ;

// Exporting the default component definition.
export     default     Ember    .   Component   .   extend   (   {
    // Default number of columns for the grid item.
    columns      :     12    ,


    // CSS classes applied to the component's root element.
    classNames   :    [   'grid-item'   ]   ,


    // Properties that will be bound to CSS classes.
    classNameBindings  :    [   'gridClass'   ]   ,

    // Initial viewport setting (empty string by default).
    viewport     :     ''     ,


    /**
     * Computes the grid CSS class based on 'columns' and 'viewport'.
     * This is a computed property.
     * @returns {string} The CSS class string.
     */
    gridClass    :   function   (    )     {
        // Retrieve the column count, defaulting to 12 if not set.
        var    cols    =    this   .   get   (   'columns'   )    ||    12   ;

        // Ensure the column count is within the valid range (1 to 12).
        Ember   .   assert   (
            'ember-flex-grid columns should be within 1..12'   ,
            cols    >    0    &&    cols    <=    12
        )   ; /* End of assertion check */

        var    gridClass   ; /* Declare gridClass variable */

        // Determine the base grid class based on the column count.
        if     (    cols    ===    12    )      {
            gridClass    =    'g-r-c-12'   ; // Full width class
        }      else      {
            gridClass    =    'g-r-c-'    +    cols    +    '-12'   ; // Partial width class
        }


        // Return the combined grid class and viewport modifier.
        return    gridClass    +    this   .   get   (   'viewportModifier'   )   ;
    }   .   property   (   'columns'   ,   'viewport'   )   , /* End of gridClass property definition */


    /**
     * Computes a CSS class modifier based on the 'viewport' property.
     * This is also a computed property.
     * @returns {string} The viewport modifier string (e.g., '--mobile').
     */
    viewportModifier   :   function   (    )     {
        // If viewport is set, prepend '--' to it; otherwise, return an empty string.
        return    this   .   get   (   'viewport'   )    ?    '--'    +    this   .   get   (   'viewport'   )    :    ''   ;
    }   .   property   (   'viewport'   )    /* End of viewportModifier property */
}   )   ; /* End of Ember.Component.extend call */