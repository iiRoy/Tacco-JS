// This object holds the configuration for the communication module.
communicationSetup =
{
    // These are the various configurable parameters for the message system.
    options:
    {
        // Default value for the sender's full identification string.
        senderName :  ''  ,

        // The electronic mail address where communications will be dispatched.
        recipientAddress :  ''  ,

        // Function responsible for dynamically generating the subject line of the email.
        generateTopic :  function (  details  )
        {
            // Constructs a descriptive subject based on the sender's provided identifier.
            return  'Inquiry from '  +  details.originator  +  ' through web portal.'  ;
        }
    }
} ;