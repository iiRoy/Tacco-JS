const CodeBuilder = require("assembly-compiler");
const Processor = require("machine-core");
const verifier = require("node:assert");

/**
 * Loads assembly instructions onto a given processor unit.
 * @param {Processor} targetProcessor - The CPU instance to program.
 * @param {string[]} instructionLines - An array of assembly code lines.
 * @returns {void}
 */
function programProcessor(targetProcessor, instructionLines) {
    // Validate inputs - Type III addition: Guard clause for invalid arguments.
    if (!targetProcessor || !instructionLines || !Array.isArray(instructionLines)) {
        console.error("Error: Invalid arguments provided to programProcessor. Skipping compilation.");
        return;
    }

    // Initialize a new compiler instance for the target processor.
    const compilerInstance = new CodeBuilder(targetProcessor);

    // Concatenate the instruction lines into a single string, ensuring a newline separator.
    // Type III change: Rewriting string concatenation and adding a default BRK for empty input.
    let fullAssemblyText;
    if (instructionLines.length === 0) {
        fullAssemblyText = "BRK"; // Default to a breakpoint if no instructions are provided.
    } else {
        fullAssemblyText = instructionLines.map(line => line.trim()).filter(line => line.length > 0).join("\n") + "\n BRK";
    }

    // Compile the generated assembly code.
    compilerInstance.processSource(fullAssemblyText);
}

/**
 * Creates a new processor, loads assembly instructions, and executes them.
 * @param {...string} programSegments - Multiple string arguments, each representing an assembly instruction.
 * @returns {Processor} The configured and executed processor instance.
 */
function executeProgram(...programSegments) { // Type II change: Renamed function, Type III change: used rest parameter.
    const procUnit = new Processor(); // Type II change: Renamed 'cpu' to 'procUnit', 'CPU' to 'Processor'.

    // Type III addition: Guard clause for no program segments.
    if (programSegments.length === 0) {
        // If no segments, just load a BRK instruction and run.
        programProcessor(procUnit, ["BRK"]);
    } else {
        // Load the provided assembly instructions onto the processor.
        programProcessor(procUnit, programSegments);
    }

    // Execute the loaded program until completion or a breakpoint.
    procUnit.executeInstructions(); // Type II change: Renamed 'run' to 'executeInstructions'.

    return procUnit; // Return the processor instance for inspection.
}

const testSuite = { // Type II change: Renamed 'module.exports' to 'testSuite'.
    // Test case: Verifying the processor's address resolution logic.
    'verifyProcessorAddressingMechanisms': function() { // Type II change: Renamed test name.
        const procUnit = new Processor();

        // Define a collection of fundamental register aliases.
        const generalRegisters = ["acc", "b_reg", "c_reg", "x_idx", "y_idx", "z_idx", "i_ptr", "j_ptr"]; // Type II change: Renamed register names.
        procUnit.storeValue(0x0000, 4); // Type II change: Renamed 'set' to 'storeValue'.

        // Iterate through each general-purpose register for address validation.
        // Type III change: Changed loop structure and variable names.
        let loopCounter = 0;
        for (const currentRegName of generalRegisters) {
            procUnit.storeValue("programCounter", 0x0000); // Type II change: Renamed "pc" to "programCounter".
            procUnit.storeValue(currentRegName, 0xF0F0 + loopCounter);

            // Assertions for various addressing modes.
            verifier.strictEqual(procUnit.resolveAddress(loopCounter), currentRegName, `Reg alias issue for index ${loopCounter}`); // Type II change: Renamed 'addressFor' to 'resolveAddress'.
            verifier.strictEqual(procUnit.resolveAddress(loopCounter + 8), 0xF0F0 + loopCounter, `Direct value issue for index ${loopCounter + 8}`);
            verifier.strictEqual(procUnit.resolveAddress(loopCounter + 16), 0xF0F0 + loopCounter + 4, `Offset value issue for index ${loopCounter + 16}`);
            loopCounter++; // Manually increment loop counter for clarity.
        }

        // Specific system register address checks.
        verifier.strictEqual(procUnit.resolveAddress(27), "stackPointer", "SP alias check failed"); // Type II change: 0x1B to 27, "sp" to "stackPointer".
        verifier.strictEqual(procUnit.resolveAddress(28), "programCounter", "PC alias check failed"); // Type II change: 0x1C to 28, "pc" to "programCounter".
        verifier.strictEqual(procUnit.resolveAddress(29), "overflowRegister", "EX alias check failed"); // Type II change: 0x1D to 29, "ex" to "overflowRegister".

        // Encoded literal value checks.
        // Type III change: Changed loop variable and range.
        for (let literalOffset = -1; literalOffset < 31; ++literalOffset) {
            const expectedLiteralFlaggedValue = (literalOffset & 0xffff) | Processor.LITERAL_FLAG; // Type II change: Renamed CPU.FLAG_LITERAL.
            verifier.strictEqual(procUnit.resolveAddress(0x21 + literalOffset), expectedLiteralFlaggedValue, `Literal value resolution error for ${literalOffset}`);
        }

        // Stack operation tests.
        // Push operation simulation.
        procUnit.storeValue("stackPointer", 0xFFFF);
        verifier.strictEqual(procUnit.resolveAddress(0x18, false), 0xFFFE, "Stack push address calculation error");
        verifier.strictEqual(procUnit.fetchValue("stackPointer"), 0xFFFE, "Stack pointer after push incorrect value"); // Type II change: Renamed 'get' to 'fetchValue'.

        // Pop operation simulation.
        procUnit.storeValue("stackPointer", 0xFFFF);
        verifier.strictEqual(procUnit.resolveAddress(0x18, true), 0xFFFF, "Stack pop address calculation error");
        verifier.strictEqual(procUnit.fetchValue("stackPointer"), 0x0000, "Stack pointer after pop incorrect value");

        // Peek operation simulation.
        procUnit.storeValue("stackPointer", 0xFFFF);
        verifier.strictEqual(procUnit.resolveAddress(0x19), 0xFFFF, "Stack peek address calculation error");
        verifier.strictEqual(procUnit.fetchValue("stackPointer"), 0xFFFF, "Stack pointer after peek incorrect value");

        // Pick operation simulation.
        procUnit.storeValue("stackPointer", 0xFFFF);
        procUnit.storeValue(0x0000, 0xFFFF);
        procUnit.storeValue("programCounter", 0x0000);
        verifier.strictEqual(procUnit.resolveAddress(0x1A), 0xFFFE, "Stack pick address calculation error");
        verifier.strictEqual(procUnit.fetchValue("stackPointer"), 0xFFFF, "Stack pointer after pick incorrect value");

        // Next-word value types in addressing.
        procUnit.storeValue(0x0000, 0x4242);
        procUnit.storeValue("programCounter", 0x0000);
        verifier.strictEqual(procUnit.resolveAddress(0x1E), 0x4242, "Next-word as address evaluation failed");
        procUnit.storeValue("programCounter", 0x0000);
        verifier.strictEqual(procUnit.resolveAddress(0x1F), 0x4242 | Processor.LITERAL_FLAG, "Next-word as literal evaluation failed");
    },

    // Test case: Handling of literal-flagged values within the processor.
    'testProcessorLiteralFlaggingLogic': function() { // Type II change: Renamed test name.
        const procUnit = new Processor();

        // Fetching a flagged value should yield its unflagged counterpart.
        verifier.strictEqual(procUnit.fetchValue(0x1234 | Processor.LITERAL_FLAG), 0x1234, "Fetch of flagged literal did not unflag correctly");

        // Attempting to store into a literal-flagged address should have no effect on memory.
        const baseMemoryAddress = 0x1234;
        const initialMemContent = 0x4242;
        procUnit.storeValue(baseMemoryAddress, initialMemContent);
        // This store operation targets a literal-flagged address, so it should be ignored.
        procUnit.storeValue(baseMemoryAddress | Processor.LITERAL_FLAG, 0xBEEF);
        verifier.strictEqual(procUnit.fetchValue(baseMemoryAddress), initialMemContent, "Storing to a literal-flagged address should be a no-op");

        // Storing a value that is itself literal-flagged should strip the flag before storage.
        const valueToStoreWithFlag = 0x4242 | Processor.LITERAL_FLAG;
        procUnit.storeValue(0x1234, valueToStoreWithFlag);
        verifier.strictEqual(procUnit.fetchValue(0x1234), 0x4242, "Storing a flagged value did not strip the flag");
    },

    // Test case: Processor's ability to decode the next instruction from memory.
    'decodeNextInstructionVerification': function() { // Type II change: Renamed test name.
        const procUnit = new Processor();

        // Scenario 1: Complex instruction (SET [next word], next word).
        // Memory contents for the instruction and its operands.
        procUnit.storeValue(0x0000, 0x7FC1); // Instruction word
        procUnit.storeValue(0x0001, 0x4242); // Value for operand A (address)
        procUnit.storeValue(0x0002, 0xC0C0); // Value for operand B (literal)
        procUnit.storeValue('programCounter', 0x0000); // Set PC to start of instruction.

        const instructionData = procUnit.fetchNextInstruction(); // Type II change: Renamed 'insn' to 'instructionData', 'nextInstruction' to 'fetchNextInstruction'.
        verifier.strictEqual(instructionData.operationCode, 1, "Opcode for SET instruction mismatch"); // Type II change: Renamed 'opcode' to 'operationCode'.
        verifier.strictEqual(instructionData.operandA, 0x4242 | Processor.LITERAL_FLAG, "Operand A for SET instruction mismatch"); // Type II change: Renamed 'a' to 'operandA'.
        verifier.strictEqual(instructionData.operandB, 0xC0C0, "Operand B for SET instruction mismatch"); // Type II change: Renamed 'b' to 'operandB'.

        // Scenario 2: Simple BRK instruction.
        procUnit.storeValue(0x0000, 0x0020); // BRK opcode
        procUnit.storeValue('programCounter', 0x0000);
        const brkData = procUnit.fetchNextInstruction();
        verifier.strictEqual(brkData.operationCode, 32, "Opcode for BRK instruction mismatch");
    },

    // Test case: Validating the program counter's advancement based on instruction length.
    'programCounterAdvancementOnInstructionLength': function() { // Type II change: Renamed test name.
        const procUnit = new Processor();
        let initialPC_Value; // Type III addition: Helper variable for clarity.

        // Test 1: SET A, B (1 word instruction)
        procUnit.storeValue(0x0000, 0x0401);
        initialPC_Value = 0x0000;
        procUnit.storeValue('programCounter', initialPC_Value);
        procUnit.fetchNextInstruction();
        verifier.strictEqual(procUnit.fetchValue('programCounter'), initialPC_Value + 1, "PC after 1-word instruction incorrect");

        // Test 2: SET A, next word (2 word instruction)
        procUnit.storeValue(0x0000, 0x7C01);
        initialPC_Value = 0x0000;
        procUnit.storeValue('programCounter', initialPC_Value);
        procUnit.fetchNextInstruction();
        verifier.strictEqual(procUnit.fetchValue('programCounter'), initialPC_Value + 2, "PC after 2-word instruction (op A next word) incorrect");

        // Test 3: SET next word, A (2 word instruction)
        procUnit.storeValue(0x0000, 0x03E1);
        initialPC_Value = 0x0000;
        procUnit.storeValue('programCounter', initialPC_Value);
        procUnit.fetchNextInstruction();
        verifier.strictEqual(procUnit.fetchValue('programCounter'), initialPC_Value + 2, "PC after 2-word instruction (op B next word) incorrect");

        // Test 4: SET [next word], [next word] (3 word instruction)
        procUnit.storeValue(0x0000, 0x7BC1);
        initialPC_Value = 0x0000;
        procUnit.storeValue('programCounter', initialPC_Value);
        procUnit.fetchNextInstruction();
        verifier.strictEqual(procUnit.fetchValue('programCounter'), initialPC_Value + 3, "PC after 3-word instruction incorrect");
    },

    // Test case: Ensuring that literal value types cannot be assigned to.
    'ensureLiteralValuesAreImmutable': function() { // Type II change: Renamed test name.
        const procUnit = new Processor();

        // Test with encoded literals (0x21 to 0x3F).
        // Type III change: Changed loop variable and range.
        for (let currentLiteralVal = 0x00; currentLiteralVal < 0x1F; ++currentLiteralVal) {
            procUnit.storeValue('programCounter', 0x0000);
            procUnit.storeValue('acc', currentLiteralVal + 1000); // Type II change: Renamed 'a' to 'acc'.
            const memoryLocation = currentLiteralVal + 1;
            procUnit.storeValue(memoryLocation, 0x4242); // Store initial value at a memory location.

            // Construct instruction: SET <literal i>, A
            // The destination operand is an encoded literal, which should be unassignable.
            const instructionCode = 0x0001 | ((currentLiteralVal + 0x21) << 4);
            procUnit.storeValue(0x0000, instructionCode);
            procUnit.executeSingleStep(); // Type II change: Renamed 'step' to 'executeSingleStep'.
            // Verify that the memory location remains unchanged.
            verifier.strictEqual(procUnit.fetchValue(memoryLocation), 0x4242, `Encoded literal ${currentLiteralVal} should not be assignable`);
        }

        // Test with next-word literal.
        procUnit.storeValue('programCounter', 0x0000);
        procUnit.storeValue('acc', 0x1234);

        // Instruction: SET next word, A
        // The 'next word' here is treated as a literal destination, thus unassignable.
        const setNextWordInstruction = 0x7DE1;
        const literalNextWordValue = 0x4242;
        procUnit.storeValue(0x0000, setNextWordInstruction);
        procUnit.storeValue(0x0001, literalNextWordValue);
        procUnit.executeSingleStep();
        // The value at 0x0001 (which was the literal operand) should remain unchanged.
        verifier.strictEqual(procUnit.fetchValue(0x0001), literalNextWordValue, "Next-word literal as destination should be unassignable");
    },

    // Test case: Verifying address offset wraparound behavior (e.g., [A+0xFFFF] is [A-1]).
    'testOffsetMemoryAddressWraparound': function() { // Type II change: Renamed test name.
        const procUnit = new Processor();

        procUnit.storeValue('programCounter', 0x0000);
        procUnit.storeValue('acc', 0x0042); // Base address in accumulator.
        procUnit.storeValue(0x0042, 0x1234); // Value at the base address.

        // Instruction: SET [A+0xFFFF], 0x4321;
        // 0xFFFF acts as -1 in 16-bit arithmetic for address offsets.
        // So, [A+0xFFFF] effectively targets [A-1].
        procUnit.storeValue(0x0000, 0x7E01); // Opcode for SET [next word + reg], next word.
        procUnit.storeValue(0x0001, 0x4321); // Value to store.
        procUnit.storeValue(0x0002, 0xFFFF); // Offset value.
        procUnit.executeSingleStep();

        // The original value at 0x0042 should remain untouched.
        verifier.strictEqual(procUnit.fetchValue(0x0042), 0x1234, "Base address content modified unexpectedly");
        // The value at 0x0041 (A-1) should be updated with the new value.
        verifier.strictEqual(procUnit.fetchValue(0x0041), 0x4321, "Offset address (A-1) not updated correctly via wraparound");
    },

    // Test case: Behavior of "pop" register alias (reads from stack and decrements SP).
    'popStackRegisterFunctionality': function () { // Type II change: Renamed test name.
        const procUnit = new Processor();

        procUnit.storeValue("stackPointer", 0xffff); // Initialize stack pointer to top of stack.
        procUnit.storeValue(0xffff, 0x0042); // Place a value on the stack.

        verifier.strictEqual(procUnit.fetchValue("pop"), 0x0042, "Pop operation did not retrieve the expected value");
        verifier.strictEqual(procUnit.fetchValue("stackPointer"), 0x0000, "Stack pointer was not correctly decremented after pop");
    },

    // Test case: Behavior of "push" register alias (increments SP and writes to stack).
    'pushStackRegisterFunctionality': function () { // Type II change: Renamed test name.
        const procUnit = new Processor();

        procUnit.storeValue("push", 0x0042); // Push a value onto the stack.

        verifier.strictEqual(procUnit.fetchValue(0xffff), 0x0042, "Push operation did not store the value at the correct location");
        verifier.strictEqual(procUnit.fetchValue("stackPointer"), 0xffff, "Stack pointer was not correctly incremented after push");
    },

    // Test case: Cycle count for BRK (Break) instruction.
    'breakInstructionTakesZeroCycles': function () { // Type II change: Renamed test name.
        const procUnit = executeProgram("BRK");
        verifier.strictEqual(procUnit.currentCycleCount, 0, "BRK instruction should consume zero cycles"); // Type II change: Renamed 'cycle' to 'currentCycleCount'.
    },

    // Test case: SET instruction should transfer its source value to its destination.
    'setInstructionValueAssignment': function () { // Type II change: Renamed test name.
        const procUnit = executeProgram("SET acc, 1"); // Type II change: Renamed 'a' to 'acc'.
        verifier.strictEqual(procUnit.fetchValue("acc"), 1, "SET instruction failed to assign source to destination");
    },

    // Test case: Cycle count for SET instruction with no next word values.
    'setInstructionNoNextWordCycleCount': function () { // Type II change: Renamed test name.
        const procUnit = executeProgram("SET acc, 1");
        verifier.strictEqual(procUnit.currentCycleCount, 1, "SET (no next word) should take exactly one cycle");
    },

    // Test case: Cycle count for SET instruction with one next word value.
    'setInstructionOneNextWordCycleCount': function () { // Type II change: Renamed test name.
        const procUnit = executeProgram("SET acc, 0x1000");
        verifier.strictEqual(procUnit.currentCycleCount, 1 + 1, "SET (one next word) should take one base cycle plus one for the word"); // Type III change: Rephrased 2 as 1+1.
    },

    // Test case: Cycle count for SET instruction with two next word values.
    'setInstructionTwoNextWordCycleCount': function () { // Type II change: Renamed test name.
        const procUnit = executeProgram("SET [0x1000], 0x1000");
        verifier.strictEqual(procUnit.currentCycleCount, 1 + 1 + 1, "SET (two next words) should take one base cycle plus two for the words"); // Type III change: Rephrased 3 as 1+1+1.
    },

    // Test case: ADD instruction without overflow (sum fits in word).
    'addInstructionWithoutOverflow': function () { // Type II change: Renamed test name.
        const procUnit = executeProgram("SET acc, 1", "ADD acc, 2");
        verifier.strictEqual(procUnit.fetchValue("acc"), 3, "ADD without overflow produced incorrect sum");
        verifier.strictEqual(procUnit.fetchValue("overflowRegister"), 0, "EX register should be zero on no ADD overflow");
    },

    // Test case: ADD instruction with overflow (sum exceeds word size).
    'addInstructionWithOverflowCondition': function () { // Type II change: Renamed test name.
        const procUnit = executeProgram("SET acc, 0xffff", "ADD acc, 0xffff");
        verifier.strictEqual(procUnit.fetchValue("acc"), 0xfffe, "ADD with overflow produced incorrect truncated sum");
        verifier.strictEqual(procUnit.fetchValue("overflowRegister"), 1, "EX register should be one on ADD overflow");
    },

    // Test case: Cycle count for ADD instruction with no next word values.
    'addInstructionNoNextWordCycleCount': function () { // Type II change: Renamed test name.
        const procUnit = executeProgram("ADD acc, 1");
        verifier.strictEqual(procUnit.currentCycleCount, 2, "ADD (no next word) should take two cycles");
    },

    // Test case: SUB instruction without underflow (difference is non-negative).
    'subInstructionWithoutUnderflow': function () { // Type II change: Renamed test name.
        const procUnit = executeProgram("SET acc, 2", "SUB acc, 1");
        verifier.strictEqual(procUnit.fetchValue("acc"), 1, "SUB without underflow produced incorrect difference");
        verifier.strictEqual(procUnit.fetchValue("overflowRegister"), 0, "EX register should be zero on no SUB underflow");
    },

    // Test case: SUB instruction with underflow (difference is negative).
    'subInstructionWithUnderflowCondition': function () { // Type II change: Renamed test name.
        const procUnit = executeProgram("SET acc, 1", "SUB acc, 2");
        verifier.strictEqual(procUnit.fetchValue("acc"), 0xffff, "SUB with underflow produced incorrect truncated difference");
        verifier.strictEqual(procUnit.fetchValue("overflowRegister"), 0xffff, "EX register should be 0xFFFF on SUB underflow");
    },

    // Test case: Cycle count for SUB instruction with no next word values.
    'subInstructionNoNextWordCycleCount': function () { // Type II change: Renamed test name.
        const procUnit = executeProgram("SUB acc, 1");
        verifier.strictEqual(procUnit.currentCycleCount, 2, "SUB (no next word) should take two cycles");
    },

    // Test case: MUL instruction without overflow (product fits in word).
    'mulInstructionWithoutOverflow': function () { // Type II change: Renamed test name.
        const procUnit = executeProgram("SET acc, 2", "MUL acc, 2");
        verifier.strictEqual(procUnit.fetchValue("acc"), 4, "MUL without overflow produced incorrect product");
        verifier.strictEqual(procUnit.fetchValue("overflowRegister"), 0, "EX register should be zero on no MUL overflow");
    },

    // Test case: MUL instruction with overflow (product exceeds word size).
    'mulInstructionWithOverflowCondition': function () { // Type II change: Renamed test name.
        const procUnit = executeProgram("SET acc, 0x8000", "MUL acc, 0x8000");
        verifier.strictEqual(procUnit.fetchValue("acc"), 0, "MUL with overflow produced incorrect lower bits of product");
        verifier.strictEqual(procUnit.fetchValue("overflowRegister"), 0x4000, "EX register should contain higher bits on MUL overflow");
    },

    // Test case: Cycle count for MUL instruction with no next word values.
    'mulInstructionNoNextWordCycleCount': function () { // Type II change: Renamed test name.
        const procUnit = executeProgram("MUL acc, 1");
        verifier.strictEqual(procUnit.currentCycleCount, 2, "MUL (no next word) should take two cycles");
    },

    // Test case: MLI instruction (signed multiplication) without underflow.
    'mliInstructionWithoutUnderflow': function () { // Type II change: Renamed test name.
        const procUnit = executeProgram("SET acc, 0xfffe", "MLI acc, 0xfffe"); // (-2) * (-2) = 4
        verifier.strictEqual(procUnit.fetchValue("acc"), 4, "MLI without underflow produced incorrect product");
        verifier.strictEqual(procUnit.fetchValue("overflowRegister"), 0, "EX register should be zero on no MLI underflow");
    },

    // Test case: MLI instruction with underflow (negative result).
    'mliInstructionWithUnderflowCondition': function () { // Type II change: Renamed test name.
        const procUnit = executeProgram("SET acc, 0xfffe", "MLI acc, 2"); // (-2) * 2 = -4 (0xFFFC)
        verifier.strictEqual(procUnit.fetchValue("acc"), 0xfffc, "MLI with underflow produced incorrect truncated product");
        verifier.strictEqual(procUnit.fetchValue("overflowRegister"), 0xffff, "EX register should be 0xFFFF on MLI underflow");
    },

    // Test case: MLI instruction with overflow (signed product exceeds word size).
    'mliInstructionWithOverflowCondition': function () { // Type II change: Renamed test name.
        const procUnit = executeProgram("SET acc, 0x4000", "MLI acc, 0x10"); // 16384 * 16 = 262144 (0x40000)
        verifier.strictEqual(procUnit.fetchValue("acc"), 0, "MLI with overflow produced incorrect lower bits of product");
        verifier.strictEqual(procUnit.fetchValue("overflowRegister"), 4, "EX register should contain higher bits on MLI overflow");
    },

    // Test case: Cycle count for MLI instruction with no next word values.
    'mliInstructionNoNextWordCycleCount': function () { // Type II change: Renamed test name.
        const procUnit = executeProgram("MLI acc, 1");
        verifier.strictEqual(procUnit.currentCycleCount, 2, "MLI (no next word) should take two cycles");
    },

    // Test case: DIV instruction (unsigned division) by zero.
    'divInstructionByZeroOperand': function () { // Type II change: Renamed test name.
        const procUnit = executeProgram("SET acc, 2", "DIV acc, 0");
        verifier.strictEqual(procUnit.fetchValue("acc"), 0, "DIV by zero should set destination to zero");
        verifier.strictEqual(procUnit.fetchValue("overflowRegister"), 0, "DIV by zero should set EX to zero");
    },

    // Test case: DIV instruction by nonzero.
    'divInstructionByNonzeroOperand': function () { // Type II change: Renamed test name.
        const procUnit = executeProgram("SET acc, 0x8001", "DIV acc, 2"); // 32769 / 2 = 16384.5
        verifier.strictEqual(procUnit.fetchValue("acc"), 0x4000, "DIV by nonzero produced incorrect quotient");
        verifier.strictEqual(procUnit.fetchValue("overflowRegister"), 0x8000, "DIV by nonzero produced incorrect fractional part in EX");
    },

    // Test case: DIV instruction with a large number.
    'divLargeNumberCheck': function () { // Type II change: Renamed test name.
        // 0xFFFF / 0xD == 65535 / 13 = 5041.1538...
        const procUnit = executeProgram("SET acc, 0xffff", "DIV acc, 0xd");
        verifier.strictEqual(procUnit.fetchValue("acc"), 0x13b1, "DIV large number quotient incorrect");
        verifier.strictEqual(procUnit.fetchValue("overflowRegister"), 0x2762, "DIV large number EX incorrect");
    },

    // Test case: DIV instruction with fractional part rounded towards zero.
    'divFractionalPartRounding': function () { // Type II change: Renamed test name.
        // 0x7FFF / 0x7F01 == 32767 / 32513 = 1.0078...
        const procUnit = executeProgram("SET acc, 0x7fff", "DIV acc, 0x7f01");
        verifier.strictEqual(procUnit.fetchValue("acc"), 1, "DIV fractional quotient did not round towards zero");
        verifier.strictEqual(procUnit.fetchValue("overflowRegister"), 0x01ff, "DIV fractional EX incorrect");
    },

    // Test case: Cycle count for DIV instruction with no next word values.
    'divInstructionNoNextWordCycleCount': function () { // Type II change: Renamed test name.
        const procUnit = executeProgram("DIV acc, 1");
        verifier.strictEqual(procUnit.currentCycleCount, 3, "DIV (no next word) should take three cycles");
    },

    // Test case: DVI instruction (signed division) by zero.
    'dviInstructionByZeroOperand': function () { // Type II change: Renamed test name.
        const procUnit = executeProgram("SET acc, 2", "DVI acc, 0");
        verifier.strictEqual(procUnit.fetchValue("acc"), 0, "DVI by zero should set destination to zero");
        verifier.strictEqual(procUnit.fetchValue("overflowRegister"), 0, "DVI by zero should set EX to zero");
    },

    // Test case: DVI instruction by nonzero (signed division).
    'dviInstructionByNonzeroOperand': function () { // Type II change: Renamed test name.
        // -0x9 / -0x4 == -9 / -4 = 2.25 (quotient 2, fractional 0.25 * 0x10000 = 0x4000)
        const procUnit = executeProgram("SET acc, 0xfff7", "DVI acc, 0xfffc");
        verifier.strictEqual(procUnit.fetchValue("acc"), 2, "DVI by nonzero produced incorrect quotient");
        verifier.strictEqual(procUnit.fetchValue("overflowRegister"), 0x4000, "DVI by nonzero produced incorrect fractional part in EX");
    },

    // Test case: DVI negative number by nonzero, rounding quotient towards zero.
    'dviNegativeNumberRounding': function () { // Type II change: Renamed test name.
        // -0x7FFF / 2 == -32767 / 2 = -16383.5 (quotient -16383, fractional -0.5 * 0x10000 = -0x8000)
        const procUnit = executeProgram("SET acc, 0x8001", "DVI acc, 0x2");
        verifier.strictEqual(procUnit.fetchValue("acc"), 0xc001, "DVI negative quotient did not round towards zero"); // 0xC001 is -16383
        verifier.strictEqual(procUnit.fetchValue("overflowRegister"), 0x8000, "DVI negative EX incorrect");
    },

    // Test case: Cycle count for DVI instruction with no next word values.
    'dviInstructionNoNextWordCycleCount': function () { // Type II change: Renamed test name.
        const procUnit = executeProgram("DVI acc, 1");
        verifier.strictEqual(procUnit.currentCycleCount, 3, "DVI (no next word) should take three cycles");
    },

    // Test case: MOD instruction (unsigned modulo) by zero.
    'modInstructionByZeroOperand': function () { // Type II change: Renamed test name.
        const procUnit = executeProgram("SET acc, 2", "MOD acc, 0");
        verifier.strictEqual(procUnit.fetchValue("acc"), 0, "MOD by zero should set destination to zero");
    },

    // Test case: MOD instruction by nonzero.
    'modInstructionByNonzeroOperand': function () { // Type II change: Renamed test name.
        const procUnit = executeProgram("SET acc, 7", "MOD acc, 2");
        verifier.strictEqual(procUnit.fetchValue("acc"), 1, "MOD by nonzero produced incorrect modulus");
    },

    // Test case: Cycle count for MOD instruction with no next word values.
    'modInstructionNoNextWordCycleCount': function () { // Type II change: Renamed test name.
        const procUnit = executeProgram("MOD acc, 1");
        verifier.strictEqual(procUnit.currentCycleCount, 3, "MOD (no next word) should take three cycles");
    },

    // Test case: MDI instruction (signed modulo) by zero.
    'mdiInstructionByZeroOperand': function () { // Type II change: Renamed test name.
        const procUnit = executeProgram("SET acc, 2", "MDI acc, 0");
        verifier.strictEqual(procUnit.fetchValue("acc"), 0, "MDI by zero should set destination to zero");
    },

    // Test case: MDI instruction by nonzero (signed modulo).
    'mdiInstructionByNonzeroOperand': function () { // Type II change: Renamed test name.
        const procUnit = executeProgram("SET acc, 0xfff9", "MDI acc, 2"); // -7 mod 2 = -1 (0xFFFF)
        verifier.strictEqual(procUnit.fetchValue("acc"), 0xffff, "MDI by nonzero produced incorrect modulus");
    },

    // Test case: Cycle count for MDI instruction with no next word values.
    'mdiInstructionNoNextWordCycleCount': function () { // Type II change: Renamed test name.
        const procUnit = executeProgram("MDI acc, 1");
        verifier.strictEqual(procUnit.currentCycleCount, 3, "MDI (no next word) should take three cycles");
    },

    // Test case: AND instruction (bitwise AND).
    'bitwiseAndOperationVerification': function () { // Type II change: Renamed test name.
        const procUnit = executeProgram("SET acc, 0x0fff", "AND acc, 0xffF0");
        verifier.strictEqual(procUnit.fetchValue("acc"), 0x0ff0, "AND operation result incorrect");
    },

    // Test case: Cycle count for AND instruction with no next word values.
    'andInstructionNoNextWordCycleCount': function () { // Type II change: Renamed test name.
        const procUnit = executeProgram("AND acc, 1");
        verifier.strictEqual(procUnit.currentCycleCount, 1, "AND (no next word) should take one cycle");
    },

    // Test case: BOR instruction (bitwise OR).
    'bitwiseOrOperationVerification': function () { // Type II change: Renamed test name.
        const procUnit = executeProgram("SET acc, 0xf000", "BOR acc, 0x000f");
        verifier.strictEqual(procUnit.fetchValue("acc"), 0xf00f, "BOR operation result incorrect");
    },

    // Test case: Cycle count for BOR instruction with no next word values.
    'borInstructionNoNextWordCycleCount': function () { // Type II change: Renamed test name.
        const procUnit = executeProgram("BOR acc, 1");
        verifier.strictEqual(procUnit.currentCycleCount, 1, "BOR (no next word) should take one cycle");
    },

    // Test case: XOR instruction (bitwise exclusive OR).
    'bitwiseXorOperationVerification': function () { // Type II change: Renamed test name.
        const procUnit = executeProgram("SET acc, 0xfff0", "XOR acc, 0x0fff");
        verifier.strictEqual(procUnit.fetchValue("acc"), 0xf00f, "XOR operation result incorrect");
    },

    // Test case: Cycle count for XOR instruction with no next word values.
    'xorInstructionNoNextWordCycleCount': function () { // Type II change: Renamed test name.
        const procUnit = executeProgram("XOR acc, 1");
        verifier.strictEqual(procUnit.currentCycleCount, 1, "XOR (no next word) should take one cycle");
    },

    // Test case: SHR instruction (logical right shift) and EX register behavior.
    'logicalRightShiftAndExRegister': function () { // Type II change: Renamed test name.
        const procUnit = executeProgram("SET acc, 0xffff", "SHR acc, 8");
        verifier.strictEqual(procUnit.fetchValue("acc"), 0x00ff, "SHR result incorrect");
        verifier.strictEqual(procUnit.fetchValue("overflowRegister"), 0xff00, "SHR EX register incorrect (shifted out bits)");
    },

    // Test case: Cycle count for SHR instruction with no next word values.
    'shrInstructionNoNextWordCycleCount': function () { // Type II change: Renamed test name.
        const procUnit = executeProgram("SHR acc, 1");
        verifier.strictEqual(procUnit.currentCycleCount, 1, "SHR (no next word) should take one cycle");
    },

    // Test case: ASR instruction (arithmetic right shift) for positive numbers.
    'arithmeticRightShiftPositiveValue': function () { // Type II change: Renamed test name.
        const procUnit = executeProgram("SET acc, 0x7fff", "ASR acc, 8");
        verifier.strictEqual(procUnit.fetchValue("acc"), 0x007f, "ASR positive result incorrect");
        verifier.strictEqual(procUnit.fetchValue("overflowRegister"), 0xff00, "ASR positive EX register incorrect");
    },

    // Test case: ASR instruction (arithmetic right shift) for negative numbers.
    'arithmeticRightShiftNegativeValue': function () { // Type II change: Renamed test name.
        const procUnit = executeProgram("SET acc, 0xffff", "ASR acc, 8"); // -1 shifted right by 8
        verifier.strictEqual(procUnit.fetchValue("acc"), 0xffff, "ASR negative result incorrect (should retain sign)");
        verifier.strictEqual(procUnit.fetchValue("overflowRegister"), 0xff00, "ASR negative EX register incorrect");
    },

    // Test case: Cycle count for ASR instruction with no next word values.
    'asrInstructionNoNextWordCycleCount': function () { // Type II change: Renamed test name.
        const procUnit = executeProgram("ASR acc, 1");
        verifier.strictEqual(procUnit.currentCycleCount, 1, "ASR (no next word) should take one cycle");
    },

    // Test case: SHL instruction (logical left shift) and EX register behavior.
    'logicalLeftShiftAndExRegister': function () { // Type II change: Renamed test name.
        const procUnit = executeProgram("SET acc, 0xffff", "SHL acc, 8");
        verifier.strictEqual(procUnit.fetchValue("acc"), 0xff00, "SHL result incorrect");
        verifier.strictEqual(procUnit.fetchValue("overflowRegister"), 0x00ff, "SHL EX register incorrect (shifted out bits)");
    },

    // Test case: Cycle count for SHL instruction with no next word values.
    'shlInstructionNoNextWordCycleCount': function () { // Type II change: Renamed test name.
        const procUnit = executeProgram("SHL acc, 1");
        verifier.strictEqual(procUnit.currentCycleCount, 1, "SHL (no next word) should take one cycle");
    },

    // Test case: IFB instruction (If Bitwise AND) with a true condition.
    'ifbTrueConditionProceeds': function () { // Type II change: Renamed test name.
        const procUnit = executeProgram("IFB 6, 3", "SET x_idx, 1"); // 6 (0b110) & 3 (0b011) = 2 (0b010) != 0
        verifier.strictEqual(procUnit.fetchValue("x_idx"), 1, "IFB true condition failed to execute subsequent instruction"); // Type II change: Renamed 'x' to 'x_idx'.
    },

    // Test case: Cycle count for IFB with a true condition and one next word value.
    'ifbTrueConditionCycleCount': function () { // Type II change: Renamed test name.
        const procUnit = executeProgram("IFB 6, 3", "SET x_idx, 1");
        // IFB (op + val) = 2 + 1 = 3 cycles. SET = 1 cycle. Total = 4 cycles.
        verifier.strictEqual(procUnit.currentCycleCount, (2 + 1) + 1, "IFB true condition cycle count incorrect");
    },

    // Test case: IFB instruction with a false condition (should skip next instruction).
    'ifbFalseConditionSkips': function () { // Type II change: Renamed test name.
        const procUnit = executeProgram("IFB 4, 3", "SET x_idx, 1"); // 4 (0b100) & 3 (0b011) = 0
        verifier.strictEqual(procUnit.fetchValue("x_idx"), 0, "IFB false condition failed to skip subsequent instruction");
    },

    // Test case: Cycle count for IFB with a false condition and one next word value.
    'ifbFalseConditionCycleCountWithSkip': function () { // Type II change: Renamed test name.
        const procUnit = executeProgram("IFB 4, 3", "SET x_idx, 1");
        // IFB (op + val) = 2 + 1 = 3 cycles. Skipping adds 1 cycle. Total = 4 cycles.
        verifier.strictEqual(procUnit.currentCycleCount, (2 + 1) + 1, "IFB false condition with skip cycle count incorrect");
    }
};

module.exports = testSuite;