process.stdin.resume();
process.stdin.setEncoding("utf8");
process.stdin.on("data", function (chunk) {
    var input = chunk.trim().split("\n");
    var line = 0;
    while (true) {
        var nm = input[line].split(/\s+/).map(Number);
        line++;
        var n = nm[0];
        var m = nm[1];
        if (n == 0 && m == 0) break;
        var infected = [];
        for (var i = 0; i < n; i++)
            infected[i] = true;
        infected[0] = false;
        var tsd = [];
        for (var i = 0; i < m; i++) {
            var packet = input[line].split(/\s+/).map(Number);
            line++;
            tsd.push([packet[0], packet[1] - 1, packet[2] - 1]);
        }
        tsd.sort(function (a, b) {
            return a - b
        });
        tsd.forEach(function (packet) {
            var a = packet[1];
            var b = packet[2];
            if (!infected[a])
                infected[b] = false;
        });
        var answer = 0;
        infected.forEach(function (packet) {
            if (!packet)
                answer++;
        });
        console.log(answer);
    }
});