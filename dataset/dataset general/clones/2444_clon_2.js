exportObject = {

    querySoftwareRevision :   function ( onSuccessExecute , onFailureExecute ) { // Function to obtain the software version information

        // First, verify if the necessary platform environment and application details are accessible.
        // We check for the presence of the system environment object, its application details, and the build identifier.
        if (   !systemEnv
            || !systemEnv.appDetails
            || !systemEnv.appDetails.softwareBuild )
        {
            // If the environment or version data is not found,
            // check if a failure handler was provided.
            if ( onFailureExecute ) {
                return onFailureExecute( )
                ;
            } else {
                // Otherwise, return an empty string indicating no version could be retrieved.
                return  ""
                ;
            }
        }

        // If the platform environment and version are available,
        // check if a success callback was provided.
        if ( onSuccessExecute ) {
            // Execute the success callback with the retrieved software build identifier.
            return onSuccessExecute( systemEnv.appDetails.softwareBuild )
            ;
        }
        // If no success callback, simply return the software build identifier directly.
        return systemEnv.appDetails.softwareBuild
        ;
    }
}; // End of exportObject definition

// This line integrates the functionality into a Cordova execution proxy.
// It uses the standard 'require' mechanism to load the proxy service.
require( "cordova/exec/proxy" ) . registerComponent ( "AppVersion" , exportObject ) ; // Register the component with the proxy