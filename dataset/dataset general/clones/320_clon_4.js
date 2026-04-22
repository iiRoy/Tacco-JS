function reportIssue(message) {
  if (window.console) {
    window.console.error(message);
  }
}

function displayModalWindow(titleContent, bodyContent) {
  const newWindow = window.open('');
  if (!newWindow) {
    reportIssue('Popup blocked: ' + titleContent);
    return;
  }
  const escapedContent = bodyContent
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  newWindow.document.write(`<html><head><title>${titleContent}</title></head><body><pre>${escapedContent}</pre></body></html>`);
  newWindow.document.close();
}

const RESOLUTION_EVENT = 'mergeSystemResolved';
const COMPLETION_EVENT = 'mergeSystemCompleted';

let instanceCounter = 0;

const initialSettings = {
  leftSource: [],
  rightSource: [],
  enableDebugging: false,
  showResultPopup: false,
  showSourcePopups: false,
  onMergeComplete: () => {}
};

class Discrepancy {
  constructor(elementContainer, commanderInstance) {
    this.conflictElement = elementContainer;
    this.commander = commanderInstance;

    this.hasBeenAddressed = false;
    this.preferLeftVersion = false;
    this.discrepancyCategory = '';
    this.leftSourceLine = 0;
    this.rightSourceLine = 0;
    this.leftSourceRowCount = 0;
    this.rightSourceRowCount = 0;

    this.initializeDiscrepancy();
  }

  initializeDiscrepancy() {
    const categoryMatch = this.conflictElement.className.match(/Change([\w]+)/);
    if (categoryMatch && categoryMatch[1]) {
      this.discrepancyCategory = categoryMatch[1];
    } else {
      reportIssue('Could not determine discrepancy category for element: ' + this.conflictElement.outerHTML);
      return;
    }

    this.conflictElement.addEventListener('click', this.processClick.bind(this));
    this.conflictElement.addEventListener('mouseover', this.applyHoverEffect.bind(this));
    this.conflictElement.addEventListener('mouseout', this.removeHoverEffect.bind(this));

    this.determineSourceLines();
    this.determineSourceRows();

    this.commander.logActivity('Discrepancy initialized:', this);
  }

  mergeAction() {
    if (this.preferLeftVersion) {
      this.commander.logActivity(
        'Ignoring lines', this.leftSourceLine, '-', (this.leftSourceLine + this.leftSourceRowCount - 1), '.'
      );
      this.conflictElement.dispatchEvent(new CustomEvent(COMPLETION_EVENT, { bubbles: true }));
      return;
    }

    this.commander.logActivity('Merging Discrepancy:', this);

    switch (this.discrepancyCategory) {
      case 'Replace':
        this.executeDeletion();
        this.executeInsertion();
        break;
      case 'Insert':
        this.executeInsertion();
        break;
      case 'Delete':
        this.executeDeletion();
        break;
      default:
        reportIssue('Undefined merge method "' + this.discrepancyCategory + '".');
        return;
    }

    this.conflictElement.dispatchEvent(new CustomEvent(COMPLETION_EVENT, { bubbles: true }));
  }

  applyHoverEffect(event) {
    const targetCell = event.target.closest('td');
    if (!targetCell) return;
    const sideClass = targetCell.classList.contains('Left') ? 'Left' : 'Right';
    Array.from(this.conflictElement.querySelectorAll(`td.${sideClass}`))
      .forEach(cell => cell.classList.add('hover'));
  }

  removeHoverEffect() {
    Array.from(this.conflictElement.querySelectorAll('td.hover'))
      .forEach(cell => cell.classList.remove('hover'));
  }

  processClick(event) {
    const targetCell = event.target.closest('td');
    if (!targetCell) return;

    let useThisSide = false;
    if (!this.commander.isInlineMode) {
      useThisSide = targetCell.classList.contains('Left');
    } else {
      useThisSide = targetCell.classList.contains('use');
      if (targetCell.classList.contains('Left')) {
        useThisSide = !useThisSide;
      }
    }
    this.preferLeftVersion = useThisSide;

    const chosenSideClass = this.preferLeftVersion ? 'Left' : 'Right';
    const otherSideClass = this.preferLeftVersion ? 'Right' : 'Left';

    if (this.commander.isInlineMode &&
      (this.discrepancyCategory === 'Delete' || this.discrepancyCategory === 'Insert')
    ) {
      Array.from(this.conflictElement.querySelectorAll('td'))
        .forEach(cell => {
          cell.classList.toggle('use');
          cell.classList.toggle('dontUse', !cell.classList.contains('use'));
        });
    } else {
      Array.from(this.conflictElement.querySelectorAll(`td.${chosenSideClass}`))
        .forEach(cell => {
          cell.classList.remove('dontUse');
          cell.classList.add('use');
        });
      Array.from(this.conflictElement.querySelectorAll(`td.${otherSideClass}`))
        .forEach(cell => {
          cell.classList.remove('use');
          cell.classList.add('dontUse');
        });
    }

    if (!this.hasBeenAddressed) {
      this.hasBeenAddressed = true;
      this.conflictElement.dispatchEvent(new CustomEvent(RESOLUTION_EVENT, { bubbles: true }));
    }
  }

  determineSourceLines() {
    const previousBody = this.conflictElement.previousElementSibling;
    if (!previousBody || previousBody.tagName !== 'TBODY') {
      this.commander.logActivity('No previous tbody found for line numbers.', this.conflictElement);
      return;
    }
    const lastRow = previousBody.lastElementChild;
    if (!lastRow) {
      this.commander.logActivity('No last row found in previous tbody for line numbers.', previousBody);
      return;
    }

    const firstHeader = lastRow.firstElementChild;
    const lastHeader = lastRow.lastElementChild;

    this.leftSourceLine = parseInt(firstHeader ? (firstHeader.textContent || '0') : '0', 10) + 1;
    this.rightSourceLine = parseInt(lastHeader ? (lastHeader.textContent || '0') : '0', 10) + 1;
  }

  determineSourceRows() {
    if (this.commander.isInlineMode) {
      this.leftSourceRowCount = this.conflictElement.querySelectorAll('.Left').length;
      this.rightSourceRowCount = this.conflictElement.querySelectorAll('.Right').length;
    } else {
      this.leftSourceRowCount = Array.from(this.conflictElement.querySelectorAll('.Left'))
        .filter(cell => cell.previousElementSibling && cell.previousElementSibling.textContent.trim() !== '\xA0')
        .length;
      this.rightSourceRowCount = Array.from(this.conflictElement.querySelectorAll('.Right'))
        .filter(cell => cell.previousElementSibling && cell.previousElementSibling.textContent.trim() !== '\xA0')
        .length;
    }
  }

  executeInsertion() {
    this.commander.injectOutputLines(this.rightSourceLine, this.rightSourceRowCount, this.leftSourceLine);
  }

  executeDeletion() {
    this.commander.removeOutputLines(this.leftSourceLine, this.leftSourceRowCount);
  }
}

class MergeCommander {
  constructor(containerElement, configuration = {}) {
    this.instanceId = 1 + instanceCounter++;
    this.mainContainer = containerElement;

    this.configuration = this.deepMerge({}, initialSettings, configuration);

    this.discrepancyElements = this.mainContainer.querySelectorAll('.ChangeReplace, .ChangeDelete, .ChangeInsert');
    this.discrepancies = [];
    this.unaddressedDiscrepancies = 0;
    this.unprocessedMerges = 0;
    this.isInlineMode = false;
    this.finalOutput = [];
    this.outputLineShift = 0;
    this.temporaryLineShift = 0;

    this.initializeOperation();
  }

  deepMerge(...objects) {
    const isObject = obj => obj && typeof obj === 'object' && !Array.isArray(obj);
    return objects.reduce((accumulator, current) => {
      Object.keys(current).forEach(key => {
        if (isObject(accumulator[key]) && isObject(current[key])) {
          accumulator[key] = this.deepMerge(accumulator[key], current[key]);
        } else {
          accumulator[key] = current[key];
        }
      });
      return accumulator;
    }, {});
  }

  initializeOperation() {
    this.logActivity('MergeCommander about to be initiated with configuration:', this.configuration);

    this.unaddressedDiscrepancies = this.discrepancyElements.length;

    if (this.unaddressedDiscrepancies <= 0 || (this.configuration.leftSource.length === 0 && this.configuration.rightSource.length === 0)) {
      this.logActivity('Nothing to merge or merge sources not available - Please submit leftSource and rightSource on initiation!');
      return;
    }

    this.isInlineMode = this.mainContainer.classList.contains('DifferencesInline');

    this.confirmMergeControl();

    this.discrepancies = Array.from(this.discrepancyElements).map(el => new Discrepancy(el, this));

    this.mainContainer.addEventListener(RESOLUTION_EVENT, this.handleDiscrepancyResolution.bind(this));
    this.mainContainer.addEventListener(COMPLETION_EVENT, this.handleDiscrepancyCompletion.bind(this));
    this.mainContainer.addEventListener(COMPLETION_EVENT, this.adjustOutputLineShift.bind(this));

    this.logActivity('MergeCommander initiated', this);
  }

  acceptRightSide() {
    Array.from(this.discrepancyElements).forEach(el => {
      const rightCell = el.querySelector('td.Right');
      if (rightCell) {
        rightCell.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      }
    });

    if (this.mainContainer.classList.contains('DifferencesInline')) {
      Array.from(this.mainContainer.querySelectorAll('.ChangeDelete td.Left')).forEach(cell => {
        cell.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        cell.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      });
    }
  }

  acceptLeftSide() {
    Array.from(this.discrepancyElements).forEach(el => {
      const leftCell = el.querySelector('td.Left');
      if (leftCell) {
        leftCell.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      }
    });

    if (this.mainContainer.classList.contains('DifferencesInline')) {
      Array.from(this.mainContainer.querySelectorAll('.ChangeInsert td.Right')).forEach(cell => {
        cell.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        cell.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      });
    }
  }

  performMerge(event) {
    if (event && typeof event.preventDefault === 'function') {
      event.preventDefault();
    }

    if (this.configuration.mergeButton && this.configuration.mergeButton.hasAttribute('disabled')) {
      this.logActivity('Unable to merge: not all discrepancies have been resolved.');
      return;
    }

    this.finalOutput = [...this.configuration.leftSource];
    this.outputLineShift = 0;
    this.temporaryLineShift = 0;

    this.unprocessedMerges = this.discrepancies.length;

    this.discrepancies.forEach(discrepancy => discrepancy.mergeAction());
  }

  updateConfiguration(newConfiguration) {
    if (typeof newConfiguration === 'object' && newConfiguration !== null && !Array.isArray(newConfiguration)) {
      this.configuration = this.deepMerge(this.configuration, newConfiguration);
    }
  }

  confirmMergeControl() {
    let mergeControlElement = this.configuration.mergeButton;

    if (!mergeControlElement || !this.mainContainer.ownerDocument.body.contains(mergeControlElement)) {
      mergeControlElement = this.mainContainer.ownerDocument.createElement('button');
      mergeControlElement.textContent = 'Process Changes';
      mergeControlElement.setAttribute('disabled', 'disabled');
      Object.assign(mergeControlElement.style, {
        display: 'block',
        height: '50px',
        width: '200px',
        margin: '50px auto'
      });
      if (this.mainContainer.parentElement) {
        this.mainContainer.parentElement.insertBefore(mergeControlElement, this.mainContainer.nextElementSibling);
      } else {
        this.mainContainer.appendChild(mergeControlElement);
      }
      this.configuration.mergeButton = mergeControlElement;
    } else {
      this.configuration.mergeButton.setAttribute('disabled', 'disabled');
    }

    mergeControlElement.addEventListener('click', this.performMerge.bind(this));
  }

  logActivity(...args) {
    if (this.configuration.enableDebugging && window.console && window.console.log) {
      window.console.log.apply(window.console, args);
    }
  }

  handleDiscrepancyResolution() {
    this.unaddressedDiscrepancies--;
    if (this.unaddressedDiscrepancies === 0) {
      if (this.configuration.mergeButton) {
        this.configuration.mergeButton.removeAttribute('disabled');
      }
    }
  }

  handleDiscrepancyCompletion() {
    this.unprocessedMerges--;
    if (this.unprocessedMerges === 0) {
      if (this.configuration.showResultPopup) {
        displayModalWindow('Final Output', this.finalOutput.join('\n'));
      }
      if (this.configuration.showSourcePopups) {
        displayModalWindow('Left Source', this.configuration.leftSource.join('\n'));
        displayModalWindow('Right Source', this.configuration.rightSource.join('\n'));
      }
      if (typeof this.configuration.onMergeComplete === 'function') {
        this.configuration.onMergeComplete.call(this, this.finalOutput, this.configuration.leftSource, this.configuration.rightSource);
      }
    }
  }

  removeOutputLines(sourceLineIndex, lineCount) {
    this.logActivity('Removing Left: ' + sourceLineIndex + ' - ' + (sourceLineIndex + lineCount - 1) + '.');
    const removedLines = this.finalOutput.splice((sourceLineIndex + this.outputLineShift - 1), lineCount);

    if (this.configuration.enableDebugging) {
      const debugContent = removedLines.map(value => (value.trim().substring(0, 10) + '...'));
      this.logActivity('Content removed: ', debugContent);
    }

    this.temporaryLineShift -= lineCount;
  }

  injectOutputLines(sourceLineIndex, lineCount, targetLineIndex) {
    const linesToInsert = [];
    for (let i = 0; i < lineCount; i++) {
      const line = this.configuration.rightSource[sourceLineIndex - 1 + i];
      linesToInsert.push(line);
      this.finalOutput.splice((targetLineIndex - 1 + this.outputLineShift + i), 0, line);
    }

    if (this.configuration.enableDebugging) {
      this.logActivity('Left line prior to insertion: ' + (targetLineIndex - 1));
      if (this.finalOutput[targetLineIndex - 2 + this.outputLineShift]) {
        this.logActivity(
          'Content: ', this.finalOutput[targetLineIndex - 2 + this.outputLineShift].trim().substring(0, 10)
        );
      }

      this.logActivity('Inserted Right: Row ' + sourceLineIndex + ' - ' + (sourceLineIndex + lineCount - 1) + '.');

      const debugContent = linesToInsert.map(value => (value.trim().substring(0, 10) + '...'));
      this.logActivity('Content inserted: (' + debugContent.join(', ') + ')');
    }

    this.temporaryLineShift += lineCount;
  }

  adjustOutputLineShift() {
    this.logActivity('Change outputLineShift from: ' + this.outputLineShift + ' to ' +
      (this.outputLineShift + this.temporaryLineShift) + '.');
    this.outputLineShift += this.temporaryLineShift;
    this.temporaryLineShift = 0;
  }
}

const instanceRegistry = new WeakMap();

const mergeTool = function(targetElement, config) {
  if (typeof targetElement === 'string') {
    targetElement = document.querySelector(targetElement);
  }
  if (!targetElement) {
    reportIssue('Target element not found.');
    return null;
  }

  let commanderInstance = instanceRegistry.get(targetElement);

  if (typeof config === 'string') {
    const methodName = config;
    const methodArgs = Array.prototype.slice.call(arguments, 2);

    if (!commanderInstance) {
      reportIssue('Cannot call methods on mergeTool prior to initialization for this element.');
      return null;
    }

    const method = commanderInstance[methodName];
    if (typeof method === 'function') {
      return method.apply(commanderInstance, methodArgs);
    } else {
      reportIssue('Method "' + methodName + '" does not exist on mergeTool instance.');
      return null;
    }
  } else {
    if (commanderInstance) {
      commanderInstance.updateConfiguration(config);
    } else {
      commanderInstance = new MergeCommander(targetElement, config);
      instanceRegistry.set(targetElement, commanderInstance);
    }
    return commanderInstance;
  }
};

if (typeof window !== 'undefined') {
  window.mergeTool = mergeTool;
}