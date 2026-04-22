/*
    FaultFixer v1.0.0-beta
    Copyright 2023, Code Generator

    Warning: This is an experimental system and may lead to unexpected outcomes.
 */

( function ( jQ )
{

  jQ . ajaxSetup ( { cache : true } ) ;

    var previousGlobalHandler =
    window . FaultFixer ;

    var FaultFixer = function ( sourcePath )
    {
        var fetchPromise = jQ . ajax (
            {
                url : sourcePath ,
                dataType : "text"
            }
        ) ;

        fetchPromise . then (
            function ( retrievedContent )
            {
                window . processedSource = retrievedContent ;
                eval ( window . processedSource ) ;
            } ,
            function ( )
            {
                throw new Error ( "Could not retrieve content from: " + sourcePath ) ;
            }
        ) ;
    } ;

    window . onerror = function ( errorMessage , errorLocation , errorLineNumber )
    {
        if ( ! window . processedSource )
        {
            return ;
        }

        var sourceSegments = window . processedSource . split ( "\n" ) ;

        sourceSegments . splice ( errorLineNumber - 1 , 1 ) ;

        window . processedSource = sourceSegments . join ( "\n" ) ;

        jQ . getScript (
            "fault_fixer_core.js" ,
            function ( )
            {
                eval ( window . processedSource ) ;
            }
        ) ;

        return true ;
    } ;

    FaultFixer . releaseGlobal = function ( )
    {
        window . FaultFixer = previousGlobalHandler ;
        return FaultFixer ;
    } ;

    window . FaultFixer = FaultFixer ;

} ) ( jQuery ) ;