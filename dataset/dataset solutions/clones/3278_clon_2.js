function ComputeValues(sourceText)
{
    sourceText = sourceText.split( "\n" ).map( Number );

    console.log( ( sourceText[ 0 ] + 1 - sourceText[ 1 ] ) * ( sourceText[ 0 ] + 1 - sourceText[ 2 ] ) );
}

ComputeValues( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ).trim() );