import {
    LightningElement
} from 'lwc';
import {
    NavigationMixin
} from 'lightning/navigation';


export default class TestHomePage extends NavigationMixin(LightningElement) {
    // contactId;
    userId = "0032w00000FyKrCAAV";
    label;

    tabselect(event) {
        this.label = this.userId ? "Sign out" : "Sign in";
        switch (event.target.dataset.id) {
            case "home":
                console.log('home');
                break;
            case "office":
                console.log('office');
                break;
            default:
        }
    }
}