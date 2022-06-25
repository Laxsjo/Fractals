export function set(
	name: string,
	value: string,
	exdays: number | null = null,
	sameSiteOnly = true
) {
	const d = new Date();
	if (exdays === null) {
		/*Point when unix exceeds 32-bit int limit, which may break some
		browsers (Actually its a few months later but I've added some
		margin just to be sure). From here: https://stackoverflow.com/a/532660/15507414*/
		d.setUTCFullYear(2038, 0, 1);
		d.setHours(1, 0, 0, 0);
	} else {
		d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
	}
	let expires = 'expires=' + d.toUTCString();
	let sameSite = sameSiteOnly ? 'strict' : 'lax';
	document.cookie =
		name + '=' + value + ';' + expires + ';path=/;samesite=' + sameSite;
}

export function get(name: string): string {
	name += '=';
	let decodedCookie = decodeURIComponent(document.cookie);
	let ca = decodedCookie.split(';');
	for (let i = 0; i < ca.length; i++) {
		let c = ca[i];
		while (c.charAt(0) == ' ') {
			c = c.substring(1);
		}
		if (c.indexOf(name) == 0) {
			return c.substring(name.length, c.length);
		}
	}
	return '';
}

export function setJSON(
	name: string,
	value: object,
	exdays: number = 365,
	sameSiteOnly = true
) {
	set(name, encodeURIComponent(JSON.stringify(value)), exdays, sameSiteOnly);
}

export function getJSON(name: string): object | undefined {
	let value = get(name);
	if (!value) return undefined;
	return JSON.parse(decodeURIComponent(get(name)));
}
