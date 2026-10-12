const Node = function (val) {
  this.val = val;
  this.parent = this;
  this.rank = 1;
  this.weight = 0; // 親に対してのweight
};

const WeightedDisjointSet = function () {
  this.m = [];
};

WeightedDisjointSet.prototype.add = function (val) {
  this.m[val] = new Node(val);
};

WeightedDisjointSet.prototype.merge = function (val1, val2, weight) {
  const p1 = this.find(val1);
  const p2 = this.find(val2);
  const w1 = this.weight(val1);
  const w2 = this.weight(val2);
  if (p1 === p2) {
    if (w2 - w1 !== weight) {
      throw Error("invalid weight");
    }
    return;
  }
  if (p1.rank <= p2.rank) {
    if (p1.rank == p2.rank) {
      p2.rank++;
    }
    p1.parent = p2;
    p1.weight = -weight + w1 - w2;
  } else {
    p2.parent = p1;
    p2.weight = weight - w1 + w2;
  }
};

WeightedDisjointSet.prototype.find = function (val) {
  let cur = this.m[val];
  if (cur.parent != cur) {
    const root = this.find(cur.parent.val);
    cur.weight += cur.parent.weight;
    cur.parent = root;
  }
  return cur.parent;
};

WeightedDisjointSet.prototype.diff = function (val1, val2) {
  const p1 = this.find(val1);
  const p2 = this.find(val2);
  if (p1 != p2) {
    return null;
  }
  return this.weight(val2) - this.weight(val1);
};

WeightedDisjointSet.prototype.weight = function (val) {
  let weight = 0;
  let cur = this.m[val];
  while (cur.parent != cur) {
    weight += cur.weight;
    cur = cur.parent;
  }
  return weight;
};

let input = require("fs").readFileSync("/dev/stdin", "utf8");
const lines = input.trim().split("\n");
let n, m, d;

try {
  for (let i = 0; i < lines.length; i++) {
    if (i === 0) {
      [n, m] = lines[i].split(" ");
      d = new WeightedDisjointSet();
      for (let i = 0; i < n; i++) {
        d.add(i);
      }
    } else {
      const [x, y, w] = lines[i].split(" ").map((v) => parseInt(v));
      d.merge(x - 1, y - 1, w);
    }
  }
} catch (err) {
  console.log("No");
  return;
}
console.log("Yes");
