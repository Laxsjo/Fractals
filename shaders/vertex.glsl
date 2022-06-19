#version 300 es
// an attribute will receive data from a buffer
in vec4 a_position;

out vec2 texCoord;

// all shaders have a main function
void main() {

    // gl_Position is a special variable a vertex shader
    // is responsible for setting
    gl_Position = a_position;

    // texCoord = (a_position.xy + vec2(1)) * 0.5;
    texCoord = a_position.xy;
}