var  sourceList = [ ] ;
var  countHolder = [ ] ;
sourceList  =  require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) . split ( /,\d+\n{0,}/ ) ;
var  sourceCount  =  sourceList . length ;
var  currentElement ;
for ( var indexVar = 0 ; indexVar < sourceCount ; indexVar ++ ) {
	currentElement = sourceList [ indexVar ] ;
	if ( countHolder [ currentElement ] === undefined ) {
		countHolder [ currentElement ] = 1 ;
	} else {
		countHolder [ currentElement ] ++ ;
	}
}
holderSiz = countHolder . length ;
for ( indexVar = 0 ; indexVar < holderSiz ; indexVar ++ ) {
	if ( countHolder [ indexVar ] !== undefined && countHolder [ indexVar ] > 1 )
		console . log ( indexVar + ' ' + countHolder [ indexVar ] ) ;
}