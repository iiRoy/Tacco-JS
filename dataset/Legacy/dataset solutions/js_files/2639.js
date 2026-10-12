"use strict";
    
const main = arg => {
    arg = arg.trim().split("\n");
    const N = parseInt(arg[0].split(" ")[0]);
    const Q = parseInt(arg[0].split(" ")[1]);
    
    const ab = arg.slice(1, N).map(n=>n.split(" "));
    const px = arg.slice(N, N + 1 + Q).map(n=>n.split(" "));
    
    const nodes = [];

    for(let i=1; i<=N; i++) {
        nodes.push(new Node(i));
    }
    
    // 親子関係を決定
    for(let i=0; i<N-1; i++) {
        nodes[ab[i][0]-1].addChild(nodes[ab[i][1]-1]);
    }
    
    // 親自身への加点
    for(let i=0; i<Q; i++) {
        nodes[px[i][0]-1].addPoint(px[i][1]);
    }
    
    // それぞれの親の子以下への加点
    for(let i=0; i<N; i++) {
        nodes[i].addPointToChild();
    }
    
    let answer = [];
    
    // 集計
    for(let i=0; i<N; i++) {
        answer.push(nodes[i].point);
    }
    
    console.log(answer.join(" "));
}

class Node {
    // 初期化
    constructor(nodeName) {
        this.name   = nodeName;
        this.parent = null;
        this.childrenArray = [];
        this.point  = 0;
    }
    
    // 子を追加
    addChild(childNode) {
        this.childrenArray.push(childNode);
        childNode.parent = this;
    }
    
    // 自身への加点
    addPoint(point) {
        this.point += parseInt(point);
    }
    
    // 自身以下の子への加点
    addPointToChild() {
        for(let child of this.childrenArray) {
            child.addPoint(this.point);
        }
    }
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));