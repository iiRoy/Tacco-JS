const input_source_data = require("fs").readFileSync("/dev/stdin", "utf8");
const string_tokens = input_source_data.trim().split(/\s+/);
let current_token_position = 0;

const extract_numeric_value = () => Number(string_tokens[current_token_position++]);
const extract_string_value = () => string_tokens[current_token_position++];

class CelestialBody {
    constructor(coord_x, coord_y, motion_vector_tag) {
        this.coord_x = coord_x;
        this.coord_y = coord_y;
        this.diag_component_one = coord_x - coord_y; // Invariant for NW-SE diagonal movement
        this.diag_component_two = coord_x + coord_y; // Invariant for NE-SW anti-diagonal movement
        this.motion_vector_tag = motion_vector_tag; // 'U', 'R', 'D', 'L'
    }
}

function analyze_celestial_paths() {
    const cosmic_infinity = 1_000_000_000;
    const number_of_bodies = extract_numeric_value();

    const body_catalog = new Map([
        ['U', []], // Bodies moving upwards (increasing Y)
        ['R', []], // Bodies moving rightwards (increasing X)
        ['D', []], // Bodies moving downwards (decreasing Y)
        ['L', []]  // Bodies moving leftwards (decreasing X)
    ]);

    for (let body_idx = 0; body_idx < number_of_bodies; ++body_idx) {
        const x_position = extract_numeric_value();
        const y_position = extract_numeric_value();
        const direction_char = extract_string_value();
        body_catalog.get(direction_char).push(new CelestialBody(x_position, y_position, direction_char));
    }

    let minimum_encounter_time_unit = cosmic_infinity;

    // --- Scenario 1: Vertical (U-D) and Horizontal (R-L) Encounters ---
    // These occur when bodies share a coordinate and move towards each other.

    // Group U and D bodies by their X-coordinate
    const x_coordinate_groups = new Map();
    for (const body of body_catalog.get('U')) {
        if (!x_coordinate_groups.has(body.coord_x)) x_coordinate_groups.set(body.coord_x, []);
        x_coordinate_groups.get(body.coord_x).push(body);
    }
    for (const body of body_catalog.get('D')) {
        if (!x_coordinate_groups.has(body.coord_x)) x_coordinate_groups.set(body.coord_x, []);
        x_coordinate_groups.get(body.coord_x).push(body);
    }

    // Check U-D encounters
    for (const [x_value, body_group] of x_coordinate_groups.entries()) {
        const sorted_by_y = [...body_group].sort((b1, b2) => b1.coord_y - b2.coord_y);
        for (let i = 0; i < sorted_by_y.length; ++i) {
            const body_u = sorted_by_y[i];
            if (body_u.motion_vector_tag !== 'U') continue;
            for (let j = i + 1; j < sorted_by_y.length; ++j) {
                const body_d = sorted_by_y[j];
                if (body_d.motion_vector_tag === 'D') { // U is below D on same X-line
                    minimum_encounter_time_unit = Math.min(minimum_encounter_time_unit, body_d.coord_y - body_u.coord_y);
                    break;
                }
            }
        }
    }

    // Group R and L bodies by their Y-coordinate
    const y_coordinate_groups = new Map();
    for (const body of body_catalog.get('R')) {
        if (!y_coordinate_groups.has(body.coord_y)) y_coordinate_groups.set(body.coord_y, []);
        y_coordinate_groups.get(body.coord_y).push(body);
    }
    for (const body of body_catalog.get('L')) {
        if (!y_coordinate_groups.has(body.coord_y)) y_coordinate_groups.set(body.coord_y, []);
        y_coordinate_groups.get(body.coord_y).push(body);
    }

    // Check R-L encounters
    for (const [y_value, body_group] of y_coordinate_groups.entries()) {
        const sorted_by_x = [...body_group].sort((b1, b2) => b1.coord_x - b2.coord_x);
        for (let i = 0; i < sorted_by_x.length; ++i) {
            const body_r = sorted_by_x[i];
            if (body_r.motion_vector_tag !== 'R') continue;
            for (let j = i + 1; j < sorted_by_x.length; ++j) {
                const body_l = sorted_by_x[j];
                if (body_l.motion_vector_tag === 'L') { // R is left of L on same Y-line
                    minimum_encounter_time_unit = Math.min(minimum_encounter_time_unit, body_l.coord_x - body_r.coord_x);
                    break;
                }
            }
        }
    }

    // --- Scenario 2: Anti-diagonal (U-R, D-L) Encounters ---
    // These occur when bodies share the `x+y` sum (diag_component_two) and move towards each other.

    const anti_diagonal_groups = new Map();
    for (const [tag, bodies] of body_catalog.entries()) {
        for (const body of bodies) {
            if (!anti_diagonal_groups.has(body.diag_component_two)) {
                anti_diagonal_groups.set(body.diag_component_two, { U: [], R: [], D: [], L: [] });
            }
            anti_diagonal_groups.get(body.diag_component_two)[tag].push(body);
        }
    }

    for (const [diag_sum_value, tagged_groups] of anti_diagonal_groups.entries()) {
        const u_bodies = tagged_groups.U.sort((b1, b2) => b1.coord_x - b2.coord_x);
        const r_bodies = tagged_groups.R.sort((b1, b2) => b1.coord_x - b2.coord_x);
        const d_bodies = tagged_groups.D.sort((b1, b2) => b1.coord_x - b2.coord_x);
        const l_bodies = tagged_groups.L.sort((b1, b2) => b1.coord_x - b2.coord_x);

        // U-R encounters: U(xU,yU), R(xR,yR). Collision if xU > xR and yR > yU. Time = xU-xR. Result (yR-yU)*2.
        let u_pointer = 0;
        for (let r_pointer = 0; r_pointer < r_bodies.length; ++r_pointer) {
            const r_body = r_bodies[r_pointer];
            while (u_pointer < u_bodies.length && u_bodies[u_pointer].coord_x <= r_body.coord_x) {
                u_pointer++;
            }
            if (u_pointer < u_bodies.length) {
                const u_body = u_bodies[u_pointer];
                // At this point, r_body.coord_x < u_body.coord_x (R is left of U)
                // Since diag_sum is equal, this implies u_body.coord_y > r_body.coord_y (U is above R)
                // This is the collision configuration.
                minimum_encounter_time_unit = Math.min(minimum_encounter_time_unit, (r_body.coord_y - u_body.coord_y) * 2);
            }
        }

        // D-L encounters: D(xD,yD), L(xL,yL). Collision if xD < xL and yD > yL. Time = xL-xD. Result (xL-xD)*2.
        let l_pointer = 0;
        for (let d_pointer = 0; d_pointer < d_bodies.length; ++d_pointer) {
            const d_body = d_bodies[d_pointer];
            while (l_pointer < l_bodies.length && l_bodies[l_pointer].coord_x <= d_body.coord_x) {
                l_pointer++;
            }
            if (l_pointer < l_bodies.length) {
                const l_body = l_bodies[l_pointer];
                // At this point, d_body.coord_x < l_body.coord_x (D is left of L)
                // Since diag_sum is equal, this implies d_body.coord_y > l_body.coord_y (D is above L)
                // This is the collision configuration.
                minimum_encounter_time_unit = Math.min(minimum_encounter_time_unit, (l_body.coord_x - d_body.coord_x) * 2);
            }
        }
    }

    // --- Scenario 3: Diagonal (U-L, R-D) Encounters ---
    // These occur when bodies share the `x-y` difference (diag_component_one) and move towards each other.

    const diagonal_groups = new Map();
    for (const [tag, bodies] of body_catalog.entries()) {
        for (const body of bodies) {
            if (!diagonal_groups.has(body.diag_component_one)) {
                diagonal_groups.set(body.diag_component_one, { U: [], R: [], D: [], L: [] });
            }
            diagonal_groups.get(body.diag_component_one)[tag].push(body);
        }
    }

    for (const [diag_diff_value, tagged_groups] of diagonal_groups.entries()) {
        const u_bodies = tagged_groups.U.sort((b1, b2) => b1.coord_x - b2.coord_x);
        const l_bodies = tagged_groups.L.sort((b1, b2) => b1.coord_x - b2.coord_x);
        const r_bodies = tagged_groups.R.sort((b1, b2) => b1.coord_x - b2.coord_x);
        const d_bodies = tagged_groups.D.sort((b1, b2) => b1.coord_x - b2.coord_x);

        // U-L encounters: U(xU,yU), L(xL,yL). Collision if xU < xL and yU < yL. Time = xL-xU. Result (xL-xU)*2.
        let l_pointer = 0;
        for (let u_pointer = 0; u_pointer < u_bodies.length; ++u_pointer) {
            const u_body = u_bodies[u_pointer];
            while (l_pointer < l_bodies.length && l_bodies[l_pointer].coord_x <= u_body.coord_x) {
                l_pointer++;
            }
            if (l_pointer < l_bodies.length) {
                const l_body = l_bodies[l_pointer];
                // At this point, u_body.coord_x < l_body.coord_x (U is left of L)
                // Since diag_diff is equal, this implies u_body.coord_y < l_body.coord_y (U is below L)
                // This is the collision configuration.
                minimum_encounter_time_unit = Math.min(minimum_encounter_time_unit, (l_body.coord_x - u_body.coord_x) * 2);
            }
        }

        // R-D encounters: R(xR,yR), D(xD,yD). Collision if xR < xD and yR < yD. Time = xD-xR. Result (xD-xR)*2.
        let d_pointer = 0;
        for (let r_pointer = 0; r_pointer < r_bodies.length; ++r_pointer) {
            const r_body = r_bodies[r_pointer];
            while (d_pointer < d_bodies.length && d_bodies[d_pointer].coord_x <= r_body.coord_x) {
                d_pointer++;
            }
            if (d_pointer < d_bodies.length) {
                const d_body = d_bodies[d_pointer];
                // At this point, r_body.coord_x < d_body.coord_x (R is left of D)
                // Since diag_diff is equal, this implies r_body.coord_y < d_body.coord_y (R is below D)
                // This is the collision configuration.
                minimum_encounter_time_unit = Math.min(minimum_encounter_time_unit, (d_body.coord_x - r_body.coord_x) * 2);
            }
        }
    }

    return minimum_encounter_time_unit === cosmic_infinity ? "SAFE" : minimum_encounter_time_unit * 5;
}

const final_processed_result = analyze_celestial_paths();
if (final_processed_result !== undefined) console.log(String(final_processed_result));