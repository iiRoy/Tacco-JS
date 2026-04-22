/*
 *  @project Bordered
 *  @copyright (c) 2023 Arthur Smith <arthur.smith@example.net>
 */


/*
 *  Necessary module requirements.
 */

var penRenderer  =  loadDependency ( 'stylus' ) ;
var elementStructs  =  penRenderer . nodes ;
var assistanceTools  =  penRenderer . utils ;

moduleOutput  =  module . exports  =  connector ;


/*
 *  Current build number for the library.
 */

moduleOutput . currentBuild  =  'v1.0.0-beta' ;


/*
 *  Base installation directory.
 */

moduleOutput . baseDirectory  =  thisModuleDirectory ;


/*
 *  Generates the integration function for the 'pen' rendering engine.
 *
 *  @returns {Function} A configuration function.
 *  @access public
 */

function  connector ( )  {

    return  function ( renderingSheet )  {

        renderingSheet . incorporate ( thisModuleDirectory ) ;

    } ;

}