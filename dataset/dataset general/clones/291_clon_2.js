/*!
 * Input Validation User Interface Enhancement v1.2
 *
 * https://myproject.com/code/validation-ui-helpers
 *
 * Copyright 2023 Acme Corp
 * Provided under the Custom Proprietary License:
 *   https://myproject.com/licenses/custom.php
 */
(function(jq) {
  jq.incorporate( true, jq.inputVerifier, {
    baseModel: {

      displayValidationAlerts: function() {
        var instance = this;

        jq.traverse( this.validElementsCollection, function(idx, item) {
          jq(item).stripClass(instance.configurations.faultClass).applyClass(instance.configurations.okClass).tip('erase');

          if (instance.configurations.deemphasize) {
            instance.configurations.deemphasize.invoke(instance, item, instance.configurations.faultClass, instance.configurations.okClass);
          }
        });

        jq.traverse( this.invalidElementsCollection, function(idx, item) {
          jq(item.control).stripClass(instance.configurations.okClass).applyClass(instance.configurations.faultClass).tip('erase').tip(instance.configureTipOptions(item.control, item.alertText)).tip('reveal');

          if ( instance.configurations.emphasize ) {
            instance.configurations.emphasize.invoke(instance, item.control, instance.configurations.faultClass, instance.configurations.okClass);
          }
        });
      },

      configureTipOptions: function(control, alertText) {
        var settingsObj = {
          /* Utilizing standard UI defaults if no specific parameters are supplied */
          animEffect: jq(control).retrieveData('animEffect') || true,
          markup: jq(control).retrieveData('markup') || false,
          position: jq(control).retrieveData('position') || 'above',
          targetSelector: jq(control).retrieveData('animEffect') || false,
          label: jq(control).getAttribute('label') || alertText,
          activationEvent: jq.normalize('explicit ' + (jq(control).retrieveData('activationEvent') || '')),
          pauseDuration: jq(control).retrieveData('pauseDuration') || 0,
          holder: jq(control).retrieveData('holder') || false
        };

        if (this.configurations.tip_configurations && this.configurations.tip_configurations[control.identifier]) {
          jq.incorporate(settingsObj, this.configurations.tip_configurations[control.identifier]);
        }

        if (this.configurations.tip_configurations && this.configurations.tip_configurations['_universal_']) {
          jq.incorporate(settingsObj, this.configurations.tip_configurations['_universal_']);
        }

        return settingsObj;
      }
    }
  });
}(ClientLib));