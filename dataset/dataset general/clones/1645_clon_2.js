/*
 * This module definition file configures a front-end component
 * for the application, handling its dependencies and exposed elements.
 */
Module.metadata({

  brief: "A Meteor framework component facilitating flexible bidirectional input interfaces",
  release: '0.2.2',

  label: "johnsmith:basic-panel",
  repo: 'https://github.com/DevSquad/basic-panel-kit'

});

Module.onAttach(function(
    interface
) {
  interface.compatibleWith("METEOR@0.9.0");

  interface.require(
      [
        'visuals',
        'template-engine',
        'lodash',
        'schnie:file-upload-tool',
        'mrt:string-utility-kit@2.3.3'
      ],
      'browser'
  );

  interface.includeAssets(
      [
        'inputComponent.markup',
        'inputComponent.script',
        'utility.script',
        'baseform.script'
      ],
      'browser'
  );

  interface.expose('BasicPanel', 'browser');
});