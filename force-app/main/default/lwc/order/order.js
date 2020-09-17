import {
    LightningElement,
    wire
} from 'lwc';
import getDeliveryAdress from "@salesforce/apex/ContactController.getDeliveryAdress";
import getOrdersById from "@salesforce/apex/CustomOrderController.getOrdersById";
import formOrder from "@salesforce/apex/CustomOrderController.formOrder";
import deleteOrder from "@salesforce/apex/CustomOrderController.deleteOrder";
import getTypesOfPaymentOptions from "@salesforce/apex/CustomOrderController.getTypesOfPaymentOptions";

import {
    ShowToastEvent
} from 'lightning/platformShowToastEvent';
import {
    CurrentPageReference,
    NavigationMixin
} from 'lightning/navigation';
import {
    refreshApex
} from '@salesforce/apex';
// import createNewPayments from '@salesforce/apex/PayPalController/createNewPayments';
import FIRST_NAME_FIELD from '@salesforce/schema/Contact.FirstName';
import LAST_NAME_FIELD from '@salesforce/schema/Contact.LastName';
import PHONE_FIELD from '@salesforce/schema/Contact.Phone';
import EMAIL_FIELD from '@salesforce/schema/Contact.Email';
import ORDER_NUMBER_FIELD from '@salesforce/schema/Custom_Order__c.Order_Number__c';
import TOTAL_AMOUNT_FIELD from '@salesforce/schema/Custom_Order__c.Total_Amount__c';

export default class Order extends NavigationMixin(LightningElement) {

    contactId;
    orderId;

    selectedAddressId;
    orders;
    error;
    date;
    typeOfPayment;
    description;
    isHideDeliveryDate = false;
    isCongratulationModalOpen = false;

    fields = [FIRST_NAME_FIELD, LAST_NAME_FIELD, PHONE_FIELD, EMAIL_FIELD];
    fieldsOfOrder = [ORDER_NUMBER_FIELD, TOTAL_AMOUNT_FIELD];

    @wire(CurrentPageReference)
    currentPageReference;

    get orderIdFromState() {
        return (
            this.currentPageReference && this.currentPageReference.state.c__orderId
        );
    }
    get contactIdFromState() {
        return (
            this.currentPageReference && this.currentPageReference.state.c__contactId
        );
    }

    renderedCallback() {
        this.orderId = this.orderIdFromState;
        this.contactId = this.contactIdFromState;
    }

    @wire(getTypesOfPaymentOptions)
    typeOfPaymentOptions;

    @wire(getDeliveryAdress, {
        contactId: "$contactId"
    }) deliveryAddresses;

    @wire(getOrdersById, {
        orderId: "$orderId"
    })
    wiredOrders({
        data,
        error
    }) {
        if (data) {
            this.orders = data;
            this.error = undefined;
        }
        if (error) {
            this.error = error;
            this.orders = undefined;
        }
    }

    refresh() {
        return refreshApex(this.deliveryAddresses);
    }

    get deliveryAddressesOptions() {
        const returnOptions = [];
        if (this.deliveryAddresses.data) {

            const addresses = this.deliveryAddresses.data;

            addresses.forEach(item => {
                returnOptions.push({
                    label: item.Adress__c,
                    value: item.Id
                });
            });
        }
        return returnOptions;
    }

    handleChange(event) {
        switch (event.target.dataset.id) {
            case "address":
                this.selectedAddressId = event.detail.value;
                break;
            case "deliveryCheckbox":
                this.isHideDeliveryDate = event.target.checked ? true : false;
                break;
            case "deliveryDate":
                this.date = event.detail.value;
                break;
            case "typeOfPayment":
                this.typeOfPayment = event.detail.value;
                break;
            case "description":
                this.description = event.detail.value;
                break;
            default:
        }
    }

    handleSubmitForOrder() {

        if (this.typeOfPayment) {
            if (!this.isHideDeliveryDate) {
                this.formOrder();
            } else {
                if (this.selectedAddressId && this.date) {
                    this.formOrder();
                } else {
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Warning',
                            message: 'Please, choose date and address',
                            variant: 'warning'
                        })
                    );
                }
            }
        } else {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Warning',
                    message: 'Please, choose type of payment',
                    variant: 'warning'
                })
            );
        }
    }

    handleCancelOrder() {
        deleteOrder({
            orderId: this.orderId,
        }).then(() => {
            this[NavigationMixin.Navigate]({
                type: "standard__component",
                attributes: {
                    componentName: "c__FromHomePageToGallery"
                },
                state: {
                    c__userId: this.contactId
                }
            })
        }).catch(error => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error updating record',
                    message: error.body.message,
                    variant: 'error'
                })
            );
        });
    }

    formOrder() {
        formOrder({
            deliveryDate: this.date,
            typeOfPayment: this.typeOfPayment,
            orderId: this.orderId,
            id: this.selectedAddressId,
            isHideDeliveryDate: this.isHideDeliveryDate,
            description: this.description
        }).then(() => {
            if (this.typeOfPayment === 'by card online') {
                //go to controller Apex
                // createNewPayments({
                //     contId: this.contactId,
                //     orderId: this.orderId
                // }).then(() => {
                //     this.dispatchEvent(
                //         new ShowToastEvent({
                //             title: 'Success',
                //             message: 'Success',
                //             variant: 'success'
                //         })
                //     );
                // }).catch(error => {
                //     this.dispatchEvent(
                //         new ShowToastEvent({
                //             title: 'Error updating record',
                //             message: error.body.message,
                //             variant: 'error'
                //         })
                //     );
                // });
                //go to paypal
                this[NavigationMixin.Navigate]({
                    "type": "standard__webPage",
                    "attributes": {
                        "url": "https://www.paypal.com/in/signin"
                    }
                });
            } else {
                this.isCongratulationModalOpen = true;
            }
        }).catch(error => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error updating record',
                    message: error.body.message,
                    variant: 'error'
                })
            );
        });
    }
}