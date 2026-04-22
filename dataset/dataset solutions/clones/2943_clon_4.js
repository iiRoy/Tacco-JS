const processingUnit = ((inputBlob) => {
  const primeModulus = 1000000007;

  const addModulo = (termA, termB) => (termA + termB) % primeModulus;
  const subtractModulo = (termA, termB) => (termA - termB + primeModulus) % primeModulus;
  const multiplyModulo = (termA, termB) => (termA * termB) % primeModulus;
  
  const extendedEuclidean = (valA, valB) => {
      if (valA === 0) return [valB, 0, 1];
      const [gcdVal, x1, y1] = extendedEuclidean(valB % valA, valA);
      const xVal = y1 - Math.floor(valB / valA) * x1;
      const yVal = x1;
      return [gcdVal, xVal, yVal];
  };

  const getModularInverse = (numToInvert) => {
      const [gcdResult, invX, invY] = extendedEuclidean(numToInvert, primeModulus);
      if (gcdResult !== 1) {
          // This case should ideally not happen for primeModulus unless numToInvert is 0 or multiple of primeModulus.
          // For bug replication, we handle numToInvert === 0 separately.
          throw new Error("Modular inverse does not exist for " + numToInvert);
      }
      return (invX % primeModulus + primeModulus) % primeModulus;
  };

  // Replicate the original code's bug for modular inverse calculation
  // If denominator is 0 (due to % K bug), original F becomes 1.
  const getBuggyModularInverse = (numToInvert, modulus) => {
      if (numToInvert === 0) return 1; // Replicating the bug from original code
      return getModularInverse(numToInvert);
  };

  const invConst2 = getModularInverse(2);
  const invConst6 = getModularInverse(6);
  const invConst30 = getModularInverse(30);

  const sumFirstPower = (limit) => { // Sum i^1 from 1 to limit
      if (limit < 0) return 0;
      limit %= primeModulus;
      return multiplyModulo(multiplyModulo(limit, addModulo(limit, 1)), invConst2);
  };

  const sumSecondPower = (limit) => { // Sum i^2 from 1 to limit
      if (limit < 0) return 0;
      limit %= primeModulus;
      return multiplyModulo(multiplyModulo(multiplyModulo(limit, addModulo(limit, 1)), addModulo(multiplyModulo(2, limit), 1)), invConst6);
  };

  const sumThirdPower = (limit) => { // Sum i^3 from 1 to limit
      if (limit < 0) return 0;
      const sum1 = sumFirstPower(limit);
      return multiplyModulo(sum1, sum1);
  };

  const sumFourthPower = (limit) => { // Sum i^4 from 1 to limit
      if (limit < 0) return 0;
      limit %= primeModulus;
      const termA = multiplyModulo(limit, addModulo(limit, 1));
      const termB = addModulo(multiplyModulo(2, limit), 1);
      const termC = subtractModulo(addModulo(multiplyModulo(3, multiplyModulo(limit, limit)), multiplyModulo(3, limit)), 1);
      return multiplyModulo(multiplyModulo(multiplyModulo(termA, termB), termC), invConst30);
  };

  const sumPowerRange = (powerIndex, startVal, endVal) => {
      if (startVal > endVal) return 0;
      let sumUpToEnd;
      let sumUpToStartMinus1;

      switch (powerIndex) {
          case 0: sumUpToEnd = addModulo(endVal, 1); sumUpToStartMinus1 = addModulo(startVal - 1, 1); break; // Sum of 1s
          case 1: sumUpToEnd = sumFirstPower(endVal); sumUpToStartMinus1 = sumFirstPower(startVal - 1); break;
          case 2: sumUpToEnd = sumSecondPower(endVal); sumUpToStartMinus1 = sumSecondPower(startVal - 1); break;
          case 3: sumUpToEnd = sumThirdPower(endVal); sumUpToStartMinus1 = sumThirdPower(startVal - 1); break;
          case 4: sumUpToEnd = sumFourthPower(endVal); sumUpToStartMinus1 = sumFourthPower(startVal - 1); break;
          default: return 0;
      }
      return subtractModulo(sumUpToEnd, sumUpToStartMinus1);
  };

  class Polynomial {
      constructor(coefficientArray) { // coefficientArray[i] is coefficient of x^i
          this.coefficients = coefficientArray.map(c => (c % primeModulus + primeModulus) % primeModulus);
          this.trim();
      }

      trim() {
          while (this.coefficients.length > 1 && this.coefficients[this.coefficients.length - 1] === 0) {
              this.coefficients.pop();
          }
      }

      static fromConstant(value) {
          return new Polynomial([value]);
      }

      static fromVariable() {
          return new Polynomial([0, 1]);
      }

      add(otherPoly) {
          const maxLength = Math.max(this.coefficients.length, otherPoly.coefficients.length);
          const resultCoeffs = new Array(maxLength).fill(0);
          for (let i = 0; i < maxLength; i++) {
              const c1 = i < this.coefficients.length ? this.coefficients[i] : 0;
              const c2 = i < otherPoly.coefficients.length ? otherPoly.coefficients[i] : 0;
              resultCoeffs[i] = addModulo(c1, c2);
          }
          return new Polynomial(resultCoeffs);
      }

      subtract(otherPoly) {
          const maxLength = Math.max(this.coefficients.length, otherPoly.coefficients.length);
          const resultCoeffs = new Array(maxLength).fill(0);
          for (let i = 0; i < maxLength; i++) {
              const c1 = i < this.coefficients.length ? this.coefficients[i] : 0;
              const c2 = i < otherPoly.coefficients.length ? otherPoly.coefficients[i] : 0;
              resultCoeffs[i] = subtractModulo(c1, c2);
          }
          return new Polynomial(resultCoeffs);
      }

      multiply(otherPoly) {
          const resultCoeffs = new Array(this.coefficients.length + otherPoly.coefficients.length - 1).fill(0);
          for (let i = 0; i < this.coefficients.length; i++) {
              for (let j = 0; j < otherPoly.coefficients.length; j++) {
                  resultCoeffs[i + j] = addModulo(resultCoeffs[i + j], multiplyModulo(this.coefficients[i], otherPoly.coefficients[j]));
              }
          }
          return new Polynomial(resultCoeffs);
      }

      scale(scalar) {
          const resultCoeffs = this.coefficients.map(c => multiplyModulo(c, scalar));
          return new Polynomial(resultCoeffs);
      }
  }

  const numericInputs = inputBlob.trim().split(/\s+/).map(x => parseInt(x, 10));
  const firstVal = numericInputs[0];
  const secondVal = numericInputs[1];
  const thirdVal = numericInputs[2];

  const lesserDim = Math.min(firstVal, secondVal);
  const greaterDim = Math.max(firstVal, secondVal);
  const combinatorK = thirdVal;

  let overallAccumulator = 0;

  const polyVarD = Polynomial.fromVariable();
  const polyConst1 = Polynomial.fromConstant(1);
  const polyConst2 = Polynomial.fromConstant(2);
  const polyConst3 = Polynomial.fromConstant(3);
  const polyLesserDim = Polynomial.fromConstant(lesserDim);
  const polyGreaterDim = Polynomial.fromConstant(greaterDim);

  // Range 1: d from 1 to lesserDim - 1
  if (lesserDim - 1 >= 1) {
      const dPlus1 = polyVarD.add(polyConst1);
      const dPlus2 = polyVarD.add(polyConst2);
      const dPlus3 = polyVarD.add(polyConst3);

      const termA1 = dPlus1.multiply(dPlus2).multiply(dPlus3).scale(invConst6);

      const NminusDminus1 = polyLesserDim.subtract(polyVarD).subtract(polyConst1);
      const MminusDminus1 = polyGreaterDim.subtract(polyVarD).subtract(polyConst1);
      const sumNMDminus2Dminus2 = NminusDminus1.add(MminusDminus1);
      const dPlus1MulDPlus2Div2 = dPlus1.multiply(dPlus2).scale(invConst2);
      const termB1 = sumNMDminus2Dminus2.multiply(dPlus1MulDPlus2Div2);

      const termC1 = NminusDminus1.multiply(MminusDminus1).multiply(dPlus1);

      const D1part1 = polyLesserDim.subtract(polyVarD).multiply(polyGreaterDim);
      const D1part2 = polyGreaterDim.subtract(polyVarD).multiply(polyLesserDim);
      const termD1 = D1part1.add(D1part2);

      const P1poly = termA1.add(termB1).add(termC1).scale(2).subtract(termD1);
      const summand1Poly = P1poly.multiply(polyVarD);

      for (let i = 0; i < summand1Poly.coefficients.length; i++) {
          const coeff = summand1Poly.coefficients[i];
          if (coeff === 0) continue;
          overallAccumulator = addModulo(overallAccumulator, multiplyModulo(coeff, sumPowerRange(i, 1, lesserDim - 1)));
      }
  }

  // Range 2: d from lesserDim to greaterDim - 1
  if (greaterDim - 1 >= lesserDim) {
      const constNplus1 = Polynomial.fromConstant(addModulo(lesserDim, 1));
      const constNplus2 = Polynomial.fromConstant(addModulo(lesserDim, 2));

      const termA2 = Polynomial.fromConstant(multiplyModulo(multiplyModulo(multiplyModulo(lesserDim, constNplus1.coefficients[0]), constNplus2.coefficients[0]), invConst6));

      const MminusDminus1 = polyGreaterDim.subtract(polyVarD).subtract(polyConst1);
      const NmulNplus1Div2 = Polynomial.fromConstant(multiplyModulo(multiplyModulo(lesserDim, addModulo(lesserDim, 1)), invConst2));
      const termB2 = MminusDminus1.multiply(NmulNplus1Div2);

      const termC2 = Polynomial.fromConstant(0);

      const termD2 = polyGreaterDim.subtract(polyVarD).multiply(polyLesserDim);

      const P2poly = termA2.add(termB2).add(termC2).scale(2).subtract(termD2);
      const summand2Poly = P2poly.multiply(polyVarD);

      for (let i = 0; i < summand2Poly.coefficients.length; i++) {
          const coeff = summand2Poly.coefficients[i];
          if (coeff === 0) continue;
          overallAccumulator = addModulo(overallAccumulator, multiplyModulo(coeff, sumPowerRange(i, lesserDim, greaterDim - 1)));
      }
  }

  // Range 3: d from greaterDim to lesserDim + greaterDim - 2
  const upperLimitRange3 = lesserDim + greaterDim - 2;
  if (upperLimitRange3 >= greaterDim) {
      const aPoly = polyLesserDim.add(polyGreaterDim).subtract(polyConst1).subtract(polyVarD);
      const aPlus1 = aPoly.add(polyConst1);
      const aPlus2 = aPoly.add(polyConst2);
      const termA3 = aPoly.multiply(aPlus1).multiply(aPlus2).scale(invConst6);

      const termB3 = Polynomial.fromConstant(0);
      const termC3 = Polynomial.fromConstant(0);
      const termD3 = Polynomial.fromConstant(0);

      const P3poly = termA3.add(termB3).add(termC3).scale(2).subtract(termD3);
      const summand3Poly = P3poly.multiply(polyVarD);

      for (let i = 0; i < summand3Poly.coefficients.length; i++) {
          const coeff = summand3Poly.coefficients[i];
          if (coeff === 0) continue;
          overallAccumulator = addModulo(overallAccumulator, multiplyModulo(coeff, sumPowerRange(i, greaterDim, upperLimitRange3)));
      }
  }

  // Part 2: Combinatorial multiplication C(N*M-2, K-2)
  const totalGridCells = multiplyModulo(lesserDim, greaterDim);
  const kMinus2 = combinatorK - 2;

  if (kMinus2 < 0) {
      overallAccumulator = 0; // C(X, Y) is 0 if Y < 0
  } else {
      let numeratorPermutation = 1;
      for (let i = 0; i < kMinus2; i++) {
          numeratorPermutation = multiplyModulo(numeratorPermutation, subtractModulo(totalGridCells, addModulo(2, i)));
      }

      let denominatorFactorial = 1;
      for (let i = 1; i <= kMinus2; i++) {
          denominatorFactorial = (denominatorFactorial * i) % combinatorK; // Replicating the bug: modulo K instead of E
      }

      const inverseDenominator = getBuggyModularInverse(denominatorFactorial, primeModulus);
      overallAccumulator = multiplyModulo(overallAccumulator, multiplyModulo(numeratorPermutation, inverseDenominator));
  }

  console.log(overallAccumulator);
})(require('fs').readFileSync('/dev/stdin','utf8'));