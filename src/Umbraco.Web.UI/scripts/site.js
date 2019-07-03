$("#menu-toggle, #sidebar-mask").click(function (e) {
    e.preventDefault();
    $("#sidebar-wrapper, #sidebar-mask").toggleClass("toggled");
});


var orderController = function () {

    // bind properties to input/html
    var binder = null;

    // category click
    $('.categories .list-group-item').click(function(e) {
        var $this = $(e.target),
            url = $this.attr('href'),
            title = $this.attr('title') || null;

        // Continue as normal for cmd clicks etc
        if (e.which == 2 || e.metaKey) { return true; }

        // push state
        document.title = title || document.title;
        history.pushState(null, document.title, '#' +  url);
        ReloadProducts();

        e.preventDefault();
        return false;       
    });

    // back button.
    window.onpopstate = function (event) {
        ReloadProducts();
    };

    // reload products from server
    function ReloadProducts() {
        var hash = window.location.hash;

        services.GetAsyncView('products', { hash : hash }, function (html) {
            $('#products').html(html);
            SyncProductsWithCart();
        });
    }

    function SyncProductsWithCart() {
        binder = new Binder();
        
        // first deselect all
        $('#products article.on').each(function () { deselect($(this)); });

        $('#cart-items input.quantity').each(function () {
                   
            var q = $(this);
            var id = q.data('id');
            var parentid = q.data('parentid');

            var article;


            if (parentid) {
                article = $('#products article.product.id_' + parentid);
                article.find('.preparation-method.id-' + id).addClass('on');
            } else {
                article = $('#products article.product.id_' + id);
                if (article.length) {
                    select(article);
                }
            }
            
            if (parentid) {                
                binder.addInput('product-' + id, $('#listquantity' + parentid + '_' + id));
                binder.addHtml('product-' + id, q.parent().find('.quantity-label'));
            } else {
                binder.addInput('product-' + id, $('#listquantity' + id));
            }

            var quantity = q.val();

            binder.addInput('product-' + id, q);
            binder.setPropertyValue('product-' + id, quantity);
        });

        function select(article) {
            article.find('.preparation-methods').addClass('expanded');
            //article.find('.product-button').addClass('on');
            article.addClass('on');
        }

        function deselect(article) {
          //  article.find('.preparation-methods').removeClass('expanded');
            //article.find('.product-button').removeClass('on');
            article.removeClass('on');
            article.find('input.spinner').val(0);
            article.find('.preparation-method.on').removeClass('on');
        }

    }

    // Bind to StateChange Event
    //History.Adapter.bind(window, 'statechange', function () { // Note: We are using statechange instead of popstate
    //    var State = History.getState(); // Note: We are using History.getState() instead of event.state
    //    if (State) {
    //        SetState(State);
    //    }
    //});


    // dom loaded
    $(function () {

        var addedToCart = { groupCode: '', itemId: 0 };

        SetState();
        
        $(Amazilia).on('addedToBasket', function (e, data) {

            var html = '';
            if (!data.success) {
                html = '<ul class="cart-warnings">';
                for (var i in data.message) {
                    html += '<li>' + data.message[i] + '</li>';
                }
                html += '</ul>';

                $(html).modal();
            } 

            // Update the basket.
            $('#cart-wrapper').html(data.updatebasketsectionhtml);
            $('#cart-wrapper .loading').removeClass('show');
                       
            SyncProductsWithCart();

            $('.gr-code-' + addedToCart.groupCode + ' .prep-id-' + addedToCart.itemId).addClass('blink');

        });
        
        $(Amazilia).on('basketUpdated', function (e, data) {

            var html = '';
            if (!data.success) {
                html = '<ul class="cart-warnings">';
                for (var i in data.message) {
                    html += '<li>' + data.message[i] + '</li>';
                }
                html += '</ul>';

                $(html).modal();
            }

            // Update the basket.
            $('#cart-wrapper').html(data.updatebasketsectionhtml);
            $('#cart-wrapper .loading').removeClass('show');
        
            SyncProductsWithCart();
        });
             
        $('body').on('click', '.number-spinner .min', function (e) {
            var input = $(this).parent().find('input');
            var val = parseInt(input.val());
            input.val(val - 1);
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
      
        // add to basket
        $('body').on('click', '#products .addtocart', function (e) {
            var button = $(e.currentTarget);
            var id = button.data('id');
            var groupCode = button.data('groupcode') || "";
            var isRootItem = button.data('isrootitem') || "0";

            // data - groupcode="gr-@item.Id" data - isRootItem="1"
            var form = $('form.additem');
            form[0]["ItemID"].value = id;
            form[0]["IsGroupRootItem"].value = isRootItem;
            form[0]["GroupCode"].value = groupCode;

            addedToCart.groupCode = groupCode;
            addedToCart.itemId = id;

            form.trigger('submit');
        });

        // basket remove all
        $('#cart-wrapper').on('click', '.cart-remove-all', function (e) {
            $(this).parent().find('input').prop('checked', true).trigger('change');
        });
        // basket remove
        $('#cart-wrapper').on('click', '.removefromcart', function (e) {
            // todo, find out why the trigger is needed to submit the form
            $(this).parent().find('input').prop('checked', true).trigger('change');
        });
        // basket quantity
        $('#cart-wrapper').on('change', 'input', function (e) {
            var form = $('form.updatecart').trigger('submit');
            $('#cart-wrapper .loading').addClass('show');
        });

        $('#products').on('click', '.expand', function () {
            $(this).closest('.preparation-methods').toggleClass('expanded');
        });


    });
}();

var services = function() {

    return {
        /*
            Loads the async view from the server
        */
        GetAsyncView: function (viewName, data, callback) {
            data.viewName = viewName;
            var time = Date.now();
                        
            $.ajax('/umbraco/vwa/async/GetAsyncView/', { data: data, complete: complete, error :error });

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
        }
    };

}();

