const _visualizerUtility = window.exelixis;

const _drawVisualComponent = _visualizerUtility.createTree;
const _modifyVisualComponent = _visualizerUtility.updateTree;

class ConfigurationAssembler {
    constructor() {
        this._settingsStore = {};
    }

    _ensurePropertyPath(pathSegments) {
        let currentTarget = this._settingsStore;
        pathSegments.forEach(segmentKey => {
            if (!currentTarget[segmentKey]) {
                currentTarget[segmentKey] = {};
            }
            currentTarget = currentTarget[segmentKey];
        });
        return currentTarget;
    }

    setComponentProperty(pathSegments, propertyKey, propertyValue) {
        const targetObject = this._ensurePropertyPath(pathSegments);
        targetObject[propertyKey] = typeof propertyValue === 'function' ? propertyValue() : propertyValue;
        return this;
    }

    assemble() {
        return this._settingsStore;
    }
}

const _configBuilder = new ConfigurationAssembler();

_configBuilder
    .setComponentProperty([], 'el', () => document.getElementById("yourDiv"))
    .setComponentProperty(['tree'], 'data', "(homo_sapiens:12,(mus_musculus:12,(danio_rerio:13,(pan_troglodytes:9,(taeniopygia_guttata:10,callithrix_jacchus:11):12):12):10);")
    .setComponentProperty(['tree'], 'width', 500)
    .setComponentProperty(['tree'], 'height', 12)
    .setComponentProperty(['tree'], 'scale', false)
    .setComponentProperty(['tree'], 'layoutInput', "vertical")
    .setComponentProperty(['label'], 'fontsize', 12)
    .setComponentProperty(['label'], 'usePics', true)
    .setComponentProperty(['label', 'pics'], 'pictureWidth', 30)
    .setComponentProperty(['label', 'pics'], 'pictureHeight', 40)
    .setComponentProperty(['nodes'], 'toggle', true)
    .setComponentProperty(['nodes'], 'select', true)
    .setComponentProperty(['nodes'], 'size', 5)
    .setComponentProperty(['nodes'], 'fill', "blue")
    .setComponentProperty(['nodes'], 'stroke', "red")
    .setComponentProperty(['nodes'], 'selectedFill', "steelblue")
    .setComponentProperty(['nodes'], 'selectedSize', 4);

const _finalConfiguration = _configBuilder.assemble();

const _activeVisualDisplay = _drawVisualComponent(_finalConfiguration);

// _modifyVisualComponent(_activeVisualDisplay, _finalConfiguration);