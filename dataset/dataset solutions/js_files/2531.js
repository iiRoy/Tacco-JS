"use strict"

function sieveOfEratosthenes(n) {

 var primes = [];
 for (let i = 0; i <= n; i++) {
   primes[i] = true;
 }

 primes[0] = false;
 primes[1] = false;

 for (let i = 2; i <= Math.sqrt(n); i++) {
   for (let j = 2; j * i <= n; j++) {
     primes[i * j] = false;
   }
 }

 var result = [];

 for (let i = 0; i < primes.length; i++) {
   if (primes[i]) result.push(i);
 }

 return result;
}

const arg_str = require('fs').readFileSync('/dev/stdin', 'UTF-8')
const args_lines = arg_str.split(' ')
const A = parseInt(args_lines[0])
const B = parseInt(args_lines[1])

// const X = Math.sqrt(A > B ? A : B)
const X = (A > B ? A : B) / 2
const Y = sieveOfEratosthenes(Math.ceil(X))

Y.push(1)

const Z = Y.filter(x=>(A % x == 0 && B % x == 0))

if (Z.length == 1 && A == B) Z.push(A)

console.log(Z.length)