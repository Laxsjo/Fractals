export enum UniformType {
	Float = 'uniform1f',
	Vec3 = 'uniform3f',
	Int = 'uniform1i',
	UInt = 'uniform1ui',
}

export class UniformInputs {
	protected static inputs: Input[] = [];

	public static registerUniform(
		name: string,
		type: UniformType,
		defaultValue: string | number
	) {
		let constructor: () => Input;
		switch (type) {
			case UniformType.Float:
			case UniformType.Int:
			case UniformType.UInt:
				this.inputs.push(
					new InputNumber(name, type, String(defaultValue))
				);
				break;
			case UniformType.Vec3:
				this.inputs.push(
					new InputColor(name, type, String(defaultValue))
				);
		}
	}

	public static getInputs() {
		return this.inputs;
	}
}

abstract class Input {
	public name: string;
	public value: string;
	public type: UniformType;

	public input: HTMLInputElement;

	protected defaultValue: string;

	constructor(
		name: string,
		type: UniformType,
		defaultValue: string,
		value?: string
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

		if (this.input.value === '') {
			this.value = defaultValue;
			return;
		}

		this.value = this.input.value;
	}

	public getValue(): any {
		return this.value;
	}

	public reset() {
		this.value = this.defaultValue;
	}
}

export class InputNumber extends Input {
	public getValue(): number {
		return Number(this.value);
	}
}

export class InputColor extends Input {
	public getValue(): [number, number, number] {
		let hexValues = _.chunk(_.trim(this.value, '#'), 2);

		let numValues = _.take(
			_.map(hexValues, (hexNumbers) => {
				return parseInt(hexNumbers.join(''), 16) / 255;
			}),
			3
		) as [number, number, number];

		// console.log(this.value, '=', numValues);

		return numValues;
	}
}
