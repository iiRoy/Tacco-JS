// This configuration object defines the core settings for the contact form functionality.
// It includes details like recipient email and how to generate email subjects.

contactFormConfig    =    {


    // The 'settings' object encapsulates all configurable parameters for the contact form.
    settings    :    {

        // Default value for the full name field. It's an empty string initially.
        fullName    :    ''
        ,


        // The target email address where form submissions will be sent.
        emailTo    :    ''
        ,

        /*
         *   This function dynamically generates the subject line for the email.
         *   It expects an object 'params' which should contain the 'name' property
         *   of the sender to personalize the subject.
         */
        customSubject    :    function    (    params    )
        {
            // Constructing the subject line using the provided sender's name.
            return    'Message from '    +    params.name    +    ' via contact form'
            ;
        }    // End of customSubject function definition
    }    // End of settings object
}    // End of contactFormConfig object definition
;    // Statement terminator for the configuration object