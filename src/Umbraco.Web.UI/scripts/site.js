$("#menu-toggle, #sidebar-mask").click(function (e) {
    e.preventDefault();
    $("#sidebar-wrapper, #sidebar-mask").toggleClass("toggled");
});


var _orderController = function () {

    // status object
    var addedToCart = {};
    
    // initial load
    reloadProducts();

    // category click
    $('.categories .list-group-item').click(function(e) {
        var $this = $(e.target),
            url = $this.attr('href'),
            title = $this.attr('title') || null;

        // Continue as normal for cmd clicks etc
        if (e.which === 2 || e.metaKey) { return true; }

        // push state
        document.title = title || document.title;
        history.pushState(null, document.title, '#' +  url);
        reloadProducts();

        e.preventDefault();
        return false;       
    });

    // back button.
    window.onpopstate = function (event) {
        reloadProducts();
        services.UpdateWithAction("#cart-wrapper", false);
    };
    
    /**
   * Added to basked event listener
   *
   */
    $(Amazilia).on('addedToBasket', function (e, data) {
        resetDish();
        window.setTimeout(function () { $('.gr-code-' + addedToCart.groupCode).addClass('blink') }, 10);
    });

    // add to dish
    $('body').on('click', '.products .prep-addtodish', function (e) {
        $(this).parent().addClass('on');
        $(this).closest('article').addClass('on');
    });

    // add to basket
    $('body').on('click', '.products .addtocart', function (e) {

        let button = $(e.currentTarget);
        let id = button.data('id');
        // create unique group id
        let groupCode = 'gr-' + id + '-' + Math.floor(Math.random() * 100).toString();
        let article = button.closest('article');
        let quantity = parseInt(button.parent().find('input').val());

        // gather data for this dish
        let items = [];
        // main item.
        let item = { IsGroupRootItem: true, ItemID: id, GroupCode: groupCode, Quantity: quantity };
        items.push(item);

        article.find('.preparation-method.on').each(function () {
            let prepId = $(this).data('id');
            let prepQuantity = $(this).find('input').val();
            prepQuantity = parseInt(prepQuantity);
            prepQuantity *= quantity;
            let prepItem = { IsGroupRootItem: false, ItemID: prepId, GroupCode: groupCode, Quantity: prepQuantity };
            items.push(prepItem);
        });

        // todo, find items in shopping bag met matching quantities and prep. methods.
        // and use this groupcode.

        Amazilia.sendAddItemsForm(items);

        addedToCart.groupCode = groupCode;
        $('#cart-wrapper .loading').addClass('show');
    });


    $('body').on('click', '.products article .row', function () {
        $(this).parent().find('.preparation-methods').addClass('expanded');
    });
    $('body').on('click', '.products .expand', function () {
        $(this).closest('.preparation-methods').toggleClass('expanded');
    });


    // reload products from server
    function reloadProducts() {

        let isActive = false;                                                   // active state
        let params = VWA.Utils.GetQueryParameters();                            // query parameters
        let categoryId = params['categoryid'];                                  // selected categoryId from query parameters
        let $link = $('.categories .list-group-item.category-' + categoryId);   // corresponing link in category view
        let mobileWrp = $('#product_content_' + categoryId);                    // Mobile products wrapper (mobile gets rendered underneath the selected category link)
        let isMobile = mobileWrp.is(':visible');                                // is the mobile wrapper visible (thus whe are on mobile)

        // determine the current active state
        isActive = !!$link.hasClass('on');

        if (isActive && !isMobile) {
            // no toggle on desktop
            return;
        }

        // remove all active states from category links
        $('.categories .list-group-item.on').removeClass('on');

        // toggle active state
        isActive = !isActive;
        $link.data('isActive', isActive);

        // set active class on category link
        if (isActive) {
            $link.addClass('on');
        } else {
            $link.removeClass('on');
        }

        // mobile product wrapper, set loading
        if (isMobile) {
            $('.products-sm').html('');
            if (isActive) {
                mobileWrp.prepend('<div class="loading">loading...</div>');
                mobileWrp.append("<div class='holder'><div>");
                //mobileWrp.find('.holder').slideUp();
            }
        } else {
            $('#products').prepend('<div class="loading">loading...</div>');
        }

        // if active, load the new products async, and slide the wrapper.
        if (isActive) {
            let hash = window.location.hash;
            services.GetAsyncView('products', { hash: hash }, true, function (html) {

                if (isMobile) {
                    mobileWrp.find('.holder').slideUp(0);
                    mobileWrp.find('.holder').html(html).slideDown(function () { mobileWrp.find('.loading').remove(); });
                } else {
                    $('#products').html(html);
                }

                resetDish();
            });
        }


    }

    /**
     * resetDish
     * deselects the dish status
     **/
    function resetDish() {
        // first deselect all
        $('#products article.on').each(function () { deselect($(this)); });

        function deselect(article) {
            //  article.find('.preparation-methods').removeClass('expanded');
            //article.find('.product-button').removeClass('on');
            article.removeClass('on');
            article.find('input.spinner').val(1);
            article.find('.preparation-method.on').removeClass('on');
        }
    }

    return { resetDish: resetDish, reloadProducts: reloadProducts };

};

var _basketController = function () {



    // inital cart load
    services.UpdateWithAction("#cart-wrapper", false);


    /**
     * Added to basked event listener
     *
     */
    $(Amazilia).on('addedToBasket', function (e, data) {

        var html = '';
        if (!data.success) {
            html = '<ul class="cart-warnings">';
            for (var i in data.message) {
                html += '<li>' + data.message[i] + '</li>';
            }
            html += '</ul>';

            $(html).modal();
            return;
        }

        if (data.updateaddedtocarthtml && data.updateaddedtocarthtml.length > 10) {
            html = data.updateaddedtocarthtml;
            $(html).modal();
        }


        // Update the basket.
        $('#cart-wrapper').html(data.sections['updatebasketsectionhtml']);
        $('#cart-wrapper .loading').removeClass('show');
    });

    /*
     * Basket updated event listener
     *
     */
    $(Amazilia).on('basketUpdated', function (e, data) {

        var html = '';
        if (!data.success) {
            html = '<ul class="cart-warnings">';
            for (var i in data.message) {
                html += '<li>' + data.message[i] + '</li>';
            }
            html += '</ul>';

            $(html).modal();
            return;
        }

        // Update the basket.
        $('#cart-wrapper').html(data.sections['updatebasketsectionhtml']);
        $('#cart-wrapper .loading').removeClass('show');
    });


    $(Amazilia).on('shippingMethodSubmited', function (e, data) {

        var html = '';
        if (!data.success) {
            html = '<ul class="cart-warnings">';
            for (var i in data.message) {
                html += '<li>' + data.message[i] + '</li>';
            }
            html += '</ul>';

            $(html).modal();
            return;
        }

        // refresh basket
        services.UpdateWithAction("#cart-wrapper", false);
    });

    // basket remove all
    $('#cart-wrapper').on('click', '.cart-remove-all', function (e) {
        $(this).parent().find('input').prop('checked', true);
        var form = $('form.updatecart').trigger('submit');
        $('#cart-wrapper .loading').addClass('show');
    });

    // basket remove
    $('#cart-wrapper').on('click', '.removefromcart', function (e) {
        // todo, find out why the trigger is needed to submit the form
        $(this).parent().find('input').prop('checked', true);
        var form = $('form.updatecart').trigger('submit');
        $('#cart-wrapper .loading').addClass('show');
    });

    // basket quantity
    $('#cart-wrapper').on('change', 'input.quantity', function (e) {
        var form = $('form.updatecart').trigger('submit');
        $('#cart-wrapper .loading').addClass('show');
    });

    $('#cart-wrapper').on('click', '.shipping.method-name', function () {
        let $button = $(this);

        if ($button.hasClass('on')) {
            // already selected
            return;
        }
        $button.parent().find('.on').removeClass('on');
        $button.addClass('on');

        $('#cart-wrapper .loading').addClass('show');

        Amazilia.sendShippingOptions('shippingoption=' + $button.find('input').val());

    });


    return {};

};

var _checkoutController = function () {

    function _init() {
        if (Amazilia_Adressess && Amazilia_Adressess.length && Amazilia_Adressess.selectedId > 0) {
            _selectAddress(Amazilia_Adressess.selectedId);            
        }


        // slide open address choiches
        $(document).on('click', '.select-address', function () {
            $('.select-billing-address').removeClass('d-none').slideDown();

            $(document).one('click', function () {
                $('.select-billing-address').slideUp();
            });

        });

        //$('.select-address').click(function () {
        //    $('.select-billing-address').removeClass('d-none').slideDown();
        //});

        // update cart, using delegate handler, the form can be reloaded async
        $(document).on('submit', 'form.checkout-billing-address', function (e) {

            var form = $(this);
            var url = form.attr('action');

            Amazilia.sendBillingAddressForm(form.serialize(), url, function (data) {
                if (data.success) {
                    $('#address_wrp').html(data.sections['view']);
                }
            });

            // prevent form submit
            e.preventDefault();
            return false;
        });

        // Checkout final confirm button, start the checkout sequence
        $(document).on('submit', 'form.checkout-confirm', function (e, data) {
            
            if (!data || !data.novalidate) {

                // Submit and validate address
                let form = $('form.checkout-billing-address');
                let url = form.attr('action');
                Amazilia.sendBillingAddressForm(form.serialize(), url, function (data) {
                    // if any validation errors, show them and bail out
                    if (!data.success) {
                        $('#address_wrp').html(data.sections['view']);
                        return;
                    } else {
                        // Submit and validate the paymentMethod
                        let form = $('form.checkout-paymentmethod');
                        let url = form.attr('action');
                        Amazilia.sendForm(form.serialize(), url, function (data) {
                            // if any validation errors, show them and bail out
                            if (!data.success) {
                                $('#paymentmethod_wrp').html(data.sections['view']);
                                return;
                            }

                            // submit the form finaly, without starting the validation sequence
                            $('form.checkout-confirm').trigger('submit', { novalidate: true });

                        });
                    }
                });

                // prevent form submit
                e.preventDefault();
                return false;

            }


        });
    }

    function _selectAddress(addressId) {
        let address = null;

        // find selected addres
        for (let i in Amazilia_Adressess) {
            if (Amazilia_Adressess[i].Id == addressId) {
                address = Amazilia_Adressess[i];
                break;
            }
        }
        if (address !== null) {
            // prefill the address fields.
            $('#EditAddress_FirstName').val(address.FirstName);
            $('#EditAddress_Email').val(address.Email);
            $('#EditAddress_LastName').val(address.LastName);
            $('#EditAddress_Country').val(address.Country.Id);
            $('#EditAddress_PhoneNumber').val(address.PhoneNumber);
            $('#EditAddress_Address1').val(address.Address1);
            $('#EditAddress_Address2').val(address.Address2);
            $('#EditAdddress_City').val(address.City);
        }
    }

    _init();

    return {
        selectNewAddress : _selectAddress
    };

};

var services = function() {

    return {
        /*
            Loads the async view from the server
        */
        GetAsyncView: function (viewName, data, enableCache, callback) {
            data.viewName = viewName;
            var time = Date.now();
            var headers = {};

            if (enableCache) {
                headers.PwaEnableCache = 1;
            } else {
                headers.PwaDisableCache = 1;
            }

            $.ajax('/umbraco/vwa/async/GetAsyncView/', { headers: headers, data: data, complete: complete, error :error });

            function complete(response, status, xhr) {
                if (status === "error") {
                    var msg = "[GetAsyncView] error loading view: ";
                    console.log(msg + response.responseText);
                    return;
                }
                var time2 = Date.now();

                console.log('query took: ' + Math.abs(time - time2) +  ' milisecons');
                callback && callback(response.responseText);
            }

            function error(response, status) {
                var msg = "[GetAsyncView] error loading view: ";
                console.log(msg + response.responseText);

                callback && callback(response.responseText);
                return;
            }
        },

        UpdateWithAction: function (selector, enableCache,  callback) {
            var el = $(selector);
            this.GetAsyncAction(el, null, enableCache, function (result) {
                el.html(result);
                callback && callback();
            });
        },

        GetAsyncAction: function (el, data, enableCache, callback) {

            var action = el.data('asyncaction');
            if (!action) {
                console.log('[services] element does not contain any asyncaction data');
                return "[noaction]";
            }
            var time = Date.now();

            var headers = {};
            if (enableCache) {
                headers.PwaEnableCache = 1;
            } else {
                headers.PwaDisableCache = 1;
            }

            $.ajax(action, { headers: headers, data: data, complete: complete, error: error });

            function complete(response, status, xhr) {
                if (status === "error") {
                    var msg = "[GetAsyncView] error loading view: ";
                    console.log(msg + response.responseText);
                    return;
                }
                var time2 = Date.now();

                console.log('query took: ' + Math.abs(time - time2) + ' milisecons');
                callback && callback(response.responseText);
            }

            function error(response, status) {
                var msg = "[GetAsyncView] error loading view: ";
                console.log(msg + response.responseText);

                callback && callback(response.responseText);
                return;
            }
        }

    };

}();


$(function () {

    if ($('#orderController').length) {
        Amazilia.orderController = _orderController();
    }
    if ($('#cart-wrapper').length) {
        Amazilia.basketController = _basketController();
    }

    //if ($('#orderController').length) {
    // orderController();
    //}

    if ($('#checkoutController').length) {
        Amazilia.checkoutController = _checkoutController();
    }


});


/* spinner functions */
$(function () {
    $('body').on('click', '.number-spinner .min', function (e) {
        var input = $(this).parent().find('input');
        var val = parseInt(input.val());
        val = val - 1;
        val = Math.max(val, 0);
        input.val(val);
        input.trigger('change');
        e.preventDefault();
        return false;
    });

    $('body').on('click', '.number-spinner .plus', function (e) {
        var input = $(this).parent().find('input');
        var val = parseInt(input.val());
        input.val(val + 1);
        input.trigger('change');
        e.preventDefault();
        return false;
    });
});

