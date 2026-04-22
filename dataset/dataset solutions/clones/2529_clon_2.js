require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' )
let textRows = rawData . split ( '\n' )
let firstRow = textRows . shift ( ) . split ( ' ' )
let firstNum = firstRow [ 0 ] + 0
let secondNum = firstRow [ 1 ] + 0


const findFactors = function ( value )
{
    let factorList = [ ]
    for ( let idx = 1 ; idx * idx <= value ; idx ++ )
    {
        if ( value % idx === 0 )
        {
            factorList . push ( idx )
            if ( idx !== value / idx )
            {
                factorList . push ( value / idx )
            }
        }
    }
    return factorList . sort ( ( x , y ) => x - y )
}


const isNumberPrime = function ( checkVal )
{
    if ( checkVal < 2 )
    {
        return false
    }
    for ( let counter = 2 ; counter * counter <= checkVal ; counter ++ )
    {
        if ( checkVal % counter === 0 )
        {
            return false
        }
    }
    return true
}


const greatestCommonDivisor = function ( valA , valB , tempVar )
{
	while ( valA % valB !== 0 )
    {
		tempVar = valB
		valB = valA % valB
		valA = tempVar
	}
	return valB
}


let factorsOfA = findFactors ( firstNum )
let factorsOfB = findFactors ( secondNum )

let commonFactors = [ ]
let currentFactorA = factorsOfA . pop ( )
let currentFactorB = factorsOfB . pop ( )

while ( currentFactorA != 1 || currentFactorB != 1 )
{
    if ( currentFactorA === currentFactorB )
    {
        commonFactors . push ( currentFactorA )
        currentFactorA = factorsOfA . pop ( )
        currentFactorB = factorsOfB . pop ( )
    }
    else
    {
        if ( currentFactorA < currentFactorB )
        {
            currentFactorB = factorsOfB . pop ( )
        }
        else
        {
            currentFactorA = factorsOfA . pop ( )
        }
    }
}

let primeCount = 1
for ( let loopIndex = 0 ; loopIndex < commonFactors . length ; loopIndex ++ )
{
    if ( isNumberPrime ( commonFactors [ loopIndex ] ) )
    {
        primeCount ++
    }
}

console . log ( primeCount )