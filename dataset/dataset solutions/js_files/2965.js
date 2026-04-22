function Main(input) {
    input = input.trim().split("\n").map(function(x) { return x.split(" ")});
    let N = parseInt(input[0][0], 10);
    let M = parseInt(input[0][1], 10);

    var uf = new UnionFind(N);
    let line;
    for (let i = 0; i < M; i++){
        line = input[i + 1].map(e => parseInt(e, 10));

        uf.union(line[0] - 1, line[1] - 1);
    }
    let ans = 0;
    for (let i = 0; i < N; i++){
        if (uf.find(i) === i) ans++;
        // console.log(i, uf.find(i));
    }
    console.log(ans);
    // console.log(uf);

}

function UnionFind (n) {
    this.parents = [];
    for (let i = 0; i < n; i++) {
        this.parents.push(-1);
    }
}

UnionFind.prototype.find = function (x) {
    if (this.parents[x] < 0) return x;
    return this.parents[x] = this.find(this.parents[x]);    
}


UnionFind.prototype.union = function (x, y) {
    x = this.find(x);
    y = this.find(y);
    if (x === y) return;
    if (this.parents[x] > this.parents[y]) [x, y] = [y, x];
    
    this.parents[x] += this.parents[y];
    this.parents[y] = x;
}


UnionFind.prototype.size = function (x) {
    x = this.find(x);
    while (x >= 0) {
        x = this.parents[x];
    }
    return x * -1;
}

// 例
// var uf = new UnionFind(5);
// uf.union(3,4);
// uf.union(1,2);
// uf.union(0,4);
// console.log(uf.find(0)); //3 (3-4-0)
// console.log(uf.size(2)); //2 (1-2)
// console.log(uf) // UnionFind { parents: [ 3, -2, 1, -3, 3 ] } //経路圧縮された各ノードの親が格納 それ自身が親の場合はその木のサイズ*-1を返す


Main(require("fs").readFileSync("/dev/stdin", "utf8"));
