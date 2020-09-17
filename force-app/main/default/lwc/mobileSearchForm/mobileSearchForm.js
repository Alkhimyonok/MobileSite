import { LightningElement, wire, track } from 'lwc';
import getMobilesPicklist from '@salesforce/apex/MobileDataService.getMobilesPicklist';

export default class MobileSearchForm extends LightningElement {
    @track selectedBySort = '';
    @track searchKey = '';
    @track maxPrice;
    @track selectedBrand = [];
    @track selectedOS = [];

    @track brandOptions;
    @track osOptions;
    @track sortingOptions = [
        { value: 'priceDesc', label: 'Descending price' },
        { value: 'priceAsc', label: 'Ascending price' },
        { value: 'rating', label: 'Rating' },
        { value: '', label: 'choose...' }
    ];


    @track error = undefined;

    @wire(getMobilesPicklist, {
        objInfo: { 'sobjectType': 'Product2' },
        picklistFieldApi: 'Brand__c'
    })
    mobileBrands({ error, data }) {
        if (data) {
            this.brandOptions = data.map(type => {
                return {
                    label: type.slabel,
                    value: type.svalue
                };
            });
        } else if (error) {
            this.searchOptions = undefined;
            this.error = error;
        }
    }

    @wire(getMobilesPicklist, {
        objInfo: { 'sobjectType': 'Product2' },
        picklistFieldApi: 'Operating_System__c'
    })
    mobileOS({ error, data }) {
        if (data) {
            this.osOptions = data.map(type => {
                return {
                    label: type.slabel,
                    value: type.svalue
                };
            });
        } else if (error) {
            this.osOptions = undefined;
            this.error = error;
        }
    }

    handleBrandChange(event) {
        this.selectedBrand = event.detail.value;
        event.preventDefault();
        const searchBrandEvent = new CustomEvent('searchbrand', {
            detail: {
                selectedBrand: this.selectedBrand
            }
        });
        this.dispatchEvent(searchBrandEvent);
    }

    handleSortingOptionChange(event) {
        this.selectedBySort = event.detail.value;
        const sortEvent = new CustomEvent('sort', {
            detail: {
                selectedBySort: this.selectedBySort
            }
        });
        this.dispatchEvent(sortEvent);
    }

    handleMaxPriceChange(event) {
        const maxPrice = event.detail.value;
        if (maxPrice) {
            this.maxPrice = maxPrice;
        } else {
            this.maxPrice = 0;
        }
        const priceEvent = new CustomEvent('maxprice', {
            detail: {
                maxPrice: this.maxPrice
            }
        });
        this.dispatchEvent(priceEvent);
    }

    handleChange(event) {
        this.searchKey = event.target.value;
        event.preventDefault();
        const searchEvent = new CustomEvent('changekey', {
            detail: {
                searchKey: this.searchKey
            }
        });
        this.dispatchEvent(searchEvent);
    }

    handleOSChange(event) {
        this.selectedOS = event.target.value;
        event.preventDefault();
        const selectOSEvent = new CustomEvent('changeos', {
            detail: {
                selectedOS: this.selectedOS
            }
        });
        this.dispatchEvent(selectOSEvent);
    }
}