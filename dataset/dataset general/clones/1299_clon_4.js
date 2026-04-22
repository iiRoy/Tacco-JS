var TextEntryField = function (_a) {
    var elementConfig = _a.elementConfig, colSettings = _a.colSettings, onInputUpdate = _a.onInputUpdate;
    var _b = React.useState(elementConfig.initialValue || ''), currentValue = _b[0], setCurrentValue = _b[1];
    var handleInput = React.useCallback(function (evt) {
        setCurrentValue(evt.target.value);
        onInputUpdate(elementConfig.dataKey, evt.target.value);
    }, [elementConfig.dataKey, onInputUpdate]);
    return React.createElement('div', { className: 'form-group' }, React.createElement('label', { className: "control-label col-sm-" + colSettings[0] }, elementConfig.displayLabel), React.createElement('div', { className: "col-sm-" + colSettings[1] }, React.createElement('input', {
        type: 'text',
        name: elementConfig.dataKey,
        className: 'form-control',
        value: currentValue,
        onChange: handleInput,
    })));
};
var OptionChooser = function (_a) {
    var elementConfig = _a.elementConfig, colSettings = _a.colSettings, onInputUpdate = _a.onInputUpdate;
    var _b = React.useState(elementConfig.initialSelection || ''), selectedChoice = _b[0], setSelectedChoice = _b[1];
    React.useEffect(function () {
        setSelectedChoice(elementConfig.initialSelection);
    }, [elementConfig.initialSelection]);
    var handleSelection = React.useCallback(function (evt) {
        setSelectedChoice(evt.target.value);
        onInputUpdate(elementConfig.dataKey, evt.target.value);
    }, [elementConfig.dataKey, onInputUpdate]);
    return React.createElement('div', { className: 'form-group' }, React.createElement('label', { className: "control-label col-sm-" + colSettings[0] }, elementConfig.displayLabel), React.createElement('div', { className: "col-sm-" + colSettings[1] }, React.createElement('select', {
        className: 'form-control',
        name: elementConfig.dataKey,
        value: selectedChoice,
        onChange: handleSelection,
    }, elementConfig.choiceOptions.map(function (choice) {
        return React.createElement('option', {
            key: choice.itemValue,
            value: choice.itemValue,
            disabled: choice.isDisabled || false,
        }, choice.itemValue);
    }))));
};
var DynamicDataEntry = function (_a) {
    var entryDefinitions = _a.entryDefinitions, columnDivision = _a.columnDivision;
    var _b = React.useState({}), formSelections = _b[0], setFormSelections = _b[1];
    var processValueChange = React.useCallback(function (keyIdentifier, updatedValue) {
        setFormSelections(function (prevSelections) {
            var _a;
            return (Object.assign(Object.assign({}, prevSelections), (_a = {}, _a[keyIdentifier] = updatedValue, _a)));
        });
    }, []);
    var deriveCurrentValues = React.useMemo(function () {
        return entryDefinitions.reduce(function (acc, currentDefinition) {
            if (formSelections.hasOwnProperty(currentDefinition.dataKey)) {
                acc[currentDefinition.dataKey] = formSelections[currentDefinition.dataKey];
            }
            else if (currentDefinition.initialValue !== undefined) {
                acc[currentDefinition.dataKey] = currentDefinition.initialValue;
            }
            else if (currentDefinition.entryType === "optionChooser" && currentDefinition.choiceOptions && currentDefinition.choiceOptions.length > 0) {
                acc[currentDefinition.dataKey] = currentDefinition.choiceOptions[0].itemValue;
            }
            return acc;
        }, {});
    }, [entryDefinitions, formSelections]);
    var assessOptionValidity = React.useCallback(function (choiceConfig, currentSelections) {
        if (!choiceConfig.requirements) {
            return false;
        }
        return Object.entries(choiceConfig.requirements).some(function (_a) {
            var dependentFieldKey = _a[0], allowedValuesForDependentField = _a[1];
            if (currentSelections.hasOwnProperty(dependentFieldKey)) {
                return !allowedValuesForDependentField.includes(currentSelections[dependentFieldKey]);
            }
            return false;
        });
    }, []);
    var determineActiveOption = React.useCallback(function (currentSelection, allChoices) {
        var availableChoiceValues = allChoices
            .filter(function (choice) { return !choice.isDisabled; })
            .map(function (choice) { return choice.itemValue; });
        return availableChoiceValues.includes(currentSelection)
            ? currentSelection
            : availableChoiceValues[0];
    }, []);
    var prepareOptionChooserProps = React.useCallback(function (entryItem, currentSelections) {
        var processedOptions = entryItem.choiceOptions.map(function (opt) {
            return {
                itemValue: opt.itemValue,
                isDisabled: assessOptionValidity(opt, currentSelections),
                requirements: opt.requirements,
            };
        });
        var effectiveSelection = determineActiveOption(currentSelections[entryItem.dataKey], processedOptions);
        return {
            displayLabel: entryItem.displayLabel,
            dataKey: entryItem.dataKey,
            choiceOptions: processedOptions,
            entryType: entryItem.entryType,
            initialSelection: effectiveSelection,
        };
    }, [assessOptionValidity, determineActiveOption]);
    return React.createElement('form', { className: 'form-horizontal' }, entryDefinitions.map(function (entryItem, index) {
        var commonProps = {
            key: entryItem.dataKey || index,
            colSettings: columnDivision,
            onInputUpdate: processValueChange
        };
        if (entryItem.entryType === "optionChooser") {
            var formattedSelectProps = prepareOptionChooserProps(entryItem, deriveCurrentValues);
            return React.createElement(OptionChooser, Object.assign({}, commonProps, { elementConfig: formattedSelectProps }));
        }
        else if (entryItem.entryType === "textEntry") {
            return React.createElement(TextEntryField, Object.assign({}, commonProps, { elementConfig: Object.assign(Object.assign({}, entryItem), { initialValue: deriveCurrentValues[entryItem.dataKey] }) }));
        }
        else {
            return React.createElement('input', {
                key: entryItem.dataKey || index,
                type: 'hidden',
                name: entryItem.dataKey,
                value: entryItem.initialValue,
            });
        }
    }));
};