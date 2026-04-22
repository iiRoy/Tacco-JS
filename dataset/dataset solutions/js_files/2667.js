function main(input) {
    var args = input.trim().split("\n");
    var info = args[0].split(" ").map((v) => parseInt(v));
    var N = info[0];
    var M = info[1];
    var jobs = args.filter((v, i) => i !== 0).map((v) => {
        return v.split(" ").map(v2 => parseInt(v2));
    });

    jobs.sort((a, b) => {
        // 日にちが低いほうが優先
        // 金額が高いほうが優先

        if (a[1] > b[1]) {
            if (a[0] > b[0]) {
                return 1;
            }

            return -1;
        }

        return 1;

        if (a[0] > b[0]) {
            return a[1] > b[1] ? -1 : 1;
        }

        return -1;
    });

    var result = 0;
    var day = 1;
    while(day <= M && jobs.length > 0) {
        var index = jobs.findIndex((job) => {
            return day >= job[0];
        });

        if (index === -1) {
            day++;
            continue;
        }

        var job = jobs[index];
        result += job[1];
        jobs.splice(index, 1);
        day++;
    }

    console.log(result);
}

main(require("fs").readFileSync("/dev/stdin", "utf8"));