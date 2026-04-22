var nodes = [];
var restrictions = [];
//辺の命名規則：小さい番号のノード＊100+大きい番号のノード

function Main(input) {
    // 1行目がinput[0], 2行目がinput[1], …に入る
    input = input.split("\n");


    //文字列から10進数に変換するときはparseIntを使います
    var N = parseInt(input[0], 10);
    for (var i = 0; i < N; i++) {
        var data = {
            self: i,
            child: [],
            depth: 0,
            parent: null
            //連結しているnodeのnodes配列におけるインデックス
        }
        nodes.push(data);
    }
    //NをNにいれる
    for (var i = 1; i < N; i++) {
        var tmp = input[i].split(" ");
        var n1 = parseInt(tmp[0], 10);
        var n2 = parseInt(tmp[1], 10);
        nodes[n1 - 1].child.push(n2 - 1);
        nodes[n2 - 1].child.push(n1 - 1);
    }
    arrangement(nodes[0]);
    // この時点で木の整列は完了している。

    //制約について調べる。
    var M = parseInt(input[N]);//制約の個数
    for (var i = N + 1; i <= N + M; i++) {
        var tmp = input[i].split(" ");
        var r1 = parseInt(tmp[0], 10);
        var r2 = parseInt(tmp[1], 10);
        restrictions.push(getRoute(r1 - 1, r2 - 1));
    }

    var and = getAnd();


    var pattern = 0;

    for (var key in and) {
        if (countTargetString(key, "1") % 2 == 1) {
            pattern += Math.pow(2, N - (1 + and[key].length));
        } else {
            pattern -= Math.pow(2, N - (1 + and[key].length));

        }
    }
    console.log(Math.pow(2, N - 1) - pattern);
    //console.log('%d %s', a + b + c, s);
}
//和集合
function getAnd() {
    var result = {}
    for (var i = 1; i < Math.pow(2, restrictions.length); i++) {
        var key = i.toString(2);
        if (countTargetString(key, "1") == 1) {
            result[key] = restrictions[key.length - 1];
        } else {
            //firstとlastの和集合を求める
            var first = "" + key.substring(0, 1) * Math.pow(10, key.length - 1);
            var last = "" + parseInt(key.substring(1, key.length), 2).toString(2);
            result[key] = uniq(result[first].concat(result[last]));
        }

    }

    return result;

}

function uniq(array) {
    return array.filter((elem, index, self) => self.indexOf(elem) === index);
}

function countTargetString(str, val) {
    return (str.match(new RegExp(val, "g")) || []).length;
}

function getRoute(node1, node2) {//オブジェクトではなく番号で行う
    var result = [];
    var depth1 = nodes[node1].depth;
    var depth2 = nodes[node2].depth;

    while (true) {
        if (depth1 == depth2) {

            if (node1 == node2) {
                break;
            }

            result.push(Math.min(node1, nodes[node1].parent) * 100 + Math.max(node1, nodes[node1].parent));
            depth1 -= 1;
            node1 = nodes[node1].parent;

            result.push(Math.min(node2, nodes[node2].parent) * 100 + Math.max(node2, nodes[node2].parent));
            depth2 -= 1;
            node2 = nodes[node2].parent;

        } else if (depth1 > depth2) {

            result.push(Math.min(node1, nodes[node1].parent) * 100 + Math.max(node1, nodes[node1].parent));
            depth1 -= 1;
            node1 = nodes[node1].parent;

        } else {


            result.push(Math.min(node2, nodes[node2].parent) * 100 + Math.max(node2, nodes[node2].parent));
            depth2 -= 1;
            node2 = nodes[node2].parent;
        }
    }

    return result;
}

function arrangement(target) {

    for (var i = 0; i < target.child.length; i++) {

        var temp = [];
        var checking = target.child[i];//子供（仮）のi番目が親かどうかを調べる。親ならスキップ、それ以外は自分の子供のままにする。

        if (checking != target.parent) {


            nodes[checking].parent = target.self;

            nodes[checking].depth = target.depth + 1;
            //子供なら、子供の親を自分にする。
            arrangement(nodes[checking]);

        } else {
            target.child.splice(i, 1);
            i--;
            //親だった場合は子供リストから消しておく。
        }
    }

}

//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));