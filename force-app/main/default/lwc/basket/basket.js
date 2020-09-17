import {
  LightningElement,
  wire,
  api,
  track
} from 'lwc';
import {
  CurrentPageReference,
  NavigationMixin
} from 'lightning/navigation';
import {
  getRecord,
  getFieldValue,
  createRecord
} from 'lightning/uiRecordApi';
import {
  refreshApex
} from '@salesforce/apex';
import {
  ShowToastEvent
} from 'lightning/platformShowToastEvent';
import saveOrder from '@salesforce/apex/BasketController.saveOrder';
import getBasketList from '@salesforce/apex/BasketController.getBasketList';

import ORDER_OBJECT from '@salesforce/schema/Custom_Order__c';
import ORDER_NAME_FIELD from '@salesforce/schema/Custom_Order__c.Name';
//import ORDER_CONTACTID_FIELD from '@salesforce/schema/Custom_Order__c.ContactId__c';
import ORDER_STATUS_FIELD from '@salesforce/schema/Custom_Order__c.Status__c';
//import ORDER_AMOUNT_FIELD from '@salesforce/schema/Custom_Order__c.Total_Amount__c';

const DELETE_TEXT = "You have removed this item from your basket"
const READ_CLASS = "lgc-bg-inverse";
const READ_ONLY_CLASS = "lgc-bg";

export default class Basket extends NavigationMixin(LightningElement) {

  //@api
  userId;
  userName;
  //  = '0032w00000INmlwAAD';
  @track hasRendered = true;
  orderId; // = 'a012w00000NmDdVAAV';   //Name = 'DraftOrder'
  disabledCondition = false;
  baskets;
  now = new Date().toJSON().slice(0, 10);

  @wire(CurrentPageReference)
  currentPageReference;

  get contactIdFromState() {
    return (
      this.currentPageReference && this.currentPageReference.state.c__userId
    );
  }
  get userNameFromState() {
    return (
      this.currentPageReference && this.currentPageReference.state.c__userName
    );
  }

  renderedCallback() {
    this.userId = this.contactIdFromState;
    this.userName = this.userNameFromState;
  }

  @wire(getBasketList, {
    contactId: '$userId'
  })
  wiredGetActivityHistory(value) {
    // Hold on to the provisioned value so we can refresh it later.
    this.wiredBaskets = value; // track the provisioned value
    const {
      data,
      error
    } = value; // destructure the provisioned value
    if (data) {
      this.error = undefined;
      this.baskets = data;
    } else if (error) {
      this.error = error;
    }
  }

  handleOrderClick() {

    const fields = {};
    fields[ORDER_NAME_FIELD.fieldApiName] = 'Order_' + this.userId + '_' + this.now;
    //fields[ORDER_CONTACTID_FIELD.fieldApiName] = this.contactId;
    fields[ORDER_STATUS_FIELD.fieldApiName] = 'Draft';
    //fields[ORDER_AMOUNT_FIELD.fieldApiName] = this.quantity * this.mobilePrice;

    const recordInput = {
      apiName: ORDER_OBJECT.objectApiName,
      fields
    }
    createRecord(recordInput)
      .then(order => {
        this.orderId = order.id;

        saveOrder({
            contactId: this.userId,
            orderId: this.orderId
          })

          .then(result => {
            this.dispatchEvent(
              new ShowToastEvent({
                title: 'Success',
                message: 'Successful ' + this.orderId + ' ORDER ORDER ORDER',
                variant: 'success',
              }),
            );

            this[NavigationMixin.Navigate]({
              type: "standard__component",
              attributes: {
                componentName: "c__FromBasketToOrder"
              },
              state: {
                c__orderId: this.orderId,
                c__contactId: this.userId
              }
            })

          })
          .catch(error => {
            window.console.log(error);
            this.error = JSON.stringify(error);
            this.dispatchEvent(
              new ShowToastEvent({
                title: 'Error Basket save',
                message: error.body.message,
                variant: 'error',
              }),
            );
          });
      })
      .catch(error => {
        window.console.log(error);
        this.error = JSON.stringify(error);
        this.dispatchEvent(
          new ShowToastEvent({
            title: 'Error Order save',
            message: error.body.message,
            variant: 'error',
          }),
        );
      });
  }

  handleOrderButton(event) {
    console.log('handleOrderButton------------------' + event.detail);
    this.disabledCondition = event.detail;
  }

  handleDeleteButton(event) {
    console.log('handleDeleteButton start------------------' + event.detail);
    refreshApex(this.wiredBaskets);
    console.log('handleDeleteButton finish------------------' + event.detail);
  }

  //works without refreshApex()
  /*@wire(getBasketList, {contactId :'$contactId' })
  wiredBaskets({ error, data }) {
    if (data) {
        this.error = undefined;
        this.baskets = data;
        //this.quantity=this.basketItem.Quantity__c;

    } else if (error) {
      this.error = error;
    }
  }*/
}