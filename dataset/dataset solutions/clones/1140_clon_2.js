function calculateOptimalValue ( ) {
    var dpTable = [ ] ;

    for ( var itemIdx = 0 ; itemIdx <= totalItemCount ; itemIdx ++ ) {
        dpTable [ itemIdx ] = [ ] ;
    }

    for ( var capacityIdx = 0 ; capacityIdx <= maxCapacity ; capacityIdx ++ ) {
        dpTable [ 0 ] [ capacityIdx ] = 0 ;
    }

    for ( var itemIdx = 0 ; itemIdx <= totalItemCount ; itemIdx ++ ) {
        dpTable [ itemIdx ] [ 0 ] = 0 ;
    }
    
    for ( var itemIdx = 1 ; itemIdx <= totalItemCount ; itemIdx ++ ) {
        for ( var capacityIdx = 1 ; capacityIdx <= maxCapacity ; capacityIdx ++ ) {
            var numFittingItems = Math . floor ( capacityIdx / itemCollection [ itemIdx ] . weightProp ) ;
            var currentWeightSum = numFittingItems * itemCollection [ itemIdx ] . weightProp ;
            var currentValueSum = numFittingItems * itemCollection [ itemIdx ] . valueProp ;

            if ( currentWeightSum <= maxCapacity ) {
                if ( currentValueSum + dpTable [ itemIdx - 1 ] [ capacityIdx - currentWeightSum ] > dpTable [ itemIdx - 1 ] [ capacityIdx ] ) {
                    dpTable [ itemIdx ] [ capacityIdx ] = currentValueSum + dpTable [ itemIdx - 1 ] [ capacityIdx - currentWeightSum ] ;
                } else {
                    dpTable [ itemIdx ] [ capacityIdx ] = dpTable [ itemIdx - 1 ] [ capacityIdx ] ;
                }
            } else {
                dpTable [ itemIdx ] [ capacityIdx ] = dpTable [ itemIdx - 1 ] [ capacityIdx ] ;
            }
        }
    }
    
    return dpTable [ totalItemCount ] [ maxCapacity ] ;
}

var fileInputData = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;
var inputLinesArray = ( fileInputData . trim ( ) ) . split ( "\n" ) ;
var configNumbers = ( inputLinesArray . shift ( ) ) . split ( " " ) . map ( Number ) ;
var totalItemCount = configNumbers [ 0 ] ;
var maxCapacity = configNumbers [ 1 ] ;
var itemCollection = [ null ] ;

for ( var itemIdx = 1 ; itemIdx <= totalItemCount ; itemIdx ++ ) {
    var currentItemProps = ( inputLinesArray . shift ( ) ) . split ( " " ) . map ( Number ) ;
    itemCollection [ itemIdx ] = { valueProp : currentItemProps [ 0 ] , weightProp : currentItemProps [ 1 ] } ;
}

var highestAchievedValue = calculateOptimalValue ( ) ;
console . log ( highestAchievedValue ) ;