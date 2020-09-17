import {
    LightningElement,
    api
} from 'lwc';
import {
    ShowToastEvent
} from 'lightning/platformShowToastEvent';

export default class AddNewAddress extends LightningElement {

    @api contactId;
    isHideAddresses = false;
    labelNewAddressButton = "Add new address";

    handleAddNewAddress() {
        this.isHideNewAddressButton = this.isHideNewAddressButton ? false : true;
        this.labelNewAddressButton = this.isHideNewAddressButton ?
            "Hide" :
            "Add new address";
    }

    handleSubmit(event) {
        console.log('handleSubmit');
        event.preventDefault();
        const fields = event.detail.fields;
        fields.Contact__c = this.contactId;
        this.template.querySelector('[data-id="address"]').submit(fields);
    }

    handleSuccess() {
        console.log('handleSuccess');
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Success',
                message: 'Address created',
                variant: 'success'
            })
        );
        this.handleReset();

        this.handleAddNewAddress();
        this.dispatchEvent(new CustomEvent('refresh', {}));
    }

    handleReset() {

        const inputFields = this.template.querySelectorAll('[data-id="addressInput"]');
        if (inputFields) {
            inputFields.forEach(field => {
                field.reset();
            });
        }
    }
}