var groupname;
var group = {};
var membership = {};
var data = require('fs').readFileSync('/dev/stdin', 'utf8');
var input = data.trim().split("\n");
while (true) {
    var n = input.shift();
    if (n == 0)
        break;
    for (var i = 0; i < n; i++) {
        var s = input.shift().split(':');
        group[s[0]] = s[1].split(",");
        if (i === 0) {
            groupname = s[0];
        }
    }
    dfs(groupname);
    var answer = 0;
    for (var i in membership) {
        ++answer;
    }
    console.log(answer);
 
    group = {};
    membership = {};
}
 
function dfs(groupname) {
    var member = group[groupname];
    group[groupname] = [];
    for (var i = 0; i < member.length; i++) {
        element = member[i].replace(/[.](\r\n|\n|\r)/gm, "");
        if (group[element] !== undefined) {
            dfs(element);
        } else {
            if (!membership.hasOwnProperty(element.replace(/[.](\r\n|\n|\r)/gm, "")))
                membership[element.replace(/[.](\r\n|\n|\r)/gm, "")] = true;
        }
    }
}