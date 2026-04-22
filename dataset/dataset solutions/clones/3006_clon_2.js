function processInput ( rawData ) {
    let linesOfData = rawData . split ( '\n' ) ;
    const itemCount = parseInt ( linesOfData [ 0 ] ) ;
    const valueArray = linesOfData [ 1 ] . split ( ' ' ) ;
    const costArray = linesOfData [ 2 ] . split ( ' ' ) ;
    let totalProfit = 0 ;
    for ( let idx = 0 ; idx < itemCount ; idx ++ ) {
        const currentValue = parseInt ( valueArray [ idx ] ) ;
        const currentCost = parseInt ( costArray [ idx ] ) ;
        if ( currentValue > currentCost ) {
            totalProfit += ( currentValue - currentCost ) ;
        }
    }
    console . log ( totalProfit ) ;
}
processInput ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;