$(function () {

    // change currency
    $('#currencyChangeList li a').click(function () {
        $('input#CurrencyId').val($(this).data("currencyid"));
        $(this).closest('form').submit();
        return false;
    });
    
    // update cart, using delegate handler, the form can be reloaded.
    $(document).on('submit','form.additem', function (e) {

        var form = $(this);
        var url = form.attr('action');
        Amazilia.sendAddItemForm(url, form.serialize());

        // prevent form submit
        e.preventDefault(); 
        return false;
    });

    // update cart, using delegate handler, the form can be reloaded.
    $(document).on('submit', 'form.updatecart', function (e) {
        var form = $(this);
        var url = form.attr('action');

        Amazilia.sendUpdateCardForm(url, form.serialize());

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
        $.ajax({
            type: "POST",
            url: action,
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

                if (data.redirect) {
                    window.location = data.redirect;
                    return;
                }
                success(data);               
            }
            , error: function (err) {
                console.log("[Amazilia.sendform]" + err.responseText);
                error && error(err);
            }
        });       
    }

    return {

        /**
         * Amazilia.sendUpdateCardForm
         * this function sends the form data to the store BascketController.UpdateBasket action
         * @param {any} action -  Action to post to
         * @param {any} data  - Post Data 
         */
        sendUpdateCardForm: function (action, data) {
            // make a ajax post to the basket controller
            _sendform(action, data, function (data) {
                $(Amazilia).trigger('basketUpdated', data);
            });
        },

        /**
         * Amazilia.SendItemForm
         * this function sends the item data to the BasketContoller.AddToBasket action.
         * @param {any} action -  Action to post to
         * @param {any} data - Data must include: string ufprt, int itemID, int quantity = 1, string RedirectToUrl = null
         */
        sendAddItemForm: function (action, data) {
            // make a ajax post to the basket controller
            _sendform(action, data, function (data) {
                // make a ajax post to the basket controller
                $(Amazilia).trigger('addedToBasket', data);
            });

        }
    };
}();




