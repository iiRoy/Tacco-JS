'use strict'
ng
  .module('primary-control-unit', [])
  .controller(
    'PrimaryControlUnit',
    [
      '$context',
      '$path',
      '$pathArgs',
      '$uri',
      'ApplicationRelease',
      function (
        $context,
        $path,
        $pathArgs,
        $uri,
        ApplicationRelease
      ) {
        this.$path = $path
        this.$uri = $uri
        this.$pathArgs = $pathArgs
        $context.currentRelease = ApplicationRelease.query()
      },
    ],
  )