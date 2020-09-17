import {
    LightningElement,
    api
} from 'lwc';
import {
    ShowToastEvent
} from 'lightning/platformShowToastEvent';

export default class CreateNewCase extends LightningElement {

    @api orderId;
    @api contactId;

    handleSubmit(event) {
        console.log('handleSubmit');
        event.preventDefault();
        const fields = event.detail.fields;
        fields.ContactId = this.contactId;
        fields.Custom_OrderId__c = this.orderId;
        fields.CreatedDate = new Date();
        this.template.querySelector('[data-id="newCase"]').submit(fields);
    }

    handleSuccess() {
        console.log('handleSuccess');
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Success',
                message: 'Case created',
                variant: 'success'
            })
        );
        this.handleReset();
        this.dispatchEvent(new CustomEvent('close', {}));
        this.dispatchEvent(new CustomEvent('refresh', {}));
    }

    handleReset() {

        const inputFields = this.template.querySelectorAll('[data-id="caseInput"]');
        if (inputFields) {
            inputFields.forEach(field => {
                field.reset();
            });
        }
    }

    closeModal() {
        this.dispatchEvent(new CustomEvent('close', {}));
    }
}