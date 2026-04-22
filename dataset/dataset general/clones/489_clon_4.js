const validationAid = {
    verify: (subject) => ({
        isExecutable: () => { if (typeof subject !== 'function') throw new Error(`Expectation failed: subject is not a function`); },
        derivesFrom: (baseClass) => { if (!(subject instanceof baseClass)) throw new Error(`Expectation failed: subject does not derive from ${baseClass.name}`); },
        possessesAttribute: (attr) => { if (subject === null || typeof subject !== 'object' || !Object.prototype.hasOwnProperty.call(subject, attr)) throw new Error(`Expectation failed: subject lacks attribute '${attr}'`); },
        attributeIsExecutable: (attr) => { if (subject === null || typeof subject !== 'object' || typeof subject[attr] !== 'function') throw new Error(`Expectation failed: attribute '${attr}' is not a function`); },
        textContains: (fragment) => { if (typeof subject !== 'string' || !subject.includes(fragment)) throw new Error(`Expectation failed: text does not contain fragment '${fragment}'`); },
        isEquivalentTo: (other) => { if (subject !== other) throw new Error(`Expectation failed: subject is not equivalent to other`); },
        isStructure: () => { if (typeof subject !== 'object' || subject === null) throw new Error(`Expectation failed: subject is not an object`); },
        renderedOutputContains: (textFragment) => {
            if (subject === null || typeof subject !== 'object' || typeof subject.obtainMarkup !== 'function' || !subject.obtainMarkup().includes(textFragment)) {
                throw new Error(`Expectation failed: rendered output does not contain "${textFragment}"`);
            }
        }
    })
};

const BaseComponentFramework = function() {};
BaseComponentFramework.prototype.baseFrameworkMethod = () => {};

const dynamicModuleLoader = (resourceIdentifier) => {
    return new Promise(resolve => {
        setTimeout(() => {
            if (resourceIdentifier === 'packages/demo/view') {
                const MockViewConstructor = function() {
                    this.template = (dataPayload) => {
                        const userName = dataPayload && dataPayload.data && dataPayload.data.username ? dataPayload.data.username : 'Artyom';
                        return `<section>demo template ${userName}</section>`;
                    };
                    this.render = () => {
                        this.domElement = {
                            obtainMarkup: () => {
                                return this.template({data: {username: 'Artyom'}}) + '<span>Hello, demo!</span>';
                            }
                        };
                        return this;
                    };
                    this.showNotification = () => {
                        return { status: 'displayed', content: 'Notification message' };
                    };
                };
                Object.setPrototypeOf(MockViewConstructor.prototype, BaseComponentFramework.prototype);
                resolve(MockViewConstructor);
            } else {
                resolve(null);
            }
        }, 50);
    });
};

const unitTestingFacility = {
    testConveyor: (mainLabel, executionPlan) => {
        console.log(`\n--- Initiating Test Sequence: ${mainLabel} ---`);
        let sharedComponentReference = null;

        const setupPhase = () => {
            return dynamicModuleLoader('packages/demo/view').then(loadedModule => {
                sharedComponentReference = loadedModule;
            });
        };

        const runIndividualTest = (testCaseFunction, description) => {
            console.log(`  Executing: ${description}`);
            return Promise.resolve().then(() => testCaseFunction(sharedComponentReference))
                .then(() => console.log(`  SUCCESS: ${description}`))
                .catch(error => console.error(`  FAILURE: ${description}\n`, error));
        };

        let sequenceChain = setupPhase();

        executionPlan.forEach(testUnit => {
            sequenceChain = sequenceChain.then(() => runIndividualTest(testUnit.action, testUnit.label));
        });

        sequenceChain.finally(() => console.log(`--- Completed Test Sequence: ${mainLabel} ---\n`));
    }
};

const mainTestDefinition = [
    {
        label: 'Verifying component constructor type',
        action: (theConstructor) => {
            return Promise.resolve().then(() => {
                validationAid.verify(theConstructor).isExecutable();
            });
        }
    },
    {
        label: 'Confirming component template functionality',
        action: (theConstructor) => {
            return Promise.resolve().then(() => {
                const componentInstance = new theConstructor();
                validationAid.verify(componentInstance).derivesFrom(BaseComponentFramework);
                validationAid.verify(componentInstance).possessesAttribute('template');
                validationAid.verify(componentInstance.template).isExecutable();
                validationAid.verify(componentInstance.template({data: {
                    username: 'Lola'
                }})).textContains("demo template Lola");
            });
        }
    },
    {
        label: 'Ensuring component rendering capabilities',
        action: (theConstructor) => {
            return Promise.resolve().then(() => {
                const componentInstance = new theConstructor();
                validationAid.verify(componentInstance).possessesAttribute('render');
                validationAid.verify(componentInstance.render()).isEquivalentTo(componentInstance);
                validationAid.verify(componentInstance.render().domElement).isStructure();
                validationAid.verify(componentInstance.render().domElement).renderedOutputContains('demo template Artyom');
            });
        }
    },
    {
        label: 'Validating notification display mechanism',
        action: (theConstructor) => {
            return Promise.resolve().then(() => {
                const componentInstance = new theConstructor();
                validationAid.verify(componentInstance).possessesAttribute('showNotification');
                validationAid.verify(componentInstance.showNotification).attributeIsExecutable('showNotification');
                validationAid.verify(componentInstance.showNotification()).isStructure();
                validationAid.verify(componentInstance.render().domElement).renderedOutputContains('Hello, demo!');
            });
        }
    }
];

unitTestingFacility.testConveyor('Application Component Evaluation', mainTestDefinition);