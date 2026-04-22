"use strict";
var   dataSource   =   require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ;
var tokenStream = dataSource.split( / |\n/ ), tokenIndex = 0 ;

function   readNum ( ) {
    return +tokenStream[tokenIndex++] ;
}

function readText(){ return tokenStream[tokenIndex++]; }

function readBig(){ return BigInt( tokenStream[ tokenIndex++ ] ); }

function readNums( quantity, isStringArray ) {
    return isStringArray ? tokenStream.slice( tokenIndex, tokenIndex += quantity ) : tokenStream.slice( tokenIndex, tokenIndex += quantity ).map( entry => +entry );
}

function readMatrix( rows, columns, isStringMatrix ) {
    var matrixData = [], current_row_idx = 0;
    if ( isStringMatrix ) {
        for ( ; current_row_idx < rows; current_row_idx++ ) {
            matrixData.push( tokenStream.slice( tokenIndex, tokenIndex += columns ) );
        }
    }
    else {
        for ( ; current_row_idx < rows; current_row_idx++ ) {
            matrixData.push( tokenStream.slice( tokenIndex, tokenIndex += columns ).map( item => +item ) );
        }
    }
    return matrixData;
}

// Function to construct multi-dimensional arrays dynamically
function createMultiDimArray( initialValue ) {
    var args = arguments, argsLength = args.length, evalString = "Array(args[" + --argsLength + "]).fill().map(e=>{return " + initialValue + ";})";
    while ( --argsLength ) {
        evalString = "Array(args[" + argsLength + "]).fill().map(e=>" + evalString + ")";
    }
    return eval( evalString );
}

// Computes the greatest common divisor using Euclidean algorithm
function greatestCommonDivisor( val1, val2 ) {
    return val2 ? greatestCommonDivisor( val2, val1 % val2 ) : val1;
}

var primeModulo = 1e9 + 7;

// Custom modular multiplication for multiple arguments
function modMultiply() {
    for ( var operands = arguments, product = operands[0], i = operands.length; --i; ) {
        product = ( ( product >> 16 ) * operands[i] % primeModulo * 65536 + ( product & 65535 ) * operands[i] ) % primeModulo;
    }
    return product;
}

var factorials = [], inverseFactorials = [], inverseElements = [], powersOfTwo = [];

function setupFactorials( max_val ) {
    factorials.length = max_val + 1;
    factorials[0] = factorials[1] = 1;
    for ( var current_val = 2; current_val <= max_val; ) {
        factorials[current_val] = modMultiply( factorials[current_val - 1], current_val++ );
    }

    inverseFactorials.length = max_val + 1;
    inverseFactorials[0] = inverseFactorials[1] = 1;
    inverseFactorials[max_val] = modInverse( factorials[max_val] );

    for ( current_val = max_val; 2 < current_val; ) {
        inverseFactorials[current_val - 1] = modMultiply( inverseFactorials[current_val], current_val-- );
    }
    // These arrays are commented out in the original, so they remain so here.
    // inverseElements.length = max_val + 1;
    // inverseElements[0] = inverseElements[1] = 1;
    // for(current_val = 2; current_val <= max_val; ) {
    //     inverseElements[current_val] = modMultiply( factorials[current_val - 1], inverseFactorials[current_val++] );
    // }
    // powersOfTwo.length = max_val + 1;
    // powersOfTwo[0] = 1;
    // for(current_val = 1; current_val <= max_val; current_val++) {
    //     powersOfTwo[current_val] = powersOfTwo[current_val-1] * 2 % primeModulo;
    // }
}

// Calculates modular multiplicative inverse using Extended Euclidean Algorithm
function modInverse( operand_b ) {
    var operand_a = primeModulo, u_val = 0, v_val = 1, temp_val;
    for ( ; operand_b; v_val = temp_val ) {
        temp_val = operand_a / operand_b | 0;
        operand_a -= temp_val * operand_b;
        u_val -= temp_val * v_val;
        temp_val = operand_a;
        operand_a = operand_b;
        operand_b = temp_val;
        temp_val = u_val;
        u_val = v_val;
    }
    u_val %= primeModulo;
    return u_val < 0 ? u_val + primeModulo : u_val;
}

// Modular exponentiation (a^n % primeModulo)
function modPower( base_val, exponent_val ) {
    for ( var res = 1; exponent_val; base_val = modMultiply( base_val, base_val ), exponent_val >>= 1 ) {
        if ( exponent_val & 1 ) {
            res = modMultiply( base_val, res );
        }
    }
    return res;
}

// Calculates nCr (n choose r) modulo primeModulo
function combinationsMod( n_val, r_val ) {
    return modMultiply( factorials[n_val], inverseFactorials[r_val], inverseFactorials[n_val - r_val] );
}

// Calculates n! / r! modulo primeModulo (not standard nPr)
function permutationsModPartial( n_val, r_val ) {
    return modMultiply( factorials[n_val], inverseFactorials[r_val] );
}

// Ensures a number is within the [0, primeModulo-1] range
function normalizeModulo( input_num ) {
    return ( input_num % primeModulo + primeModulo ) % primeModulo;
}


var resultValue = executeSolution();
if ( resultValue !== undefined ) {
    console.log( resultValue );
}

function executeSolution() {
    var totalElements = readNum();
    var zeroACount = 0, zeroBCount = 0;
    var coordinateMap = {};

    for ( var idx = 0; idx < totalElements; idx++ ) {
        var valA = readBig(), valB = readBig();

        if ( valA === 0n && valB === 0n ) {
            continue;
        }
        if ( valA === 0n ) {
            zeroACount++;
            continue;
        }
        if ( valB === 0n ) {
            zeroBCount++;
            continue;
        }

        var commonDivisor = greatestCommonDivisor( valA, valB );
        valA /= commonDivisor;
        valB /= commonDivisor;

        // Normalize negative signs
        if ( valA < 0 ) {
            valA = -valA;
            valB = -valB;
        }

        // Store counts in nested object (map)
        if ( coordinateMap[valA] ) {
            if ( coordinateMap[valA][valB] ) {
                coordinateMap[valA][valB]++;
            } else {
                coordinateMap[valA][valB] = 1;
            }
        } else {
            coordinateMap[valA] = {};
            coordinateMap[valA][valB] = 1;
        }
    }

    var finalResult = modPower( 2, zeroACount ) + modPower( 2, zeroBCount ) - 1;

    // Iterate through the unique coordinate pairs
    for ( var i_key in coordinateMap ) {
        for ( var j_key in coordinateMap[i_key] ) {
            var tempCount = 0;
            // Handle negative 'j_key' cases
            if ( j_key < 0 ) {
                // If the corresponding positive pair is already processed or exists
                if ( coordinateMap[j_key.slice( 1 )] && coordinateMap[j_key.slice( 1 )][i_key] ) {
                    continue;
                }
            } else {
                // Check for its negative counterpart
                if ( coordinateMap[j_key] && coordinateMap[j_key]["-" + i_key] ) {
                    tempCount = modPower( 2, coordinateMap[j_key]["-" + i_key] ) - 1;
                }
            }
            // Add the count for the current pair
            tempCount += modPower( 2, coordinateMap[i_key][j_key] );
            finalResult = modMultiply( finalResult, tempCount % primeModulo );
        }
    }

    return normalizeModulo( finalResult - 1 );
}