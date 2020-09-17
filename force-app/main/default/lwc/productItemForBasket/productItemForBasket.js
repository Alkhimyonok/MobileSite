import { LightningElement, api } from 'lwc';

export default class ProductItemForBasket extends LightningElement {
    @api basketId;

    get name() {
        return this.basketId.ProductId__r.Name;
    }
    get picture() {
        return this.basketId.ProductId__r.Picture__c;
    }
    get description() {
        return this.basketId.ProductId__r.Description;
    }
    get price() {
        return this.basketId.ProductId__r.Price__c;
    }
}