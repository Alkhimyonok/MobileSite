import { LightningElement, wire, api } from 'lwc';
import { CurrentPageReference, NavigationMixin } from 'lightning/navigation';
import { getRecord, getFieldValue, createRecord } from 'lightning/uiRecordApi';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import updateRating from '@salesforce/apex/MobileDataService.updateRating';

import MOBILE_ID_FIELD from '@salesforce/schema/Product2.Id';
import MOBILE_NAME_FIELD from '@salesforce/schema/Product2.Name';
import MOBILE_PICTURE_FIELD from '@salesforce/schema/Product2.Picture__c';
import MOBILE_TOTAL_QUANTITY_FIELD from '@salesforce/schema/Product2.Total_Quantity__c';
import MOBILE_PRICE_FIELD from '@salesforce/schema/Product2.Price__c';
import MOBILE_REVIEWS_COUNT from '@salesforce/schema/Product2.Reviews_Count__c';
import MOBILE_RATING_FIELD from '@salesforce/schema/Product2.Rating__c';
const MOBILE_FIELDS = [MOBILE_ID_FIELD, MOBILE_NAME_FIELD, MOBILE_PICTURE_FIELD, MOBILE_TOTAL_QUANTITY_FIELD, MOBILE_PRICE_FIELD, MOBILE_REVIEWS_COUNT, MOBILE_RATING_FIELD];


import ORDER_OBJECT from '@salesforce/schema/Custom_Order__c';
import ORDER_NAME_FIELD from '@salesforce/schema/Custom_Order__c.Name';
import ORDER_CONTACTID_FIELD from '@salesforce/schema/Custom_Order__c.ContactId__c';
import ORDER_STATUS_FIELD from '@salesforce/schema/Custom_Order__c.Status__c';

import BASKET_OBJECT from '@salesforce/schema/Basket__c';
import BASKET_PRODUCTID_FIELD from '@salesforce/schema/Basket__c.ProductId__c';
import BASKET_CONTACTID_FIELD from '@salesforce/schema/Basket__c.ContactId__c';
import BASKET_ORDERID_FIELD from '@salesforce/schema/Basket__c.CustomOrderId__c';
import BASKET_STATUS_FIELD from '@salesforce/schema/Basket__c.ProductStatus__c';
import BASKET_QUANTITY_FIELD from '@salesforce/schema/Basket__c.Quantity__c';
import BASKET_UNITPRICE_FIELD from '@salesforce/schema/Basket__c.UnitPrice__c';

const REVIEWS_TAB = 'reviews';

export default class MobileDetais extends NavigationMixin(LightningElement) {
	userId;
	mobileId;
	quantity = 1;
	orderId;

	get refresh(){
		this.renderedCallback();
		refreshApex(this.wiredRecord);
		return true;
	}

	@wire(getRecord, { recordId: '$mobileId', fields: MOBILE_FIELDS })
	wiredRecord;

	get detailsTabIconName() {
		return this.wiredRecord && this.wiredRecord.data
			? 'utility:call'
			: null;
	}

	@wire(CurrentPageReference)
	currentPageReference;

	get mobileIdFromState() {
		return (
			this.currentPageReference && this.currentPageReference.state.c__mobileId
		);
	}
	get userIdFromState() {
		return (
			this.currentPageReference && this.currentPageReference.state.c__userId
		);
	}

	renderedCallback() {
		this.mobileId = this.mobileIdFromState;
		this.userId = this.userIdFromState;
	}

	get totalQuantityValue() {
		return getFieldValue(this.wiredRecord.data, MOBILE_TOTAL_QUANTITY_FIELD);
	}

	get mobileName() {
		return getFieldValue(this.wiredRecord.data, MOBILE_NAME_FIELD);
	}

	get backgroundStyle() {
		return getFieldValue(this.wiredRecord.data, MOBILE_PICTURE_FIELD);
	}

	get mobilePrice() {
		return getFieldValue(this.wiredRecord.data, MOBILE_PRICE_FIELD);
	}

	get reviewsCount() {
		return getFieldValue(this.wiredRecord.data, MOBILE_REVIEWS_COUNT);
	}

	get reviewsLabel() {
		return 'Reviews(' + this.reviewsCount + ')';
	}

	get mobileRating() {
		return getFieldValue(this.wiredRecord.data, MOBILE_RATING_FIELD);
	}

	navigateToRecordViewPage() {
		this[NavigationMixin.Navigate]({
			type: 'standard__recordPage',
			attributes: {
				recordId: this.mobileId,
				objectApiName: 'Product2',
				actionName: 'view'
			}
		});
	}

	handleReviewCreated(event) {
		const reviewId = event.detail.reviewId;
		updateRating({ mobileId: this.mobileId, reviewId: reviewId })
			.then(() => {
				refreshApex(this.wiredRecord);
			})
			.catch(error => {
				window.console.log(error);
			});
		this.template.querySelector('lightning-tabset').activeTabValue = REVIEWS_TAB;
		this.template.querySelector('c-mobile-review-list').refresh();
	}

	handleQuantityChange(event) {
		this.quantity = event.detail.value;
	}

	handleProductToBasket() {
		const fields = {};
		fields[BASKET_PRODUCTID_FIELD.fieldApiName] = this.mobileId;
		fields[BASKET_CONTACTID_FIELD.fieldApiName] = this.userId;
		fields[BASKET_ORDERID_FIELD.fieldApiName] = 'a022w00000Eol5lAAB';//////////////////////////////
		fields[BASKET_STATUS_FIELD.fieldApiName] = true;
		fields[BASKET_QUANTITY_FIELD.fieldApiName] = this.quantity;
		fields[BASKET_UNITPRICE_FIELD.fieldApiName] = this.mobilePrice;
		const recordInput = {
			apiName: BASKET_OBJECT.objectApiName,
			fields
		}
		window.console.log('a');
		createRecord(recordInput)
			.then(basket => {
				window.console.log('b');
				window.console.log(basket.id);
				this.dispatchEvent(new ShowToastEvent({
					title: 'Success!',
					message: 'Product added to basket uccessfully!',
					variant: 'success'
				}));
			})
			.catch(error => {
				window.console.log(error);
				this.error = JSON.stringify(error);
			});
	}

	handleProductToOrder() {
		const fields = {};
		fields[ORDER_NAME_FIELD.fieldApiName] = 'Order ' + this.mobileName;
		fields[ORDER_CONTACTID_FIELD.fieldApiName] = this.userId;
		fields[ORDER_STATUS_FIELD.fieldApiName] = 'Draft';

		const recordInput = {
			apiName: ORDER_OBJECT.objectApiName,
			fields
		}
		createRecord(recordInput)
			.then(order => {
				/////нужна savepoint
				this.orderId = order.id;
				const fields = {};
				fields[BASKET_PRODUCTID_FIELD.fieldApiName] = this.mobileId;
				fields[BASKET_CONTACTID_FIELD.fieldApiName] = this.userId;
				fields[BASKET_ORDERID_FIELD.fieldApiName] = this.orderId
				fields[BASKET_STATUS_FIELD.fieldApiName] = true;
				fields[BASKET_QUANTITY_FIELD.fieldApiName] = this.quantity;
				fields[BASKET_UNITPRICE_FIELD.fieldApiName] = this.mobilePrice;
				const recordInput = {
					apiName: BASKET_OBJECT.objectApiName,
					fields
				}
				createRecord(recordInput)
					.then(basket => {
						this.dispatchEvent(new ShowToastEvent({
							title: 'Success!',
							message: 'Order ' + this.orderId + ' Created Successfully!',
							variant: 'success'
						}));
						this[NavigationMixin.Navigate]({
							type: "standard__component",
							attributes: {
								componentName: "c__FromMobileDetailsToNewOrder"
							},
							state: {
								c__orderId: this.orderId,
								c__userId: this.userId
							}
						})
					})
					.catch(error => {
						window.console.log(error);
						this.error = JSON.stringify(error);
					});
			})
			.catch(error => {
				window.console.log(error);
				this.error = JSON.stringify(error);
			});
	}
}