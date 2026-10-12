'use strict'; process.stdin.resume();
process.stdin.setEncoding('utf-8');
 
let inputString = ''; let currentLine = 0;
 
process.stdin.on('data', inputStdin => {
    inputString += inputStdin;
});
process.stdin.on('end', () => {
    inputString = inputString.split('\n');
    main();
});
function readline() {
    return inputString[currentLine++];
}
// ******************************************************
// ******************** Code Start **********************
 
function main() {
     
    var T = parseInt(readline());
    var str = readline();
    
    var res1 = str.slice(0, Math.floor(T/2));
    var res2 = str.slice(T/2);
    
    if(str.length === 1) print('No');
    print(res1 === res2 ? 'Yes': 'No');
    
}