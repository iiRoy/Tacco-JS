function processSequence(srcStr) {
  const charArray = srcStr.split('');
  if (charArray.length < 2) {
    console.log(0);
    return;
  }

  const initialTracker = {
    val: 0,
    status: false,
    lastSeen: charArray[0]
  };

  const finalTracker = charArray.slice(1).reduce((tracker, currentCharacter) => {
    let newCount = tracker.val;
    let newStatus = tracker.status;
    const priorCharacter = tracker.lastSeen;

    if (currentCharacter === priorCharacter && !tracker.status) {
      newStatus = true;
      newCount++;
    } else if (currentCharacter !== priorCharacter && tracker.status) {
      newCount++;
    } else {
      newStatus = false;
    }

    return {
      val: newCount,
      status: newStatus,
      lastSeen: currentCharacter
    };
  }, initialTracker);

  console.log(finalTracker.val);
}

processSequence(require("fs").readFileSync("/dev/stdin","utf-8"));