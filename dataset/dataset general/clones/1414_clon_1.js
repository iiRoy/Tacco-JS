/*
 * This file contains test specifications for the Person module.
 * It uses the RequireJS define pattern and a testing framework
 * like Mocha/Chai for assertions.
 */

define(
    ['lib/person'], // Dependency: the Person module itself
    function (Person) {

        // Describe block for the 'Person' entity.
        // All tests related to the Person class will be nested here.
        describe('Person', function () {

            // Test case 1: Verify default name.
            it('should have a name by default', function () {
                // Instantiating a new Person without arguments
                var defaultPerson = new Person();
                // Assert that the 'name' property equals 'Joe'
                defaultPerson.name.should.equal('Joe');
            });


            // Test case 2: Verify custom name setting during creation.
            it('should allow a name to be set on creation', function () {
                // Instantiating with a specific name 'Francis'
                var namedPerson = new Person('Francis');
                // Assert that the 'name' property now equals 'Francis'
                namedPerson.name.should.equal('Francis');
            });


            // Test case 3: A pending test for 'age'.
            // This test is defined but has no implementation yet.
            it('should have an age');

        }); // End of describe('Person') block

    } // End of function(Person) callback
); // End of define call