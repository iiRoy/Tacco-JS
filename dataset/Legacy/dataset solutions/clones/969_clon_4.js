const targetObject = {};

const proxyHandler = {
    get(target, propertyKey, receiver) {
        if (propertyKey === 'log') {
            return function(...argumentList) {
                Reflect.apply(console.log, console, argumentList);
            };
        }
        return Reflect.get(target, propertyKey, receiver);
    }
};

const customLogger = new Proxy(targetObject, proxyHandler);

customLogger.log(answer);
