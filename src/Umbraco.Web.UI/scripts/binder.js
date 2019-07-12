
// vwa namespace
var VWA = {};


/*
 *
 *
 * Usage:
 *
        binder = new Binder();

        binder.addInput('quantity', $('#quantity'));
        binder.addHtml('quantity',$('#quantityHtml'));
        binder.setPropertyValue('quantity', 6);
        *
 *
 * */
function Binder() {

    var _items = {};
    var _listeners = {};
    var _inputs = {};
    var _htmls = {};

   
    function raisePropertyChanged(key, value) {
        if (!_listeners[key])
            return;

        for (var i in _listeners[key]) {
            _listeners[key][i]();
        }
    }
    
    function _inputChange(key, e) {
        _setPropertyValue(key, $(e.target).val());
    }
    function _setPropertyValue(key, value) {
        if (!_items[key] || _items[key] !== value) {
            _items[key] = value;
            raisePropertyChanged(key, value);
            var inputss = _inputs[key];

            for (let i in inputss) {
                if (inputss[i].val() !== value) {
                    inputss[i].val(value).trigger('change');
                }
            }

            var htmlss = _htmls[key];

            for (let i in htmlss) {
                htmlss[i].html(value);
            }


        }
        _items[key] = value;
    }
    return {
        addListener: function _addListener(key, fn) {
            if (!_listeners[key]) {
                _listeners[key] = [];
            }
            _listeners[key].push(fn);
        }
        ,
        addInput: function _addInput(key, $ell) {
            if (!_inputs[key]) {
                _inputs[key] = [];
            }
            _inputs[key].push($ell);
            $ell.off('change.propchange');
            $ell.on('change.propchange', function (e) { _inputChange(key, e); });
        },

        addHtml: function _addHtml(key, $ell) {
            if (!_htmls[key]) {
                _htmls[key] = [];
            }
            _htmls[key].push($ell);
        },

        setPropertyValue: _setPropertyValue,

        clearKey: function (key) {
            _inputs[key] = [];
            _items[key] = [];
            _listeners[key] = [];
            _htmls[key] = [];
        }
    };
}



VWA.Utils = function Utils() {

    return {
        /**
         * Function GetQueryParamenters
         * returns: the parameters from the hashed query string
         **/
        GetQueryParameters: function () {

            let params = {};
            let hash = window.location.hash;
            let index = hash.indexOf('?') + 1;
         

            if (index < 1) {
                return params;
            }

            let query = hash.substr(index, hash.length - index).split('&');

            for (let i in query) {
                var nameval = query[i].split('=');
                params[nameval[0]] = nameval[1];
            }
            return params;
        }
    };
}();

