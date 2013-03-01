/**
 * MitnkSendToKindle namespace.
 */

if (typeof MitnkSendToKindle == "undefined") {
    var MitnkSendToKindle = {};
};

window.addEventListener(
  "load", function() { MitnkSendToKindle.IO.init(); }, false);

function mitnk_sendtokindle_json_to_dom(xml, doc, nodes) {
    function is_array(obj) {
        return obj instanceof Array;
    }

    function namespace(name) {
        var m = /^(?:(.*):)?(.*)$/.exec(name);
        return [mitnk_sendtokindle_json_to_dom.namespaces[m[1]], m[2]];
    }

    function tag(name, attr) {
        if (is_array(name)) {
            var frag = doc.createDocumentFragment();
            Array.forEach(arguments, function (arg) {
                if (!is_array(arg[0]))
                    frag.appendChild(tag.apply(null, arg));
                else
                    arg.forEach(function (arg) {
                        frag.appendChild(tag.apply(null, arg));
                    });
            });
            return frag;
        }

        var args = Array.slice(arguments, 2);
        var vals = namespace(name);
        var elem = doc.createElementNS(vals[0] || mitnk_sendtokindle_json_to_dom.defaultNamespace,
                                       vals[1]);

        for (var key in attr) {
            var val = attr[key];
            if (nodes && key == "key")
                nodes[val] = elem;

            vals = namespace(key);
            if (typeof val == "function")
                elem.addEventListener(key.replace(/^on/, ""), val, false);
            else
                elem.setAttributeNS(vals[0] || "", vals[1], val);
        }
        args.forEach(function(e) {
            elem.appendChild(typeof e == "object" ? tag.apply(null, e) :
                             e instanceof Node    ? e : doc.createTextNode(e));
        });
        return elem;
    }
    return tag.apply(null, xml);
}
mitnk_sendtokindle_json_to_dom.namespaces = {
    html: "http://www.w3.org/1999/xhtml",
    xul: "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul"
};
mitnk_sendtokindle_json_to_dom.defaultNamespace = mitnk_sendtokindle_json_to_dom.namespaces.html;


/**
 * Send Blog Articles to Kindle.
 * API provided by http://kindle.io
 */
MitnkSendToKindle.IO = {
    get_or_create_main_div: function(doc, div_id) {
        var main_div = doc.getElementById(div_id);
        if (main_div == null) {
            main_div = doc.body.appendChild(doc.createElement("div"));
            this.clickify(doc, main_div, div_id);
        }
        return main_div;
    },

    clickify: function(doc, elem, div_id) {
        elem.setAttribute("id", div_id);
        elem.addEventListener("click", function(event){
                doc.body.removeChild(this);
            }, false);
        elem.style.color = "#333";
        elem.style.backgroundColor = "cornsilk";
        elem.style.position = "fixed";
        elem.style.border = "4px outset orange";
        elem.style.top = "50px";
        elem.style.left = "50px";
        elem.style.padding = "10px";
        elem.style.width = "16em";
        elem.style.zIndex = "9999";
        elem.style.fontSize = "20px";
    },

    set_a_link: function(doc, target_div, url, text, opentab, clear) {
        if (clear) {
            while (target_div.hasChildNodes()) {
                target_div.removeChild(target_div.lastChild);
            }
        }
        var attrs = {'href': url}
        if (opentab) {
            attrs["target"] = "_blank";
        }
        var elem = mitnk_sendtokindle_json_to_dom(["a", attrs, text], doc, {});
        target_div.appendChild(elem);
    },

    set_div_text: function(doc, target_div, text) {
        while (target_div.hasChildNodes()) {
            target_div.removeChild(target_div.lastChild);
        }
        var elem = mitnk_sendtokindle_json_to_dom(["span", {}, text], doc, {});
        target_div.appendChild(elem);
    },

    build_url: function(doc) {
        var url_api = "http://kindle.io/api/send_to_kindle/";
        return url_api + "?" + "url=" + encodeURIComponent(doc.URL);
    },

    request_sending: function(doc, url, target_div) {
        this.set_div_text(doc, target_div, "Sending");
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.status == 500) {
                MitnkSendToKindle.IO.set_div_text(doc, target_div,
                    "Service Error");
            }
            else if (xmlhttp.status > 200) {
                MitnkSendToKindle.IO.set_div_text(doc, target_div,
                    "Network Error");
            }
            else if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                var result = JSON.parse(xmlhttp.responseText);
                if (result.status == "ok") {
                    MitnkSendToKindle.IO.set_div_text(doc, target_div,
                        "Sent Successfully!");
                    setTimeout("MitnkSendToKindle.IO.dismiss_main_div()", 1500);
                }
                else {
                    MitnkSendToKindle.IO.set_div_text(doc, target_div,
                        result.reason);
                    if (result.url != "") {
                        MitnkSendToKindle.IO.set_a_link(doc, target_div,
                            result.url, result.url_string, true, false);
                    }
                }
            }
        }
        xmlhttp.open("GET", url, true);
        xmlhttp.send(null);
    },

    dismiss_main_div: function() {
        var doc = content.document;
        var main_div = this.get_or_create_main_div(doc, "mitnk-send-to-kindle");
        doc.body.removeChild(main_div);
    },

    main: function() {
        var doc = content.document;
        var main_div = this.get_or_create_main_div(doc, "mitnk-send-to-kindle");
        var url = this.build_url(doc);
        this.request_sending(doc, url, main_div);
    },

    init : function() {
        var currentset = document.getElementById("nav-bar").currentSet;
        currentset=currentset + ",mitnk-sendtokindle-send-btn";
        document.getElementById("nav-bar").setAttribute("currentset",currentset);
        document.getElementById("nav-bar").currentSet = currentset;
        document.persist("nav-bar","currentset");
    }
};
