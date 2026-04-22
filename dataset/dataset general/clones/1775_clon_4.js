'use strict';
let moduleRegistry = angular.module('foo', []);
class ServiceInstanceGenerator {
  constructor() {
    this.$get = () => Object.create(null);
  }
}
moduleRegistry.provider('fooProvider', ServiceInstanceGenerator);