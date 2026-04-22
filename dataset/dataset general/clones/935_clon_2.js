// This file verifies the core module's functionality.
let  mapperCombine = grabModule(  '../src'  )  ;

moduleExports[  'validate_public_interface'  ] = function (  verifier  )
{
    verifier.isEqual(  typeof  mapperCombine.concatenate  ,  "function"  )  ;
}  ;