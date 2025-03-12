precision mediump float;

uniform sampler2D u_buffer;
uniform vec2 u_resolution;
uniform float u_time;

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;

    // Display the buffered image directly
    vec3 col = texture2D(u_buffer, uv).rgb;
    gl_FragColor = vec4(col, 1.);
}
