#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_recursions;
uniform float u_theta;
const int MAX_RECURSIONS = 20;

vec3 palette(float t) {
    vec3 a = vec3(0.5, 0.5, 0.5);
    vec3 b = vec3(0.5, 0.5, 0.5);
    vec3 c = vec3(1.0, 1.0, 1.0);
    vec3 d = vec3(0.263, 0.416, 0.557);

    return a + b * cos(6.28318 * (c * t + d));
}

vec2 N(float angle){
    return vec2(sin(angle), cos(angle));
}

void main() {
    vec2 uv = (gl_FragCoord.xy-.5*u_resolution.xy)/u_resolution.y;
    vec2 mouse = u_mouse / u_resolution.xy;

    //uv *= 3.;
    vec3 col = vec3(0);
    //line angle:
    float angle = (u_theta)*3.1415; //mult by pi so that can rotate more than 1RAD piRADS = 180deg.
    //line normal (perpendicular direction):
    vec2 n = vec2(sin(angle), cos(angle)); //will trace out a circle, imagine displacement vector as hands of a clock
    //get distance between any pixel to line described by mouse pos
    
    /*
    float d = dot(uv, n); //creates flat gradient with angle, in other words the distance to a line.

    uv -= n * min(0., d)*2.; //uv coords reflected from pos side of line to neg side.

    col.rg+= sin(uv*3.);
    col += smoothstep(0.02, 0.00, abs(d));
    */

    float scale = 1.;
    uv.x += .5;
    
    int recursions = int(u_recursions);

    for(int i = 0; i < MAX_RECURSIONS; i++){
        if(i >= recursions) break;
        //reset uv coordinates for each line segment:
        uv *= 3.;
        scale *= 4.;
        uv.x -= 1.5;

        uv.x = abs(uv.x);
        uv.x -= 0.5; //widen the line, because instead of terminating at x=1, it will be x=1.5
        uv -= n * min(0., dot(uv,n))*2.; //uv coords reflected from pos side of line to neg side.
    }


    float d = length(uv - vec2(clamp(uv.x, -1., 1.), 0));
    d = smoothstep(0.5/u_resolution.y, 0.09, d/scale);

    col -= d;
    col += palette(((length(uv.xy))+3.1415 * scale) * 10. /pow(scale, 0.6)+ u_time/5.);

    gl_FragColor = vec4(col, 1.0);
}
