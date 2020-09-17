import {
    LightningElement,
    track,
    api
} from 'lwc';
import getAutorization from '@salesforce/apex/AutorizationPageController.getAutorization';
import {
    CurrentPageReference,
    NavigationMixin
} from 'lightning/navigation';
import {
    ShowToastEvent
} from 'lightning/platformShowToastEvent';



export default class AuthorizationPage extends NavigationMixin(LightningElement) {
    loginInput;
    passwordInput;
    url;
    @track errorMsg = '';
    @api userName;



    navigateToForgotPassword() {
        this[NavigationMixin.Navigate]({
                type: 'standard__webPage',
                attributes: {
                    url: 'https://margophoneshop-dev-ed.lightning.force.com/lightning/n/Fogot_Password_Page'
                }
            },
            true
        );
    }
    // navigateToRegistrationUser() {
    //     this[NavigationMixin.Navigate]({
    //             type: 'standard__webPage',
    //             attributes: {
    //                 url: ''
    //             }
    //         },
    //         true
    //     );
    // }
    handleChange(event) {
        if (event.target.label === 'Login') {
            this.loginInput = event.target.value;
        }
        if (event.target.label === 'Password') {
            this.passwordInput = event.target.value;
        }
    }

    submitLogin() {
        getAutorization({
                inputLoginValue: this.loginInput,
                inputPasswordValue: this.passwordInput
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