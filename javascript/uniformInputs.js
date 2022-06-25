export var UniformType;
(function (UniformType) {
    UniformType["Float"] = "uniform1f";
    UniformType["Vec3"] = "uniform3f";
    UniformType["Int"] = "uniform1i";
    UniformType["UInt"] = "uniform1ui";
})(UniformType || (UniformType = {}));
export class UniformInputs {
    static registerUniform(name, type, defaultValue) {
        let constructor;
        switch (type) {
            case UniformType.Float:
            case UniformType.Int:
            case UniformType.UInt:
                this.inputs.push(new InputNumber(name, type, String(defaultValue)));
                break;
            case UniformType.Vec3:
                this.inputs.push(new InputColor(name, type, String(defaultValue)));
        }
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
        if (this.input.value === '') {
            this.value = defaultValue;
            return;
        }
        this.value = this.input.value;
    }
    getValue() {
        return this.value;
    }
    reset() {
        this.value = this.defaultValue;
    }
}
export class InputNumber extends Input {
    getValue() {
        return Number(this.value);
    }
}
export class InputColor extends Input {
    getValue() {
        let hexValues = _.chunk(_.trim(this.value, '#'), 2);
        let numValues = _.take(_.map(hexValues, (hexNumbers) => {
            return parseInt(hexNumbers.join(''), 16) / 255;
        }), 3);
        // console.log(this.value, '=', numValues);
        return numValues;
    }
}
//# sourceMappingURL=uniformInputs.js.map