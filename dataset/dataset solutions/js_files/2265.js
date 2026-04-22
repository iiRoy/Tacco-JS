"use strict";
// import bigInt from 'big-integer'

const Main = input => {
  input = input.trim().split("\n");
  const musicCount = input.shift();
  const lastListenedMusic = input.pop();
  let startSleep = false;
  let totalSleepTime = 0;
  for (let i = 0; i < input.length; i++) {
    const musicData = input[i].split(" ");
    const title = musicData[0];
    const sec = parseInt(musicData[1], 10);
    if (!startSleep) {
      if (title === lastListenedMusic) {
        startSleep = true;
      }
      continue;
    }

    totalSleepTime += sec;
  }

  console.log(totalSleepTime);
};

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
