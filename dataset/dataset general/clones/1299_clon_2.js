var DataEntryPanel=VisualCore.buildComponent({

  //  Initializes the component's internal data store
  retrieveInitialState: function(){
    return {
      fieldData: {}
    };
  },

  TextField: VisualCore.buildComponent({

    retrieveInitialState: function(){
      return {
        currentVal: this.props.elementDef.elementValue
      };
    },

    displayElement: function(){
      return VisualCore.UIElements.section({
        styleClass: "form-group input-field",
        components: [
          VisualCore.UIElements.labelTag({
            styleClass: "label-control grid-col-"+this.props.columnSizes[0],
            components: [
              this.props.elementDef.labelTxt
            ]
          }),
          VisualCore.UIElements.container({
            styleClass: "grid-col-"+this.props.columnSizes[1],
            components: [
              VisualCore.UIElements.textInput({
                inputType: "plainText",
                controlName: this.props.elementDef.controlName,
                styleClass: "entry-control",
                currentVal: this.state.currentVal,
                onUpdate: function(evt){
                  this.setState({currentVal: evt.target.value});
                  this.props.updateCallback(evt.target.controlName, evt.target.value);
                }.bind(this),
              })
            ]
          })
        ]
      });
    }
  }),

  DropdownChooser: VisualCore.buildComponent({

    retrieveInitialState: function(){
      return {currentSelection: this.props.elementDef.elementValue};
    },

    onPropsUpdate: function(newProperties){
      this.setState({currentSelection: newProperties.elementDef.elementValue});
    },

    displayElement: function(){
      return VisualCore.UIElements.section({
        styleClass: "form-group",
        components: [
          VisualCore.UIElements.labelTag({
            styleClass: "label-control grid-col-"+this.props.columnSizes[0],
            components: [
              this.props.elementDef.labelTxt
            ]
          }),
          VisualCore.UIElements.container({
            styleClass: "grid-col-"+this.props.columnSizes[1],
            components: [
              VisualCore.UIElements.selectionBox({
                styleClass: "selection-control",
                controlName: this.props.elementDef.controlName,
                currentSelection: this.state.currentSelection,
                onUpdate: function(evt){
                  this.setState({currentSelection: evt.target.value});
                  this.props.updateCallback(evt.target.controlName, evt.target.value);
                }.bind(this),
                components: this.props.elementDef.choices.map(function(choice){
                  return VisualCore.UIElements.choiceItem({
                    isDisabled: choice.isDisabled || false,
                    components: [
                      choice.itemValue
                    ]
                  });
                })
              })
            ]
          })
        ]
      });
    }
  }),

  fetchCurrentData: function(){
    var currentSnapshot={};
    for (var idx=0; idx < this.props.elements.length; idx++) {
      var element=this.props.elements[idx];
      if (this.state.fieldData.hasOwnProperty(element.controlName)) {
        currentSnapshot[element.controlName]=this.state.fieldData[element.controlName];
      } else if (element.elementValue !== undefined) {
        currentSnapshot[element.controlName]=element.elementValue;
      } else if (element.elementKind === "dropdown" && element.choices.length > 0) {
        currentSnapshot[element.controlName]=element.choices[0].itemValue;
      }
    }
    return currentSnapshot;
  },

  handleDataChange: function(fieldId, newValue){
    var currentFieldData=this.state.fieldData;
    currentFieldData[fieldId]=newValue;
    this.setState({fieldData: currentFieldData});
  },

  determineOptionDisabledStatus: function(optionObj, presentFieldData){
    if (optionObj.dependents !== undefined) {
      for (var depKey in optionObj.dependents) {
        if (presentFieldData.hasOwnProperty(depKey)) {
          var dependencyMet=false;
          for (var iter=0; iter < optionObj.dependents[depKey].length; iter++) {
            if (presentFieldData[depKey] === optionObj.dependents[depKey][iter]) {
              dependencyMet=true;
              break;
            }
          }
          if (!dependencyMet) {
            return true;
          }
        }
      }
    }
    return false;
  },

  // Verifies if the currently chosen value is present in the list of active options
  getValidSelectedChoice: function(currentChosenValue, availableChoices){
    var selectableValues=availableChoices.filter(function(choiceItem){
      return !choiceItem.isDisabled;
    }).map(function(choiceItem){
      return choiceItem.itemValue;
    });
    var valuePresent=false;
    for (var k=0; k < selectableValues.length; k++) {
      if (selectableValues[k] === currentChosenValue) {
        valuePresent=true;
        break;
      }
    }
    return valuePresent ? currentChosenValue : selectableValues[0];
  },

  prepareDropdownData: function(elementDef, currentFieldData){
    var processedChoices=elementDef.choices.map(function(originalChoice){
      return {itemValue: originalChoice.itemValue,
              isDisabled: this.determineOptionDisabledStatus(originalChoice, currentFieldData)};
    }.bind(this));
    var finalValue=this.getValidSelectedChoice(currentFieldData[elementDef.controlName], processedChoices);
    return {labelTxt: elementDef.labelTxt,
            controlName: elementDef.controlName,
            choices: processedChoices,
            elementKind: elementDef.elementKind,
            elementValue: finalValue};
  },

  displayPanel: function(){
    var presentFieldData=this.fetchCurrentData();
    return VisualCore.UIElements.dataForm({
      styleClass: "horizontal-form",
      components: this.props.elements.map(function(element){
        if (element.elementKind === "dropdown") {
          return this.DropdownChooser({elementDef: this.prepareDropdownData(element, presentFieldData),
                                      columnSizes: this.props.columnSizes,
                                      updateCallback: this.handleDataChange});
        } else if (element.elementKind === "textField") {
          return this.TextField({elementDef: element,
                                 columnSizes: this.props.columnSizes,
                                 updateCallback: this.handleDataChange});
        } else {
          return VisualCore.UIElements.hiddenInput({
            inputType: "invisible",
            controlName: element.controlName,
            elementValue: element.elementValue
          });
        }
      }.bind(this))
    });
  }
});