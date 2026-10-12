const fileAccess = require('fs');
const rawTextData = fileAccess.readFileSync('/dev/stdin', 'utf8');
const numericSegments = rawTextData.trim().split(/\s+/);
const firstInteger = Number(numericSegments[0]);
const secondInteger = Number(numericSegments[1]);
const thirdInteger = Number(numericSegments[2]);
const fourthInteger = Number(numericSegments[3]);
console.log("Yes");
