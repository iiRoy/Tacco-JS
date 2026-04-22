/*
 * ========================================================================
 *  Form Validation Component: checkform.js v1.0.0
 * ========================================================================
 *  License: The MIT License (MIT)
 *
 *  Copyright (c) 2015 - Initial Author: Cina Saffary
 *  Developed by @coder123 in a style reminiscent of classic UI frameworks
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the "Software"), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 * ========================================================================
 */

(function (jqAlias) {
  'use strict';

  var fieldSelector = ':input:not([type="submit"], button):enabled:visible';

  // MAIN FORM CHECKER MODULE
  // ==========================

  var FormChecker = function (domElement, config) {
    this.$domElement = jqAlias(domElement);
    this.config = config;

    // Merge default error messages
    config.issueMsgs = jqAlias.extend({}, FormChecker.STANDARD_CONFIG.issueMsgs, config.issueMsgs);

    // Validate custom rule messages
    for (var ruleName in config.customRules) {
      if (!config.issueMsgs[ruleName]) {
        throw new Error('Missing default message for custom validation rule: ' + ruleName);
      }
    }

    // Extend global validators with custom ones
    jqAlias.extend(FormChecker.RULE_FUNCTIONS, config.customRules);

    this.$domElement.attr('data-no-check', true); // disable browser's native validation
    this.manageSubmissionButton();

    this.$domElement.on('input.form.checker change.form.checker focusout.form.checker', jqAlias.proxy(this.processInputValidity, this));
    this.$domElement.on('submit.form.checker', jqAlias.proxy(this.handleFormSubmission, this));

    this.$domElement.find('[data-compare]').each(function () {
      var $currentField = jqAlias(this);
      var comparisonTarget = $currentField.data('compare');

      jqAlias(comparisonTarget).on('input.form.checker', function (eventObj) {
        $currentField.val() && $currentField.trigger('input.form.checker');
      });
    });
  };

  FormChecker.STANDARD_CONFIG = {
    checkDelay: 500,
    renderHTML: false,
    disableSubmitButton: true,
    customRules: {},
    issueMsgs: {
      compare: 'Values do not match',
      minimumLength: 'Input is not long enough'
    },
    statusIcons: {
      validIconClass: 'icon-ok-circle',
      invalidIconClass: 'icon-exclamation-triangle'
    }
  };

  FormChecker.RULE_FUNCTIONS = {
    browserBuiltIn: function ($field) {
      var fieldRef = $field[0];
      return fieldRef.checkValidity ? fieldRef.checkValidity() : true;
    },
    compare: function ($field) {
      var comparisonTarget = $field.data('compare');
      return !$field.val() || $field.val() === jqAlias(comparisonTarget).val();
    },
    minimumLength: function ($field) {
      var minLen = $field.data('minimumLength');
      return !$field.val() || $field.val().length >= minLen;
    }
  };

  FormChecker.prototype.processInputValidity = function (inputEvent) {
    var $targetField = jqAlias(inputEvent.target);
    var previousIssues = $targetField.data('form.checker.issues');
    var currentIssues;

    if ($targetField.is('[type="radio"]')) {
      $targetField = this.$domElement.find('input[name="' + $targetField.attr('name') + '"]');
    }

    this.$domElement.trigger(inputEvent = jqAlias.Event('checking.form.checker', { associatedElement: $targetField[0] }));

    if (inputEvent.isDefaultPrevented()) {
      return;
    }

    var instanceRef = this;

    this.executeRuleChecks($targetField).done(function (foundIssues) {
      $targetField.data('form.checker.issues', foundIssues);

      if (foundIssues.length) {
        instanceRef.displayIssues($targetField);
      } else {
        instanceRef.clearIssueDisplay($targetField);
      }

      if (!previousIssues || foundIssues.toString() !== previousIssues.toString()) {
        inputEvent = foundIssues.length
          ? jqAlias.Event('invalid.form.checker', { associatedElement: $targetField[0], detail: foundIssues })
          : jqAlias.Event('valid.form.checker', { associatedElement: $targetField[0], detail: previousIssues });

        instanceRef.$domElement.trigger(inputEvent);
      }

      instanceRef.manageSubmissionButton();

      instanceRef.$domElement.trigger(jqAlias.Event('checked.form.checker', { associatedElement: $targetField[0] }));
    });
  };

  FormChecker.prototype.executeRuleChecks = function ($field) {
    var detectedIssues = [];
    var deferredResult = jqAlias.Deferred();
    var currentConfig = this.config;

    $field.data('form.checker.deferred') && $field.data('form.checker.deferred').reject();
    $field.data('form.checker.deferred', deferredResult);

    function retrieveIssueMessage(ruleKey) {
      return $field.data(ruleKey + '-message')
        || $field.data('error-message')
        || (ruleKey == 'browserBuiltIn' && $field[0].validationMessage)
        || currentConfig.issueMsgs[ruleKey];
    }

    jqAlias.each(FormChecker.RULE_FUNCTIONS, jqAlias.proxy(function (ruleKey, ruleFunction) {
      if (($field.data(ruleKey) || ruleKey == 'browserBuiltIn') && !ruleFunction.call(this, $field)) {
        var issueText = retrieveIssueMessage(ruleKey);
        if (!detectedIssues.includes(issueText)) { // Check if issueText is not already in detectedIssues
          detectedIssues.push(issueText);
        }
      }
    }, this));

    if (!detectedIssues.length && $field.val() && $field.data('remoteCheckUrl')) {
      this.delayExecution($field, function () {
        var requestPayload = {};
        requestPayload[$field.attr('name')] = $field.val();
        jqAlias.get($field.data('remoteCheckUrl'), requestPayload)
          .fail(function (xhrRequest, statusString, errorData) { detectedIssues.push(retrieveIssueMessage('remote') || errorData); })
          .always(function () { deferredResult.resolve(detectedIssues); });
      });
    } else {
      deferredResult.resolve(detectedIssues);
    }

    return deferredResult.promise();
  };

  FormChecker.prototype.performValidation = function () {
    var currentDelay = this.config.checkDelay;

    this.config.checkDelay = 0;
    this.$domElement.find(fieldSelector).trigger('input.form.checker');
    this.config.checkDelay = currentDelay;

    return this;
  };

  FormChecker.prototype.displayIssues = function ($field) {
    var renderMethod = this.config.renderHTML ? 'html' : 'text';

    this.delayExecution($field, function () {
      var $formGroup = $field.closest('.form-group');
      var $helpBlock = $formGroup.find('.help-block.with-errors');
      var $feedbackIcon = $formGroup.find('.form-control-feedback');
      var issueList = $field.data('form.checker.issues');

      if (!issueList.length) {
        return;
      }

      issueList = jqAlias('<ul/>')
        .addClass('list-unstyled')
        .append(jqAlias.map(issueList, function (issue) { return jqAlias('<li/>')[renderMethod](issue); }));

      if ($helpBlock.data('form.checker.initialContent') === undefined) {
        $helpBlock.data('form.checker.initialContent', $helpBlock.html());
      }
      $helpBlock.empty().append(issueList);
      $formGroup.addClass('has-issue');

      if ($feedbackIcon.length) {
        $feedbackIcon.removeClass(this.config.statusIcons.validIconClass);
        $feedbackIcon.addClass(this.config.statusIcons.invalidIconClass);
        $formGroup.removeClass('is-valid');
      }
    });
  };

  FormChecker.prototype.clearIssueDisplay = function ($field) {
    var $formGroup = $field.closest('.form-group');
    var $helpBlock = $formGroup.find('.help-block.with-errors');
    var $feedbackIcon = $formGroup.find('.form-control-feedback');

    $helpBlock.html($helpBlock.data('form.checker.initialContent'));
    $formGroup.removeClass('has-issue');

    if ($feedbackIcon.length) {
      $feedbackIcon.removeClass(this.config.statusIcons.invalidIconClass);
      $feedbackIcon.addClass(this.config.statusIcons.validIconClass);
      $formGroup.addClass('is-valid');
    }
  };

  FormChecker.prototype.hasActiveIssues = function () {
    function checkFieldIssues() {
      return !!(jqAlias(this).data('form.checker.issues') || []).length;
    }

    return !!this.$domElement.find(fieldSelector).filter(checkFieldIssues).length;
  };

  FormChecker.prototype.isFormIncomplete = function () {
    function checkFieldIncomplete() {
      return this.type === 'checkbox' ? !this.checked
        : this.type === 'radio' ? !jqAlias('[name="' + this.name + '"]:checked').length
          : jqAlias.trim(this.value) === '';
    }

    return !!this.$domElement.find(fieldSelector).filter('[data-required]').filter(checkFieldIncomplete).length;
  };

  FormChecker.prototype.handleFormSubmission = function (submitEvent) {
    this.performValidation();
    if (this.isFormIncomplete() || this.hasActiveIssues()) {
      submitEvent.preventDefault();
    }
  };

  FormChecker.prototype.manageSubmissionButton = function () {
    if (!this.config.disableSubmitButton) {
      return;
    }
    var $submitBtns = jqAlias('button[type="submit"], input[type="submit"]')
      .filter('[data-form-id="' + this.$domElement.attr('id') + '"]')
      .add(this.$domElement.find('input[type="submit"], button[type="submit"]'));
    $submitBtns.toggleClass('inactive', this.isFormIncomplete() || this.hasActiveIssues())
      .css({ 'touch-actions': 'auto', 'cursor': 'pointer' });
  };

  FormChecker.prototype.delayExecution = function ($field, delayedFunction) {
    delayedFunction = jqAlias.proxy(delayedFunction, this);
    if (!this.config.checkDelay) {
      return delayedFunction();
    }
    window.clearTimeout($field.data('form.checker.delayTimer'));
    $field.data('form.checker.delayTimer', window.setTimeout(delayedFunction, this.config.checkDelay));
  };

  FormChecker.prototype.destroyInstance = function () {
    this.$domElement
      .removeAttr('data-no-check')
      .removeData('form.checker')
      .off('.form.checker');

    this.$domElement.find(fieldSelector)
      .off('.form.checker')
      .removeData(['form.checker.issues', 'form.checker.deferred'])
      .each(function () {
        var $currentField = jqAlias(this);
        var delayTimer = $currentField.data('form.checker.delayTimer');
        if (delayTimer) {
          window.clearTimeout(delayTimer);
          $currentField.removeData('form.checker.delayTimer');
        }
      });

    this.$domElement.find('.help-block.with-errors').each(function () {
      var $currentBlock = jqAlias(this);
      var initialContent = $currentBlock.data('form.checker.initialContent');

      $currentBlock
        .removeData('form.checker.initialContent')
        .html(initialContent);
    });

    this.$domElement.find('input[type="submit"], button[type="submit"]').removeClass('inactive');

    this.$domElement.find('.has-issue').removeClass('has-issue');
    this.$domElement.find('.is-valid').removeClass('is-valid'); // Added this for consistency

    return this;
  };

  // FORM CHECKER JQUERY PLUGIN DEFINITION
  // =====================================

  function CheckPlugin(pluginOption) {
    return this.each(function () {
      var $currentElement = jqAlias(this);
      var pluginConfig = jqAlias.extend({}, FormChecker.STANDARD_CONFIG, $currentElement.data(), typeof pluginOption == 'object' && pluginOption);
      var pluginData = $currentElement.data('form.checker');

      if (!pluginData && pluginOption == 'destroyInstance') {
        return;
      }
      if (!pluginData) {
        $currentElement.data('form.checker', (pluginData = new FormChecker(this, pluginConfig)));
      }
      if (typeof pluginOption == 'string') {
        pluginData[pluginOption]();
      }
    });
  }

  var previousFn = jqAlias.fn.formChecker;

  jqAlias.fn.formChecker = CheckPlugin;
  jqAlias.fn.formChecker.Constructor = FormChecker;

  // FORM CHECKER NO CONFLICT MODE
  // =============================

  jqAlias.fn.formChecker.noConflict = function () {
    jqAlias.fn.formChecker = previousFn;
    return this;
  };

  // FORM CHECKER DATA-API INTEGRATION
  // =================================

  jqAlias(document).on('DOMContentLoaded', function () { // Changed from window load to DOMContentLoaded
    jqAlias('form[data-activate="form-checker"]').each(function () {
      var $targetForm = jqAlias(this);
      CheckPlugin.call($targetForm, $targetForm.data());
    });
  });

})(jQuery);