"use strict";

(function(fileSystemOperations) {
  "use strict";

  // Implements a min-priority queue (min-heap) with lazy deletion
  class OrderedValueCollector {
    constructor() {
      this.valueContainer = [];
      this.removalLog = new Map(); // Tracks counts of elements marked for removal
    }

    // Swaps two elements in the internal array
    _exchange(idxA, idxB) {
      [this.valueContainer[idxA], this.valueContainer[idxB]] = [this.valueContainer[idxB], this.valueContainer[idxA]];
    }

    // Moves an element up the heap to maintain the min-heap property
    _promote(idx) {
      let currentPosition = idx;
      while (currentPosition > 0) {
        let parentPosition = Math.floor((currentPosition - 1) / 2);
        if (this.valueContainer[currentPosition] < this.valueContainer[parentPosition]) {
          this._exchange(currentPosition, parentPosition);
          currentPosition = parentPosition;
        } else {
          break;
        }
      }
    }

    // Moves an element down the heap to maintain the min-heap property
    _demote(idx) {
      let currentPosition = idx;
      const finalPosition = this.valueContainer.length - 1;

      while (true) {
        let leftChildPosition = 2 * currentPosition + 1;
        let rightChildPosition = 2 * currentPosition + 2;
        let smallestChildPosition = currentPosition;

        if (leftChildPosition <= finalPosition && this.valueContainer[leftChildPosition] < this.valueContainer[smallestChildPosition]) {
          smallestChildPosition = leftChildPosition;
        }
        if (rightChildPosition <= finalPosition && this.valueContainer[rightChildPosition] < this.valueContainer[smallestChildPosition]) {
          smallestChildPosition = rightChildPosition;
        }

        if (smallestChildPosition !== currentPosition) {
          this._exchange(currentPosition, smallestChildPosition);
          currentPosition = smallestChildPosition;
        } else {
          break;
        }
      }
    }

    // Removes elements from the top of the heap that are marked for lazy deletion
    _purgeTop() {
      while (this.valueContainer.length > 0 && this.removalLog.get(this.valueContainer[0]) > 0) {
        const topElement = this.valueContainer[0];
        this.removalLog.set(topElement, this.removalLog.get(topElement) - 1);

        // Perform actual heap pop operation
        if (this.valueContainer.length === 1) {
          this.valueContainer.pop();
        } else {
          this.valueContainer[0] = this.valueContainer.pop();
          this._demote(0);
        }
      }
    }

    // Adds a new element to the collection
    deposit(elementValue) {
      // If the element was previously marked for removal, decrement its removal count instead of re-adding
      if (this.removalLog.has(elementValue) && this.removalLog.get(elementValue) > 0) {
        this.removalLog.set(elementValue, this.removalLog.get(elementValue) - 1);
      } else {
        this.valueContainer.push(elementValue);
        this._promote(this.valueContainer.length - 1);
      }
    }

    // Marks an element for lazy removal from the collection
    expunge(elementValue) {
      this.removalLog.set(elementValue, (this.removalLog.get(elementValue) || 0) + 1);
    }

    // Retrieves the smallest element currently in the collection, handling lazy removals
    getMinimum() {
      this._purgeTop(); // Ensure the top element is not marked for removal
      return this.valueContainer.length > 0 ? this.valueContainer[0] : null;
    }
  }

  // --- Main application execution logic ---
  (function() {
    // Utility function to parse a line of space-separated numbers
    function parseNumericLine(lineContent) {
      return (Array.isArray(lineContent) ? lineContent : lineContent.split(/\s+/)).map(Number);
    }

    // Main function to process the problem input and generate output
    function executeProblem(rawData) {
      const allLines = rawData.split("\n");

      // Parse initial counts
      const [projectCount, queryCount] = parseNumericLine(allLines[0]);

      // Parse project details and calculate adjusted start/end moments
      const projectDetails = allLines.slice(1, projectCount + 1).map((currentLine) => {
        const [beginTime, finishTime, identifierValue] = parseNumericLine(currentLine);
        return {
          begin: beginTime,
          finish: finishTime,
          value: identifierValue,
          startMoment: beginTime - identifierValue - 0.5, // Adjusted start time
          endMoment: finishTime - identifierValue - 0.6 // Adjusted end time
        };
      });

      // Parse query times
      const queryTimes = parseNumericLine(allLines.slice(projectCount + 1)).slice(0, queryCount);

      // Generate timeline actions (add/remove events) from project details
      const timelineActions = [];
      for (const project of projectDetails) {
        timelineActions.push({
          kind: "add",
          timePoint: project.startMoment,
          targetValue: project.value
        }, {
          kind: "remove",
          timePoint: project.endMoment,
          targetValue: project.value
        });
      }

      // Sort all actions chronologically
      timelineActions.sort((actionA, actionB) => {
        return actionA.timePoint - actionB.timePoint;
      });

      const activeIdentifiers = new OrderedValueCollector();
      let currentQueryIndex = 0;
      const results = [];

      // Process actions and queries in chronological order
      for (const incident of timelineActions) {
        // Resolve queries that occur before the current incident's time
        while (currentQueryIndex < queryCount && queryTimes[currentQueryIndex] < incident.timePoint) {
          const retrievedMinimum = activeIdentifiers.getMinimum();
          results.push(retrievedMinimum === null ? -1 : retrievedMinimum);
          currentQueryIndex++;
        }

        // Apply the current incident's action
        if ("add" === incident.kind) {
          activeIdentifiers.deposit(incident.targetValue);
        } else if ("remove" === incident.kind) {
          activeIdentifiers.expunge(incident.targetValue);
        }
      }

      // Resolve any remaining queries after all incidents have been processed
      while (currentQueryIndex < queryCount) {
        const retrievedMinimum = activeIdentifiers.getMinimum();
        results.push(retrievedMinimum === null ? -1 : retrievedMinimum);
        currentQueryIndex++;
      }

      // Output all results
      console.log(results.join("\n"));
    }

    // Read input from stdin and execute the problem solver
    executeProblem(fileSystemOperations.readFileSync("/dev/stdin", "utf8"));
  })();
})(require("fs"));