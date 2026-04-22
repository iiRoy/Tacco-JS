let CodeBuilder = require("code-builder");
let Processor = require("processor");
let verifier = require("verifier");

function compileForProcessor(coreUnit, instructionStrings) {
    let builderInstance = new CodeBuilder(coreUnit);
    let assemblyCode = instructionStrings.join("\n");
    builderInstance.generate(assemblyCode + "\n HALT");
}
function executeOnProcessor() {
    let procInstance = new Processor();
    compileForProcessor(procInstance, Array.prototype.slice.call(arguments, 0));
    procInstance.execute();
    return procInstance;
}

let exportBundle = {
    'verify Processor#resolveAddress': function() {
        let procInstance = new Processor();

        // Basic register-based storage locations
        let machineRegisters = ["alpha", "beta", "gamma", "xi", "upsilon", "zeta", "iota", "kappa"];
        procInstance.store(0x0000, 4);
        for (let idx = 0, totalItems = machineRegisters.length; idx < totalItems; ++idx) {
            procInstance.store("programCounter", 0x0000);
            procInstance.store(machineRegisters[idx], 0xF0F0 + idx);

            verifier.equal(procInstance.resolveAddress(idx), machineRegisters[idx]);
            verifier.equal(procInstance.resolveAddress(idx + 8), 0xF0F0 + idx);
            verifier.equal(procInstance.resolveAddress(idx + 16), 0xF0F0 + idx + 4);
        }

        verifier.equal(procInstance.resolveAddress(0x1B), "stackPointer");
        verifier.equal(procInstance.resolveAddress(0x1C), "programCounter");
        verifier.equal(procInstance.resolveAddress(0x1D), "overflowRegister");

        // Embedded constant values
        for (idx = -1; idx < 31; ++idx) {
            verifier.equal(procInstance.resolveAddress(0x21 + idx), (idx & 0xffff) | Processor.CONSTANT_FLAG);
        }

        // Stack operations verification
        // Push operation
        procInstance.store("stackPointer", 0xFFFF);
        verifier.equal(procInstance.resolveAddress(0x18, false), 0xFFFE);
        verifier.equal(procInstance.retrieve("stackPointer"), 0xFFFE);

        // Pop operation
        procInstance.store("stackPointer", 0xFFFF);
        verifier.equal(procInstance.resolveAddress(0x18, true), 0xFFFF);
        verifier.equal(procInstance.retrieve("stackPointer"), 0x0000);

        // Peek operation
        procInstance.store("stackPointer", 0xFFFF);
        verifier.equal(procInstance.resolveAddress(0x19), 0xFFFF);
        verifier.equal(procInstance.retrieve("stackPointer"), 0xFFFF);

        // Pick from stack
        procInstance.store("stackPointer", 0xFFFF);
        procInstance.store(0x0000, 0xFFFF);
        procInstance.store("programCounter", 0x0000);
        verifier.equal(procInstance.resolveAddress(0x1A), 0xFFFE);
        verifier.equal(procInstance.retrieve("stackPointer"), 0xFFFF);

        // Next-word value types
        procInstance.store(0x0000, 0x4242);
        procInstance.store("programCounter", 0x0000);
        verifier.equal(procInstance.resolveAddress(0x1E), 0x4242); // used as memory location
        procInstance.store("programCounter", 0x0000);
        verifier.equal(procInstance.resolveAddress(0x1F), 0x4242 | Processor.CONSTANT_FLAG); // used as literal value
    },

    'verify constant-marked values': function() {
        let procInstance = new Processor();

        // retrieve delivers unflagged value
        verifier.equal(procInstance.retrieve(0x1234 | Processor.CONSTANT_FLAG), 0x1234);

        // store operation should not affect flagged address
        procInstance.store(0x1234, 0x4242);
        procInstance.store(0x1234 | Processor.CONSTANT_FLAG, 0xBEEF);
        verifier.equal(procInstance.retrieve(0x1234), 0x4242);

        // storing a flagged constant stores its unflagged form
        procInstance.store(0x1234, 0x4242 | Processor.CONSTANT_FLAG);
        verifier.equal(procInstance.retrieve(0x1234), 0x4242);
    },

    'verify Processor#fetchNextOperation': function() {
        let procInstance = new Processor();

        // ASSIGN [next word], next word
        procInstance.store(0x0000, 0x7FC1);
        procInstance.store(0x0001, 0x4242);
        procInstance.store(0x0002, 0xC0C0);
        procInstance.store('programCounter', 0x0000);

        let operationUnit = procInstance.fetchNextOperation();
        verifier.equal(operationUnit.opCodeVal, 1);
        verifier.equal(operationUnit.operandA, 0x4242 | Processor.CONSTANT_FLAG);
        verifier.equal(operationUnit.operandB, 0xC0C0);

        // HALT instruction
        procInstance.store(0x0000, 0x0020);
        procInstance.store('programCounter', 0x0000);
        operationUnit = procInstance.fetchNextOperation();
        verifier.equal(operationUnit.opCodeVal, 32);
    },

    'verify operation length': function() {
        let procInstance = new Processor();

        // ASSIGN alpha, beta
        procInstance.store(0x0000, 0x0401);
        procInstance.store('programCounter', 0x0000);
        procInstance.fetchNextOperation();
        verifier.equal(procInstance.retrieve('programCounter'), 0x0001);

        // ASSIGN alpha, next word
        procInstance.store(0x0000, 0x7C01);
        procInstance.store('programCounter', 0x0000);
        procInstance.fetchNextOperation();
        verifier.equal(procInstance.retrieve('programCounter'), 0x0002);

        // ASSIGN next word, alpha
        procInstance.store(0x0000, 0x03E1);
        procInstance.store('programCounter', 0x0000);
        procInstance.fetchNextOperation();
        verifier.equal(procInstance.retrieve('programCounter'), 0x0002);

        // ASSIGN [next word], [next word]
        procInstance.store(0x0000, 0x7BC1);
        procInstance.store('programCounter', 0x0000);
        procInstance.fetchNextOperation();
        verifier.equal(procInstance.retrieve('programCounter'), 0x0003);
    },

    // Constant value-types must not be modifiable
    'verify non-assignable constants': function() {
        let procInstance = new Processor();

        // Encoded constants
        for (let currIndex = 0x00; currIndex < 0x1F; ++currIndex) {
            procInstance.store('programCounter', 0x0000);
            procInstance.store('alpha', currIndex + 1000);
            procInstance.store(currIndex + 1, 0x4242);

            // ASSIGN <constant i>, alpha
            procInstance.store(0x0000, 0x0001 | ((currIndex + 0x21) << 4));
            procInstance.performStep();
            verifier.equal(procInstance.retrieve(currIndex + 1), 0x4242);
        }

        // Next-word constant
        procInstance.store('programCounter', 0x0000);
        procInstance.store('alpha', 0x1234);

        // ASSIGN next word, alpha
        procInstance.store(0x0000, 0x7DE1);
        procInstance.store(0x0001, 0x4242);
        procInstance.performStep();
        verifier.equal(procInstance.retrieve(0x0001), 0x4242);
    },

    // [A+0xFFFF] should behave identically to [A-1]
    'verify address offset wrapping': function() {
        let procInstance = new Processor();

        procInstance.store('programCounter', 0x0000);
        procInstance.store('alpha', 0x0042);
        procInstance.store(0x0042, 0x1234);

        // ASSIGN [alpha+0xFFFF] 0x4321;
        procInstance.store(0x0000, 0x7E01);
        procInstance.store(0x0001, 0x4321);
        procInstance.store(0x0002, 0xFFFF);
        procInstance.performStep();
        verifier.equal(procInstance.retrieve(0x0042), 0x1234);
        verifier.equal(procInstance.retrieve(0x0041), 0x4321);
    },

    'Processor#retrieve("extract") should match its counterpart': function() {
        let procInstance = new Processor();

        procInstance.store("stackPointer", 0xffff);
        procInstance.store(0xffff, 0x0042);

        verifier.equal(procInstance.retrieve("extract"), 0x0042);
        verifier.equal(procInstance.retrieve("stackPointer"), 0x0000);
    },

    'Processor#store("insert") should match its counterpart': function() {
        let procInstance = new Processor();

        procInstance.store("insert", 0x0042);

        verifier.equal(procInstance.retrieve(0xffff), 0x0042);
        verifier.equal(procInstance.retrieve("stackPointer"), 0xffff);
    },

    'HALT should consume no cycles': function() {
        let procInstance = executeOnProcessor("HALT");
        verifier.equal(procInstance.cycleCount, 0);
    },

    'ASSIGN should place source in target': function() {
        let procInstance = executeOnProcessor("ASSIGN alpha, 1");
        verifier.equal(procInstance.retrieve("alpha"), 1);
    },

    'ASSIGN with no immediate values should take one cycle': function() {
        let procInstance = executeOnProcessor("ASSIGN alpha, 1");
        verifier.equal(procInstance.cycleCount, 1);
    },

    'ASSIGN with one immediate value should take one extra cycle': function() {
        let procInstance = executeOnProcessor("ASSIGN alpha, 0x1000");
        verifier.equal(procInstance.cycleCount, 1 + 1);
    },

    'ASSIGN with two immediate values should take two extra cycles': function() {
        let procInstance = executeOnProcessor("ASSIGN [0x1000], 0x1000");
        verifier.equal(procInstance.cycleCount, 1 + 1 + 1);
    },

    'SUM without overflow should store result and zero in EX': function() {
        let procInstance = executeOnProcessor("ASSIGN alpha, 1",
                                              "SUM alpha, 2");
        verifier.equal(procInstance.retrieve("alpha"), 3);
        verifier.equal(procInstance.retrieve("overflowRegister"), 0);
    },

    'SUM with overflow should store truncated sum and one in EX': function() {
        let procInstance = executeOnProcessor("ASSIGN alpha, 0xffff",
                                              "SUM alpha, 0xffff");
        verifier.equal(procInstance.retrieve("alpha"), 0xfffe);
        verifier.equal(procInstance.retrieve("overflowRegister"), 1);
    },

    'SUM with no immediate values should take two cycles': function() {
        let procInstance = executeOnProcessor("SUM alpha, 1");
        verifier.equal(procInstance.cycleCount, 2);
    },

    'DIFFERENCE without underflow should store result and zero in EX': function() {
        let procInstance = executeOnProcessor("ASSIGN alpha, 2",
                                              "DIFFERENCE alpha, 1");
        verifier.equal(procInstance.retrieve("alpha"), 1);
        verifier.equal(procInstance.retrieve("overflowRegister"), 0);
    },

    'DIFFERENCE with underflow should store truncated result and -1 in EX': function() {
        let procInstance = executeOnProcessor("ASSIGN alpha, 1",
                                              "DIFFERENCE alpha, 2");
        verifier.equal(procInstance.retrieve("alpha"), 0xffff);
        verifier.equal(procInstance.retrieve("overflowRegister"), 0xffff);
    },

    'DIFFERENCE with no immediate values should take two cycles': function() {
        let procInstance = executeOnProcessor("DIFFERENCE alpha, 1");
        verifier.equal(procInstance.cycleCount, 2);
    },

    'PRODUCT without overflow should store result and zero in EX': function() {
        let procInstance = executeOnProcessor("ASSIGN alpha, 2",
                                              "PRODUCT alpha, 2");
        verifier.equal(procInstance.retrieve("alpha"), 4);
        verifier.equal(procInstance.retrieve("overflowRegister"), 0);
    },

    'PRODUCT with overflow should store lower bits and higher bits in EX': function() {
        let procInstance = executeOnProcessor("ASSIGN alpha, 0x8000",
                                              "PRODUCT alpha, 0x8000");
        verifier.equal(procInstance.retrieve("alpha"), 0);
        verifier.equal(procInstance.retrieve("overflowRegister"), 0x4000);
    },

    'PRODUCT with no immediate values should take two cycles': function() {
        let procInstance = executeOnProcessor("PRODUCT alpha, 1");
        verifier.equal(procInstance.cycleCount, 2);
    },

    'SIGNED_PRODUCT without underflow should store result and zero in EX': function() {
        let procInstance = executeOnProcessor("ASSIGN alpha, 0xfffe",
                                              "SIGNED_PRODUCT alpha, 0xfffe");
        verifier.equal(procInstance.retrieve("alpha"), 4);
        verifier.equal(procInstance.retrieve("overflowRegister"), 0);
    },

    'SIGNED_PRODUCT with underflow should store lower bits and higher bits in EX': function() {
        let procInstance = executeOnProcessor("ASSIGN alpha, 0xfffe",
                                              "SIGNED_PRODUCT alpha, 2");
        verifier.equal(procInstance.retrieve("alpha"), 0xfffc);
        verifier.equal(procInstance.retrieve("overflowRegister"), 0xffff);
    },

    'SIGNED_PRODUCT with overflow should store lower bits and higher bits in EX': function() {
        let procInstance = executeOnProcessor("ASSIGN alpha, 0x4000",
                                              "SIGNED_PRODUCT alpha, 0x10");
        verifier.equal(procInstance.retrieve("alpha"), 0);
        verifier.equal(procInstance.retrieve("overflowRegister"), 4);
    },

    'SIGNED_PRODUCT with no immediate values should take two cycles': function() {
        let procInstance = executeOnProcessor("SIGNED_PRODUCT alpha, 1");
        verifier.equal(procInstance.cycleCount, 2);
    },

    'QUOTIENT by zero should store zero in destination and EX': function() {
        let procInstance = executeOnProcessor("ASSIGN alpha, 2",
                                              "QUOTIENT alpha, 0");
        verifier.equal(procInstance.retrieve("alpha"), 0);
        verifier.equal(procInstance.retrieve("overflowRegister"), 0);
    },

    'QUOTIENT by nonzero should store quotient and fractional part in EX': function() {
        let procInstance = executeOnProcessor("ASSIGN alpha, 0x8001",
                                              "QUOTIENT alpha, 2");
        verifier.equal(procInstance.retrieve("alpha"), 0x4000);
        verifier.equal(procInstance.retrieve("overflowRegister"), 0x8000);
    },

    'QUOTIENT large number by nonzero should store fractional part in EX': function() {
        // 0xFFFF / 0xD == 0x13B1.27627
        let procInstance = executeOnProcessor("ASSIGN alpha, 0xffff",
                                              "QUOTIENT alpha, 0xd");
        verifier.equal(procInstance.retrieve("alpha"), 0x13b1);
        verifier.equal(procInstance.retrieve("overflowRegister"), 0x2762);
    },

    'QUOTIENT number by nonzero should store fractional part rounded to zero in EX': function() {
        // 0x7FFF / 0x7F01 == 0x1.01FFFBF8
        let procInstance = executeOnProcessor("ASSIGN alpha, 0x7fff",
                                              "QUOTIENT alpha, 0x7f01");
        verifier.equal(procInstance.retrieve("alpha"), 1);
        verifier.equal(procInstance.retrieve("overflowRegister"), 0x01ff);
    },

    'QUOTIENT with no immediate values should take three cycles': function() {
        let procInstance = executeOnProcessor("QUOTIENT alpha, 1");
        verifier.equal(procInstance.cycleCount, 3);
    },

    'SIGNED_QUOTIENT by zero should store zero in destination and EX': function() {
        let procInstance = executeOnProcessor("ASSIGN alpha, 2",
                                              "SIGNED_QUOTIENT alpha, 0");
        verifier.equal(procInstance.retrieve("alpha"), 0);
        verifier.equal(procInstance.retrieve("overflowRegister"), 0);
    },

    'SIGNED_QUOTIENT by nonzero should store quotient and fractional part in EX': function() {
        // -0x9 / -0x4 == 0x2.4
        let procInstance = executeOnProcessor("ASSIGN alpha, 0xfff7",
                                              "SIGNED_QUOTIENT alpha, 0xfffc");
        verifier.equal(procInstance.retrieve("alpha"), 2);
        verifier.equal(procInstance.retrieve("overflowRegister"), 0x4000);
    },

    'SIGNED_QUOTIENT negative number by nonzero should round towards zero': function() {
        // -0x7FFF / 2 == -0x3fff.8
        let procInstance = executeOnProcessor("ASSIGN alpha, 0x8001",
                                              "SIGNED_QUOTIENT alpha, 0x2");
        verifier.equal(procInstance.retrieve("alpha"), 0xc001);
        verifier.equal(procInstance.retrieve("overflowRegister"), 0x8000);
    },

    'SIGNED_QUOTIENT with no immediate values should take three cycles': function() {
        let procInstance = executeOnProcessor("SIGNED_QUOTIENT alpha, 1");
        verifier.equal(procInstance.cycleCount, 3);
    },

    'MODULO by zero should store zero in destination': function() {
        let procInstance = executeOnProcessor("ASSIGN alpha, 2",
                                              "MODULO alpha, 0");
        verifier.equal(procInstance.retrieve("alpha"), 0);
    },

    'MODULO by nonzero should store modulus in destination': function() {
        let procInstance = executeOnProcessor("ASSIGN alpha, 7",
                                              "MODULO alpha, 2");
        verifier.equal(procInstance.retrieve("alpha"), 1);
    },

    'MODULO with no immediate values should take three cycles': function() {
        let procInstance = executeOnProcessor("MODULO alpha, 1");
        verifier.equal(procInstance.cycleCount, 3);
    },

    'SIGNED_MODULO by zero should store zero in destination': function() {
        let procInstance = executeOnProcessor("ASSIGN alpha, 2",
                                              "SIGNED_MODULO alpha, 0");
        verifier.equal(procInstance.retrieve("alpha"), 0);
    },

    'SIGNED_MODULO by nonzero should store modulus in destination': function() {
        let procInstance = executeOnProcessor("ASSIGN alpha, 0xfff9",
                                              "SIGNED_MODULO alpha, 2");
        verifier.equal(procInstance.retrieve("alpha"), 0xffff);
    },

    'SIGNED_MODULO with no immediate values should take three cycles': function() {
        let procInstance = executeOnProcessor("SIGNED_MODULO alpha, 1");
        verifier.equal(procInstance.cycleCount, 3);
    },

    'BITWISE_AND should store bitwise AND in destination': function() {
        let procInstance = executeOnProcessor("ASSIGN alpha, 0x0fff",
                                              "BITWISE_AND alpha, 0xffF0");
        verifier.equal(procInstance.retrieve("alpha"), 0x0ff0);
    },

    'BITWISE_AND with no immediate values should take one cycle': function() {
        let procInstance = executeOnProcessor("BITWISE_AND alpha, 1");
        verifier.equal(procInstance.cycleCount, 1);
    },

    'BITWISE_OR should store bitwise OR in destination': function() {
        let procInstance = executeOnProcessor("ASSIGN alpha, 0xf000",
                                              "BITWISE_OR alpha, 0x000f");
        verifier.equal(procInstance.retrieve("alpha"), 0xf00f);
    },

    'BITWISE_OR with no immediate values should take one cycle': function() {
        let procInstance = executeOnProcessor("BITWISE_OR alpha, 1");
        verifier.equal(procInstance.cycleCount, 1);
    },

    'BITWISE_XOR should store bitwise XOR in destination': function() {
        let procInstance = executeOnProcessor("ASSIGN alpha, 0xfff0",
                                              "BITWISE_XOR alpha, 0x0fff");
        verifier.equal(procInstance.retrieve("alpha"), 0xf00f);
    },

    'BITWISE_XOR with no immediate values should take one cycle': function() {
        let procInstance = executeOnProcessor("BITWISE_XOR alpha, 1");
        verifier.equal(procInstance.cycleCount, 1);
    },

    'SHIFT_RIGHT_LOGICAL should shift bits right with zero padding and store shifted-out bits in EX': function() {
        let procInstance = executeOnProcessor("ASSIGN alpha, 0xffff",
                                              "SHIFT_RIGHT_LOGICAL alpha, 8");
        verifier.equal(procInstance.retrieve("alpha"), 0x00ff);
        verifier.equal(procInstance.retrieve("overflowRegister"), 0xff00);
    },

    'SHIFT_RIGHT_LOGICAL with no immediate values should take one cycle': function() {
        let procInstance = executeOnProcessor("SHIFT_RIGHT_LOGICAL alpha, 1");
        verifier.equal(procInstance.cycleCount, 1);
    },

    'SHIFT_RIGHT_ARITHMETIC positive numbers should shift bits right with sign extension and store shifted-out bits in EX': function() {
        let procInstance = executeOnProcessor("ASSIGN alpha, 0x7fff",
                                              "SHIFT_RIGHT_ARITHMETIC alpha, 8");
        verifier.equal(procInstance.retrieve("alpha"), 0x007f);
        verifier.equal(procInstance.retrieve("overflowRegister"), 0xff00);
    },

    'SHIFT_RIGHT_ARITHMETIC negative numbers should shift bits right with sign extension and store shifted-out bits in EX': function() {
        let procInstance = executeOnProcessor("ASSIGN alpha, 0xffff",
                                              "SHIFT_RIGHT_ARITHMETIC alpha, 8");
        verifier.equal(procInstance.retrieve("alpha"), 0xffff);
        verifier.equal(procInstance.retrieve("overflowRegister"), 0xff00);
    },

    'SHIFT_RIGHT_ARITHMETIC with no immediate values should take one cycle': function() {
        let procInstance = executeOnProcessor("SHIFT_RIGHT_ARITHMETIC alpha, 1");
        verifier.equal(procInstance.cycleCount, 1);
    },

    'SHIFT_LEFT_LOGICAL should shift bits left and store shifted-out bits in EX': function() {
        let procInstance = executeOnProcessor("ASSIGN alpha, 0xffff",
                                              "SHIFT_LEFT_LOGICAL alpha, 8");
        verifier.equal(procInstance.retrieve("alpha"), 0xff00);
        verifier.equal(procInstance.retrieve("overflowRegister"), 0x00ff);
    },

    'SHIFT_LEFT_LOGICAL with no immediate values should take one cycle': function() {
        let procInstance = executeOnProcessor("SHIFT_LEFT_LOGICAL alpha, 1");
        verifier.equal(procInstance.cycleCount, 1);
    },

    'COND_AND should proceed to next instruction if bitwise AND is nonzero': function() {
        let procInstance = executeOnProcessor("COND_AND 6, 3",
                                              "ASSIGN xi, 1");
        verifier.equal(procInstance.retrieve("xi"), 1);
    },

    'COND_AND with true condition and one immediate value should take three cycles (excluding next instruction)': function() {
        let procInstance = executeOnProcessor("COND_AND 6, 3",
                                              "ASSIGN xi, 1");
        verifier.equal(procInstance.cycleCount, (2 + 1) + 1);
    },

    'COND_AND should skip next instruction if bitwise AND is zero': function() {
        let procInstance = executeOnProcessor("COND_AND 4, 3",
                                              "ASSIGN xi, 1");
        verifier.equal(procInstance.retrieve("xi"), 0);
    },

    'COND_AND with false condition and one immediate value should take three cycles plus one for each skipped instruction': function() {
        // The original comment is incomplete, I'll complete it based on the instruction set behavior.
        // It should be '...plus one for each skipped instruction (in this case, one instruction is skipped, so +1 cycle)'
        let procInstance = executeOnProcessor("COND_AND 4, 3",
                                              "ASSIGN xi, 1");
        verifier.equal(procInstance.cycleCount, (2 + 1) + 1);
    }
};

module.exports = exportBundle;