/*
 * Utility functions for various common programming tasks.
 * This collection includes array manipulations, mathematical calculations,
 * string operations, and search algorithms.
 *
 * Functions provided:
 * - calculateLexicographicalIndex(sequence): Determines the lexicographical rank of a permutation.
 * - sumArrayElements(numericArray): Computes the total sum of numbers in an array.
 * - logIfDebugging(valueToLog): Prints a value to console only if debug mode is active.
 * - findIndexOfMaxValue(numericArray): Locates the index of the largest value in an array.
 * - findIndexOfMinValue(numericArray): Locates the index of the smallest value in an array.
 * - convertTo2DCharMatrix(stringArray): Transforms an array of strings into a 2D character array.
 * - testForPrimality(candidateNumber): Checks if a given number is a prime number.
 * - isValidNumericString(inputString): Validates if a string represents a non-negative integer.
 * - computeFactorial(numberInput): Calculates the factorial of a non-negative integer.
 * - rotateMatrix90DegreesClockwise(matrix): Rotates a 2D matrix 90 degrees clockwise.
 * - insertSubarrayAtPosition(baseArray, subArray, startIndex): Inserts a subarray into a base array.
 * - reverseSubarrayInPlace(targetArray, startInclusive, endInclusive): Reverses a portion of an array.
 * - padNumberWithLeadingZeros(numberValue, desiredLength): Adds leading zeros to a number string.
 * - getPrimeFactorizationMap(numberToFactor): Returns an object mapping prime factors to their powers.
 * - calculateGreatestCommonDivisor(numA, numB): Computes the GCD of two numbers using the Euclidean algorithm.
 * - calculateLeastCommonMultiple(numA, numB): Computes the LCM of two numbers.
 * - numericComparator(valA, valB): A comparator function for sorting numbers in ascending order.
 * - performBinarySearchForLargestSmallerOrEqual(sortedArray, targetValue): Binary search for a specific value or its insertion point.
 * - splitStringByNewlines(textInput): Splits a string into an array of lines.
 * - checkIfArrayIsSortedAscending(inputArray): Checks if an array is sorted in ascending order.
 * - calculatePrimeFactorsEfficiently(numberValue): An alternative, efficient prime factorization method.
 */

const debugMode = false;
const inf = Number.MAX_SAFE_INTEGER;
const mod = 1000000007;

function Main(input){
    var lines = input.trim().split("\n");
    var mem = lines.shift().split(" ").map(Number);
    var h = mem[0];
    var w = mem[1];

    var board = arr1dto2d(lines);

    for(var i = 0; i < board.length; i++){
        board[i].push("^");
        board[i].unshift("^");
    }

    var wall = new Array(w + 2);
    for(var p = 0; p < wall.length; p++){
        wall[p] = "^";
    }

    board.push(wall.slice());
    board.unshift(wall.slice());

    for(var y = 1; y <= h; y++){
        for(var x = 1; x <= w; x++){
            if(board[y][x] !== "."){
                continue;
            }

            var count = 0;

            for(var dy = -1; dy <= 1; dy++){
                for(var dx = -1; dx <= 1; dx++){
                    if(board[y + dy][x + dx] == "#"){
                        count++;
                    }
                }
            }

            board[y][x] = count;
        }
    }

    board.pop();
    board.shift();

    for(var r = 0; r < board.length; r++){
        board[r].pop();
        board[r].shift();
        board[r] = board[r].join("");
    }

    console.log(board.join("\n"));
}

Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());

function zisyozyunn(a){
  var arr = [];
  for(var i = 0; i < a.length; i++){
    arr.push(i + 1);
  }

  var sum = 0;

  for(var j = 0; j < a.length; j++){
    var f = arr.findIndex(function(val){
      return val == a[j];
    });
    sum += factorialize(a.length - 1 - j) * f;
    arr.splice(f, 1);
  }

  return sum;
}

function arrsum(arr){
  var sum = 0;
  for(var i = 0, len = arr.length; i < len; ++i){
      sum += arr[i] - 0;
  }
  return sum;
}

function debug(val){
  if(debugMode == true){
    console.log(val);
  }
}

function arrMaxPoint(arr){
	var max = Number.MIN_SAFE_INTEGER;
	var point = -1;

	for(var i = 0; i < arr.length; i++){
		if(max < arr[i]){
			max = arr[i];
			point = i;
		}
	}

	return point;
}

function arrMinPoint(arr){
	var min = Number.MAX_SAFE_INTEGER;
	var point = -1;

	for(var i = 0; i < arr.length; i++){
		if(min > arr[i]){
			min = arr[i];
			point = i;
		}
	}

	return point;
}

function arr1dto2d(arr){
	var result = [];

	for(var i = 0; i < arr.length; i++){
		result[i] = arr[i].split("");
	}

	return result;
}

function isPrime(n){
    if(Number.isInteger(n) === false){
        return false;
    }

    if(n <= 1){
        return false;
    }

    if(n === 2){
        return true;
    }

    if(n % 2 === 0){
        return false;
    }

    var square_root = Math.floor(Math.sqrt(n));

    for(var i = 3; i <= square_root; i += 2){
        if(n % i === 0){
            return false;
        }
    }

    return true;
}

function isNumber(val){
	const pat = /^([1-9]\d*|0)$/;
	return pat.test(val);
}

function factorialize(num) {
  if(num === 0){
    return 1;
  }

  return num * factorialize(num - 1);
}

function rotate(array) {
  const ROW = array.length;
  const COL = array[0].length;
  const row = ROW - 1;
  var a = new Array(COL);

  for(var c = 0; c < COL; c++){
    a[c] = new Array(ROW);

    for(var r = 0; r < ROW; r++){
      a[c][r] = array[row - r][c];
    }
  }

  return a;
}

function part_in(base, push, st){
	for(var i = st, p = 0; p < push.length; i++, p++){
		base[i] = push[p];
	}

	return base;
}

function part_reverse(arr, s, g){
	var push = arr.slice(s - 1, g);
  push.reverse();
	arr = part_in(arr, push, s - 1);
	return arr;
}

function zeroPadding(num, length){
    var text = num + '000000000000000000000000000000000';
    return text.slice(0, length);
}

function pf(n) {
    var result = {};

    if(n === 1){
        result["1"] = 1;
        return result;
    }

    var init = 2;

    while(n !== 1){
        var i = init;

        while(i < Number.MAX_SAFE_INTEGER){
            if(n % i === 0){
                n = n / i;

                if(!(result[i] > 0)){
                    result[i] = 0;
                }

                result[i]++;
                break;
            }

            i++;
        }

        init = i;
    }

    return result;
}

function gcd(a, b) {
    while(b !== 0){
        var tmp = a % b;
        a = b;
        b = tmp;
    }

    return a;
}

function lcm(a, b) {
    var g = function(n, m){
      return m ? g(m, n % m) : n;
    };

    return a * b / g(a, b);
}

function num(a, b) {
  return a - b;
}

function nibu(a, searchValue){
	var index = -1;
  var left = 0;
  var right = a.length - 1;

  while(left <= right){
      var middle = Math.floor((left + right) / 2);

      if(a[middle] == searchValue){
          index = middle;
          break;
      }else if(a[middle] < searchValue){
          left = middle + 1;
      }else{
          right = middle - 1;
      }
  }

  if(index != -1){
    return index;
  }else{
    return left;
  }
}

function br(input){
  return input.split("\n");
}

function is_sortred(arr){
  var flag = true;

  for(var i = 1; i < arr.length; i++){
    if(arr[i - 1] > arr[i]){
      flag = false;
      break;
    }
  }

  return flag;
}

function primeFactorization(n) {
	var s = Math.floor(Math.sqrt(n));
	var r = 0;
	var result = {};

	for(var i = 2; i <= s; i++){
		if((n % i) == 0){
			r = 0;

			do{
				r++;
				n = n / i;
			}while((n % i) == 0);

			result[i] = r;
		}
	}

	if(n > s){
		result[n] = 1;
	}

	return result;
}