import {
    LightningElement,
    api
} from 'lwc';
import restorePassword from '@salesforce/apex/ForgotPasswordController.restorePassword';
import getAutorization from '@salesforce/apex/AutorizationPageController.getAutorization';
import {
    CurrentPageReference,
    NavigationMixin
} from 'lightning/navigation';
import {
    ShowToastEvent
} from 'lightning/platformShowToastEvent';

export default class ForgotPasswordLwc extends NavigationMixin(LightningElement) {
    inputLoginValue;
    inputPasswordValue;
    inputEmailValue
    @api resultSendEmail;
    @api error;

    handleChange(event) {
        if (event.target.label === 'Email') {
            this.inputEmailValue = event.target.value;
        }
        if (event.target.label === 'Login') {
            this.inputLoginValue = event.target.value;
        }
        if (event.target.label === 'Password') {
            this.inputPasswordValue = event.target.value;
        }
    }

    forgotPassword() {
        restorePassword({
                emailValue: this.inputEmailValue
            })
            .then((result) => {
                this.resultSendEmail = result;
                console.log(result);
                if (result == true) {
                    const evt = new ShowToastEvent({
                        title: 'SUCCESS!',
                        message: 'Please, check your email post. ',
                        variant: 'success',
                        mode: 'dismissable'
                    });
                    this.dispatchEvent(evt);

                } else {
                    const evt = new ShowToastEvent({
                        title: 'Application Error',
                        message: 'Something went wrong. Email adress incorrect. ',
                        variant: 'error',
                        mode: 'dismissable'
                    });
                    this.dispatchEvent(evt);
                }
            })
    }

    submitLogin() {
        getAutorization({
                inputLoginValue: this.inputLoginValue,
                inputPasswordValue: this.inputPasswordValue
            })
            .then(result => {
                result.forEach(element => {
                    console.log('element', element)
                    this.userName = element.Name,
                        this.userId = element.Id
                });
                this[NavigationMixin.Navigate]({
                    type: "standard__component",
                    attributes: {
                        componentName: "c__FromAutorizationPageToHome"
                    },
                    state: {
                        c__userName: this.userName,
                        c__userId: this.userId

                    }
                })
            })
            .catch(error => {
                if (error) {
                    const evt = new ShowToastEvent({
                        title: 'Application Error',
                        message: 'Incorrect login or password. ',
                        variant: 'error',
                        mode: 'dismissable'
                    });
                    this.dispatchEvent(evt);
                }
            });
    }
}