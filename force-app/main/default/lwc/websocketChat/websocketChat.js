import {
  LightningElement,
  api,
  wire
} from 'lwc';
import {
  loadScript
} from 'lightning/platformResourceLoader';
import {
  getRecord,
  createRecord
} from 'lightning/uiRecordApi';
import {
  refreshApex
} from '@salesforce/apex';
import SOCKET_IO_JS from '@salesforce/resourceUrl/socketiojs';
import WEBSOCKET_SERVER_URL from '@salesforce/label/c.websocket_server_url';
import MESSAGE_OBJECT from '@salesforce/schema/Chat_Message__c';
import CONTENT_FIELD from '@salesforce/schema/Chat_Message__c.Content__c';
import CONTACT_FIELD from '@salesforce/schema/Chat_Message__c.Contact__c';
import getTodayMessages from '@salesforce/apex/ChatController.getTodayMessages';
import getActiveChatUsers from '@salesforce/apex/ChatController.getActiveChatUsers';
import setUserChatActive from '@salesforce/apex/ChatController.setUserChatActive';
import setUserChatInactive from '@salesforce/apex/ChatController.setUserChatInactive';

export default class WebsocketChat extends LightningElement {
  @api timeString;
  @api message;
  @api error;
  @api isChatActive = false;
  @api isTyping = false;
  @api item;
  @api recordId;

  _socketIoInitialized = false;
  _socket;

  @wire(getTodayMessages)
  wiredMessages

  @wire(getActiveChatUsers)
  wiredChatUsers

  handleChange(event) {
    this.testparam = event.target.value
  }

  renderedCallback() {
    if (this._socketIoInitialized) {
      return;
    }
    this._socketIoInitialized = true;
    Promise.all([
        loadScript(this, SOCKET_IO_JS),
      ])
      .then(() => {
        this.initSocketIo();
      })
      .catch(error => {
        console.error('loadScript error', error);
        this.error = 'Error loading socket.io';
      });
  }

  initSocketIo() {
    this._socket = io.connect(WEBSOCKET_SERVER_URL);
    const messageInput = this.template.querySelector('.message-input');
    if (this._socket !== undefined) {
      this._socket.on('time', (timeString) => {
        this.timeString = timeString;
      });
      messageInput.addEventListener('keydown', (event) => {
        this._socket.emit('usertyping', {
          userId: this.item
        });

        if (event.keyCode !== 9) {
          this._socket.emit('usertyping', {
            userId: this.item
          });
        }
        if (event.which === 13 && event.shiftKey === false) {
          event.preventDefault();

          const fields = {};
          fields[CONTENT_FIELD.fieldApiName] = messageInput.value;
          fields[CONTACT_FIELD.fieldApiName] = this.item;
          const message = {
            apiName: MESSAGE_OBJECT.objectApiName,
            fields
          };

          createRecord(message)
            .then(() => {
              messageInput.value = '';
              this._socket.emit('transmit');
              return refreshApex(this.wiredMessages);
            })
            .catch(error => {
              console.error('error', error);
              this.error = 'Error creating message';
            });
        }
      });

      messageInput.addEventListener('keyup', this.debounce(() => {
        this._socket.emit('usernottyping', {
          userId: this.item
        });
      }, 1000));
      this._socket.on('istyping', (data) => {
        if (data.userId !== this.item) {
          this.isTyping = true;
        }
      });
      this._socket.on('nottyping', (data) => {
        if (data.userId !== this.item) {
          this.isTyping = false;
        }
      });
      this._socket.on('output', (data) => {
        console.log('on output', data);
      });
      this._socket.on('status', (data) => {
        if (data.success) {
          messageInput.value = '';
          this.message = data.message;
          this.messageResetDelay('message');
          this.error = '';
        } else if (!data.success) {
          this.error = data.message;
          this.messageResetDelay('error');
          this.message = '';
        }
      })
      this._socket.on('chatupdated', () => {
        return refreshApex(this.wiredMessages);
      });
      this._socket.on('refreshChatUsers', () => {
        return refreshApex(this.wiredChatUsers);
      });
    }
  }

  handleEnterChat() {
    setUserChatActive({
        userId: this.item
      })
      .then((res) => {
        console.log(res);
        this.isChatActive = res.Chat_Active__c;
        this._socket.emit('userEnteredChat');
        return refreshApex(this.wiredChatUsers);
      })
      .catch(error => {
        console.error('error', error);
        this.error = 'Error updating user record';
      });
  }

  handleLeaveChat() {
    setUserChatInactive({
        userId: this.item
      })
      .then((res) => {
        this.isChatActive = res.Chat_Active__c;
        this._socket.emit('userLeftChat');
        window.location.reload();
        return refreshApex(this.wiredChatUsers);
      })
      .catch(error => {
        console.error('error', error);
        this.error = 'Error updating user record';
      });
  }

  get isInputDisabled() {
    return this.isChatActive ? false : true;
  }

  get inputPlaceholderText() {
    return this.isInputDisabled ? '' : 'Type your message and press enter';
  }

  get displayChatUserList() {
    return this.isChatActive && this.wiredChatUsers;
  }

  debounce(callback, wait) {
    let timeout;
    return (...args) => {
      const context = this;
      clearTimeout(timeout);
      timeout = setTimeout(() => callback.apply(context, args), wait);
    };
  }

  messageResetDelay(msgType) {
    setTimeout(() => {
      this[msgType] = '';
    }, 1000)
  }
}