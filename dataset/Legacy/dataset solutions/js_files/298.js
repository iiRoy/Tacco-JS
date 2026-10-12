(function (input) {
    function isFill(size) {
        for ( var i = 0; i < size; i++ ) {
            for ( var j = 0; j < size; j++ ) {
                if ( data[i][j] !== '*' ) {
                    return false;
                }
            }
        }
        return true;
    }
    function isRect(x, y, size) {
        for ( var i = y; i <= y+size; i++ ) {
            for ( var j = x; data[i] && j <= x+size; j++ ) {
                // console.log(size, i, y);
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
        if ( isFill(n) ) {
            console.log(0);
        } else {
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
    }
})(require("fs").readFileSync("/dev/stdin", "utf8"));