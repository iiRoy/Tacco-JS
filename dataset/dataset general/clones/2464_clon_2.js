define  (  function    (importer)   {
    'use strict' ;

    let optionsBundle = {
        navStateAvailable :  window.history && window.history.pushState
    } ;

    return  function  (  ) {
        return optionsBundle  ;
    } ;
} ) ;