class DisclosureButtonElement extends HTMLButtonElement {
	public content: HTMLElement;

	public get siblingSelector(): string | undefined {
		return this.getAttribute("siblingSelector") ?? undefined;
	}
	public set siblingSelector(v: string | undefined) {
		if (v === undefined) {
			this.removeAttribute("siblingSelector");
		} else {
			this.setAttribute("siblingSelector", v);
		}
	}

	public get stretchContent(): boolean {
		return this.content.classList.contains("stretchContent");
	}
	public set stretchContent(value: boolean) {
		this.content.classList.toggle("stretchContent", value);
	}

	// protected animationContainer: HTMLElement;
	// protected measuringWrapper: HTMLElement;

	public get expanded(): boolean {
		return (this.getAttribute("aria-expanded") ?? "false") !== "false";
	}
	public set expanded(state: boolean) {
		this.setExpandState(state);
	}

	protected resizeObserver: ResizeObserver;

	constructor() {
		super();
	}

	connectedCallback() {
		let contentId = this.getAttribute("aria-controls");
		this.content = document.getElementById(contentId);
		if (this.content === null) {
			throw new Error(
				`Failed creating Disclosure: Could not find disclosure content with id ${contentId}`
			);
		}

		// console.log("created disclosure", this, "with content", this.content);

		// this.animationContainer = document.createElement("div");
		// this.animationContainer.classList.add("animationContainer");

		// this.measuringWrapper = document.createElement("div");
		// this.measuringWrapper.classList.add("measuringWrapper");

		// this.animationContainer.append(this.measuringWrapper);
		// this.measuringWrapper.append(...this.content.childNodes);
		// this.content.append(this.animationContainer);

		// this.animationContainer = this.content.querySelector(
		// 	'.animationContainer'
		// );
		// if (this.animationContainer === null) {
		// 	throw new Error(
		// 		`Failed creating Disclosure: Disclosure content did not have child with class animationContainer.`
		// 	);
		// }
		// this.measuringWrapper =
		// 	this.animationContainer.querySelector('.measuringWrapper');
		// if (this.measuringWrapper === null) {
		// 	throw new Error(
		// 		`Failed creating Disclosure: Disclosure animation container did not have child with class measuringWrapper.`
		// 	);
		// }

		this.expanded = this.getAttribute("aria-expanded") === "true";

		// this.resizeObserver = new ResizeObserver((entries) => {
		// 	this.updateContentDimension();
		// });
		// if (this.measuringWrapper.children[0]) {
		// 	this.resizeObserver.observe(
		// 		this.measuringWrapper /* .children[0] */
		// 	);
		// }

		this.addEventListener("click", (event) => {
			// console.time('flipAnimate');
			this.toggleExpandState();
		});

		// const [width, height, duration] = this.updateContentDimension();
	}

	protected handleKeyDown(event: KeyboardEvent) {
		switch (event.code) {
			case "Enter":
			case "Space":
				this.toggleExpandState();
				break;
		}
	}

	public toggleExpandState() {
		this.expanded = !this.expanded;
	}

	// protected updateContentDimension(): [
	// 	width: number,
	// 	height: number,
	// 	duration: number,
	// 	slowDuration: number
	// ] {
	// 	let [width, height, duration, slowDuration] =
	// 		this.getContentDimensions();
	// 	// let width = this.content.scrollWidth;

	// 	this.content.style.setProperty("--duration", duration + "s");
	// 	this.content.style.setProperty("--slowDuration", slowDuration + "s");
	// 	this.content.style.setProperty("--width", width + "px");
	// 	this.content.style.setProperty("--height", height + "px");

	// 	this.animationContainer.style.height = height + "px";

	// 	if (!this.stretchContent) {
	// 		this.animationContainer.style.width = width + "px";
	// 	}

	// 	// console.log('updated dimension to', [width, height]);

	// 	return [width, height, duration, slowDuration];
	// }

	protected setExpandState(expanded: boolean) {
		if (expanded) {
			this.content.classList.remove("hidden");
			this.content.inert = false;
			// this.content.hidden = false;
			// this.content.setAttribute('aria-hidden', 'false');
			this.setAttribute("aria-expanded", "true");
		} else {
			this.content.classList.add("hidden");
			this.content.inert = true;
			// this.content.hidden = true;
			// this.content.setAttribute('aria-hidden', 'true');
			this.setAttribute("aria-expanded", "false");
		}

		// }
	}

	// protected getContentDimensions(): [
	// 	width: number,
	// 	height: number,
	// 	duration: number,
	// 	slowDuration: number
	// ] {
	// 	let height: number = this.measuringWrapper.clientHeight;
	// 	let widthStyle = this.measuringWrapper.style.width;
	// 	this.measuringWrapper.style.width = "max-content";
	// 	let width: number = this.measuringWrapper.scrollWidth;
	// 	this.measuringWrapper.style.width = widthStyle;
	// 	let duration: number = (height / 1500) ** 0.6; // 900: 900px / 1s = 90px / 0.1s
	// 	let slowDuration: number = (height / 200) ** 0.8; // 900: 900px / 1s = 90px / 0.1s

	// 	return [width, height, duration, slowDuration];
	// }
}
customElements.define("disclosure-button", DisclosureButtonElement, {
	extends: "button",
});
