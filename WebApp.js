var WebApp = {
    "GetBD": async function(Key, NotExist) {
        if (localStorage.getItem(Key) === null) {
            return NotExist;
        } else {
            return localStorage.getItem(Key);
        }
    }
}
