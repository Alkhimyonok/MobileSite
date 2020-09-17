import { LightningElement, api, wire } from 'lwc';
import { CurrentPageReference, NavigationMixin } from 'lightning/navigation';
export default class Gallery extends NavigationMixin(LightningElement) {
    isLoading = false;
    userId = '0032w00000I6h0sAAB';
    userName;

    @wire(CurrentPageReference)
    currentPageReference;

    /*get userIdFromState() {
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
        this.userId = this.userIdFromState;
        this.userName = this.userNameFromState;
    }*/
    handleLoading() {
        this.isLoading = true;
    }

    handleDoneLoading() {
        this.isLoading = false;
    }

    searchMobiles(event) {
        const selectedBrand = event.detail.selectedBrand;
        this.template.querySelector('c-list-mobiles').searchMobiles(selectedBrand);
    }

    sortMobiles(event) {
        const selectedBySort = event.detail.selectedBySort;
        this.template.querySelector('c-list-mobiles').sortMobiles(selectedBySort);
    }

    handleChangeKey(event) {
        const searchKey = event.detail.searchKey;
        this.template.querySelector('c-list-mobiles').inputSearch(searchKey);
    }

    handleMaxPrice(event) {
        const maxPrice = event.detail.maxPrice;
        this.template.querySelector('c-list-mobiles').inputMaxPrice(maxPrice);
    }

    handleChangeOS(event) {
        const selectedOS = event.detail.selectedOS;
        this.template.querySelector('c-list-mobiles').inputOS(selectedOS);
    }
}