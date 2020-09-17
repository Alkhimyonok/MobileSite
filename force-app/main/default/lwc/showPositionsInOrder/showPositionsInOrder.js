import {
    LightningElement,
    wire,
    api
} from 'lwc';
import getBasketsInOrder from "@salesforce/apex/MobileDataService.getBasketsInOrder";

const COLS = [{
        label: "Picture",
        fieldName: "ProductId__r.Picture__c",
        hideDefaultActions: true,
        type: 'image'
    },
    {
        label: "Name",
        fieldName: "ProductId__r.Name",
        hideDefaultActions: true
    },
    {
        label: "Price",
        fieldName: "UnitPrice__c",
        hideDefaultActions: true,
        type: 'currency'
    }, {
        label: "Quantity",
        fieldName: "Quantity__c",
        hideDefaultActions: true,
    }
];

export default class ShowPositionsInOrder extends LightningElement {

    @api orderId;
    labelOfPositionsButton = "Show all positions";
    isHidePositionsInOrder = false;
    basketsInOrder;
    orderItems;
    error;
    columns = COLS;


    @wire(getBasketsInOrder, {
        orderId: "$orderId"
    })
    wiredBaskets(result) {
        console.log(' wiredBaskets');
        this.basketsInOrder = result;
        if (result.data) {
            //  this is the final array into which the flattened response will be pushed.
            let contactsArray = [];

            for (let row of result.data) {
                // this const stroes a single flattened row.
                const flattenedRow = {}

                // get keys of a single row — Name, Phone, LeadSource and etc
                let rowKeys = Object.keys(row);

                //iterate
                rowKeys.forEach((rowKey) => {

                    //get the value of each key of a single row. John, 999-999-999, Web and etc
                    const singleNodeValue = row[rowKey];

                    //check if the value is a node(object) or a string
                    if (singleNodeValue.constructor === Object) {

                        //if it's an object flatten it
                        this._flatten(singleNodeValue, flattenedRow, rowKey)
                    } else {

                        //if it’s a normal string push it to the flattenedRow array
                        flattenedRow[rowKey] = singleNodeValue;
                    }

                });

                //push all the flattened rows to the final array
                contactsArray.push(flattenedRow);
            }

            //assign the array to an array that's used in the template file
            this.orderItems = contactsArray;

        } else if (result.error) {
            this.error = result.error;
            this.orderItems = undefined;
            console.log('error====>');
        }
    }

    _flatten = (nodeValue, flattenedRow, nodeName) => {
        let rowKeys = Object.keys(nodeValue);
        rowKeys.forEach((key) => {
            let finalKey = nodeName + '.' + key;
            flattenedRow[finalKey] = nodeValue[key];
        })
    }

    handleChange() {

        this.isHidePositionsInOrder = this.isHidePositionsInOrder ? false : true;
        this.labelOfPositionsButton = this.isHidePositionsInOrder ?
            "Hide all positions" :
            "Show all positions";
    }
}