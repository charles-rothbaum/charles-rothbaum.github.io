#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_recursions;
uniform float u_theta;
uniform float u_speed;
const int MAX_RECURSIONS = 20;

vec3 palette(float t) {
    vec3 a = vec3(0.5, 0.5, 0.5);
    vec3 b = vec3(0.5, 0.5, 0.5);
    vec3 c = vec3(1.0, 1.0, 1.0);
    vec3 d = vec3(0.263, 0.416, 0.557);
    return a + b * cos(6.28318 * (c * t + (u_time / (1./u_speed)) + d));
}

vec2 N(float angle) {
    return vec2(sin(angle), cos(angle));
}

// A helper function that folds (reflects) a 2D point into the unit square.
// If a coordinate is greater than 1.0, it is reflected back (i.e. boxfolded).
vec2 fold(vec2 v) {
    v = abs(v);
    v.x = (v.x > 1.0) ? 2.0 - v.x : v.x;
    v.y = (v.y > 1.0) ? 2.0 - v.y : v.y;
    return v;
}

void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
    vec2 mouse = u_mouse / u_resolution.xy;
    vec3 col = vec3(0);
    
    float angle = u_theta * 3.1415;
    vec2 n = N(angle);
    
    float scale = 1.0;
    uv.x += 0.5;
    
    int recursions = int(u_recursions);
    for (int i = 0; i < MAX_RECURSIONS; i++) {
        if (i >= recursions) break;
        
        // Scale the uv coordinates and update the scale factor.
        uv *= 3.0;
        scale *= 3.0;
        uv.x -= 1.5;
        uv.y -= 0.5;
        
        // Box fold: reflect the uv coordinates inside a unit square.
        uv = fold(uv);
        // Shift the coordinates to center the fold.
        uv -= 0.5;
        
        // Additional line reflection using the rotated normal.
        uv -= n * min(0.0, dot(uv, n)) * 2.0;
    }
    
    // A final fold step to ensure symmetry.
    //uv = fold(uv);
    
    float d = length(uv - vec2(clamp(uv.x, -1.0, 1.0), clamp(uv.y, -1.0, 1.0)));
    d = smoothstep(0.5 / u_resolution.y, 0.09, d / scale);
    
    col -= d;
    col += palette((length(uv.xy) + 3.1415 * scale) * 10.0 / pow(scale, 0.6));
    
    gl_FragColor = vec4(col, 1.0);
}
