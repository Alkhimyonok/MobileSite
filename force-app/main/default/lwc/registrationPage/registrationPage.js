import {
    LightningElement
} from 'lwc';
//import saveContact from '@salesforce/apex/RegistrContactController.saveContact';
import {
    ShowToastEvent
} from 'lightning/platformShowToastEvent';
import {
    NavigationMixin
} from 'lightning/navigation';
import {
    createRecord
} from 'lightning/uiRecordApi';

import CONTACT_OBJECT from '@salesforce/schema/Contact';
import F_NAME_FIELD from '@salesforce/schema/Contact.FirstName';
import L_NAME_FIELD from '@salesforce/schema/Contact.LastName';
import EMAIL_FIELD from '@salesforce/schema/Contact.Email';
import PHONE_FIELD from '@salesforce/schema/Contact.Phone';
import LOGIN_FIELD from '@salesforce/schema/Contact.Login__c';
import PASSWORD_FIELD from '@salesforce/schema/Contact.Password__c';
import STREET_FIELD from '@salesforce/schema/Contact.MailingStreet';
import CITY_FIELD from '@salesforce/schema/Contact.MailingCity';

export default class RegistrationPage extends NavigationMixin(LightningElement) {
    firstNameValue;
    lastNameValue;
    emailValue;
    phoneValue;
    loginValue;
    passwordValue;
    checkBoxFieldValue = false;
    streetValue;
    cityValue;

    userId;

    handleChange(event) {
        if (event.target.name === 'FirstName') {
            this.firstNameValue = event.target.value;
        }
        if (event.target.name === 'LastName') {
            this.lastNameValue = event.target.value;
        }
        if (event.target.name === 'Phone') {
            this.phoneValue = event.target.value;
        }
        if (event.target.name === 'Email') {
            this.emailValue = event.target.value;
        }
        if (event.target.name === 'Login') {
            this.loginValue = event.target.value;
        }
        if (event.target.name === 'Password') {
            this.passwordValue = event.target.value;
        }
        if (event.target.name === 'Street') {
            this.streetValue = event.target.value;
        }
        if (event.target.name === 'City') {
            this.cityValue = event.target.value;
        }
    }

    handleCheckBoxChange(event) {
        this.checkBoxFieldValue = event.target.checked;
    }

    createContact() {

        const fields = {};
        fields[L_NAME_FIELD.fieldApiName] = this.lastNameValue;
        fields[F_NAME_FIELD.fieldApiName] = this.firstNameValue;
        fields[EMAIL_FIELD.fieldApiName] = this.emailValue;
        fields[PHONE_FIELD.fieldApiName] = this.phoneValue;
        fields[STREET_FIELD.fieldApiName] = this.streetValue;
        fields[CITY_FIELD.fieldApiName] = this.cityValue;
        fields[LOGIN_FIELD.fieldApiName] = this.loginValue;
        fields[PASSWORD_FIELD.fieldApiName] = this.passwordValue;

        const recordInput = {
            apiName: CONTACT_OBJECT.objectApiName,
            fields
        }

        if (this.checkBoxFieldValue == false) {
            alert('Please check "I`m not a robot"');
            return false;
        }
        createRecord(recordInput)
            .then(contact => {
                this.userId = contact.id;

                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Successful ' + this.lastNameValue + ' ' + this.firstNameValue + ' registration',
                        variant: 'success',
                    }),
                );

                // Navigate to the Home page
                this[NavigationMixin.Navigate]({
                    type: "standard__component",
                    attributes: {
                        componentName: "c__FromRegistrationToHome"
                    },
                    state: {
                        c__userId: this.userId
                    }
                })
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error creating contact',
                        message: error.body.message,
                        variant: 'error',
                    }),
                );
            });
    }

    handleLoginClick() {
        // Navigate to the Login page
        this[NavigationMixin.Navigate]({
            type: 'standard__component',
            attributes: {
                componentName: "c__FromRegistrationToLogin"
            },
        });
    }


}