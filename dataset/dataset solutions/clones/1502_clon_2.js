function ProcessInput( rawData )
{
  const   lineCollection = rawData.split ( "\n" ) ;

  for ( let  idx = 0 ;  idx < lineCollection.length ;  idx += 1 )
  {
    console.info ( PluralizeWord ( lineCollection [ idx ] ) ) ;
  }
}


function PluralizeWord ( singleWord )
{
  const  suffixRegex = /s$/ ;
  return  suffixRegex.test ( singleWord )
    ? singleWord + "es"
    : singleWord + "s" ;
}

ProcessInput (
  require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" )
) ;