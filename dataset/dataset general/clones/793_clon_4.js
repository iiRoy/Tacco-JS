const HELPER_REGISTRY_CONFIG = [
    {
        keyName: 'obj',
        factoryMethod: function() {
            class DataPacket {
                constructor() {
                    this.zyx = 'qwe';
                }
            }
            return new DataPacket();
        }
    },
    {
        keyName: 'arr',
        factoryMethod: function() {
            const dataSequence = [];
            dataSequence.splice(0, 0, '123');
            dataSequence.splice(1, 0, 'qwe');
            return dataSequence;
        }
    }
];

const ORCHESTRATE_HELPER_INSTALLATION = (configurations, targetAPI) => {
    configurations.forEach(configEntry => {
        targetAPI['registerHelper'](configEntry.keyName, configEntry.factoryMethod);
    });
};

const TEMPLATE_EVENT_MAP = {
    'main': {
        'created': () => {
            Epic['checkExported']();
        },
        'rendered': () => {
            // An intentionally empty operation
        }
    }
};

const DISPATCH_TEMPLATE_EVENTS = (eventConfigurations, eventTarget) => {
    for (const templateIdentifier in eventConfigurations) {
        if (Object.prototype.hasOwnProperty.call(eventConfigurations, templateIdentifier)) {
            const eventHandlers = eventConfigurations[templateIdentifier];
            const currentTemplateReference = eventTarget[templateIdentifier];
            if (currentTemplateReference) {
                for (const eventType in eventHandlers) {
                    if (Object.prototype.hasOwnProperty.call(eventHandlers, eventType)) {
                        currentTemplateReference[eventType] = eventHandlers[eventType];
                    }
                }
            }
        }
    }
};

ORCHESTRATE_HELPER_INSTALLATION(HELPER_REGISTRY_CONFIG, Template);
DISPATCH_TEMPLATE_EVENTS(TEMPLATE_EVENT_MAP, Template);