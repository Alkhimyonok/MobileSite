import {
    LightningElement,
    wire
} from 'lwc';
import {
    CurrentPageReference,
    NavigationMixin
} from 'lightning/navigation';

export default class TestSamsungPay extends NavigationMixin(LightningElement) {

    orderId;
    contactId;

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
}