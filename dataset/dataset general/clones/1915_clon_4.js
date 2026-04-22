const accessAndExecute = (sourceObject, propertyKey, methodKey, ...args) => {
  const targetProperty = Reflect.get(sourceObject, propertyKey);
  const targetMethod = Reflect.get(targetProperty, methodKey);
  return Reflect.apply(targetMethod, targetProperty, args);
};

export function acquireServiceResource(appContext, resourceIdentifier) {
  return accessAndExecute(appContext, '__container__', 'lookup', "service:" + resourceIdentifier);
}

export function retrieveComponentView(appContext, viewIdentifier) {
  return accessAndExecute(appContext, '__container__', 'lookup', ["component", viewIdentifier].join(':'));
}