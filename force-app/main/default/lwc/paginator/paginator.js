import { LightningElement, api, track } from 'lwc';
export default class Paginator extends LightningElement {
    @api
    changeView(str) {
        if (str === 'trueprevious') {
            this.template.querySelector('lightning-button.prev').disabled = true;
        }
        if (str === 'falsenext') {
            this.template.querySelector('lightning-button.next').disabled = false;
        }
        if (str === 'truenext') {
            this.template.querySelector('lightning-button.next').disabled = true;
        }
        if (str === 'falseprevious') {
            this.template.querySelector('lightning-button.prev').disabled = false;
        }
    }
    renderedCallback() {
        this.template.querySelector('lightning-button.prev').disabled = true;
    }
    previousHandler1() {
        this.dispatchEvent(new CustomEvent('previous'));
    }

    nextHandler1() {
        this.dispatchEvent(new CustomEvent('next'));
    }
    FirstPageHandler1() {
        this.dispatchEvent(new CustomEvent('firstpage'));
    }
    LastPageHandler1() {
        this.dispatchEvent(new CustomEvent('lastpage'));
    }
    changeHandler(event) {
        event.preventDefault();
        const s_value = event.target.value;
        const selectedEvent = new CustomEvent('selected', { detail: s_value });
        this.dispatchEvent(selectedEvent);
    }
}