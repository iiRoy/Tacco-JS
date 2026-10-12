function myin(){return require("fs").readFileSync("/dev/stdin", "utf8").trim();}
function myout(t){console.log(t);}
function myconv(i,no){switch(no){case 0:return i;case 1:return parseInt(i);case 2:return i.split(" ");case 3:return i.split("\n");case 4:return i.split(" ").map((a)=>Number(a));case 5:return i.split("\n").map((a)=>Number(a));case 6:return i.split("");case 7:return i.split("").map((a)=>Number(a));}}

function computeFactorialDivisorCount(inputString) {
    const maximumValue = myconv(inputString, 1);
    const moduloConstant = 1000000007;

    const primeSieve = new Array(maximumValue + 1).fill(true);
    primeSieve[0] = false;
    primeSieve[1] = false;

    for (let currentNumber = 2; currentNumber * currentNumber <= maximumValue; currentNumber++) {
        if (primeSieve[currentNumber]) {
            for (let multiple = currentNumber * currentNumber; multiple <= maximumValue; multiple += currentNumber) {
                primeSieve[multiple] = false;
            }
        }
    }

    let finalDivisorProduct = 1;

    for (let primeCandidate = 2; primeCandidate <= maximumValue; primeCandidate++) {
        if (primeSieve[primeCandidate]) {
            let totalPrimeExponent = 0;
            let currentPower = primeCandidate;

            while (currentPower <= maximumValue) {
                totalPrimeExponent += Math.floor(maximumValue / currentPower);
                if (currentPower > maximumValue / primeCandidate) {
                    break;
                }
                currentPower *= primeCandidate;
            }
            
            finalDivisorProduct = (finalDivisorProduct * (totalPrimeExponent + 1)) % moduloConstant;
        }
    }

    myout(finalDivisorProduct);
}

computeFactorialDivisorCount(myin());
