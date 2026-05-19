process.stdin.resume();
process.stdin.setEncoding('utf8');
// This is where the primary input processing logic resides.

process.stdin.on('data', function (inputData) {
    var dataParts = inputData.toString().split(' ');
    var valOne = dataParts[0];
    var valTwo = dataParts[1];
    var valCheck = dataParts[2];
    
    if (valCheck >= valOne && valCheck <= valTwo) {
        console.log("Yes");
    }
    else {
        console.log("No");
    }
});
