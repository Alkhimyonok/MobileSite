/* eslint-disable radix */
import {
    LightningElement,
    api
} from 'lwc';
import {
    NavigationMixin
} from 'lightning/navigation';

export default class CongratulationPage extends NavigationMixin(LightningElement) {

    @api contactId;
    // = "0032w00000FyKrCAAV";


    renderedCallback() {
        // this.confetti();
    }

    handleNavigation(event) {

        switch (event.target.dataset.id) {
            case "gallery":
                this[NavigationMixin.Navigate]({
                    type: "standard__component",
                    attributes: {
                        componentName: "c__FromOrderToGallery"
                    },
                    state: {
                        c__userId: this.contactId
                    }
                })
                break;
            case "office":
                this[NavigationMixin.Navigate]({
                    type: "standard__component",
                    attributes: {
                        componentName: "c__FromOrderToPersonalOffice"
                    },
                    state: {
                        c__userId: this.contactId
                    }
                })
                break;
            default:
        }
    }

    confetti() {
        const test = this.template.querySelectorAll(".particletext.confetti");
        const confetticount = 100;
        // (test.width() / 50) * 10;
        test.forEach(item => {
            for (const i = 0; i <= confetticount; i++) {
                item.append('<span class="particle c' + this.rnd(1, 2) + '" style="top:' + this.rnd(10, 50) + '%; left:' + this.rnd(0, 100) + '%;width:' + this.rnd(6, 8) + 'px; height:' + this.rnd(3, 4) + 'px;animation-delay: ' + (this.rnd(0, 30) / 10) + 's;"></span>');
            }
        })
    }

    rnd(m, n) {
        m = parseInt(m);
        n = parseInt(n);
        return Math.floor(Math.random() * (n - m + 1)) + m;
    }
}