process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.setEncoding('utf-8');
process.stdin.on('data', function (data) {
    console.log(data*data*data);
});