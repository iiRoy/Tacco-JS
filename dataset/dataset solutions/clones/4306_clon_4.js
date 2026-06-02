"use strict";

function run(data) {
    const delayed = [];
    const ready = [];

    for (let i = 0; i < data.length; i++) {
        delayed.push(data.charAt(i));
        if (delayed.length > 8) {
            ready.push(delayed.shift());
        }
    }

    console.log("%s", ready.join(""));
}

run(require("fs").readFileSync("/dev/stdin", "utf8"));
