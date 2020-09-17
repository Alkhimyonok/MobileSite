import {
    LightningElement,
    wire,
    api
} from 'lwc';
import getOrdersById from "@salesforce/apex/CustomOrderController.getOrdersById";
import TOTAL_AMOUNT_FIELD from '@salesforce/schema/Custom_Order__c.Total_Amount__c';
import STATUS_FIELD from '@salesforce/schema/Custom_Order__c.Status__c';
import TYPE_OF_PAYMENT_FIELD from '@salesforce/schema/Custom_Order__c.Type_of_payment__c';
import DELIVERY_DATE_FIELD from '@salesforce/schema/Custom_Order__c.Delivery_date__c';
import DELIVERY_ADDRESS_ID_FIELD from '@salesforce/schema/Custom_Order__c.Delivery_address__c';
import DESCRIPTION_FIELD from '@salesforce/schema/Custom_Order__c.Description__c';

export default class ViewOrderInfo extends LightningElement {

    @api orderId;
    error;
    orderNumber;

    @wire(getOrdersById, {
        orderId: "$orderId"
    })
    wireOrders({
        data,
        error
    }) {
        if (data) {
            data.forEach(item => {
                this.orderNumber = item.Order_Number__c;
            });
            this.error = undefined;
        }
        if (error) {
            this.error = error;
            this.orderNumber = undefined;
        }
    }

    fieldsOfOrder = [
        TOTAL_AMOUNT_FIELD,
        STATUS_FIELD,
        TYPE_OF_PAYMENT_FIELD,
        DELIVERY_DATE_FIELD,
        DELIVERY_ADDRESS_ID_FIELD,
        DESCRIPTION_FIELD
    ];

    closeModal() {
        this.dispatchEvent(new CustomEvent('close', {}));
    }
}