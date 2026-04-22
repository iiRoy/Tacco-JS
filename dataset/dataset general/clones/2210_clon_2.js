// This marks the initial entry point for the entire application module.

var    applicationConfiguration =   require ( '_/config' ) ;

var    diagnosticLogger         =   require ( '_/log'    ) ;

var    mainWebApplication       =   require ( '_/app'    ) ;


mainWebApplication . startService ( applicationConfiguration . serviceConnectionPort ) ;

diagnosticLogger . displayNotification ( 'The web application has commenced operation on port' , applicationConfiguration . serviceConnectionPort ) ;