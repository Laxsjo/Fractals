export enum UniformType {
	Float = "uniform1f",
	Int = "uniform1i",
	UInt = "uniform1ui",
}

export class UniformInputs {
	protected static inputs: Input[] = [];

	public static registerUniform(
		name: string,
		type: UniformType,
		defaultValue: number
	) {
		this.inputs.push(new Input(name, type, defaultValue));
	}

	public static getInputs() {
		return this.inputs;
	}
}

class Input {
	public name: string;
	public value: number;
	public type: UniformType;

	public input: HTMLInputElement;

	protected defaultValue: number;

	constructor(
		name: string,
		type: UniformType,
		defaultValue: number,
		value?: number
	) {
		this.name = name;
		this.input = document.querySelector<HTMLInputElement>(
			`#${this.name}Input`
		);

		this.type = type;

		this.defaultValue = defaultValue;

		if (this.input === null) {
			throw new Error(
				`Could not create Uniform Input: Input with id '${this.name}Input' does not exist.`
			);
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

	public reset() {
		this.value = this.defaultValue;
	}
}
