let fileContents = require('fs') .readFileSync( '/dev/stdin' , 'utf8' ) ;
let textLines = fileContents.split( '\n' ) ;

let totalElements = +textLines.shift() ;
let valueList = textLines.shift() .trim() .split(' ') .map( function(item) { return +item; } ) ;
let numQueries = +textLines.shift() ;
let targetSums = textLines.shift().trim().split(' ').map(function(val) { return +val; });

targetSums.forEach( function(requiredSum) {
	if ( findSubsetSum( 0, requiredSum ) ) {
		console.log( 'yes' ) ;
	} else {
		console.log( 'no' ) ;
	}
} ) ;

function findSubsetSum( elementIndex , requiredSum )
{
	if ( elementIndex >= totalElements ) {
		return false ;
	}

	if ( valueList[elementIndex] === requiredSum ) {
		return true ;
	}

	return findSubsetSum( elementIndex + 1 , requiredSum ) || findSubsetSum( elementIndex + 1 , requiredSum - valueList[elementIndex] ) ;
}