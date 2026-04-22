const acquireModule = (moduleName) => require(moduleName);
const fileSystemHandler = acquireModule("fs");

const retrieveDataFromPath = (pathSpecifier, encodingFormat) => fileSystemHandler.readFileSync(pathSpecifier, encodingFormat);

const standardInputReference = "/dev/stdin";

String.prototype.purgeWhitespace = function() { return this.trim(); };
String.prototype.divideByPattern = function(pattern) { return this.split(pattern); };
Array.prototype.convertElementsToNumber = function() { return this.map(Number); };
Array.prototype.performActionOnEach = function(action) { this.forEach(action); };

const getAbsoluteMagnitude = (value) => Math.abs(value);

const toleranceThreshold = 0.0000000001;

const emitOutputLine = (message) => console.log(message);

class SpatialCoordinate {
    constructor(x_val, y_val) {
        this.x_axis_pos = x_val;
        this.y_axis_pos = y_val;
    }
}

class DirectionalSpan {
    constructor(start_point, end_point) {
        this.horizontal_difference = end_point.x_axis_pos - start_point.x_axis_pos;
        this.vertical_difference = end_point.y_axis_pos - start_point.y_axis_pos;
    }

    static computeScalarProduct(span_one, span_two) {
        return (span_one.horizontal_difference * span_two.horizontal_difference) +
               (span_one.vertical_difference * span_two.vertical_difference);
    }
}

const executeGeometricCheck = (input_data_string) => {
    const cleansed_input_lines = input_data_string.purgeWhitespace().divideByPattern('\n');

    cleansed_input_lines.performActionOnEach(current_entry => {
        const numerical_tokens = current_entry.divideByPattern(' ').convertElementsToNumber();

        const p1_coords = new SpatialCoordinate(numerical_tokens[0], numerical_tokens[1]);
        const p2_coords = new SpatialCoordinate(numerical_tokens[2], numerical_tokens[3]);
        const p3_coords = new SpatialCoordinate(numerical_tokens[4], numerical_tokens[5]);
        const p4_coords = new SpatialCoordinate(numerical_tokens[6], numerical_tokens[7]);

        const segment_ab_vector = new DirectionalSpan(p1_coords, p2_coords);
        const segment_cd_vector = new DirectionalSpan(p3_coords, p4_coords);

        const dot_product_result = DirectionalSpan.computeScalarProduct(segment_ab_vector, segment_cd_vector);

        if (getAbsoluteMagnitude(dot_product_result) < toleranceThreshold) {
            emitOutputLine('NO');
        } else {
            emitOutputLine('YES');
        }
    });
};

const raw_input_content = retrieveDataFromPath(standardInputReference, "utf8");
executeGeometricCheck(raw_input_content);