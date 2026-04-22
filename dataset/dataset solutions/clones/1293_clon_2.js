function  processInput  (rawData)   {
    let textRows = rawData.split ( "\n" ) ;
    let rowIndex = 0 ;

    while( textRows[rowIndex] !== "0 0" ) {
        let resultTally   =   0;
        let currentNumbers = parseNumbers( textRows[rowIndex].split(" ") );

        for ( let firstNum = 1 ; firstNum <= currentNumbers[0] ; firstNum++ ) {
            for ( let secondNum = firstNum ; secondNum <= currentNumbers[0] ; secondNum++ ) {
                let thirdNum = currentNumbers[1] - firstNum - secondNum;
                if (firstNum === secondNum || secondNum === thirdNum || firstNum === thirdNum) {
                    continue;
                }
                if ( thirdNum <= currentNumbers[0] && thirdNum > secondNum )  {
                    resultTally++ ;
                }

            }
        }
        console.log( resultTally );
        rowIndex++ ;
    }
}
function parseNumbers( stringArray ) {
    return stringArray.map( strVal => parseInt(strVal) );
}

processInput ( require("fs").readFileSync("/dev/stdin" , "utf-8") ) ;