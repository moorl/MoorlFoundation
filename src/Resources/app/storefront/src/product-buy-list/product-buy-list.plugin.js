import Plugin from 'src/plugin-system/plugin.class';
import HttpClient from 'src/service/http-client.service';
import queryString from 'query-string';

export default class MoorlProductBuyListPlugin extends Plugin {
    static options = {
        locale: document.documentElement.lang,
        currencyIso: "EUR",
        enablePrices: true,
        enableAddToCartSingle: true,
        enableAddToCartAll: true,
        productQuantities: {},
        discountValue: 0,
        star: '*'
    };

    init() {
        this._priceElements = this.el.querySelectorAll('[data-price]');
        this._productListItems = this.el.querySelectorAll('[data-moorl-product-buy-list-item]');
        this._buyButton = this.el.querySelector('[data-moorl-product-buy-list-button]');
        this._totalPriceElement = this.el.querySelector('.total-price');
        this._discountPriceElement = this.el.querySelector('.discount-price');
        this._selectedItemsElement = this.el.querySelector('.selected-items');
        this._formValuesElement = this.el.querySelector('.form-values');

        this._productIds = [];
        this._client = new HttpClient(window.accessKey, window.contextToken);

        this._updateTotalPrice();
        this._registerEvents();
    }

    _registerEvents() {
        const that = this;

        this.el.addEventListener('change', event => {
            that.el.querySelectorAll('[data-price]').forEach(item => {
                if (event.target === item) {
                    that._updateTotalPrice();
                }
            });

            if (event.target.nodeName === 'SELECT') {
                const item = event.target.closest('[data-moorl-product-buy-list-item]');
                const form = event.target.form;
                if (!item || !form) {
                    return;
                }

                const actionUrl = form.action;
                const formData = new FormData(form);
                const options = {};
                formData.forEach(function (value, key) {
                    options[key] = value;
                });

                const templateOptions = {};
                for (const [key, value] of Object.entries(that.options)) {
                    templateOptions[key] = value;
                }

                const query = {
                    switched: event.target.name,
                    options: JSON.stringify(options),
                    quantity: item.dataset.quantity ?? 1,
                    templateOptions: JSON.stringify(templateOptions),
                    enablePrices: that.options.enablePrices,
                    enableAddToCartSingle: that.options.enableAddToCartSingle,
                    enableAddToCartAll: that.options.enableAddToCartAll,
                };

                that._client.get(actionUrl + "?" + queryString.stringify(query), (response) => {
                    item.innerHTML = response;
                    that._updateTotalPrice();

                    window.PluginManager.initializePlugins();
                });
            }
        });
    }

    _updateTotalPrice() {
        if (!this.options.enableAddToCartAll) {
            return;
        }

        const that = this;
        const currency = new Intl.NumberFormat(this.options.locale, {
            style: 'currency',
            currency: this.options.currencyIso,
        });

        let totalPrice = 0;
        let selectedItems = 0;
        let allSelected = true;

        this._formValuesElement.innerHTML = null;

        // Initial load product ids to prevent discount value failure on variant switch
        if (this._productIds.length === 0) {
            this.el.querySelectorAll('[data-price]').forEach(item => {
                this._productIds.push(item.value);
            });
        }

        this.el.querySelectorAll('[data-price]').forEach(item => {
            if (!item.checked || !this._productIds.includes(item.value)) {
                allSelected = false;
                return;
            }
            totalPrice = totalPrice + (parseFloat(item.dataset.price) * parseInt(item.dataset.quantity));
            selectedItems++;
            that._createFormValues(item.value, item.dataset.quantity);
        });

        this._totalPriceElement.innerText = currency.format(totalPrice) + this.options.star;

        if (this.options.discountValue > 0) {
            if (allSelected) {
                this._totalPriceElement.classList.add('striked');
                this._discountPriceElement.classList.remove('d-none');
            } else {
                this._totalPriceElement.classList.remove('striked');
                this._discountPriceElement.classList.add('d-none');
            }
            this._discountPriceElement.innerText = currency.format(totalPrice - (this.options.discountValue / 100 * totalPrice)) + this.options.star;
        }

        if (this._selectedItemsElement) {
            this._selectedItemsElement.innerText = selectedItems;
        }

        this._buyButton.disabled = selectedItems === 0;
    }

    _createFormValues(productId, quantity) {
        this._formValuesElement.appendChild(this._createFormValue(`lineItems[${productId}][id]`, productId));
        this._formValuesElement.appendChild(this._createFormValue(`lineItems[${productId}][type]`, 'product'));
        this._formValuesElement.appendChild(this._createFormValue(`lineItems[${productId}][referencedId]`, productId));
        this._formValuesElement.appendChild(this._createFormValue(`lineItems[${productId}][stackable]`, 1));
        this._formValuesElement.appendChild(this._createFormValue(`lineItems[${productId}][removable]`, 1));
        this._formValuesElement.appendChild(this._createFormValue(`lineItems[${productId}][quantity]`, quantity));
    }

    _createFormValue(name, value) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.value = value;
        input.name = name;
        return input;
    }
}
