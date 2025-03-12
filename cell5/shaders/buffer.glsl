precision mediump float;

uniform sampler2D u_previousFrame;
uniform vec2 u_resolution;
uniform float u_time;

float rand(vec2 co) {
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}

// Get the number of alive neighbors
int GetNeighbors(ivec2 p) {
    int num = 0;
    for (int y = -1; y <= 1; y++) {
        for (int x = -1; x <= 1; x++) {
            if (x == 0 && y == 0) continue; // Skip the center cell

            // Compute neighbor position
            ivec2 neighbor = p + ivec2(x, y);

            // Wrap around edges (Toroidal boundary)
            //neighbor = ivec2(mod(vec2(neighbor), u_resolution));

            // Convert to texture coordinates
            vec2 texCoord = (vec2(neighbor) + 0.5) / u_resolution;
            float neighborState = texture2D(u_previousFrame, texCoord).r;

            num += int(floor(neighborState)); // Ensure binary values
        }
    }
    return num;
}

void main() {
    // Convert fragment coordinate to discrete cell index
    ivec2 cellIndex = ivec2(gl_FragCoord.xy);
    vec2 texCoord = (vec2(cellIndex) + 0.5) / u_resolution;
    float currentState = floor(texture2D(u_previousFrame, texCoord).r); // Ensure binary state

    vec3 col;
    if (u_time <= 0.3) {
        // Random initial state
        col = vec3(rand(texCoord) > 0.5 ? 1.0 : 0.0);
    } else {
        // Get neighbor count
        int numNeighbors = GetNeighbors(cellIndex);
        
        // Apply Game of Life rules
        float nextState = 0.0;
        if (currentState == 1.0 && (numNeighbors == 2 || numNeighbors == 3)) {
            nextState = 1.0;
        } else if (currentState == 0.0 && numNeighbors == 3) {
            nextState = 1.0;
        }

        col = vec3(nextState);
    }

    gl_FragColor = vec4(col, 1.0);
}
