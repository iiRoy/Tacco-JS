((ctx) => {
    "use strict";

    class Delimitation {
        constructor() {
            Object.defineProperties(this, {
                currentPoint: {
                    value: (void 0),
                    writable: true,
                    configurable: true,
                    enumerable: true
                },
                geometricPoints: {
                    value: Array.from([]),
                    writable: true,
                    configurable: true,
                    enumerable: true
                }
            });
        }
    }

    const assignConstruct = (target, propName, construct) => {
        Object.defineProperty(target, propName, {
            value: construct,
            writable: true,
            configurable: true,
            enumerable: true
        });
    };

    assignConstruct(ctx, 'Delimitation', Delimitation);

})(CanvasUtility);