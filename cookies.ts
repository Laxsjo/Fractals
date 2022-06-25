export function set(
	name: string,
	value: string,
	exdays: number = 365,
	sameSiteOnly = true
) {
	const d = new Date();
	d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
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

export function getJSON(name: string): object {
	let value = get(name);
	if (!value) return null;
	return JSON.parse(decodeURIComponent(get(name)));
}
