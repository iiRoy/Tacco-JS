process.stdin.resume();
process.stdin.setEncoding('utf-8');
var input_string = '';

process.stdin.on('data', (chunk) => {
    input_string += chunk;
});

process.stdin.on('end', () => {
    var lines = input_string.split('\n');
    main(lines);
});

var main = arr => {
    var n = arr.shift();
    var list = arr.slice(0, n);
    var builds = new Array(4).fill(null)
                               .map(_ => new Array(3).fill(null)
                                                     .map(_ => new Array(10).fill(null)
                                                                            .map(_ => 0)));
    list.forEach(x => {
        var data = x.split(' ').map(x => parseInt(x));
        builds[data[0] - 1][data[1] - 1][data[2] - 1] += data[3];
    });
    builds.forEach((x, i) => {
        var str = '';
        x.forEach(y => {
           y.forEach(z => {
               str += ' ' + z; 
           });
           console.log(str);
           str = '';
        });
        if (i != builds.length-1) console.log('####################');
    });
};