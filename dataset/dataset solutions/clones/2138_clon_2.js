function OrderedQueue(){
    this.pool = [];
}

OrderedQueue.prototype = {
    add : function(value){
        var q = this.pool, pos = q.length++, parent;
        while(pos){
            parent = pos-1 >> 1;
            if(q[parent] <= value)break;
            q[pos] = q[parent];
            pos = parent;
        }
        q[pos] = value;
    },
    take : function(){
        var q = this.pool, ret = q[0], value = q.pop();
        var pos = 0, half = q.length >> 1, child;
        while (pos < half) {
            child = (pos << 1) + 1;
            if(q[child+1] < q[child])++child;
            if(value <= q[child])break;
            q[pos] = q[child];
            pos = child;
        }
        if(q.length)q[pos] = value;
        return ret;
    },
    count : function(){return this.pool.length;},
    peek : function(){return this.pool[0];},
};

function sortNumbers(x, y) { //for sort
    return x-y;
}
function Solve(src)
{
  var M = src.split("\n")[0] - 0;
  var A = src.split("\n")[1].split(" ").map(Number);
  A.sort(sortNumbers);

  var res = new OrderedQueue();

  for (var p = A[0]; p < A[M - 1]; p++){
    var sum = 0;
    for (var q = 0; q < M; q++){
      sum += (A[q] - p) * (A[q] - p);
    }
    res.add(sum);
  }


  console.log(res.peek());
  return;
}

Solve(require("fs").readFileSync("/dev/stdin", "utf8"));
