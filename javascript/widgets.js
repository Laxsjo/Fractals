class DisclosureButtonElement extends HTMLButtonElement {
    constructor() {
        super();
    }
    get siblingSelector() {
        var _a;
        return (_a = this.getAttribute("siblingSelector")) !== null && _a !== void 0 ? _a : undefined;
    }
    set siblingSelector(v) {
        if (v === undefined) {
            this.removeAttribute("siblingSelector");
        }
        else {
            this.setAttribute("siblingSelector", v);
        }
    }
    get stretchContent() {
        return this.content.classList.contains("stretchContent");
    }
    set stretchContent(value) {
        this.content.classList.toggle("stretchContent", value);
    }
    // protected animationContainer: HTMLElement;
    // protected measuringWrapper: HTMLElement;
    get expanded() {
        var _a;
        return ((_a = this.getAttribute("aria-expanded")) !== null && _a !== void 0 ? _a : "false") !== "false";
    }
    set expanded(state) {
        this.setExpandState(state);
    }
    connectedCallback() {
        let contentId = this.getAttribute("aria-controls");
        this.content = document.getElementById(contentId);
        if (this.content === null) {
            throw new Error(`Failed creating Disclosure: Could not find disclosure content with id ${contentId}`);
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
    handleKeyDown(event) {
        switch (event.code) {
            case "Enter":
            case "Space":
                this.toggleExpandState();
                break;
        }
    }
    toggleExpandState() {
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
    setExpandState(expanded) {
        if (expanded) {
            this.content.classList.remove("hidden");
            this.content.inert = false;
            // this.content.hidden = false;
            // this.content.setAttribute('aria-hidden', 'false');
            this.setAttribute("aria-expanded", "true");
        }
        else {
            this.content.classList.add("hidden");
            this.content.inert = true;
            // this.content.hidden = true;
            // this.content.setAttribute('aria-hidden', 'true');
            this.setAttribute("aria-expanded", "false");
        }
        // }
    }
}
customElements.define("disclosure-button", DisclosureButtonElement, {
    extends: "button",
});
//# sourceMappingURL=widgets.js.map