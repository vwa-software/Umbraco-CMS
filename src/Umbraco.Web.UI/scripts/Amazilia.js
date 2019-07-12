$(function () {

    // change currency
    $('#currencyChangeList li a').click(function () {
        $('input#CurrencyId').val($(this).data("currencyid"));
        $(this).closest('form').submit();
        return false;
    });

    // update cart, using delegate handler, the form can be reloaded async
    $(document).on('submit', 'form.additem', function (e) {

        var form = $(this);
        var url = form.attr('action');
        Amazilia.sendAddItemForm(url, form.serialize());

        // prevent form submit
        e.preventDefault();
        return false;
    });

    // update cart, using delegate handler, the form can be reloaded async
    $(document).on('submit', 'form.updatecart', function (e) {
        var form = $(this);

        Amazilia.sendUpdateCardForm(form.serialize());

        // prevent form submit
        e.preventDefault();
        return false;
    });

    /*

    $(Amazilia).on('addedToBasket', function (e, data) {

        var html = '';
        if (!data.success) {
            html = '<ul class="cart-warnings">';
            for (var i in data.message) {
                html += '<li>' + data.message[i] + '</li>';
            }
            html += '</ul>';
        } else {
            html = data.updateaddedtocarthtml;
        }


        // Bootstrap's model, implement your own if you wish.
        $(html).modal();

        // Update the basket.
        $('.amazilia-basketsectionhtml').html(data.updatebasketsectionhtml);

    });
    */


});

var Amazilia = function () {

    function _sendform(action, data, success, error) {

        var request = {
            type: "POST",
            url: action,
            headers: { 'PwaDisableCache': '1' },
            data: data,
            success: function (data) {

                /****  result json  ****
                 
                data = {
                    success : false,
                    message : "",
                    updateaddedtocarthtml : "",
                    updatebasketsectionhtml : "",
                    redirect : ""
                }
                */

                if (data.redirectUrl) {
                    window.location = data.redirectUrl;
                    return;
                }
                success(data);
            }
            , error: function (err) {
                console.log("[Amazilia.sendform]" + err.responseText);
                error && error(err);
            }
        };

        if (typeof data !== "string") {
            request.contentType = 'application/json; charset=utf-8';
            request.dataType = 'json';
            request.data = JSON.stringify(data);
        }

        $.ajax(request);
    }

    return {

        sendForm: function (data, url, callback) {
            // make a ajax post to the  controller
            _sendform(url, data, function (data) {
                callback && callback(data);
                $(Amazilia).trigger('formResponse', data);
            });
        },

        /**
         * Amazilia.sendUpdateCardForm
         * this function sends the form data to the store BascketController.UpdateBasket action
         * @param {any} data  - Post Data
         * @param {string} url - optional url
         * @param {Function} callback - callback function
         */
        sendUpdateCardForm: function (data, url, callback) {

            url = url || '/umbraco/Amazilia/Basket/UpdateCart/';

            // make a ajax post to the  controller
            _sendform(url, data, function (data) {
                callback && callback(data);
                $(Amazilia).trigger('basketUpdated', data);
            });
        },

        /**
         * Amazilia.SendItemForm
         * this function sends the item data to the BasketContoller.AddToBasket action.
         * @param {any} data - Data must include: string ufprt, int itemID, int quantity = 1, string RedirectToUrl = null
         * @param {string} url - optional url
         * @param {Function} callback - callback function
         */
        sendAddItemForm: function (data, url, callback) {

            url = url || '/umbraco/Amazilia/Basket/AddBasketItem/';

            // make a ajax post to the  controller
            _sendform(url, data, function (data) {
                callback && callback(data);
                $(Amazilia).trigger('addedToBasket', data);
            });
        },


        /**
         * Amazilia.SendItemForm
         * this function sends the item data to the BasketContoller.AddToBasket action.
         * @param {any} data - Data must include: string ufprt, int itemID, int quantity = 1, string RedirectToUrl = null
          * @param {string} url - optional url
         * @param {Function} callback - callback function
         */
        sendAddItemsForm: function (data, url, callback) {

            url = url || '/umbraco/Amazilia/Basket/AddBasketItems/';

            // make a ajax post to the  controller
            _sendform(url, data, function (data) {
                callback && callback(data);
                $(Amazilia).trigger('addedToBasket', data);
            });
        },

        /**
         * Amazilia.sendShippingOptions
         * this function sends the shipping options
         * @param {any} data - Data must include: string ufprt, int itemID, int quantity = 1, string RedirectToUrl = null
         * @param {string} url - optional url
         * @param {Function} callback - callback function
         */
        sendShippingOptions: function (data, url, callback) {
            url = url || '/umbraco/Amazilia/checkout/ShippingMethodSubmit';

            // make a ajax post to the  controller
            _sendform(url, data, function (data) {

                callback && callback(data);

                $(Amazilia).trigger('shippingMethodSubmited', data);
            });

        },

        sendBillingAddressForm: function (data, url, callback) {

            // make a ajax post to the  controller
            _sendform(url, data, function (data) {

                callback && callback(data);

                $(Amazilia).trigger('billingAddressSubmited', data);
                
            });

        }





    };
}();




