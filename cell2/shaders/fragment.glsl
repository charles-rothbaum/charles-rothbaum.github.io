#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_resolution;
uniform float u_frequency;
uniform float u_amplitude;
uniform float u_iterations;
uniform float u_asymmetry;

const int MAX_ITERATIONS = 20; // Define a fixed upper bound.

vec3 palette(float t) {
    vec3 a = vec3(0.5, 0.5, 0.5);
    vec3 b = vec3(0.5, 0.5, 0.5);
    vec3 c = vec3(1.0, 1.0, 1.0);
    vec3 d = vec3(0.263, 0.416, 0.557);

    return a + b * cos(6.28318 * (c * t + d));
}

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution * 2.0 - 1.0;
    uv.x *= u_resolution.x / u_resolution.y;

    vec2 uv0 = uv;
    vec3 finalColor = vec3(0.0);

    int iterations = int(u_iterations);

    for (int i = 0; i < MAX_ITERATIONS; i++) {
        if (i >= iterations) break;

        uv = fract(uv * u_asymmetry) - 0.5;

        float d = length(uv) * exp(-length(uv0));

        vec3 col = palette(length(uv0) + float(i) * 0.14 + u_time * 0.4);

        d = sin(d * u_frequency + u_time) / u_amplitude;
        d = abs(d);
        d = pow(0.01 / d, 1.2);

        finalColor += col * d;
    }

    gl_FragColor = vec4(finalColor, 1.0);
}
