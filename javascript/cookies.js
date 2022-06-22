export function set(name, value, exdays = 365, sameSiteOnly = true) {
    const d = new Date();
    d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
    let expires = "expires=" + d.toUTCString();
    let sameSite = sameSiteOnly ? "strict" : "lax";
    document.cookie =
        name + "=" + value + ";" + expires + ";path=/;samesite=" + sameSite;
}
export function get(name) {
    name += "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(";");
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == " ") {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}
//# sourceMappingURL=cookies.js.map