if (typeof (PxHelper) == "undefined" || PxHelper == null) {
    PxHelper = {};
}

PxHelper.PPWidget = function(rootElem, config) {
    var container = new Element("div");
    container.addClassName("ppwidget");
    var options = config.options;
    var links = config.links;
    var text = config.text;

    function renderCloser(handler) {
        var closer = new Element("div", {
            "id" : "closer"
        });
        closer.update("X");
        closer.addClassName("closer");
        closer.observe("click", function(evt) {
            handler.hide();
        });
        handler.appendChild(closer);
    }

    function loadUrl(url, push) {
        if (push) {
            location.href = url;
            return;
        }
        var div = new Element("div", {
            "id" : "div-loadUrl"
        });
        var iframe = new Element("iframe", {
            "src" : url,
            "id" : "ppwidget-iframe",
            "width" : "100%",
            "height" : "100%",
            "allowTransparency" : "true",
            "frameBorder" : "0px",
            "frameSpacing" : "0px",
            "scrolling" : "yes"
        });
        iframe.setStyle( {
            border : "0px"
        });

        renderCloser(div);
        Element.insert(div, iframe);
        Element.insert(rootElem, div);
    }

    function init() {
        renderCloser(container);
        var ele = new Element("div");
        ele.update(text);
        container.appendChild(ele);
        var elemContainer = new Element("ul");
        options.each(function(option) {
            var elem = new Element("li", {
                "id" : option.id
            });
            var link = option.href;
            var push = option.push;
            Event.observe(elem, 'click', function(evt) {
                loadUrl(link, push);
            }.bindAsEventListener(this));
            elem.addClassName("option");
            elem.update(option.text);
            elemContainer.appendChild(elem);
        });
        container.appendChild(elemContainer);

        links.each(function(link) {
            var elem = new Element("a", {
                "href" : "#"
            });
            elem.addClassName("link");
            var img = new Element("img", {
                "id" : link.id,
                "src" : link.img
            });
            Event.observe(img, 'click', function(evt) {
                loadUrl(link.href);
                Event.stop(evt);
                return false;
            }.bindAsEventListener(this));
            elem.appendChild(img);
            container.appendChild(elem);
        });
        rootElem.appendChild(container);
    }

    init();
};