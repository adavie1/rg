
var rg_date_cdn_momentjs = "https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.17.1/moment.min.js" ;
var rg_credit_card_payment_fonts = "https://cdnjs.cloudflare.com/ajax/libs/paymentfont/1.1.2/css/paymentfont.min.css" ;
var rg_markdown_cdn_markdown = "https://cdnjs.cloudflare.com/ajax/libs/markdown-it/8.3.0/markdown-it.min.js" ;

function loadJS(file, callback) {
    // DOM: Create the script element
    var script = document.createElement("script");
    // set the type attribute
    script.type = "application/javascript";
    // make the script element load file
    script.src = file;
    script.onload = callback;
    script.onreadystatechange = callback;
    // finally insert the element to the body element in order to load the script
    document.head.appendChild(script);
}


function toBoolean (bool) {
  if (bool) {
     if (typeof bool === "string") {
        if (bool.toLowerCase() === "true" || bool.toLowerCase() === "false")
           if (bool.toLowerCase() ==="true")
              return true ;
           else
              return false ;
        }
     else if (typeof bool == "boolean")
        return bool ;
     }
  else
    return undefined ;

}

// Single Alert
riot.tag("rg-alert",
    '<div class="c-alert if={opts.type} {\'c-alert--\' + opts.type}"><button ref="closeButton" class="c-button c-button--close"' +
    ' hide={opts.dismissable==false} onclick="{dismiss}">&times;</button>{opts.text}</div>', "", "",
    function(opts) {
        var _this = this;

        this.on("mount", function() {
            if (this.opts.dismissable)
                this.refs.closeButton.hidden = false;
            else
                this.refs.closeButton.hidden = true;

            this.update();
        });


        if (typeof opts.dismissable == "string") {
            opts.dismissable = Boolean(opts.dismissable);
        }

        if (typeof this.opts.dismissable != "boolean") {
            this.opts.dismissable = true;
        }

        if (typeof opts.timeout == "string")
            opts.timeout = Number(opts.timeout);

        if (typeof opts.timeout == "number" && opts.timeout > 0) {
            this.startTimer = function() {
                this.timer = setTimeout(function() {
                    _this.dismiss();
                }, opts.timeout)
            };
            this.startTimer()
        }


        this.dismiss = function(e) {
            if (this.opts.timeout)
                clearTimeout(this.startTimer);

            this.unmount();
        } // onSelect
    });



// Multiple Alets
riot.tag("rg-alerts",
    '<div each="{opts.alerts}"><rg-alert text="{text}" type="{type}" dismissable={dismissable} timeout={timeout}>' +
    '</rg-alert> </div>', "", "",
    function() {});



riot.tag("rg-bubble",
    '<div class="context"> <div class="c-bubble c-bubble--top" if="{isvisible}"> {opts.bubble.text} </div>' +
    ' <div class="content" onmouseover="{showBubble}" onmouseout="{hideBubble}" onclick="{toggleBubble}"> <yield></yield> </div> </div>',
    'rg-bubble .context,[riot-tag="rg-bubble"] .context,[data-is="rg-bubble"] .context,rg-bubble .content,[riot-tag="rg-bubble"]' +
    ' .content,[data-is="rg-bubble"] .content{ display: inline-block; position: relative; } rg-bubble .c-bubble,[riot-tag="rg-bubble"]' +
    ' .c-bubble,[data-is="rg-bubble"] .c-bubble{ position: absolute; top: -70px; left: 50%; transform: translate3d(-50%, 0, 0); }', "",
    function(opts) {
        var _this = this;
        this.showBubble = function() {
            clearTimeout(_this._timer);
            _this.isvisible = true
        };
        this.hideBubble = function() {
            _this._timer = setTimeout(function() {
                _this.isvisible = false;
                _this.update()
            }, 1e3)
        };
        this.toggleBubble = function() {
            _this.isvisible = !_this.isvisible
        }
    });



riot.tag("rg-chart",
    "<canvas></canvas>",
    'rg-chart,[riot-tag="rg-chart"],[data-is="rg-chart"]{ display: inline-block; width: 100%; }', "",
    function(opts) {

        var _this = this;

        Chart.defaults.global.responsive = true;

        this.on("mount", function() {
            drawChart()
        });

        this.on("loaded", function(c) {
            _this.on("unmount", function() {
                c.destroy()
            })
        });

        var drawChart = function drawChart() {
            if (!opts.chart) opts.chart = {};
            var ctx = _this.root.querySelector("canvas").getContext("2d");
            var chart = new Chart(ctx);
            var c = null;
            switch (opts.chart.type) {
                case "line":
                    c = chart.Line(opts.chart.data, opts.chart.options);
                    break;
                case "radar":
                    c = chart.Radar(opts.chart.data, opts.chart.options);
                    break;
                case "polar":
                    c = chart.PolarArea(opts.chart.data, opts.chart.options);
                    break;
                case "pie":
                    c = chart.Pie(opts.chart.data, opts.chart.options);
                    break;
                case "doughnut":
                    c = chart.Doughnut(opts.chart.data, opts.chart.options);
                    break;
                default:
                    c = chart.Bar(opts.chart.data, opts.chart.options);
                    break
            }
            _this.trigger("loaded", c)
        }
    });



riot.tag2("rg-code",
    '<div class="editor"></div>',
    'rg-code .editor,[riot-tag="rg-code"] .editor,[data-is="rg-code"] ' +
    '.editor{ position: absolute; top: 0; right: 0; bottom: 0; left: 0; }', "",
    function(opts) {

        var _this = this;

        if (!opts.editor) opts.editor = {
            code: ""
        };

        var editor = undefined;

        var setupEditor = function setupEditor() {
            editor.setTheme("ace/theme/" + (opts.editor.theme || "monokai"));
            editor.getSession().setMode("ace/mode/" + (opts.editor.mode || "html"));
            editor.getSession().setTabSize(opts.editor.tabsize || 2);
            editor.getSession().setUseSoftTabs(opts.editor.softtabs);
            editor.getSession().setUseWrapMode(opts.editor.wordwrap);
            editor.setReadOnly(opts.editor.readonly)
        };


        this.on("mount", function() {
            editor = ace.edit(_this.root.querySelector(".editor"));
            editor.$blockScrolling = Infinity;
            _this.on("update", function(stuff) {
                setupEditor();
                if (opts.editor.code != editor.getValue()) editor.setValue(opts.editor.code, 1)
            });


            if (opts.url) {
                var req = new XMLHttpRequest;
                req.onload = function(resp) {
                    opts.editor.code = resp;
                    _this.update()
                };
                req.open("get", opts.url, true);
                req.send()
            }

            editor.setValue(opts.editor.code, 1);
            editor.getSession().on("change", function(e) {
                opts.editor.code = editor.getValue();
                _this.trigger("onchange", editor.getValue())
            });

            setupEditor();
            _this.update()
        })
    });


riot.tag("rg-credit-card-number",
    '<input type="text" ref="cardinput" class="c-field card-no {icon} {\'c-field--success\': opts.valid}" ' +
    'oninput="{validate}" placeholder="{opts.placeholder}">',
    'rg-credit-card-number .card-no,[riot-tag="rg-credit-card-number"] ' +
    '.card-no,[data-is="rg-credit-card-number"] .card-no{ padding-right: 60px; ' +
    'background-repeat: no-repeat; background-position: right center; background-size: 60px; } ' +
    'rg-credit-card-number .amex,[riot-tag="rg-credit-card-number"] .amex,[data-is="rg-credit-card-number"]' +
    ' .amex{ background-image: url(img/amex.png); } rg-credit-card-number .diners_club,[riot-tag="rg-credit-card-number"]' +
    ' .diners_club,[data-is="rg-credit-card-number"] .diners_club{ background-image: url(img/diners_club.png); }' +
    ' rg-credit-card-number .discover,[riot-tag="rg-credit-card-number"]' +
    ' .discover,[data-is="rg-credit-card-number"] .discover{ background-image: url(img/discover.png); } rg-credit-card-number' +
    ' .jcb,[riot-tag="rg-credit-card-number"] .jcb,[data-is="rg-credit-card-number"] .jcb{ background-image: url(img/jcb.png); }' +
    ' rg-credit-card-number .mastercard,[riot-tag="rg-credit-card-number"]' +
    ' .mastercard,[data-is="rg-credit-card-number"] .mastercard{ background-image: url(img/mastercard.png); } rg-credit-card-number ' +
    '.visa,[riot-tag="rg-credit-card-number"] .visa,[data-is="rg-credit-card-number"] .visa{ background-image: url(img/visa.png); }', "",
    function(opts) {

        var _this2 = this;

        this.on("update", function() {
            if (_this2.refs.cardinput.value != opts.cardnumber) _this2.refs.cardinput.value = opts.cardnumber;
            _this2.validate()
        });

        this.validate = function() {
            opts.cardnumber = this.refs.cardinput.value;
            var res = validateCreditCard(opts.cardnumber);
            opts.valid = res.valid;
            _this2.icon = opts.valid ? res.card_type.name : ""
        };

        function validateCreditCard(input) {
            var __indexOf = [].indexOf || function(item) {
                for (var i = 0, l = this.length; i < l; i++) {
                    if (i in this && this[i] === item) return i
                }
                return -1
            };

            var card, card_type, card_types, get_card_type, is_valid_length, is_valid_luhn, normalize, validate, validate_number, _i, _len, _ref;

            card_types = [{
                name: "amex",
                icon: "images/amex.png",
                pattern: /^3[47]/,
                valid_length: [15]
            }, {
                name: "diners_club",
                icon: "images/diners_club.png",
                pattern: /^30[0-5]/,
                valid_length: [14]
            }, {
                name: "diners_club",
                icon: "images/diners_club.png",
                pattern: /^36/,
                valid_length: [14]
            }, {
                name: "jcb",
                icon: "images/jcb.png",
                pattern: /^35(2[89]|[3-8][0-9])/,
                valid_length: [16]
            }, {
                name: "laser",
                pattern: /^(6304|670[69]|6771)/,
                valid_length: [16, 17, 18, 19]
            }, {
                name: "visa_electron",
                pattern: /^(4026|417500|4508|4844|491(3|7))/,
                valid_length: [16]
            }, {
                name: "visa",
                icon: "images/visa.png",
                pattern: /^4/,
                valid_length: [16]
            }, {
                name: "mastercard",
                icon: "images/mastercard.png",
                pattern: /^5[1-5]/,
                valid_length: [16]
            }, {
                name: "maestro",
                pattern: /^(5018|5020|5038|6304|6759|676[1-3])/,
                valid_length: [12, 13, 14, 15, 16, 17, 18, 19]
            }, {
                name: "discover",
                icon: "images/discover.png",
                pattern: /^(6011|622(12[6-9]|1[3-9][0-9]|[2-8][0-9]{2}|9[0-1][0-9]|92[0-5]|64[4-9])|65)/,
                valid_length: [16]
            }];


            var options = {};

            if (options.accept == null) {
                options.accept = function() {
                    var _i, _len, _results;
                    _results = [];
                    for (_i = 0, _len = card_types.length; _i < _len; _i++) {
                        card = card_types[_i];
                        _results.push(card.name)
                    }
                    return _results
                }()
            }
            _ref = options.accept;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                card_type = _ref[_i];
                if (__indexOf.call(function() {
                        var _j, _len1, _results;
                        _results = [];
                        for (_j = 0, _len1 = card_types.length; _j < _len1; _j++) {
                            card = card_types[_j];
                            _results.push(card.name)
                        }
                        return _results
                    }(), card_type) < 0) {
                    throw "Credit card type '" + card_type + "' is not supported"
                }
            }
            get_card_type = function(number) {
                var _j, _len1, _ref1;
                _ref1 = function() {
                    var _k, _len1, _ref1, _results;
                    _results = [];
                    for (_k = 0, _len1 = card_types.length; _k < _len1; _k++) {
                        card = card_types[_k];
                        if (_ref1 = card.name, __indexOf.call(options.accept, _ref1) >= 0) {
                            _results.push(card)
                        }
                    }
                    return _results
                }();
                for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
                    card_type = _ref1[_j];
                    if (number.match(card_type.pattern)) {
                        return card_type
                    }
                }
                return null
            };
            is_valid_luhn = function(number) {
                var digit, n, sum, _j, _len1, _ref1;
                sum = 0;
                _ref1 = number.split("").reverse();
                for (n = _j = 0, _len1 = _ref1.length; _j < _len1; n = ++_j) {
                    digit = _ref1[n];
                    digit = +digit;
                    if (n % 2) {
                        digit *= 2;
                        if (digit < 10) {
                            sum += digit
                        } else {
                            sum += digit - 9
                        }
                    } else {
                        sum += digit
                    }
                }
                return sum % 10 === 0
            };
            is_valid_length = function(number, card_type) {
                var _ref1;
                return _ref1 = number.length, __indexOf.call(card_type.valid_length, _ref1) >= 0
            };
            validate_number = function(_this) {
                return function(number) {
                    var length_valid, luhn_valid;
                    card_type = get_card_type(number);
                    luhn_valid = false;
                    length_valid = false;
                    if (card_type != null) {
                        luhn_valid = is_valid_luhn(number);
                        length_valid = is_valid_length(number, card_type)
                    }
                    return {
                        card_type: card_type,
                        valid: luhn_valid && length_valid,
                        luhn_valid: luhn_valid,
                        length_valid: length_valid
                    }
                }
            }(this);
            normalize = function(number) {
                return number.replace(/[ -]/g, "")
            };
            validate = function(_this) {
                return function() {
                    return validate_number(normalize(input))
                }
            }(this);
            return validate(input)
        }
    });




riot.tag("rg-date",
    '<div class="container">' +
    ' <input type="text" class="c-field" onclick="{open}" value="{opts.date.date.format(format)}" readonly>' +
    ' <div class="c-calendar c-calendar--high" if="{opts.date.isvisible}">' +
    ' <button class="c-calendar__control" __disabled="{opts.date.min.isSame(opts.date.date, \'year\')}" onclick="{prevYear}">‹</button>' +
    ' <div class="c-calendar__header">{opts.date.date.format(yearFormat)}</div>' +
    ' <button class="c-calendar__control" __disabled="{opts.date.max.isSame(opts.date.date, \'year\')}" onclick="{nextYear}">›</button>' +
    ' <button class="c-calendar__control" __disabled="{opts.date.min.isSame(opts.date.date, \'month\')}" onclick="{prevMonth}">‹</button>' +
    ' <div class="c-calendar__header">{opts.date.date.format(monthFormat)}</div>' +
    ' <button class="c-calendar__control" __disabled="{opts.date.max.isSame(opts.date.date, \'month\')}" onclick="{nextMonth}">›</button>' +
    ' <div class="c-calendar__day">Mo</div> <div class="c-calendar__day">Tu</div> <div class="c-calendar__day">We</div>' +
    ' <div class="c-calendar__day">Th</div> <div class="c-calendar__day">Fr</div>' +
    ' <div class="c-calendar__day">Sa</div> <div class="c-calendar__day">Su</div>' +
    ' <button class="c-calendar__date {\'c-calendar__date--selected\': day.selected, \'c-calendar__date--today\': day.today}" __disabled="{day.disabled}" each="{day in startBuffer}" onclick="{select}">{day.date.format(dayFormat)}</button>' +
    ' <button class="c-calendar__date c-calendar__date--in-month {\'c-calendar__date--selected\': day.selected, \'c-calendar__date--today\': day.today}" __disabled="{day.disabled}" each="{day in days}" onclick="{select}">{day.date.format(dayFormat)}</button>' +
    ' <button class="c-calendar__date {\'c-calendar__date--selected\': day.selected, \'c-calendar__date--today\': day.today}" __disabled="{day.disabled}" each="{day in endBuffer}" onclick="{select}">{day.date.format(dayFormat)}</button>' +
    ' <button class="c-button c-button--block c-button--primary" __disabled="{opts.date.min.isAfter(moment(), \'day\') || opts.date.max.isBefore(moment(), \'day\')}" onclick="{setToday}">Today</button>' +
    ' </div> </div>',
    'rg-date .container,[riot-tag="rg-date"] .container,[data-is="rg-date"] .container{ position: relative; display: inline-block; cursor: pointer; }' +
    ' rg-date .c-calendar,[riot-tag="rg-date"] .c-calendar,[data-is="rg-date"] .c-calendar{ position: absolute; min-width: 300px; margin-top: .5em; left: 0; }', "",
    function(opts) {
        var _this = this;
        var callbackUsed = false ;

        var toMoment = function toMoment(d) {
            if (!moment.isMoment(d)) d = moment(d);
            if (d.isValid()) return d;
            return moment()
        };

        var handleClickOutside = function handleClickOutside(e) {
            if (!_this.root.contains(e.target)) _this.close();
            _this.update()
        };

        var dayObj = function dayObj(dayDate) {
            var dateObj = dayDate || moment();
            return {
                date: dateObj,
                selected: opts.date.date.isSame(dayDate, "day"),
                today: moment().isSame(dayDate, "day"),
                disabled: opts.date.min && opts.date.min.isAfter(dayDate) || opts.date.max && opts.date.max.isBefore(dayDate)
            }
        };


        var buildCalendar = function buildCalendar() {
            _this.format = "ddd D MMM YYYY";
            _this.yearFormat = "YYYY";
            _this.monthFormat = "MMMM";
            _this.dayFormat = "D";
            _this.days = [];
            _this.startBuffer = [];
            _this.endBuffer = [];

            var begin = moment(opts.date.date).startOf("month");
            var daysInMonth = moment(opts.date.date).daysInMonth();
            var end = moment(opts.date.date).endOf("month");
            for (var i = begin.isoWeekday() - 1; i > 0; i -= 1) {
                var d = moment(begin).subtract(i, "days");
                _this.startBuffer.push(dayObj(d))
            }
            for (var i = 0; i < daysInMonth; i++) {
                var current = moment(begin).add(i, "days");
                _this.days.push(dayObj(current))
            }
            for (var i = end.isoWeekday() + 1; i <= 7; i++) {
                var d = moment(end).add(i - end.isoWeekday(), "days");
                _this.endBuffer.push(dayObj(d))
            }
        };

        // Called when script fully loaded...
        var callback = function callback() {

            if (!opts.date) opts.date = {
                date: moment(),
                min: moment().subtract(1, "year"),
                max: moment().add(10, "year")
            }


            if (!opts.date.date) opts.date.date = moment();
            opts.date.date = toMoment(opts.date.date);
            if (opts.date.min) {
                opts.date.min = toMoment(opts.date.min);
                if (opts.date.min.isAfter(moment(), "day")) {
                    opts.date.date = moment(opts.date.min)
                }
            }

            if (opts.date.max) {
                opts.date.max = toMoment(opts.date.max);
                if (opts.date.max.isBefore(moment(), "day")) {
                    opts.date.date = moment(opts.date.max)
                }
            }

        };


        this.on("before-mount", function() {
            try {
                if (! opts.date)
                   opts.date = {
                               date: moment(),
                               min: moment().subtract(1, "year"),
                               max: moment().add(10, "year")
                               }


                opts.date.date = toMoment(opts.date.date);

                if (opts.date.min) {
                    opts.date.min = toMoment(opts.date.min);

                   if (opts.date.min.isAfter(moment(), "day")) {
                      opts.date.date = moment(opts.date.min)
                      }
                }

                if (opts.date.max) {
                    opts.date.max = toMoment(opts.date.max);

                    if (opts.date.max.isBefore(moment(), "day")) {
                        opts.date.date = moment(opts.date.max)
                    }
                }

            } catch (ex) {
                callbackUsed = true ;
                loadJS(rg_date_cdn_momentjs, callback);
            }

        if (callback) {
          if (!opts.date) opts.date = {
              date: new Date(),
              min: new Date(),
              max: new Date()
          }

        }
        else {
          if (!opts.date) opts.date = {
              date: moment(),
              min: moment().subtract(1, "year"),
              max: moment().add(10, "year")
          }

        }

        });



        this.on("mount", function() {

        });


        _this.on("update", function() {
            opts.date.date = toMoment(opts.date.date);
            buildCalendar();
            positionDropdown()
        });


        this.on("unmount", function() {
            document.removeEventListener("click", handleClickOutside)
        });



        this.open = function() {
            opts.date.isvisible = true;
            _this.trigger("open")
        };



        this.close = function() {
            if (opts.date.isvisible) {
                opts.date.isvisible = false;
                _this.trigger("close")
            }
        };


        this.select = function(e) {
            opts.date.date = e.item.day.date;
            _this.trigger("select", opts.date.date)
        };


        this.setToday = function() {
            opts.date.date = moment();
            _this.trigger("select", opts.date.date)
        };


        this.prevYear = function() {
            opts.date.date = opts.date.date.subtract(1, "year")
        };


        this.nextYear = function() {
            opts.date.date = opts.date.date.add(1, "year")
        };


        this.prevMonth = function() {
            opts.date.date = opts.date.date.subtract(1, "month")
        };


        this.nextMonth = function() {
            opts.date.date = opts.date.date.add(1, "month")
        };


        function getWindowDimensions() {
            var w = window,
                d = document,
                e = d.documentElement,
                g = d.getElementsByTagName("body")[0],
                x = w.innerWidth || e.clientWidth || g.clientWidth,
                y = w.innerHeight || e.clientHeight || g.clientHeight;
            return {
                width: x,
                height: y
            }
        }


        var positionDropdown = function positionDropdown() {
            var w = getWindowDimensions();
            var m = _this.root.querySelector(".c-calendar");
            if (!m) return;
            if (!opts.date.isvisible) {
                m.style.marginTop = "";
                m.style.marginLeft = "";
                return
            }

            var pos = m.getBoundingClientRect();
            if (w.width < pos.left + pos.width) {
                m.style.marginLeft = w.width - (pos.left + pos.width) - 20 + "px"
            }
            if (pos.left < 0) {
                m.style.marginLeft = "20px"
            }
            if (w.height < pos.top + pos.height) {
                m.style.marginTop = w.height - (pos.top + pos.height) - 20 + "px"
            }
        }

        document.addEventListener("click", handleClickOutside);

    });




/*
Adds functionality for footers etc.

Example usage:

... HTML:
      <rg-drawer subheading="Something or other" position="bottom">
        The <b>contents</b> of my own special drawer.
      </rg-drawer>

     <br / />
     Some random text.
    </div>

--- SCRIPT:
        var tags = riot.mount('rg-drawer', {
          drawer: {
            header: "My Drawer Title",
            subheading: "Hello there!",
            items : [
                 {text: "items 1"},
                 {text: "Items 2"}
               ],
            footer:{
                 items : [
                      {text: "Press 1"},
                      {text: "Press 2"}
                    ]
                 }
           }
        });
*/
riot.tag("rg-drawer",
    '<div class="c-overlay c-overlay--dismissable" if="{opts.drawer.isvisible}" onclick="{close}"></div>' +
    ' <div class="o-drawer u-highest {\'o-drawer--\' + opts.drawer.position || \'c-drawer--top\'} {\'o-drawer--visible\': opts.drawer.isvisible}">' +
    ' <div class="c-card">' +
    ' <header class="c-card__header">' +
    '<h2 class="c-heading c-heading--xsmall">{opts.drawer.header}' +
    '<div class="c-heading__sub">{opts.drawer.subheading}</div>' +
    '</h2>' +
    '</header>' +
    ' <ul class="c-card--menu"> <li class="c-card__item {\'c-card__item--active\': active}" each="{opts.drawer.items}" onclick="{parent.select}"> {text} </li> </ul>' +
    ' <div class="c-card__body"> <yield></yield> </div>' +
    '</div>' +
    '<div class="c-card__footer">' +
    '<div class="c-input-group"> <button class="c-button c-button--block" each="{opts.drawer.footer.items}" onclick="{parent.select}"> {text} </button>' +
    ' </div></div></div>', "", "",
    function(opts) {
        var _this = this;

        this.on("before-mount", function() {
          if (!opts.drawer) {
              opts.drawer = {
              header: "Notice",
              subheading: undefined,
              position: "top",
              isvisible: true,
              footer: []
            }
          }
            if (!opts.drawer.footer) {
                footer: []
            }

            if (opts.header)
               opts.drawer.header = opts.header ;

            if (opts.subheading)
               opts.drawer.subheading = opts.subheading ;

            if (opts.position)
               opts.drawer.position = opts.position ;
        })



        this.close = function() {
            opts.drawer.isvisible = false;
            _this.trigger('close');
        };

        this.select = function(e) {
            opts.drawer.items.forEach(function(item) {
                return item.active = false
            });
            e.item.active = true;
            _this.trigger("select", e.item)
        }
    });



riot.tag("rg-ga", "", "", "", function(opts) {
    (function(i, s, o, g, r, a, m) {
        i["GoogleAnalyticsObject"] = r;
        i[r] = i[r] || function() {
            (i[r].q = i[r].q || []).push(arguments)
        }, i[r].l = 1 * new Date;
        a = s.createElement(o), m = s.getElementsByTagName(o)[0];
        a.async = 1;
        a.src = g;
        m.parentNode.insertBefore(a, m)
    })(window, document, "script", "//www.google-analytics.com/analytics.js", "ga");
    ga("create", opts.property, "auto");
    ga("send", "pageview")
});



riot.tag2("rg-iframify",
    '<div class="iframify"> <div class="frame"> <yield></yield> </div> </div>',
    'rg-iframify .iframify,[riot-tag="rg-iframify"] .iframify,[data-is="rg-iframify"] .iframify{ margin: 0; padding: 0; }' +
    ' rg-iframify iframe,[riot-tag="rg-iframify"] iframe,[data-is="rg-iframify"] iframe{ position: relative; width: 100%; border: 0; }', "",
    function(opts) {
        var _this = this;
        this.on("mount", function() {
            iframify(_this.root.querySelector(".frame"), _this.opts)
        })
    });



riot.tag("rg-include", "<div> {responseText} </div>", "", "", function(opts) {
    var _this = this;

    var fetch = function fetch() {
        var req = new XMLHttpRequest;
        req.onload = function(resp) {
            if (opts.unsafe) _this.root.innerHTML = req.responseText;
            else _this.responseText = req.responseText;
            _this.update();
            _this.trigger("loaded")
        };

        req.open("get", opts.url, true);
        req.send();
        _this.trigger("loading")
    };

    this.on("mount", function() {
        fetch()
    })
});


riot.tag("rg-map", '<div ref="{opts.id}" class="rg-map" style="width: 100%; min-height: 10vh; height: 85vh;"></div>', 'rg-map .rg-map,[riot-tag="rg-map"] .rg-map,[data-is="rg-map"] .rg-map{ margin: 0; padding: 0; width: 100%; height: 100%; } rg-map .rg-map img,[riot-tag="rg-map"] .rg-map img,[data-is="rg-map"] .rg-map img{ max-width: inherit; }', "", function(opts) {
    var _this = this;
    var _script_id = "rg_map_script_unqiue"; // Unique reference, to ensure Google APIs pulled in only once.

    window.rg = window.rg || {};
    window.rg.gmap = riot.observable({
        initialize: function initialize() {
            window.rg.gmap.trigger("initialize")
        }
    });


    this.on("before-mount", function() {
        if (!opts.map)
            opts.map = {
                center: {
                    lat: (opts.lat ? Number(opts.lat) : -34.397),
                    lng: (opts.lng ? Number(opts.lng) : 50.644)
                },
                zoom: 7
            }

        if (!opts.id)
            opts.id = "rg_map_id_" + Date.now();

        if (opts.apikey && !opts.map.apikey)
            opts.map.apikey = opts.apikey;

        if (opts.lat && opts.map && opts.map.center.lat)
            opts.map.center.lat = (opts.lat ? Number(opts.lat) : opts.map.center.lat);

        if (opts.lng && opts.map && opts.map.center.lng)
            opts.map.center.lng = (opts.lng ? Number(opts.lng) : opts.map.center.lng);

        if (opts.zoom && opts.map)
            opts.map.zoom = (opts.zoom ? Number(opts.zoom) : (opts.map.zoom ? opts.map.zoom : 8));

        if (opts.type && opts.map)
            opts.map.mapTypeId = (opts.type ? opts.type : (opts.map.mapTypeId ? opts.map.mapTypeId : "roadmap"));

        if (opts.tilt && opts.map)
            opts.map.tilt = (opts.tilt ? Number(opts.tilt) : (opts.map.tilt ? opts.map.tilt : 45));

        if (opts.heading && opts.map)
            opts.map.heading = (opts.heading ? Number(opts.heading) : (opts.map.heading ? opts.map.heading : 90));

    }); // on before-mount



    this.on("mount", function() {

        rg.gmap.on("initialize", function() {
            e1 = _this.root.querySelector(".rg-map");
            e2 = _this.refs[0];
            opts.map.mapObj = new google.maps.Map(e1, opts.map);
            _this.trigger("loaded", opts.map.mapObj)
        });


        if (!document.getElementById(_script_id)) {
            var script = document.createElement("script");
            script.setAttribute("id", _script_id);
            script.type = "text/javascript";
            script.src = "https://maps.googleapis.com/maps/api/js?key=" + opts.apikey + "&callback=window.rg.gmap.initialize";
            document.body.appendChild(script)
        }
    }) // on mount

});




riot.tag("rg-markdown", "", "", "", function(opts) {
    var _this = this;
    var md ;


    var callback = function callback () {
      if (markdownit) {

//          _this.reader = new commonmark.parse;
//          _this.writer = new commonmark.renderer
      }

      if (!opts.markdown) opts.markdown = {};
      if (opts.markdown.content) {
         md = markdownit({
            html: true,
            linkify: true,
            typographer: true
          });

  //        _this.root.innerHTML = _this.writer.render(_this.reader.parse(opts.markdown.content))
          _this.root.innerHTML = md.render(opts.markdown.content)
      } else if (opts.markdown.url) {
          (function() {
              var req = new XMLHttpRequest;
              req.onload = function(resp) {
//                  _this.root.innerHTML = _this.writer.render(_this.reader.parse(req.responseText));
                  _this.root.innerHTML = md.render(req.responseText);
                  _this.trigger("loaded")
              };
              req.open("get", opts.markdown.url, true);
              req.send();
              _this.trigger("loading")
          })()
      }
    }


    this.on("before-mount", function() {

        if (!opts.markdown) {
            opts.markdown = {
                content: (opts.content ? opts.content : "")
            }
        }

        if (opts.content) {
            opts.markdown.content = opts.content;
        }

        if (this.__.innerHTML)
            opts.markdown.content = this.__.innerHTML;


    });


    this.on("mount", function() {

      if (typeof markdownit === "undefined")
         loadJS(rg_markdown_cdn_markdown, callback);
      else
         callback() ;
    });

});

/*

'<div class="c-overlay {c-overlay--dismissable: opts.modal.dismissable}" if="{opts.modal.isvisible}" onclick="{close}"></div>'+
'<div class="o-modal {o-modal--ghost: opts.modal.ghost}" if="{opts.modal.isvisible}">'+
'<header class="c-card__header"> '+
'<button if="{opts.modal.dismissable}" type="button" class="c-button button--close" onclick="{close}"> &times; </button>'+
'<h3 class="c-heading c-heading--small">{opts.modal.heading}</h3> </header>'+
'<div class="c-card__body"> <yield></yield> </div>'+
'<footer class="c-card__footer {\'c-card__footer--block\': !opts.modal.ghost}">'+
'<button each="{opts.modal.buttons}" type="button" class="c-button {\'c-button--\' + type}" onclick="{action}" riot-style="{style}"> {text} </button> </footer> </div>',
*/

riot.tag("rg-modal",
    '<div class="c-overlay {c-overlay--dismissable: opts.modal.dismissable}"  if="{opts.modal.isvisible}" onclick="{close}">' +
    '<div class="c-overlay">' +
    '<div class="o-modal {o-modal--ghost: opts.modal.ghost} {o-modal--full: opts.modal.full}" if="{opts.modal.isvisible}">' +
    '<div class="c-card">' +
    '<header class="c-card__header">' +
    '<button if="{opts.modal.dismissable}" type="button" class="c-button c-button--close" onclick="{close}">&times;</button>' +
    '<h2 class="c-heading">{opts.modal.heading}</h2>' +
    '</header>' +
    '<div class="c-card__body o-panel">' +
    '<yield></yield>' +
    '</div>' +
    '<footer class="c-card__footer" {\'c-card__footer--block\': !opts.modal.ghost}">' +
    '<div class="c-input-group">' +
    '<button each="{opts.modal.buttons}" type="button" class="c-button {c-button--block: blockbuttons} {\'c-button--\' + type}" onclick="{action}" riot-style="{style}"> {text} </button>' +
    '</div>' +
    '</footer>' +
    '</div>' +
    '</div>',
    'rg-modal .o-modal--ghost .o-modal__footer .c-button,[riot-tag="rg-modal"] .o-modal--ghost .c-card__footer' +
    ' .c-button,[data-is="rg-modal"] .o-modal--ghost .c-card__footer .c-button{ margin: 0 .5em 0 0; }', "",
    function(opts) {

        var _this = this;

        this.on("before-mount", function() {

            if (!opts.modal)
                opts.modal = {
                    /*
                    isvisible: ((typeof opts.visible == "undefined") ? Boolean(opts.visible) : true),
                    dismissable: ((typeof opts.dismissable == "undefined") ? Boolean(opts.dismissable) : true),
                    full: ((typeof opts.fullscreen == "undefined") ? Boolean(opts.fullscreen) : false),
                    ghost: ((typeof opts.ghost == "undefined") ? Boolean(opts.ghost) : false),
                    */
                    isvisible: true,
                    dismissable: true,
                    full: false,
                    ghost: false,
                    heading: (opts.heading ? opts.heading : 'Note'),
                    buttons: [{
                        text: 'Close',
                        type: 'brand',
                        action: function() {
                            this.close()
                        }
                    }],
                    blockbuttons: true
                }
        });

        this.close = function() {
            if (opts.modal.dismissable) {
                opts.modal.isvisible = false;
                _this.trigger("close");
            }
        }
    });


riot.tag("rg-pagination",
'<div class="c-pagination">'+
'     <div class="c-pagination__controls c-pagination__controls--backward">'+
'       <button class="c-pagination__control" disabled="{opts.pagination.page <= 1}" onclick="{first}">«</button>'+
'       <button class="c-pagination__control" disabled="{opts.pagination.page <= 1}" onclick="{back}">‹</button>'+
'     </div>'+
'     <div class="c-pagination__controls">'+
'       <span class="c-pagination__ellipsis" if="{opts.pagination.page > 2}">&hellip;</span>'+
'         <button class="c-pagination__page" onclick="{back}" if="{opts.pagination.page > 1}">{opts.pagination.page - 1}</button>'+
'         <button class="c-pagination__page c-pagination__page--current">{opts.pagination.page}</button>'+
'         <button class="c-pagination__page" onclick="{forward}" if="{opts.pagination.page < opts.pagination.pages}">{opts.pagination.page + 1}</button>'+
'         <span class="c-pagination__ellipsis" if="{opts.pagination.page < opts.pagination.pages - 1}">&hellip;'+
'        </span>'+
'       </div>'+
'     <div class="c-pagination__controls pagination__controls--forward">'+
'       <button class="c-pagination__control" disabled="{opts.pagination.page >= opts.pagination.pages}" onclick="{forward}">›</button>'+
'       <button class="c-pagination__control" disabled="{opts.pagination.page >= opts.pagination.pages}" onclick="{last}">»</button>'+
'     </div>'+
'</div>'
 , "", "",
 function(opts) {
    var _this = this;

    this.on("before-mount", function(){
      if (!opts.pagination){
          pagination = {
            pages: 10,
            page: 1
            }
         }

    if (opts.page && opts.pages) {

       opts.page = Number(opts.page) ;
       opts.pages = Number(opts.pages) ;

       if (opts.page > opts.pages)
          opts.page = opts.pages;

        }

    if (opts.page)
       opts.pagination.page = Number(opts.page) ;

    if (opts.pages)
       opts.pagination.pages = Number(opts.pages) ;


    }) ;

    this.on("page", function() {
        var btns = _this.root.querySelectorAll("button");
        for (var i = 0; i < btns.length; i++) {
            btns[i].blur()
        }
    });

    this.forward = function() {
        opts.pagination.page++;
        _this.trigger("page", opts.pagination.page)
    };

    this.back = function() {
        opts.pagination.page--;
        _this.trigger("page", opts.pagination.page)
    };

    this.first = function() {
        opts.pagination.page = 1;
        _this.trigger("page", opts.pagination.page)
    };

    this.last = function() {
        opts.pagination.page = opts.pagination.pages;
        _this.trigger("page", opts.pagination.page)
    }
});



riot.tag("rg-phone-sim", '<div class="emulator"> <iframe class="screen" riot-src="{opts.phonesim.url}"><yield /></iframe> </div>',
 'rg-phone-sim .emulator,[riot-tag="rg-phone-sim"] .emulator,[data-is="rg-phone-sim"] .emulator{ position: relative; width: 365px; height: 792px; background-image:'+
 'url(\'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAW0AAAMYCAMAAAA3r0ZLAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAwBQTFRFMDk6+vr6KTM0lJucMz4/PklKJS8wLTg5Qk1O'+
 'xsjILzo7gomJ2NvbdH5/ho2O9fb2KzY3ztHRPEdIOkVGZWxtjJSVOEJDkpeYWGRluL2+KTQ1vcHBoaWlPUZHcnp6nKKjOkRF1NfXqa2tp62tZnBxanV2VmFiZ29wVl1eaXJzbXR04uTktbq7QElK1tnZipKTi5CRTlZXpKioo'+
 '6mqXmlqUVlaOEFCSVFSUFxdISssT1tcTlpbJC4vIiwtTVlaJjAxIy0uTFhZS1dYJzEyKDIzSlZXPUhJOURFO0ZHSVVWKzU2P0pLKjQ1OENEND0+QEtMLDY3SFRVN0JDQ05PLTc4ND9ANUBBQUxNNkFCR1NUMTo7RE9QLjg5'+
 'N0BBR1JTRlJTLzk6RVFSMjs8RVBRRlFSNj9AMzw9SFNUMj0+IissMTs8MDo7SVRVRFBRMDs8MTw9IiwsMz0+Mjw9SlVWQ09QLjk6NT4/S1ZXND4/JC4uQU1OIy0tQk5PTFdYTVhZQExNTllaJS8vJzIyP0tMLzg5LDc4KDMzNT'+
 '9AKjU1N0FCNkBBJjAwIywtMDs7Mj09NkFBJjExLjk5LDc3N0JCNUBAKjU2MTw8LDU2Ljc4OUNEKDEyQU1NPEhIPEhJO0dHOkZGND8/Qk5ORFBQQ09PLTY3OUREPkpKPkpLPUlJT1pbP0tLJTAwPUlKJzAxKjM07u/vKTIzsbW2YGprtLm'+
 '50tXWPkhJo6endn+A3d/f6uvreoOEg4yN2tvc/Pz8n6am8/T0VFtcm6CgJS4v4OLi5ufnYGdncnt8dHp7gYaHJC0uu8DAjJGRQkxNxMfHKzQ1YGtsS1NUaXN0bnh5yMzMyszMy83Oy8/PdoCAKDIy7O3tT1dYuLu70NTUbXd46Onq6erreoC'+
 'A2dzc8PHx8vPz5OXlnaSkn6Wmqq6ucHZ2t7y8o6eoeoSEkJaWm5+gW2ZnZG5vqa+wOEFB09bWtru7qrCwcXd4t7u83eDgzM7O7/DwNT4+7e7uwMPDwcPEeH5/////70wnUQAAAQB0Uk5T'+
 '//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////'+
 '//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////'+
 'AFP3ByUAAA+NSURBVHja7N13nBTlGcDxEQI5AmJQBAkcnqhEDIhoWMt5iogmQbOaYNrqYrJh16gplmTVkILJpYCmF+DSE1JIcjRR7L333ntPYjQxvTl55tnr7N7t7uw+vDP3+/0x3G3hs5+vr++8M7s7eH75Xb5x+rOjN017aeq+tO++U'+
 '1+atmn0s9M3Xl6BoFfm466ZOPROhIt259CJ19RS++7LdgW133a97O7aaI/a+VE0y+jRnUeF1p6wqfvvaz6+YVjT0jMyJ3rkeSdmzljaNKzh+OZuoE0TQmmvv67zLzrwmMY8wkXLNx5zYCfTdeur1p6wdeegblgKar8tbegc4lv/rirtjTMLT99'+
 '/UVMKzgFLNS3avwA2c2Pl2n8tPHV1QxLJMks2rC6g/alC7ScvKozrhhyIFZRrKIzvi56sRHt94b/RIsZ1xeN7UYFuffna4/UJB68Er4rGHax648vUfmqkPnxBBrmqyixQv5FPlaP9Dz2eWdIEW9U1LdFjnQsG1n5ETz4dyowdavY+VE9XPTKQ9phddP'+
 'fICjvk6lt3lruM6V97j132l26BK3S3BJAv79Gf9jN3BY85HKsadHhAedebSmtf+ofgEcOQqknDAsyLLi2pPTq4/0icatSRAefoUto7Bvc2oFSzGgLQHYtr3xTct5DVSA1XJgsD0puKaa99s9wzlwPImh5WzhXTl/5TRHt7uaN5GUI1bVmzqL64ufZfgkF/GD'+
 '417rCA9e99tf8VzCPHoVPzjhPXaVv10d5bblzCyZE6nDIJ5pKde2u/Egz487Cp1zHlHr20h8otp50ETT2WgaeL7dCe2vcF/uOQqUsrA9z7emgHQ3thdEZLLpeL0kHYwq7BrdqjAv2ofEAnlU0EZaPjvTTgHdWlvXeEhnYu0VkuUoN7707tbW6X35oiciyc6C4y'+
 'ZxmaxPf2bTq0z5VfTo/IC8/20M5GZnAHy5JzO7Tvj85bCKlEzyIzdQdvLNxf0L4wmMQjMgnmemlHZubOBcQXqvb0CO0jk720o3OmIdhPTlft4FTrth5ju55tK8bbq/YG+emUiLzqTC/t6Lz1cYoYbwi0r47QisTz0j2w0xE6ngxWJVeLdrD+WxCZVx3J9ba0QNeAnj'+
 '9T/twuOi87GcF9pLSdKM8U7Q2rV6+O0jcQMoXJJB2t96tzorzB99Y2NzfPjdQL9zLJZDJynw2YK85rvZ1ku9Cjuq+4xXknb4Js+XxU/WsQ5wnec7LlDcn6d544P+ddLFu+zlT/Vorzxd5k2fIJqfq3TJwney/Lls+RGBwniPPL3g6y5aOWBstWcd7BmypbLjhS/1Li'+
 'PNWTTTMWBik02mijTWijTWijjTbFVTuZTqSTRW8OUzqJdpGyxT89mU2ELYv25kO4+LvnyUT4kmj3LV38YzjpGmin3dReIm2pF9BlU+LmMDmnrdBbUntQje0trj2o5m2FPlBiTWKQQm9R7cG03nZAexCFNtpoE9poE9poo01oo01oo01oo4021VT7MxIUBik02mijTeG1D'+
 '5agMEih0UYbbUIbbUIbbbQJbbQJbbQJbbTRplppf1qCwiCFRhtttCm89lwJCoMUGm200Sa00Sa00Uab0Eab0Eab0EY73tqnS1AYpNBoo402hdc+VILCIIVGG220CW20CW200Sa00Sa00aYC9GkSFAYpNNpoo01oR0v7bRIUBik02mijTWijTWijjTahjTah7bL2hyUoDFJot'+
 'NFGm9BGm0ppv0OCwiCFRhtttAlttAlttNEmtOOhfbwEhUEKjTbaaBPaaBPaLmi/T4LCIIVGG220CW20CW200ab6aS+UoDBIodFGG21CG21C2wXt4yQoDFJotNFGm9BGm9BGe7BpL5KgMEih0UYbbUIbbULbBe0PSFAYpNBoo402oY02oY32YNP+oASFQQqNNtpoE9poE9poDzbtj'+
 '0hQGKTQaKONNqGNNpXS/qkEhUEKfYwEhUEKjTbaaBPaaBPaaA827Y9LUBik0GijjTahHS3tn0lQGKTQCyQoDFJotNFGm9BGm9BGG22qn/anJCgMUmi00Uabwmv/RILCIIVukKAwSKHRRhttQhttQhtttKl+2p+UoDBIodFGG20Kr/09CQqDFPo9EhQGKTTaaKNNaKNNaKONNtVP+7'+
 'MSFAYpNNpoo03htY+UoDBIodFGG21CG21CG220Ce14aH9egsIghUYb7bhq/1qCwiCFPlyCwiCFRhtttAlttAlttNEmtNGmSrV/KUFhkEL/QoLCIIUeJkFhkEKjjTbahDbahDbaaBPaaFOl2r+VoDBIoX8lQWGQQh8mQWGQQqONNtqENtqENtpoE9poE9oua/9AgsIghf6+BIVBCr2tBIV'+
 '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\');'+
 ' background-repeat: no-repeat; background-position: center; background-size: cover; } rg-phone-sim .screen,[riot-tag="rg-phone-sim"] .screen,[data-is="rg-phone-sim"] .screen{ position: absolute; top: 105px; left: 22px; background-color: white; width: 320px; height: 568px; border: 0; }', "",
   function(opts) {
     this.on("before-mount", function (){

       if (!opts.phonesim)
          opts.phonesim = {url: undefined}

       if (opts.url)
             opts.phonesim.url = opts.url ;

     }) ;

   });




riot.tag("rg-placeholdit",
          '<img riot-src="https://placeholdit.imgix.net/~text?bg={opts.placeholdit.background}'+
          '&txtclr={opts.placeholdit.color}&txt={opts.placeholdit.text}'+
          '&txtsize={opts.placeholdit.textsize}&w={opts.placeholdit.width}'+
          '&h={opts.placeholdit.height}&fm={opts.placeholdit.format}">', "", "",
          function(opts) {

    this.on("before-mount", function() {
        if (!opts.placeholdit) opts.placeholdit = {};
        opts.placeholdit.width = opts.placeholdit.width || 450;
        opts.placeholdit.height = opts.placeholdit.height || 250;
        opts.placeholdit.background = opts.placeholdit.background || "000";
        opts.placeholdit.color = opts.placeholdit.color || "fff";
        opts.placeholdit.text = opts.placeholdit.text || opts.placeholdit.width + " x " + opts.placeholdit.height;
        opts.placeholdit.textsize = opts.placeholdit.textsize || 30;
        opts.placeholdit.format = opts.placeholdit.format || "png"

        if (opts.width)
           opts.placeholdit.width = Number(opts.width) ;

        if (opts.height)
          opts.placeholdit.height = Number(opts.height) ;

        if (opts.background)
           opts.placeholdit.background = opts.background ;

        if (opts.color)
           opts.placeholdit.color = opts.color ;

        if (opts.text)
          opts.placeholdit.text = opts.text ;

        if (opts.textsize)
           opts.placeholdit.textsize = Number(opts.textsize) ;

        if (opts.format)
           opts.placeholdit.text = opts.format ;

    })
});



riot.tag2("rg-raw", "<span></span>", "", "", function(opts) {
    this.on("mount update", function() {
        this.root.innerHTML = opts.content || ""
    })
});


/*
Note! Depends on rg-utils.js

HTML:
<rg-select></rg-select>
<rg-select filter="true"></rg-select>
<rg-select filter=true></rg-select>

Script:
var tags = riot.mount('rg-select', {
  select: {
    placeholder: 'Please select a card',
    filter: 'text', // <-- this enables filtering on the 'text' property
    options: [{
      id: 0,
      text: 'Visa'
    }, {
      id: 1,
      text: 'MasterCard'
      //selected: true
    }, {
      id: 2,
      text: 'American Express'
    }, {
      id: 3,
      text: 'Discover'
    }]
  }
})

tags[0].on('open', function () {console.log("open") })
       .on('close', function () { console.log("close") })
       .on('select', function (item) { console.log("item=", item) })
*/
riot.tag("rg-select", '<input type="{opts.select.filter ? \'search\' : \'text\'}"'+
                 ' ref="selectfield" class="c-field" placeholder="{opts.select.placeholder}"'+
                 ' onkeydown="{navigate}" oninput="{filterOptions}" onfocus="{open}" __readonly="{!opts.select.filter}">'+
   ' <ul class="c-card c-card--menu u-high" if="{opts.select.isvisible}">'+
     ' <li each="{options}" no-reorder onclick="{parent.select}" class="c-card__item {\'c-card__item--active\': selected,'+
      ' \'c-card__item--disabled\': disabled, \'c-card--menu__item--hover\': active}"> {text}'+
      ' </li>'+
    ' </ul>',
    'rg-select .c-card--menu,[riot-tag="rg-select"] .c-card--menu,[data-is="rg-select"] .c-card--menu{ position: relative; }', "",
function(opts) {
    var _this = this;

    if (!opts.select) opts.select = {
        options: []
    };

    var handleClickOutside = function handleClickOutside(e) {
        if (!_this.root.contains(e.target)) _this.close();
        _this.update()
    };


    var applyFieldText = function applyFieldText() {
        for (var i = 0; i < opts.select.options.length; i++) {
            var item = opts.select.options[i];
            if (item.selected) {
                _this.refs.selectfield.value = item.text;
                break
            }
        }
    };


    this.filterOptions = function() {
        _this.options = opts.select.options;
        if (opts.select.filter) _this.options = _this.options.filter(function(option) {
            var attr = option[opts.select.filter];
            return attr && attr.toLowerCase().indexOf(_this.refs.selectfield.value.toLowerCase()) > -1
        });
        _this.trigger("filter", _this.refs.selectfield.value)
    };

    function getWindowDimensions() {
        var w = window,
            d = document,
            e = d.documentElement,
            g = d.getElementsByTagName("body")[0],
            x = w.innerWidth || e.clientWidth || g.clientWidth,
            y = w.innerHeight || e.clientHeight || g.clientHeight;
        return {
            width: x,
            height: y
        }
    } ;

    var positionDropdown = function positionDropdown() {
        var w = getWindowDimensions();
        var m = _this.root.querySelector(".c-card--menu");
        if (!m) return;
        if (!opts.select.isvisible) {
            m.style.marginTop = "";
            m.style.marginLeft = "";
            return
        } ;

        var pos = m.getBoundingClientRect();

        if (w.width < pos.left + pos.width) {
            m.style.marginLeft = w.width - (pos.left + pos.width) - 20 + "px"
        }

        if (pos.left < 0) {
            m.style.marginLeft = "20px"
        }
        if (w.height < pos.top + pos.height) {
            m.style.marginTop = w.height - (pos.top + pos.height) - 20 + "px"
        }
    };


    this.navigate = function(e) {
        if ([13, 38, 40].indexOf(e.keyCode) > -1 && !opts.select.isvisible) {
            e.preventDefault();
            _this.open();
            return true
        }

        var length = _this.options.length;

        if (length > 0 && [13, 38, 40].indexOf(e.keyCode) > -1) {
            e.preventDefault();
            var activeIndex = null;
            for (var i = 0; i < length; i++) {
                var item = _this.options[i];
                if (item.active) {
                    activeIndex = i;
                    break
                }
            }
            if (activeIndex != null) _this.options[activeIndex].active = false;
            if (e.keyCode == 38) {
                if (activeIndex == null || activeIndex == 0) _this.options[length - 1].active = true;
                else _this.options[activeIndex - 1].active = true
            } else if (e.keyCode == 40) {
                if (activeIndex == null || activeIndex == length - 1) _this.options[0].active = true;
                else _this.options[activeIndex + 1].active = true;
            } else if (e.keyCode == 13 && activeIndex != null) {
                _this.select({
                    item: _this.options[activeIndex]
                })
            }
        }
        return true
    };


    this.open = function() {
        opts.select.isvisible = true;
        _this.trigger("open")
    };


    this.close = function() {
        if (opts.select.isvisible) {
            opts.select.isvisible = false;
            _this.trigger("close")
        }
    };

    this.select = function(e) {
        opts.select.options.forEach(function(i) {
            return i.selected = false
        });
        e.item.selected = true;
        applyFieldText();
        _this.filterOptions();
        opts.select.isvisible = false;
        _this.trigger("select", e.item)
    };


    this.on("before-mount", function() {
         if (opts.filter) {
             filter = toBoolean (opts.filter) ;

             if (filter)
                opts.select.filter = "text";
             else
               opts.select.filter = undefined ;
         }

         if (opts.placeholder)
            opts.select.placeholder = opts.placeholder ;
    });


    this.on("mount", function() {
        applyFieldText();
        _this.filterOptions();
        document.addEventListener("click", handleClickOutside);
        _this.update()
    });

    this.on("update", function() {
        if (!opts.select.filter) applyFieldText();
        positionDropdown()
    });

    this.on("unmount", function() {
        document.removeEventListener("click", handleClickOutside)
    })
});



riot.tag("rg-tabs",
    '<div class="c-tabs {\'c-tabs--\' + opts.tabs.type}">'+
    '   <div class="c-tabs__headings"> '+
    '     <div each="{opts.tabs.tabs}" class="c-tab-heading {\'c-tab-heading--active\': active, \'c-tab-heading--disabled\': disabled}"'+
                   ' onclick="{parent.open}"> {heading}'+
    '     </div>'+
    '   </div>'+
    '   <div each="{opts.tabs.tabs}" class="c-tabs__tab {\'c-tabs__tab--active\': active}">'+
    '     <div if="{text}"> {text} </div> <div if="{include}"> {include.responseText}'+
    '     </div>'+
    '   </div>'+
    '</div>', "", "",
    function(opts) {
    var _this = this;

    var fetch = function fetch(tab) {
        var req = new XMLHttpRequest;
        req.onload = function(resp) {
            var activeTab = _this.root.querySelector(".c-tabs__tab--active");
            if (activeTab) activeTab.innerHTML = req.responseText;
            _this.trigger("loaded", tab)
        };
        req.open("get", tab.include, true);
        req.send();
        _this.trigger("loading", tab)
    };


    this.open = function(e) {
        var tab = e.item;
        if (!tab.disabled && !tab.active) {
            opts.tabs.tabs.forEach(function(tab) {
                tab.active = false
            });
            _this.trigger("open", tab);
            tab.active = true
        }
    };

    this.on("before-mount", function(){
      if (!opts.tabs)
         opts.tabs = {type: 'default', tabs: []} ;

    if (opts.type)
       opts.tabs.type = opts.type ;

    });


    this.on("update", function() {
        if (!opts.tabs) opts.tabs = {};
        if (!Array.isArray(opts.tabs.tabs)) return;
        opts.tabs.tabs.forEach(function(tab) {
            if (!tab.disabled && tab.active && tab.include) {
                fetch(tab)
            }
        })
    })
});


/*
Note! Depends on rg-utils.js

HTML:
<rg-tags></rg-tags>
<rg-tags type="error"></rg-tags>
<rg-tags type="error" filter=true></rg-tags>
<rg-tags type="error" placeholder="Nyah! Nyah! Na Na Na!"></rg-tags>

Script:
    var tags = riot.mount('rg-tags', {
      tags: {
        type: "brand",
        placeholder: 'Choose a country',
        filter: 'text', // <-- this enables filtering on the 'text' property
        options: [{
          text: 'England',
          type: 'info'
        }, {
          text: 'Scotland',
        }, {
          text: 'Ireland',
          type: 'warning'
        }, {
          text: 'Wales',
          type: 'success'
        }],
        tags: [{
          text: 'United States',
        }]
      }
    })

    tags[0].on('open', function () { console.log("open") })
           .on('close', function () { console.log("close") })
           .on('select', function (item) { console.log("select", item) })
*/
riot.tag("rg-tags",
     '<div class="c-tags">'+
     '  <span class="c-tags__container">'+
     '    <button each="{opts.tags.tags}" onclick="{removeTag}" type="c-button" class="c-button c-button--{type} c-tag"> {text} '+
     '      <span class="c-tag__close">×</span>'+
     '   </button>'+
     '  </span>'+
     '  <div class="c-tags__field-container">'+
     '     <input type="{opts.tags.filter ? \'search\' : \'text\'}" ref="selectfield" class="c-field" '+
     '                placeholder="{opts.tags.placeholder}" onkeydown="{navigate}" oninput="{filterOptions}" onfocus="{open}"'+
     '                __readonly="{!opts.tags.filter}">'+
     '                 <ul class="c-card c-card--menu u-higher" if="{opts.tags.isvisible}">'+
     '                    <li each="{options}" no-reorder onclick="{parent.select}" class="c-card__item '+
     '                          {\'c-card__item--active\': selected, \'c-card__item--disabled\': disabled, \'c-menu__item--hover\': active}"> {text}'+
     '                    </li>'+
     '                 </ul>'+
     '  </div>'+
     '</div>',
     'rg-tags .c-card--menu,[riot-tag="rg-tags"] .c-card--menu,[data-is="rg-tags"] .c-card--menu{ position: relative; }', "",
    function(opts) {
    var _this = this;

    if (!opts.tags) opts.tags = {
        options: [],
        tags: []
        }
    else {
          if (!opts.tags.type)
            opts.tags.type = "default" ;
          } // else..if

    if (!opts.tags.options) opts.tags.options = [];
    if (!opts.tags.tags) opts.tags.tags = [];

    if (opts.type)
       opts.tags.type = opts.type ;

    if (opts.placeholder)
       opts.tags.placeholder = opts.placeholder ;

    if (opts.filter) {
        filter = toBoolean (opts.filter) ;

        if (filter)
           opts.tags.filter = "text";
        else
          opts.tags.filter = undefined ;
    }

    var defType = opts.tags.type ;

    for (i = 0 ; i < opts.tags.options.length ; i++) {
        if (!opts.tags.options[i].type)
           opts.tags.options[i].type = defType;
    }  // for

    for (i = 0 ; i < opts.tags.tags.length ; i++) {
        if (!opts.tags.tags[i].type)
           opts.tags.tags[i].type = defType;
    }  // for


    var handleClickOutside = function handleClickOutside(e) {
        if (!_this.root.contains(e.target)) _this.close();
        _this.update()
    };


    var applyFieldText = function applyFieldText() {
        _this.refs.selectfield.value = "";
        for (var i = 0; i < opts.tags.options.length; i++) {
            var item = opts.tags.options[i];
            item.selected = false
        }
    };

    this.filterOptions = function() {
        _this.options = opts.tags.options;
        if (opts.tags.filter) _this.options = _this.options.filter(function(option) {
            var attr = option[opts.tags.filter];
            return attr && attr.toLowerCase().indexOf(_this.refs.selectfield.value.toLowerCase()) > -1
        });
        _this.trigger("filter", _this.refs.selectfield.value)
    };


    function getWindowDimensions() {
        var w = window,
            d = document,
            e = d.documentElement,
            g = d.getElementsByTagName("body")[0],
            x = w.innerWidth || e.clientWidth || g.clientWidth,
            y = w.innerHeight || e.clientHeight || g.clientHeight;
        return {
            width: x,
            height: y
        }
    }

    var positionDropdown = function positionDropdown() {
        var w = getWindowDimensions();
        var m = _this.root.querySelector(".c-card--menu");
        if (!m) return;
        if (!opts.tags.isvisible) {
            m.style.marginTop = "";
            m.style.marginLeft = "";
            return
        }
        var pos = m.getBoundingClientRect();
        if (w.width < pos.left + pos.width) {
            m.style.marginLeft = w.width - (pos.left + pos.width) - 20 + "px"
        }
        if (pos.left < 0) {
            m.style.marginLeft = "20px"
        }
        if (w.height < pos.top + pos.height) {
            m.style.marginTop = w.height - (pos.top + pos.height) - 20 + "px"
        }
    };

    this.navigate = function(e) {
        if ([13, 38, 40].indexOf(e.keyCode) > -1 && !opts.tags.isvisible) {
            e.preventDefault();
            _this.open();
            return true
        }

        var length = _this.options.length;

        if (length > 0 && [13, 38, 40].indexOf(e.keyCode) > -1) {
            e.preventDefault();
            var activeIndex = null;
            for (var i = 0; i < length; i++) {
                var item = _this.options[i];
                if (item.active) {
                    activeIndex = i;
                    break
                }
            }

            if (activeIndex != null) _this.options[activeIndex].active = false;

            if (e.keyCode == 38) {
                if (activeIndex == null || activeIndex == 0) _this.options[length - 1].active = true;
                else _this.options[activeIndex - 1].active = true
            } else if (e.keyCode == 40) {
                if (activeIndex == null || activeIndex == length - 1) _this.options[0].active = true;
                else _this.options[activeIndex + 1].active = true
            } else if (e.keyCode == 13 && activeIndex != null) {
                _this.select({
                    item: _this.options[activeIndex]
                })
            }
        }
        return true
    };


    this.open = function() {
        opts.tags.isvisible = true;
        _this.trigger("open")
    };


    this.close = function() {
        if (opts.tags.isvisible) {
            opts.tags.isvisible = false;
            _this.trigger("close")
        }
    };


    this.select = function(e) {
        opts.tags.options.forEach(function(i) {
            return i.selected = false
        });
        e.item.selected = true;
        _this.addTag(e.item);
        applyFieldText();
        _this.filterOptions();
        _this.trigger("select", e.item)
    };


    this.addTag = function(item) {
        if (opts.tags.tags.indexOf(item) == -1) {
            opts.tags.tags.push(item)
        }
    };


    this.removeTag = function(e) {
        opts.tags.tags = opts.tags.tags.filter(function(tag) {
            if (tag._id != e.item._id) return tag
        })
    };


    this.on("mount", function() {
        applyFieldText();
        _this.filterOptions();
        document.addEventListener("click", handleClickOutside);
        _this.update()
    });


    this.on("update", function() {
        opts.tags.options.forEach(function(item) {
            item._id = item._id || (Math.floor(Math.random() * 60466175) + 1679615).toString(36)
        });
        opts.tags.tags.forEach(function(tag) {
            tag._id = tag._id || (Math.floor(Math.random() * 60466175) + 1679615).toString(36)
        });
        if (!opts.tags.filter) applyFieldText();
        positionDropdown()
    });


    this.on("unmount", function() {
        document.removeEventListener("click", handleClickOutside)
    })
});



riot.tag("rg-toasts",
     '<div if="{opts.toasts.isvisible}" class="c-alerts {\'c-alerts--\' + opts.toasts.position}">'+
     '   <div each="{opts.toasts.toasts}" class="c-alert {\'c-alert--\' + type}" if="{isvisible}" onclick="{parent.toastClicked}"> {text} </div>'+
     ' </div>', "", "",
    function(opts) {
    var _this = this;

    this.toastClicked = function(e) {
        var toast = e.item;
        window.clearTimeout(toast.timer);
        toast.isvisible = false;
        _this.trigger("select", toast)
    };

    var _uid = 1;

    var uid = function uid() {
        return _uid++
    };

    this.on("mount", function() {
        if (!opts.toasts || !Array.isArray(opts.toasts.toasts)) return;

        opts.toasts.position = opts.toasts.position || "bottomright";

        opts.toasts.toasts.forEach(function(toast) {
            if (typeof toast.isvisible == "undefined") toast.isvisible = true;
            toast.id = toast.id || uid();
            if (!toast.timer && !toast.sticky) {
                toast.startTimer = function() {
                    toast.timer = window.setTimeout(function() {
                        toast.isvisible = false;
                        _this.trigger("close", toast);
                        _this.update()
                    }, toast.timeout || 6e3)
                };
                toast.startTimer()
            }
        });

        opts.toasts.isvisible = opts.toasts.toasts.filter(function(toast) {
            return toast.isvisible
        }).length > 0
    })
});

/*
Note! Depends on rg-utils.js

HTML:
<rg-toggle></rg-toggle>
<rg-toggle text="Average White Band"></rg-toggle>
<rg-toggle  type="info" checked=true></rg-toggle>
<rg-toggle text="Average White Band" type="success" checked=false></rg-toggle>

Script:
    var tags = riot.mount('rg-toggle', {
      toggle: {
        text: 'My Thang',
        type: 'success',
        checked: false
      }
    })

    tags[0].on('toggle', function (checked) { console.log("state", checked) })
*/
riot.tag("rg-toggle",
   '<div class="c-toggle {\'c-toggle--\' + opts.toggle.type}">'+
   '   <label class="c-toggle__wrapper">'+
   '        <input type="checkbox" checked="{opts.toggle.checked}" onclick="{toggle}">'+
   '        <div class="c-toggle__track">'+
   '          <div class="c-toggle__handle"></div>'+
   '        </div>'+
   '   </label>'+
   '   {opts.toggle.text}'+
   '</div>', ".c-toggle{padding-top: 0.5vh;}", "",
   function(opts) {
    var _this = this;

    if (!opts.toggle) {
        opts.toggle = {
          type: "default"
        }
    }

    if (opts.text)
       opts.toggle.text = opts.text ;

    if (opts.type)
       opts.toggle.type = opts.type ;

       if (opts.checked)
          opts.toggle.checked = toBoolean(opts.checked) ;



    this.on("mount", function() {
        if (!opts.toggle) opts.toggle = {
            checked: false
        }
    });

    this.toggle = function() {
        opts.toggle.checked = !opts.toggle.checked;
        _this.trigger("toggle", opts.toggle.checked)
    }
});


riot.tag2("rg-unsplash",
     '<img riot-src="https://unsplash.it/{opts.unsplash.greyscale}'+
     '{opts.unsplash.width}/{opts.unsplash.height}/?{options}">', "", "",
    function(opts) {
    var _this = this;


    this.on("before-mount", function() {
        _this.options = "";

        if (!opts.unsplash) opts.unsplash = {};
        opts.unsplash.width = opts.unsplash.width || 450;
        opts.unsplash.height = opts.unsplash.height || 250;
        if (opts.unsplash.greyscale) opts.unsplash.greyscale = "g/";
        if (opts.unsplash.random) _this.options += "random&";
        if (opts.unsplash.blur) _this.options += "blur&";
        if (opts.unsplash.image) _this.options += "image=" + opts.unsplash.image + "&";
        if (typeof opts.unsplash.gravity !== "undefined") _this.options += "gravity=" + opts.unsplash.gravity

        if (opts.width)
           opts.unsplash.width = Number(opts.width) ;

        if (opts.height)
           opts.unsplash.height = Number(opts.height) ;

        if (opts.image)
           opts.unsplash.image = "image=" + Number(opts.image) + "&" ;

    })
});
