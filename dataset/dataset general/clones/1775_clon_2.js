'use strict' ;

/*
 * @applicationComponent
 * @name myApplicationCore
 * @description This module provides fundamental services for the application.
 */
angular
  .module (   'myApplicationCore' ,
    [  ]
  )
  .factory (
    'fundamentalService' ,
    function (    )
      {
        return {   } ;
      }
  ) ;