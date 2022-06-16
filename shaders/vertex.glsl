// an attribute will receive data from a buffer
attribute vec4 a_position;
attribute vec2 a_texCoord;

varying vec2 v_texCoord;

// all shaders have a main function
void main() {

    // gl_Position is a special variable a vertex shader
    // is responsible for setting
    gl_Position = a_position;

    v_texCoord = (a_position.xy + vec2(1)) * 0.5;
}