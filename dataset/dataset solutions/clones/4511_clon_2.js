"use strict"
const makeInputHandler = () => {
    const dataSource = require("fs").readFileSync( "/dev/stdin" , "utf8" ) . trim ( ) . split ( "\n" ) ;
    const dataStore = {
        "items": dataSource,
        "currentPos": 0,
        "totalCount": dataSource.length,
        "hasMore": function() {
            return this.currentPos < this.totalCount;
        },
        "retrieveNext": function() {
            if ( !this.hasMore() ) {
                throw "OutOfBoundsError";
            }
            else {
                return this.items[this.currentPos++];
            }
        }
    };
    return dataStore;
}
const dataProvider = makeInputHandler();
const getNextToken = () => dataProvider.retrieveNext();
const getNextInteger = () => parseInt(dataProvider.retrieveNext());
const getNextStringArray = () => dataProvider.retrieveNext().split(" ");
const getNextIntegerArray = () => dataProvider.retrieveNext().split(" ").map(element => parseInt(element));
const getNextCharacterArray = () => dataProvider.retrieveNext().split("");
const checkMoreData = () => dataProvider.hasMore();
const displayOutput = (...values) => console.log(...values);

const calculateFactorial = (numVal) => {
    let resultValue = 1;
    for ( let counter = 1 ; counter <= numVal ; counter++ ) {
        resultValue *= counter;
    }
    return resultValue;
};
const executeMainLogic = () => {
    const [ firstNum, secondNum ] = getNextIntegerArray();
    if ( Math.abs(firstNum - secondNum) > 1 ) {
        console.log(0);
        return;
    }
    const PRIME_MODULUS = 1e9 + 7;
    let finalResult = 1;
    for ( let loopIndexA = 1 ; loopIndexA <= firstNum ; loopIndexA++ ) {
        finalResult = ( finalResult % PRIME_MODULUS ) * ( loopIndexA % PRIME_MODULUS );
    }
    for ( let loopIndexB = 1 ; loopIndexB <= secondNum ; loopIndexB++ ) {
        finalResult = ( finalResult % PRIME_MODULUS ) * ( loopIndexB % PRIME_MODULUS );
    }
    if ( firstNum === secondNum ) {
        console.log( ( 2 * finalResult ) % PRIME_MODULUS );
    }
    else {
        console.log( finalResult % PRIME_MODULUS );
    }
};
executeMainLogic();