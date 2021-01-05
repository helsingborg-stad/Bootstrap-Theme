var Muncipio = Muncipio || {};
Muncipio.Archive = Muncipio.Archive || {};

Muncipio.Archive.Dropdown = (function($) {
    function Dropdown() {
        $(
            function() {
                this.init();
                this.handleEvents();
            }.bind(this)
        );
    }

    /**
     * Update initial values
     * @return {void}
     */
    Dropdown.prototype.init = function() {
        var self = this;
        this.getButtons().forEach(function(btn){
            self.updateAmount(btn);
        })
    };


    /**
     * Update amount
     * @return {void}
     */
    Dropdown.prototype.updateAmount = function(btn) {

        if (btn.classList.contains('dropdown-open')) {
            return;
        }

        var amount = btn.querySelector('.checked-amount');
        var list = btn.nextElementSibling.getElementsByTagName('ul')[0];
        var total = 0;

        list.childNodes.forEach(function(item) {
            var input = item.childNodes[0].childNodes[0];

            if (input.checked) {
                total++;
            }
        });

        amount.textContent = '('+total+')';
    };

    /**
     * Handle events
     * @return {void}
     */
    Dropdown.prototype.handleEvents = function() {

        var buttons = this.getButtons();
        var self = this;

        function callback(mutationList) {
            mutationList.forEach(function(mutation) {
                self.updateAmount(mutation.target);
            });
        }

        var observerOptions = {
            childList: true,
            attributes: true,
            subtree: true
        }

        var observer = new MutationObserver(callback);

        buttons.forEach(function(btn) {
            observer.observe(btn, observerOptions);
        });
    };

    /**
     * Gets button element
     * @return {DOM element}
     */
    Dropdown.prototype.getButtons = function() {
        return document.getElementById('archive-filter').querySelectorAll('[data-dropdown]');
    };

    return new Dropdown();

})(jQuery);
