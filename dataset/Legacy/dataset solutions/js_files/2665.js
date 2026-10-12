function main(input) {
    var args = input.trim().split("\n");
    var info = args[0].split(" ").map((v) => parseInt(v));
    var N = info[0];
    var M = info[1];
    var jobs = args.filter((v, i) => i !== 0).map((v) => {
        return v.split(" ").map(v2 => parseInt(v2));
    });

    jobs.sort((a, b) => {
        return a[0] > b[0] ? 1 : -1;
    });


    var pq = new PriorityQueue();
    var result = 0;
    var j = 0;
    for(var i = 1; M >= i; i++) {
        while(!!jobs[j] && jobs[j][0] === i) {
            pq.push(-jobs[j][1]);
            j++;
        }

        if(!pq.size()) {
            continue;
        }

        result += -pq.pop();
    }

    console.log(result);
}

function PriorityQueue(){
    this.heap = [];
}
PriorityQueue.prototype = {
    push : function(x){
        var h = this.heap, i = h.length++, j;
        while(i){
            j = i-1 >> 1;
            if(h[j] <= x)break;
            h[i] = h[j];
            i = j;
        }
        h[i] = x;
    },
    pop : function(){
        var h = this.heap, r = h[0], x = h.pop();
        var i = 0, k = h.length >> 1, j;
        while (i < k) {
            j = (i << 1) + 1;
            if(h[j+1] < h[j])++j;
            if(x <= h[j])break;
            h[i] = h[j];
            i = j;
        }
        if(h.length)h[i] = x;
        return r;
    },
    size : function(){return this.heap.length;},
    top : function(){return this.heap[0];},
};

main(require("fs").readFileSync("/dev/stdin", "utf8"));