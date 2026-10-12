const rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read input data from standard input
const charSequence = [...rawData]; // Convert the input string into an array of characters
let outputBuffer = ''; // Initialize an empty string to build the final output

// Initialize an object to store counts for each letter of the alphabet
let letterCounts = {
  a: 0, b: 0, c: 0, d: 0, e: 0, f: 0, g: 0, h: 0, i: 0, j: 0, k: 0, l: 0, m: 0,
  n: 0, o: 0, p: 0, q: 0, r: 0, s: 0, t: 0, u: 0, v: 0, w: 0, x: 0, y: 0, z: 0,
};

// Iterate through each character in the sequence
for (let idx = 0; idx < charSequence.length; idx++) {
  // Skip characters that are not alphabetic (A-Z or a-z)
  if ((/[^A-Z,a-z]/).test(charSequence[idx])) {
    continue;
  }

  // Increment the counter for the corresponding letter, case-insensitively
  if (/[Aa]/.test(charSequence[idx])) letterCounts.a++;
  if (/[Bb]/.test(charSequence[idx])) letterCounts.b++;
  if (/[Cc]/.test(charSequence[idx])) letterCounts.c++;
  if (/[Dd]/.test(charSequence[idx])) letterCounts.d++;
  if (/[Ee]/.test(charSequence[idx])) letterCounts.e++;
  if (/[Ff]/.test(charSequence[idx])) letterCounts.f++;
  if (/[Gg]/.test(charSequence[idx])) letterCounts.g++;
  if (/[Hh]/.test(charSequence[idx])) letterCounts.h++;
  if (/[Ii]/.test(charSequence[idx])) letterCounts.i++;
  if (/[Jj]/.test(charSequence[idx])) letterCounts.j++;
  if (/[Kk]/.test(charSequence[idx])) letterCounts.k++;
  if (/[Ll]/.test(charSequence[idx])) letterCounts.l++;
  if (/[Mm]/.test(charSequence[idx])) letterCounts.m++;
  if (/[Nn]/.test(charSequence[idx])) letterCounts.n++;
  if (/[Oo]/.test(charSequence[idx])) letterCounts.o++;
  if (/[Pp]/.test(charSequence[idx])) letterCounts.p++;
  if (/[Qq]/.test(charSequence[idx])) letterCounts.q++;
  if (/[Rr]/.test(charSequence[idx])) letterCounts.r++;
  if (/[Ss]/.test(charSequence[idx])) letterCounts.s++;
  if (/[Tt]/.test(charSequence[idx])) letterCounts.t++;
  if (/[Uu]/.test(charSequence[idx])) letterCounts.u++;
  if (/[Vv]/.test(charSequence[idx])) letterCounts.v++;
  if (/[Ww]/.test(charSequence[idx])) letterCounts.w++;
  if (/[Xx]/.test(charSequence[idx])) letterCounts.x++;
  if (/[Yy]/.test(charSequence[idx])) letterCounts.y++;
  if (/[Zz]/.test(charSequence[idx])) letterCounts.z++;
}

// Format the counts into a string for output
Object.keys(letterCounts).forEach(charKey => {
  outputBuffer += charKey + ' : ' + letterCounts[charKey] + '\n';
});

// Print the final formatted string to the console, removing any trailing newline
console.log(outputBuffer.trim());
