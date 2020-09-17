import { LightningElement, api, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

import getAllReviews from '@salesforce/apex/MobileDataService.getAllReviews';

export default class MobileReviewList extends NavigationMixin(LightningElement) {
	@track mobileId;
	mobileReviews;
	isLoading;

	@api get recordId() {
		return this.mobileId;
	}
	set recordId(value) {
		this.mobileId = value;
		this.getReviews();
	}

	get reviewsToShow() {
		return this.mobileReviews ? this.mobileReviews.length > 0 : false;
	}

	@api
	refresh() {
		this.getReviews();
	}

	getReviews() {
		this.isLoading = true;
		getAllReviews({
			mobileId: this.mobileId
		})
			.then(result => {
				this.mobileReviews = result;
				this.isLoading = false;
			})
			.catch(error => {
				this.isLoading = false;
			});
	}

	navigateToRecord(event) {
		const userId = event.target.dataset.recordId;
		this[NavigationMixin.Navigate]({
			type: 'standard__recordPage',
			attributes: {
				recordId: userId,
				actionName: 'view'
			},
		});
	}
}