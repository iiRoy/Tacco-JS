const createValueVault = () => {
  let apex = null;

  const provideApex = () => apex;

  const placeItem = (currentBranch, newItem) => {
    if (currentBranch === null) {
      return { val: newItem, lower: null, higher: null };
    }
    if (newItem < currentBranch.val) {
      return { ...currentBranch, lower: placeItem(currentBranch.lower, newItem) };
    } else if (newItem > currentBranch.val) {
      return { ...currentBranch, higher: placeItem(currentBranch.higher, newItem) };
    }
    return currentBranch;
  };

  const locateDatum = (startBranch, soughtValue) => {
    let current = startBranch;
    while (current !== null) {
      if (current.val === soughtValue) {
        return current;
      }
      if (soughtValue < current.val) {
        current = current.lower;
      } else {
        current = current.higher;
      }
    }
    return null;
  };

  const retrieveMinNode = (branch) => {
    let current = branch;
    while (current && current.lower) {
      current = current.lower;
    }
    return current;
  };

  const removeEntry = (currentBranch, targetValue) => {
    if (currentBranch === null) {
      return null;
    }

    if (targetValue < currentBranch.val) {
      return { ...currentBranch, lower: removeEntry(currentBranch.lower, targetValue) };
    } else if (targetValue > currentBranch.val) {
      return { ...currentBranch, higher: removeEntry(currentBranch.higher, targetValue) };
    } else {
      if (currentBranch.lower === null) {
        return currentBranch.higher;
      }
      if (currentBranch.higher === null) {
        return currentBranch.lower;
      }

      const successor = retrieveMinNode(currentBranch.higher);
      return {
        ...currentBranch,
        val: successor.val,
        higher: removeEntry(currentBranch.higher, successor.val)
      };
    }
  };

  const displayAscending = (startBranch) => {
    let outputString = '';
    const stack = [];
    let current = startBranch;

    while (current !== null || stack.length > 0) {
      while (current !== null) {
        stack.push(current);
        current = current.lower;
      }
      current = stack.pop();
      outputString += ` ${current.val}`;
      current = current.higher;
    }
    console.log(outputString);
  };

  const displayRootFirst = (startBranch) => {
    let outputString = '';
    if (startBranch === null) {
      console.log(outputString);
      return;
    }

    const stack = [startBranch];
    while (stack.length > 0) {
      const current = stack.pop();
      outputString += ` ${current.val}`;

      if (current.higher !== null) {
        stack.push(current.higher);
      }
      if (current.lower !== null) {
        stack.push(current.lower);
      }
    }
    console.log(outputString);
  };

  return {
    addEntry: (val) => {
      apex = placeItem(apex, val);
    },
    seekValue: (val) => {
      return locateDatum(apex, val) !== null;
    },
    purgeItem: (val) => {
      apex = removeEntry(apex, val);
    },
    showAll: () => {
      displayAscending(apex);
      displayRootFirst(apex);
    }
  };
};

(function mainProcess(){
  const inputData = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
  const totalOperations = Number(inputData.shift());

  const dataStructure = createValueVault();
  inputData.forEach(function(commandLine) {
    const operationType = commandLine.charAt(0);
    const parts = commandLine.split(' ');
    const numericValue = Number(parts[1]);

    switch (operationType) {
    case 'i': dataStructure.addEntry(numericValue); break;
    case 'f': console.log(dataStructure.seekValue(numericValue) ? 'yes' : 'no'); break;
    case 'd': dataStructure.purgeItem(numericValue); break;
    default: dataStructure.showAll();
    }
  });
})();