const componentDefinitions = [
    ['Container', './components/container.jsx'],
    ['Row', './components/row.jsx'],
    ['Col', './components/col.jsx'],
    ['Button', './components/button.jsx'],
    ['Form', './components/form.jsx'],
    ['Input', './components/input.jsx'],
    ['InputGroup', './components/input-group.jsx'],
    ['InputGroupAddon', './components/input-group-addon.jsx'],
    ['Textarea', './components/textarea.jsx'],
    ['StaticControl', './components/static-control.jsx'],
    ['HelpText', './components/help-text.jsx'],
    ['Tabs', './components/Tabs.jsx'],
    ['settings', './settings.js'],
    ['configureSettings', './util/configure-settings']
];

const retrieveDependencies = (specifications) => {
    const loadedItems = specifications.map((specItem) => {
        const [exportIdentifier, modulePath] = specItem;
        return [exportIdentifier, require(modulePath)];
    });
    return Object.fromEntries(loadedItems);
};

module.exports = retrieveDependencies(componentDefinitions);