import {
    LightningElement,
    api,
    wire
} from 'lwc';
import getCasesById from "@salesforce/apex/CaseController.getCasesById";
import getOrdersById from "@salesforce/apex/CustomOrderController.getOrdersById";

import CREATED_DATE_FIELD from '@salesforce/schema/Case.CreatedDate';
import TYPE_FIELD from '@salesforce/schema/Case.Type';
import DESCRIPTION_FIELD from '@salesforce/schema/Case.Description';
import STATUS_FIELD from '@salesforce/schema/Case.Status';

export default class ViewCaseInfo extends LightningElement {

    @api caseId;
    orderId;
    error;
    orderNumber;

    @wire(getCasesById, {
        caseId: "$caseId"
    })
    wireCases({
        data,
        error
    }) {
        if (data) {
            data.forEach(item => {
                this.orderId = item.Custom_OrderId__c;
            });
            this.error = undefined;
        }
        if (error) {
            this.error = error;
            this.orderId = undefined;
        }
    }
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

    fieldsOfCase = [CREATED_DATE_FIELD, TYPE_FIELD, DESCRIPTION_FIELD, STATUS_FIELD];

    handleClick() {
        console.log('onclick');
        this.dispatchEvent(new CustomEvent('close', {}));
        this.dispatchEvent(new CustomEvent('openorder', {
            detail: this.orderId
        }));
    }

    closeModal() {
        this.dispatchEvent(new CustomEvent('close', ));
    }
}