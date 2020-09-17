import { LightningElement, api, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
const TOAST_TITLE = "Review Created!";
const TOAST_SUCCESS_VARIANT = "success";
export default class AddReviewForm extends LightningElement {
    @track mobileId;
    @api userId;
    @track reviewId;
    @track rating = 0;

    @api get recordId() {
        return this.mobileId;
    }
    set recordId(value) {
        this.mobileId = value;
    }

    handleRatingChange(event) {
        this.rating = event.detail.rating;
    }

    handleSubmit(event) {
        event.preventDefault();
        const fields = event.detail.fields;
        fields.Product__c = this.mobileId;
        fields.Rating__c = this.rating;
        fields.Contact__c = this.userId;
        return this.template.querySelector('lightning-record-edit-form').submit(fields);
    }

    handleSuccess(event) {
        this.reviewId = event.detail.id;
        this.dispatchEvent(new CustomEvent('createreview', {
            detail: {
                reviewId: this.reviewId
            }
        }));
        this.dispatchEvent(new ShowToastEvent({
            title: 'Success!',
            message: 'Review Created!',
            variant: 'success'
        }));
        this.handleReset();
    }

    handleReset() {
        const inputFields = this.template.querySelectorAll("lightning-input-field");
        if (inputFields) {
            inputFields.forEach(field => {
                field.reset();
            });
        }
    }
}