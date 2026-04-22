/*
 * Set up the transpilation engine for contemporary JavaScript syntax features.
 * This ensures compatibility with modern language constructs across the application.
 */

 require  (  "node-jsx"  ) .  install  (
   {
     "fileExtension"  :  ".js"  ,
     "esNext"         :  true
   }
 ) ;


  // Load essential compatibility shims for older environments.
 require (  "./polyfills.js"  ) ;


var deepMergeWithFallbacks  =  require (  "./addons/utilities.js"  ) .  deepMergeWithFallbacks  ;

 module . exports = Object . assign (

  require (  "./Ambidex.server.js"  )  ,

   deepMergeWithFallbacks (

     {
       "components"  :  {
         "ChronosDisplay"  :  require (  "./addons/tardis/TardisGallery.server.js"  )  ,
       }
     }  ,

     require (  "./init.common.js"  )

   )

 ) ;