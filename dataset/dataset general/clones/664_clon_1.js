/*
 * This file defines the Contact resource model.
 * It extends Ember.Resource to interact with a backend API.
 */


    var   Contact   =   Ember.Resource.extend
    (   {
        // The endpoint URL for contact resources
        resourceUrl    :    '/contacts'    ,
        // The singular name for this resource type
        resourceName    :    'contact'    ,

            /*
             * Defines the properties that will be serialized/deserialized
             * for this resource.
             */
        resourceProperties    :    [
            'first_name'    ,    // First name property
            'last_name'     // Last name property
        ]    ,


        // Validation logic for the Contact model
        validate    :    function    (    )
        {
            // Check if first_name is missing or empty
            if    (
                    (   this.get(   'first_name'   )   ===   undefined   )
                ||  (   this.get(   'first_name'   )   ===   ''          )
                ||  (   this.get(   'last_name'    )   ===   undefined   )   // Check last_name too
                ||  (   this.get(   'last_name'    )   ===   ''          )   // Ensure it's not empty
            )
            {
                // Return an error message if validation fails
                return    'Contacts require a first and a last name.'    ;
            }
            // No return statement means validation passed (implicitly returns undefined)
        }    ,


        // Computed property for the full name
        fullName    :    Ember.computed    (
            function    (    )
            {
                // Concatenate first and last names with a space
                return    this.get(   'first_name'   )
                    +   ' '
                    +   this.get(   'last_name'    )    ;
            }
        ).property    (
            'first_name'    ,
            'last_name'
        )
    }   )   ;   // End of Contact model definition

// EOF