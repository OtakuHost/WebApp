var WebApp = {
    "GetBD": async function(Key, NotExist) {
        if (localStorage.getItem(Key) === null) {
            return NotExist;
        } else {
            return localStorage.getItem(Key);
        }
    },
    "Ajax": async function(Url, CallBack) {
        $.ajax({
            type: "POST",
            url: "http://localhost/",
            data: {
                "Tipe": "Ajax",
                "Url": Url
            },
            success: function(result) {
                alert(result);
            }
        });
    }
}
