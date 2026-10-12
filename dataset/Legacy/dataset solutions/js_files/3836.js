"use strict";
class UnionFind {
    // par[i]:iの親の番号　(例) par[3] = 2 : 3の親が2

    constructor(n) { //最初は全てが根であるとして初期化
        this.par = new Array(n).map((v, i) => i);
    }

    root(x) { // データxが属する木の根を再帰で得る：root(x) = {xの木の根}
        if (this.par[x] == x) return x;
        return this.par[x] = this.root(this.par[x]);
    }

    unite(x, y) { // xとyの木を併合
        let rx = this.root(x); //xの根をrx
        let ry = this.root(y); //yの根をry
        if (rx == ry) return; //xとyの根が同じ(=同じ木にある)時はそのまま
        this.par[rx] = ry; //xとyの根が同じでない(=同じ木にない)時：xの根rxをyの根ryにつける
    }

    same(x, y) { // 2つのデータx, yが属する木が同じならtrueを返す
        let rx = this.root(x);
        let ry = this.root(y);
        return rx == ry;
    }
}

function Main(input) {
    let lines = input.split("\n");
    let num = lines.shift().split(/\s/).map((v) => v - 0);
    let N = num[0];
    let M = num[1];
   let tree = new UnionFind(N);
    let P = lines.shift().split(/\s/).map((v) => v - 0);

    for(let i = 0; i < M; i++) {
        let [x, y] = lines.shift().split(/\s/).map((v) => v - 0);
        tree.unite(x-1, y-1); // x-1の木とy-1の木を併合する
    }

    let cnt = 0;
    for(let i = 0; i < N; i++) {
        if (tree.same(i, P[i]-1)) { //iとP[i]-1が同じ木に属するなら，カウンタに1追加
            cnt++;
        }
    }

    console.log(cnt);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
