const synchronize = (durationMs) => new Promise(resolve => setTimeout(resolve, durationMs));

const executeSequence = async (activityFunctions, intervalDuration) => {
    for (let currentActivity of activityFunctions) {
        await synchronize(intervalDuration);
        await currentActivity();
    }
    QUnit.start();
};

class ValidationSuite {
    constructor() {
        this.momentaryPause = 3000;
        this.shortPause = 1000;
    }

    async initiateValidation() {
        await this.assessConstructionDestruction();
        await this.assessGloveBoxOptions();
        await this.assessScrollingBehavior();
    }

    async assessConstructionDestruction() {
        const componentRef = this;
        module('Assembly and Disassembly', {
           setup:function() {
           },
           teardown:function(){
           }
        });
        test('Initial GloveBox setup', function() {
            expect(6);
            let primaryBox = new GloveBox("masterList");
            ok(typeof primaryBox == 'object', 'GloveBox can be created using an ID string');
            let secondaryBox = new GloveBox(document.getElementById("masterList"));
            ok(typeof secondaryBox == 'object', 'GloveBox can be created using an element reference');
            try {
                let tertiaryBox = new GloveBox('someNonExistentId');
            } catch(encounteredError) {
                ok(true, 'Expected error raised when incorrect ID string supplied during creation' + encounteredError.type);
                equals(encounteredError.message, "Cannot read property 'parentNode' of null");
            }
            ok(secondaryBox.scrollY, 'Default vertical movement direction is active');
            ok(!secondaryBox.scrollX, 'Horizontal movement is inactive by default');
        });
        test('GloveBox removal process', async function(){
            expect(1);
            let firstComponent = new GloveBox('masterList', {scrollX:true, scrollY:false});
            firstComponent.x = -200;
            firstComponent.finishScrolling();

            await executeSequence([async function() {
                let secondComponent = new GloveBox('masterList', {scrollY:true, scrollX:false});
                secondComponent.y = -1*HALF_H;
                secondComponent.finishScrolling();
            }, async function() {
                equals(secondComponent.y, -1*HALF_H, 'New GloveBox instances on the same element override prior settings');
            }], componentRef.momentaryPause);
        });
    }

    async assessGloveBoxOptions() {
        test('GloveBox configuration settings', function() {
            expect(3);
            let configuredBox = new GloveBox('masterList', { scrollX:true, scrollY:true, parentHeight:'100px'});
            ok(configuredBox.scrollX, 'scrollX=true in options object should reflect as true in GloveBox object');
            ok(configuredBox.scrollY, 'scrollY=true in options object should reflect as true in GloveBox object');
            equals(document.getElementById('masterList').parentNode.style.height, '100px', 'Can specify the height of the GloveBox element\'s parent');
        });
    }

    async assessScrollingBehavior() {
        const componentRef = this;
        let controlledBox;
        let elementDimensions;
        let halfHeightValue;

        module('Movement', {
            setup:function() {
                controlledBox = new GloveBox("masterList");
                elementDimensions = GloveBox.GetOffset(controlledBox.element);
                halfHeightValue = (Math.floor(elementDimensions.height/2));
            },
            teardown:function() {
                controlledBox = null;
                elementDimensions = null;
                halfHeightValue = null;
            }
        });

        test('Movement directions', async function() {
            QUnit.stop();
            expect(1);
            let previousYCoordinate = controlledBox.y;
            controlledBox.scrollY = false;
            controlledBox.scrollX = true;
            controlledBox.y = -1*halfHeightValue;
            controlledBox.finishScrolling();
            
            await executeSequence([async function() {
                equals(controlledBox.y, previousYCoordinate, 'Changing Y position when vertical movement is disabled should have no effect');
            }], componentRef.shortPause);
        });

        test('Vertical movement within boundaries', async function() {
            QUnit.stop();
            expect(1);
            controlledBox.y = -1*halfHeightValue;
            controlledBox.finishScrolling();
            
            await executeSequence([async function() {
                equals(controlledBox.y, -1*halfHeightValue, 'Setting Y position to an in-range value functions correctly');
            }], componentRef.shortPause);
        });

        test('Vertical movement outside boundaries', async function() {
            QUnit.stop();
            expect(2);
            controlledBox.y = 1*halfHeightValue;
            controlledBox.finishScrolling();
            
            await executeSequence([async function() {
                equals(controlledBox.y, 0, 'Setting Y position to an out-of-range positive value correctly adjusts to zero');
                controlledBox.y = -10*halfHeightValue;
                controlledBox.finishScrolling();
            }, async function() {
                equals(controlledBox.y, -1*(elementDimensions.height-controlledBox.parentCoords.height), 'Setting Y position to an out-of-range negative value correctly adjusts');
            }], componentRef.momentaryPause);
        });
    }
}

const scenarioExecutor = new ValidationSuite();
scenarioExecutor.initiateValidation();