/**
 * MitnkSendToKindle namespace.
 */

if (typeof MitnkSendToKindle == "undefined") {
    var MitnkSendToKindle = {};
};

MitnkSendToKindle.IO = {
    /**
     * Send Blog Articles to Kindle.
     * API provided by http://kindle.io
     */
    get_or_create_main_div: function(doc, div_id) {
        var main_div = doc.getElementById(div_id);
        if (main_div == null) {
            main_div = doc.body.appendChild(doc.createElement("div"));
            main_div.setAttribute("id", div_id);
            main_div.setAttribute("style",
                "position:fixed;z-index:9999;top: 50px;left:50px;color:#333;"
                + "width:16em;padding:6px;font-weight:bold;font-size:20px;"
                + "border: 3px outset orange; background-color: cornsilk;");
        }
        main_div.setAttribute("onclick", "document.body.removeChild(this)");
        main_div.innerHTML = 'Sending ...';
        return main_div;
    },

    build_url: function(doc) {
        var url_api = "http://kindle.io/api/send_to_kindle/";
        return url_api + "?" + "url=" + encodeURIComponent(doc.URL);
    },

    request_sending: function(url, target_div) {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.status == 500) {
                target_div.innerHTML = 'Service Error.';
            }
            else if (xmlhttp.status != 200) {
                target_div.innerHTML = 'Network Error.';
            }
            else if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                var result = JSON.parse(xmlhttp.responseText);
                if (result.status == "ok") {
                    target_div.innerHTML = 'Sent Successfully!';
                    setTimeout("MitnkSendToKindle.IO.dismiss_main_div()", 1500);
                }
                else {
                    target_div.innerHTML = result.reason;
                    if (result.url != "") {
                        target_div.innerHTML += ' <a href="' + result.url +
                            '" target="_blank">' + result.url_string + '</a>';
                    }
                }
            }
        }
        xmlhttp.open("GET", url, true);
        xmlhttp.send(null);
    },

    dismiss_main_div: function() {
        var main_div = this.get_or_create_main_div(document, "mitnk-send-to-kindle");
        document.body.removeChild(main_div);
    },

    main: function() {
        var main_div = this.get_or_create_main_div(document, "mitnk-send-to-kindle");
        var url = this.build_url(document);
        this.request_sending(url, main_div);
    }
};

MitnkSendToKindle.IO.main();
