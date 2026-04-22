input = require('fs').readFileSync('/dev/stdin', 'utf8')
lines = input.split('\n')
s = lines.shift()
o = {}
ans = ''
for (i=65;i<91;i++) {
    o[String.fromCharCode(i).toLowerCase()] = 0
}
if (s.length == 26) {
    len = s.length
    arr = []
    for(i = len - 1; i >= 0; i--) {
        arr.push(s.slice(i,i+1))
        arr.sort()
        t = s.slice(0, i)
        found = false
        for(j=0; j < arr.length; j++) {
            if (t + arr[j] > s) {
                found = true
                ans = t + arr[j]
                break;
            }
        }
        if (found) {
            break;
        }
    }    

    if (!found) {
        ans = -1
    }

} else {
    for (i=0;i<s.length;i++) {
        o[s[i]] = 1
    }
    for (i=65;i<91;i++) {
        t = String.fromCharCode(i).toLowerCase()
        if (!o[t]) {
            break;
        }
    }
    ans = s + t
}
console.log(ans)