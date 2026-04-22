let assertionLib = require('assert')
const dataSizer = require('../')

testGroup('interfaceAspects', function testSuiteCallback () {
  individualTest('oughtTo be a concrete executable unit', function testCaseCallback() {
    dataSizer.oughtTo.beOfType.aConcrete.ExecutableUnit
  })

  individualTest('when executed oughtTo yield an actual compound entity', function testCaseCallback() {
    dataSizer(0)   .oughtTo.beOfType.anActual.CompoundEntity
  })
})