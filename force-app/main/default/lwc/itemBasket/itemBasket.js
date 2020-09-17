import {
    LightningElement,
    api,
    wire,
    track
} from 'lwc';
import {
    ShowToastEvent
} from 'lightning/platformShowToastEvent';
import editQuantity from '@salesforce/apex/BasketController.editQuantity';
import editCheckboxValue from '@salesforce/apex/BasketController.editCheckboxValue';
import deleteBasket from '@salesforce/apex/BasketController.deleteBasket';

const DELETE_TEXT = "You have removed this item from your order"
const READ_CLASS = "lgc-bg-inverse";
const READ_ONLY_CLASS = "lgc-bg";

export default class ItemBasket extends LightningElement {

    @api product;
    @api basketId;
    @api quantityItem; //Basket__c.Quantity__c
    @api checkboxValue; // = true;     //Basket__c.ProductStatus__c

    @track hasRendered = true;

    basketItem;
    info;
    quantityClass;
    readOnly = false;
    disabled = false;

    get totalPrice() {
        return this.price * this.quantityItem;
    }

    get productId() {
        return this.basketId.ProductId__c;
    }

    get price() {
        return this.basketId.ProductId__r.Price__c;
    }

    get totalQuantityValue() {
        return this.basketId.ProductId__r.Total_Quantity__c;
    }

    handleQuantity(event) {
        this.quantityItem = event.target.value;

        if (this.quantityItem > this.totalQuantityValue) {

            console.log(' if block handleQuantity------------------' + this.quantityItem);
            this.disabled = true;
            this.fireEvent();
            this.info = 'Unfortunately, we don\'t have enough quantity. In stock only ' + this.totalQuantityValue + ' item(s).';
            console.log('disabled = true  info-------------' + this.info);

        } else if (this.quantityItem < 1) {
            console.log(' if block handleQuantity------------------' + this.quantityItem);
            this.disabled = true;
            this.fireEvent();
            this.info = 'Please select 1 or more items to order';
            console.log('disabled = true  info-------------' + this.info);

        } else {
            this.disabled = false;
            this.fireEvent();
            this.info = ' ';
            console.log('disabled = false  info-------------' + this.info);

            editQuantity({
                    basketId: this.basketId,
                    quantity: this.quantityItem
                })

                .then(result => {
                    this.info = result;
                    console.log('result quantity-------------' + result);
                    console.log('quantityItem-------------' + this.quantityItem);
                })
                .catch(error => {
                    window.console.log(error);
                    this.error = JSON.stringify(error);
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Error changing the quantity of items',
                            message: error.body.message,
                            variant: 'error',
                        }),
                    );
                });
        }
    }

    handleCheckbox(event) {
        this.checkboxValue = event.target.checked;

        if (this.checkboxValue === false) {
            this.readOnly = true;
            alert(DELETE_TEXT);
            this.quantityClass = READ_CLASS;

            editCheckboxValue({
                    basketId: this.basketId,
                    checkbox: this.checkboxValue
                })

                .then(result => {

                    console.log('result checkbox false-------------' + result);
                })
                .catch(error => {
                    window.console.log(error);
                    this.error = JSON.stringify(error);
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Error changing the checkbox',
                            message: error.body.message,
                            variant: 'error',
                        }),
                    );
                });

        }
        if (this.checkboxValue === true) {
            this.readOnly = false;
            this.quantityClass = READ_ONLY_CLASS;

            editCheckboxValue({
                    basketId: this.basketId,
                    checkbox: this.checkboxValue
                })

                .then(result => {
                    console.log('result checkbox true-------------' + result);
                })
                .catch(error => {
                    window.console.log(error);
                    this.error = JSON.stringify(error);
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Error changing the checkbox',
                            message: error.body.message,
                            variant: 'error',
                        }),
                    );
                });
        }
    }

    fireEvent() {
        const orderButton = new CustomEvent('button', {
            detail: this.disabled
        });
        console.log(' fireEvent block ------------------' + this.disabled);
        this.dispatchEvent(orderButton);
    }

    handleDeleteClick() {
        deleteBasket({
                basketId: this.basketId
            })
            .then(result => {

                console.log('result checkbox true-------------' + result);

                const deleteClick = new CustomEvent('delete');
                console.log(' deleteClick block ------------------ deleteClick block');
                this.dispatchEvent(deleteClick);

                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Successful ' + this.basketId + ' basket deletion',
                        variant: 'success',
                    }),
                );
            })
            .catch(error => {
                window.console.log(error);
                this.error = JSON.stringify(error);
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error basket deletion',
                        message: error.body.message,
                        variant: 'error',
                    }),
                );
            });
    }

}