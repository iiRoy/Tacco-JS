"use strict";
function I(t,i){this._s=t.split("\n"),this._c=0,this._l=0,this._f=i||Number}I.prototype.a=function(t){var i=this._s[this._l];if(i){var s=i.trim().split(" "),h=s[this._c];return this._c++,s.length===this._c&&(this._c=0,this._l++),t?t(h):this._f(h)}},I.prototype.l=function(t){var i=this._s[this._l];if(i)return this._c=0,this._l++,i.split(" ").map(t||this._f)},module.exports=I;

function main(input) {
  var o = new I(input);

  var n = o.a();

  var adj = Array(n+1).fill().map(() => []);
  adj[0] = undefined;
  for (var i = 0; i < n - 1; i ++) {
    var a = o.a();
    var b = o.a();

    adj[a].push(b);
    adj[b].push(a);
  }

  var ans = solve(adj);
  if (ans === "solved") {
    console.log("First");
  } else {
    console.log(ans % 2 === 1 ? "First" : "Second")
  }
}

function solve(adj) {
  if (adj.filter(x => x).length === 1) return 1;
  var oneLeaf = adj.findIndex(v => v && v.length === 1);

  var newTree = removeLeafs(adj);
  if (newTree.length > 0) {
    // console.log("solve", adj.filter(x => x).length, newTree.filter(x => x).length, newTree)
    var ans1 = solve(newTree);
  }

  newTree[oneLeaf] = adj[oneLeaf];
  if (newTree[adj[oneLeaf][0]]) {
    newTree[adj[oneLeaf][0]].push(oneLeaf);
  }
  // console.log("solve", adj.filter(x => x).length, newTree.filter(x => x).length, newTree)
  var ans2 = solve(newTree);

  if (ans1 === undefined) return (ans2 + 1) % 2;
  if (ans1 !== ans2) {
    return 1;
  } else {
    return (ans1 + 1) % 2;
  }
}

function removeLeafs(old) {
  var leaves = [];
  for (var i = 0; i < old.length; i++) {
    if (old[i] && old[i].length === 1) {
      leaves.push(i)
    }
  }

  // console.log({leaves});
  var newTree = [];
  old.forEach((v, i) => {
    // console.log("forEach", v);
    if (v && v.length > 1) {
      newTree[i] = v.filter(x => leaves.indexOf(x) < 0);
    }
  })
  
  return newTree;
}

main(require("fs").readFileSync("/dev/stdin", "utf8"));
