(function (input) {
    function isRect(x, y, size) {
        for ( var i = y; i <= y+size; i++ ) {
            for ( var j = x; j <= x+size; j++ ) {
                if ( data[i][j] !== '.' ) {
                    return false;
                }
            }
        }
        return true;
    }

    var inputs = input.replace(/\r/g, '').split("\n"),
        data, n, i, j;

    while ( true ) {
        n = parseInt(inputs.shift());
        if ( n === 0 ) {
            break;
        }
        data = [];
        for ( i = 0; i < n; i++ ) {
            data.push(inputs.shift());
        }
        // console.log(data);
        // console.log(isRect(3, 3, 5));
        var size = 1;
        for ( i = 0; i < n; i++ ) {
            for ( j = 0; j < n; ) {
                if ( isRect(j, i, size) ) {
                    // console.log("rect!", j, i, size);
                    size++;
                } else {
                    // console.log("not rect!", j, i, size);
                    j += size;
                }
            }
        }
        console.log(size);
    }
})(require("fs").readFileSync("/dev/stdin", "utf8"));