function obtainSystemCore() {
  if (typeof module !== 'undefined' && module.exports) {
    return exports;
  } else {
    window._systemCore = window._systemCore || {};
    return window._systemCore;
  }
}

obtainSystemCore().reportFacade = function(kernelModules, exportInterface) {
  exportInterface.ReportAssembler = kernelModules.ReportAssembler();
};

obtainSystemCore().ReportAssembler = function() {

  const idleTimekeeper = {
    begin: () => {},
    measure: () => 0
  };

  class ReportAssembler {
    #outputChannel;
    #colorizeOutput;
    #completionHandler;
    #durationTracker;

    #activityCounter;
    #defectCounter;
    #defectiveActivities;
    #deferredCounter;
    #terminalModifiers;
    #defectiveGroups;

    constructor(configuration) {
      this.#outputChannel = configuration.outputChannel;
      this.#colorizeOutput = configuration.enableColorDisplay ?? false;
      this.#completionHandler = configuration.onCompletionCallback ?? (() => {});
      this.#durationTracker = configuration.timekeeper ?? idleTimekeeper;

      this.#activityCounter = 0;
      this.#defectCounter = 0;
      this.#defectiveActivities = [];
      this.#deferredCounter = 0;
      this.#defectiveGroups = [];

      this.#terminalModifiers = new Map([
        ['verdant', '\x1B[32m'],
        ['crimson', '\x1B[31m'],
        ['amber', '\x1B[33m'],
        ['reset', '\x1B[0m']
      ]);

      this.#outputChannel('ReportAssembler is considered obsolete and will be phased out in subsequent versions.');
    }

    initiateMonitoring() {
      this.#activityCounter = 0;
      this.#defectCounter = 0;
      this.#deferredCounter = 0;
      this.#outputChannel('Initiated');
      this.#emitLineSeparator();
      this.#durationTracker.begin();
    }

    finalizeMonitoring() {
      this.#emitLineSeparator();
      this.#defectiveActivities.forEach(item => this.#renderFaultyAttemptLog(item));

      if (this.#activityCounter > 0) {
        this.#emitLineSeparator();

        const summaryParts = [
          `${this.#activityCounter} ${this.#derivePluralForm('activity', this.#activityCounter)}`,
          `${this.#defectCounter} ${this.#derivePluralForm('defect', this.#defectCounter)}`
        ];

        if (this.#deferredCounter) {
          summaryParts.push(`${this.#deferredCounter} deferred ${this.#derivePluralForm('activity', this.#deferredCounter)}`);
        }

        this.#outputChannel(summaryParts.join(', '));
      } else {
        this.#outputChannel('No activities discovered');
      }

      this.#emitLineSeparator();
      const elapsedSeconds = this.#durationTracker.measure() / 1000;
      this.#outputChannel(`Concluded in ${elapsedSeconds} ${this.#derivePluralForm('second', elapsedSeconds)}`);
      this.#emitLineSeparator();

      this.#defectiveGroups.forEach(item => this.#renderFaultyGroupLog(item));

      this.#completionHandler(this.#defectCounter === 0);
    }

    processActivityOutcome(outcomeRecord) {
      this.#activityCounter++;

      const statusActions = new Map([
        ['pending', () => {
          this.#deferredCounter++;
          this.#outputChannel(this.#applyColorModifier('amber', '*'));
        }],
        ['passed', () => {
          this.#outputChannel(this.#applyColorModifier('verdant', '.'));
        }],
        ['failed', () => {
          this.#defectCounter++;
          this.#defectiveActivities.push(outcomeRecord);
          this.#outputChannel(this.#applyColorModifier('crimson', 'F'));
        }]
      ]);

      const action = statusActions.get(outcomeRecord.activityStatus);
      if (action) {
        action();
      }
    }

    processGroupOutcome(outcomeRecord) {
      if (outcomeRecord.failedExpectations && outcomeRecord.failedExpectations.length > 0) {
        this.#defectCounter++;
        this.#defectiveGroups.push(outcomeRecord);
      }
    }

    #emitLineSeparator() {
      this.#outputChannel('\n');
    }

    #applyColorModifier(colorKey, textContent) {
      return this.#colorizeOutput ?
        (this.#terminalModifiers.get(colorKey) + textContent + this.#terminalModifiers.get('reset')) :
        textContent;
    }

    #derivePluralForm(baseWord, quantity) {
      return quantity === 1 ? baseWord : `${baseWord}s`;
    }

    #replicateElement(element, times) {
      return Array.from({
        length: times
      }, () => element);
    }

    #offsetTextRows(sourceText, marginSpaces) {
      const lines = (sourceText || '').split('\n');
      const prefix = this.#replicateElement(' ', marginSpaces).join('');
      return lines.map(line => prefix + line).join('\n');
    }

    #renderFaultyAttemptLog(faultyActivity) {
      this.#emitLineSeparator();
      this.#outputChannel(faultyActivity.fullIdentifier);

      faultyActivity.failedExpectations.forEach(defectRecord => {
        this.#emitLineSeparator();
        this.#outputChannel(this.#offsetTextRows(defectRecord.descriptionText, 2));
        this.#outputChannel(this.#offsetTextRows(defectRecord.traceInformation, 2));
      });

      this.#emitLineSeparator();
    }

    #renderFaultyGroupLog(faultyGroup) {
      faultyGroup.failedExpectations.forEach(defectRecord => {
        this.#emitLineSeparator();
        this.#outputChannel(this.#applyColorModifier('crimson', 'An error occurred within a post-group cleanup'));
        this.#emitLineSeparator();
        this.#outputChannel(this.#applyColorModifier('crimson', `Post-group cleanup ${defectRecord.descriptionText}`));
      });
      this.#emitLineSeparator();
    }
  }

  return ReportAssembler;
};