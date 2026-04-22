// clear time -9m

// 配列のコピーを作成する
function clone(parent, child) {
    var p,
        toStr = Object.prototype.toString,
        astr = '[object Array]',
        has = Object.prototype.hasOwnProperty;

    child = child || [];

    for ( p in parent ) {
        if ( has.call(parent, p) ) {
            if ( typeof parent[p] === "object" ) {
                child[p] = (toStr.call(parent[p]) === astr ) ? [] : {};
                clone(parent[p], child[p]);
            } else {
                child[p] = parent[p];
            }
        }
    }
    return child;
}

(function (input) {
    // 配列を左回転させる
    function turn(coordinates) {
        // coordinates: 回転させたい配列
        copy = clone(coordinates);
        for( var i = 0, len = copy.length; i < len; i++ ) {
            var tmp = copy[i].x;
            copy[i].x = -copy[i].y;
            copy[i].y = tmp;
        }
        return copy;
    }

    // 配列同士が同一か調べる
    function equal(a, b) {
        if ( a.length !== b.length ) return false;
        for ( var i = 0, len = a.length; i < len; i++ ) {
            if( a[i].x !== b[i].x || a[i].y !== b[i].y ) {
                return false;
            }
        }
        return true;
    }

    var inputs = input.replace(/\r/g, '').split("\n"),
        n, m, i, j;

    while ( true ) {
        var dataset = [];

        n = parseInt(inputs.shift()) + 1;
        if ( n === 1 ) {
            break;
        }

        // 折れ線を格納
        while ( n-- ) {
            var data = [];
            m = parseInt(inputs.shift()) - 1;

            var line = inputs.shift().split(' '),
                base_x = parseInt(line[0]),
                base_y = parseInt(line[1]);

            data.push({x: 0, y: 0});
            while ( m-- ) {
                var line = inputs.shift().split(' '),
                    x = parseInt(line[0]),
                    y = parseInt(line[1]);
                data.push({
                    x: x-base_x,
                    y: y-base_y
                });
            }
            dataset.push(data);
        }

        // console.log(dataset);
        // 探す元を取り出す
        var purpose = dataset.shift(),
            purpose_r = function() {
                var tmp = clone(purpose).reverse(),
                    len = tmp.length,
                    base_x = tmp[0].x,
                    base_y = tmp[0].y;
                for ( var i = 0, len = tmp.length; i < len; i++ ) {
                    tmp[i].x -= base_x;
                    tmp[i].y -= base_y;
                }
                return tmp;
            }();

        // console.log(purpose, purpose_r);

        // 各データセットについて
        for ( i = 0, len = dataset.length; i < len; i++ ) {
            // 回転させながら同一か調べる
            for ( j = 0; j < 4; j++ ) {
                // console.log(dataset[i]);
                var turned = turn(dataset[i]);
                // console.log(turned);
                // console.log(purpose, equal(purpose, turned));
                // console.log(purpose_r, equal(purpose_r, turned));
                // console.log();
                if ( equal(turned, purpose) || equal(turned, purpose_r) ) {
                    console.log(i+1);
                    break;
                }
                dataset[i] = turned;
            }
        }
        console.log("+++++");
    }
})(require("fs").readFileSync("/dev/stdin", "utf8"));