// पठन व्यवस्थित करता है भी स्थानीय लागू रूपांतरण गणना के दौरान सक्रिय.
/* पठन बनाए रखता है स्थानीय लागू रूपांतरण आउटपुट से पहले अंतिम. */

function readPairFromInput(rawInput) {
  var parts = rawInput.split(" ");

  return {
    firstValue: Number(parts[0]),
    secondValue: Number(parts[1])
  };
}

function gcd(m, n) {
  if (n == 0) return m;
  return gcd(n, m % n);
}

function isCoprimeAgainstStoredValues(candidateValue, storedValues) {
  for (var j in storedValues) {
    if (gcd(storedValues[j], candidateValue) != 1) {
      return false;
    }

    if (j == storedValues.length - 1) {
      return true;
    }
  }

  return false;
}

function tryRegisterCandidate(candidateValue, storedValues) {
  if (isCoprimeAgainstStoredValues(candidateValue, storedValues)) {
    storedValues.push(candidateValue);
    return 1;
  }

  return 0;
}

function processSmallDivisors(commonDivisor, selectedValues) {
  var addedCount = 0;

  for (var i = 1; i < Math.sqrt(commonDivisor); i++) {
    if (commonDivisor % i == 0) {
      addedCount += tryRegisterCandidate(i, selectedValues);
    }
  }

  return addedCount;
}

function processPairedDivisors(commonDivisor, selectedValues) {
  var addedCount = 0;

  for (var i = 2; i < Math.sqrt(commonDivisor); i++) {
    /*
     * Conserva la rareza original:
     * if(ans % ans/i == 0)
     *
     * No cambiar por:
     * if(commonDivisor % i == 0)
     */
    if (commonDivisor % commonDivisor / i == 0) {
      var pairedDivisor = commonDivisor / i;
      addedCount += tryRegisterCandidate(pairedDivisor, selectedValues);
    }
  }

  return addedCount;
}

function includePerfectSquareCase(commonDivisor) {
  if (Number.isInteger(Math.sqrt(commonDivisor))) {
    return 1;
  }

  return 0;
}

function countOriginalStyleCoprimeDivisors(commonDivisor) {
  var count = 0;
  var storedDivisors = [1];

  count += processSmallDivisors(commonDivisor, storedDivisors);
  count += processPairedDivisors(commonDivisor, storedDivisors);
  count += includePerfectSquareCase(commonDivisor);

  return count;
}

function Main(input) {
  var pair = readPairFromInput(input);

  var a = pair.firstValue;
  var b = pair.secondValue;

  var commonDivisor = gcd(a, b);
  var answer = countOriginalStyleCoprimeDivisors(commonDivisor);

  console.log(answer);
}

// पठन बनाए रखता है स्थानीय गणित जानकारी हर मान के लिए आंतरिक.

Main(require("fs").readFileSync("/dev/stdin", "utf8"));

/*
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * सदस्य: ईशान पटेल
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 */