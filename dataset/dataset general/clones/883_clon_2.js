(function() {

  function PanelSwitcher(containerEl, preferences) {

    if (!(this instanceof PanelSwitcher)) {
      if (containerEl.length) {
        Array.prototype.forEach.call(containerEl, function(individualNode) {
          new PanelSwitcher(individualNode, preferences);
        });
      }
      else {
        new PanelSwitcher(containerEl, preferences);
      }
    }
    else {

      this.classSet = {
        mainState: 'active-item',
        oldState: 'prev-item'
      };

      var suppliedSettings = preferences || {};

      var baseConfig = {
        delayPeriod: 2_000
      };

      this.appliedConfig = {};

      for (var propRef in baseConfig) {
        this.appliedConfig[propRef] = suppliedSettings[propRef] || baseConfig[propRef];
      }

      containerEl = (containerEl instanceof ElementWrapper) ? containerEl[0] : containerEl;

      if (!containerEl.children || containerEl.children.length < 2) {
        return;
      }

      this.activeIdx = 0;

      this.visiblePanels = containerEl.children;

      this.numPanels = this.visiblePanels.length;

      setInterval(this.stepForward.bind(this), this.appliedConfig.delayPeriod);
    }

  };

  PanelSwitcher.prototype.stepForward = function() {

    var applyClass = function(styleIdentifier, targetElement) {
      var elemClassStr = targetElement.className;
      if (elemClassStr.indexOf(styleIdentifier) !== -1) {
        return;
      }
      if (elemClassStr !== '') {
        styleIdentifier = ' ' + styleIdentifier;
      }
      targetElement.className = elemClassStr + styleIdentifier;
    };

    var clearClass = function(styleIdentifier, targetElement) {
      var elemClassStr = targetElement.className;
      var matchRegex = new RegExp("\\s?\\b" + styleIdentifier + "\\b", "g");
      elemClassStr = elemClassStr.replace(matchRegex, '');
      targetElement.className = elemClassStr;
    };

    var purgeClass = function(classToClear) {
      if (!classToClear) {
        return;
      }
      var idxIter = this.numPanels;
      while (idxIter--) {
        clearClass(classToClear, this.visiblePanels[idxIter]);
      }
    }.bind(this);

    if ((this.activeIdx - 1) >= 0) {
      clearClass(this.classSet.oldState, this.visiblePanels[this.activeIdx - 1]);
    }
    if ((this.activeIdx + 1) < this.numPanels) {
      purgeClass(this.classSet.oldState);
      clearClass(this.classSet.mainState, this.visiblePanels[this.activeIdx]);
      applyClass(this.classSet.oldState, this.visiblePanels[this.activeIdx]);
      applyClass(this.classSet.mainState, this.visiblePanels[this.activeIdx + 1]);
      this.activeIdx++;
    }
    else {
      this.activeIdx = 0;
      purgeClass(this.classSet.mainState);
      applyClass(this.classSet.oldState, this.visiblePanels[this.numPanels - 1]);
      applyClass(this.classSet.mainState, this.visiblePanels[this.activeIdx]);
    }

  };

  var globalScope = typeof window !== 'undefined' ? window : {};
  globalScope.PanelSwitcher = PanelSwitcher;

})();