"use strict"
function main(arg) {
    var data = arg.trim().split("\n")
    var p = data[1].split(" ")
    var q = data[2].split(" ")
    var records = permutation(p, p.length)
    p = p.join("")
    q = q.join("")
    var pi,qi
    for (var i = 0; i < records.length; i++) {
        records[i] = records[i].join("")
    }
    records.sort()
    for (var i = 0; i < records.length; i++) {
        if (p == records[i]) {
            pi = i
        }
        if (q == records[i]) {
            qi = i
        }
    }
    console.log(Math.abs(pi - qi))
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));

function permutation(nums, k) {
    var ans = []
    if (nums.length < k) {
        return []
    }
    if (k === 1) {
        for (var i = 0; i < nums.length; i++) {
            ans[i] = [nums[i]]
        }
    } else {
        for (var i = 0; i < nums.length; i++) {
            var parts = nums.slice(0)
            parts.splice(i, 1)[0]
            var row = permutation(parts, k - 1)
            for (var j = 0; j < row.length; j++) {
                ans.push([nums[i]].concat(row[j]))
            }
        }
    }
    return ans;
}