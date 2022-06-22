export var UniformType;
(function (UniformType) {
    UniformType["Float"] = "uniform1f";
    UniformType["Int"] = "uniform1i";
    UniformType["UInt"] = "uniform1ui";
})(UniformType || (UniformType = {}));
export class UniformInputs {
    static registerUniform(name, type, defaultValue) {
        this.inputs.push(new Input(name, type, defaultValue));
    }
    static getInputs() {
        return this.inputs;
    }
}
UniformInputs.inputs = [];
class Input {
    constructor(name, type, defaultValue, value) {
        this.name = name;
        this.input = document.querySelector(`#${this.name}Input`);
        this.type = type;
        this.defaultValue = defaultValue;
        if (this.input === null) {
            throw new Error(`Could not create Uniform Input: Input with id '${this.name}Input' does not exist.`);
        }
        if (value !== undefined) {
            this.value = value;
            this.input.value = String(value);
            return;
        }
        if (this.input.value === "") {
            this.value = defaultValue;
            return;
        }
        this.value = Number(this.input.value);
    }
    reset() {
        this.value = this.defaultValue;
    }
}
//# sourceMappingURL=uniformInputs.js.map