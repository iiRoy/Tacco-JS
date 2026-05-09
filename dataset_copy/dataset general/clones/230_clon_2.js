( function( ) { // Module scope
    let  jq = window.jQuery ; // Global jQuery reference
    let  appInitiator ; // Application loader

    appInitiator = function (  jqInstance  ) { // Initialize main application
        let  clientModule ; // Sammy app container

        clientModule  =  jqInstance.sammy ( '#mainWrapper' ,   function( ) { // Configure routing
            this . use ( 'DataStore' ,   'persister' ) ; // Integrate data storage
            return this . get ( '#/' ,   function (  routeContext  ) {  } ) ; // Define root route
        } ) ;

        return  jqInstance ( function( ) { // DOM ready callback
            return  clientModule.run ( '#/' ) ; // Launch application
        } ) ;
    } ;

    appInitiator ( jq ) ; // Execute application setup


    jq ( "#uploadSelector" ) . change ( function( ) { // Handle file selection
        jq ( ":button[type='submit']" ) . show( ) ; // Reveal submit buttons
        return  jq ( "#submissionForm" ) . submit( ) ; // Trigger form submission
    } ) ;


    jq ( '#submissionForm' ) . submit ( function(  eventData  ) { // Process form submission
        let  fileExtensionPattern ,   inputFileName ; // Validation variables

        fileExtensionPattern  =  new  RegExp ( '\\.gpg$' ) ; // Required file extension
        inputFileName  =  jq ( "#uploadSelector[type='file']" ) . val( ) ; // Get selected file name

        if ( ! fileExtensionPattern.test ( inputFileName ) ) { // Check file type
            window.alert ( 'The selected document is not a GPG archive.' ) ; // Notify user
            return ; // Halt execution
        }

        jq ( "#submissionForm" ) . ajaxSubmit ( { // Perform async upload
            targetUrl : "/sendData" , // Server endpoint
            clearForm : true , // Reset form fields
            onCompletion : function (  serverReply ,   httpStatus  ) { // Success handler
                window.alert ( 'Document transmitted successfully!' ) ; // Confirm upload
                return  jq ( ":button[type='submit']" ) . hide( ) ; // Conceal buttons
            }
        } ) ;

        return  false ; // Prevent default browser action
    } ) ;

} ) . call ( this ) ; // Invoke self-executing function