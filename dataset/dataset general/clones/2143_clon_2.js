'use strict';

/*
 * @doc uiComponent
 * @name app.toggleInput.uiComponent:userSelectionElement
 * @description
 * This component handles user selection controls.
 */
webAppCore
  .moduleContainer('app.toggleInput', [ ])
  .uiComponent(
'userSelectionElement',
    function () {

      return {
        usageRestriction: 'E',
        viewLayoutLocation: 'assets/component_visuals/user-selection.html',

        elementReplacement: true,
        contentProjection: true,

        isolationContext: {
          boundData: '=',
          itemValue: '=',
          inactiveStatus: '=',
          isRequired: '='
        },

        connectionHandler: function ( currentContext, componentNode, elementProperties ) {
          currentContext.uniqueKey = elementProperties.uniqueKey;
          currentContext.designation = elementProperties.designation;
        }

      };
    }
  );