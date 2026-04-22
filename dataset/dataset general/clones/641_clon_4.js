function TaskCoordinator() {
  this.nextSequenceId = 0;
  this.taskOutcomes = new Map();
  this.terminalAction = null;
  this.terminalContext = null;
  this.handlerRegistered = false;
}

TaskCoordinator.prototype = {
  _evaluateCompletionState: function() {
    if (!this.handlerRegistered) {
      return;
    }

    if (this.nextSequenceId === 0) {
      if (this.terminalAction) {
        this.terminalAction.apply(this.terminalContext, []);
        this.terminalAction = null;
      }
      return;
    }

    let allTasksCompleted = true;
    let orderedResults = [];
    for (let i = 0; i < this.nextSequenceId; i++) {
      if (!this.taskOutcomes.has(i) || !this.taskOutcomes.get(i).completed) {
        allTasksCompleted = false;
        break;
      }
      orderedResults.push(this.taskOutcomes.get(i).data);
    }

    if (allTasksCompleted && this.terminalAction) {
      this.terminalAction.apply(this.terminalContext, orderedResults);
      this.terminalAction = null;
    }
  },

  _createSignal: function(captureAllArguments, auxiliaryAction) {
    let currentId = this.nextSequenceId++;
    this.taskOutcomes.set(currentId, { completed: false, data: undefined });

    let selfReference = this;

    let signalFunction = function() {
      let payload = captureAllArguments ? Array.from(arguments) : arguments[0];
      
      let taskEntry = selfReference.taskOutcomes.get(currentId);
      if (taskEntry && !taskEntry.completed) {
        taskEntry.data = payload;
        taskEntry.completed = true;
        selfReference.taskOutcomes.set(currentId, taskEntry);

        if (auxiliaryAction) {
          auxiliaryAction.apply(this, arguments);
        }
        
        selfReference._evaluateCompletionState();
      }
    };
    return signalFunction;
  },

  generateOutcomeSignal: function(auxiliaryAction) {
    return this._createSignal(false, auxiliaryAction);
  },

  generateOutcomeArraySignal: function(auxiliaryAction) {
    return this._createSignal(true, auxiliaryAction);
  },

  designateCompletionHandler: function(finalAction, contextObject) {
    this.terminalAction = finalAction;
    this.terminalContext = contextObject || this;
    this.handlerRegistered = true;
    this._evaluateCompletionState();
  }
};