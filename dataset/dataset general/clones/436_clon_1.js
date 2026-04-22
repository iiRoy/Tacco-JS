/*
 *  This file is responsible for initializing the Twilio module.
 *  It leverages the Npm.require function to load the necessary package.
 */

// Assign the Twilio module to a global variable.
// This allows other parts of the application to interact with the Twilio API.
Twilio   =   Npm.require   (   'twilio'   )   ;   //  Module loading complete.