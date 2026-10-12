let inputData = ( require("fs").readFileSync(0) + "" ) .split(" ");

let workingArray = new Array( inputData[0] - 0 ) .fill(7);

console.log( workingArray.fill( inputData[2] - 0, 0, inputData[1] ) .join(" ") );
