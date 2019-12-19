export class EventListener {
    constructor(eventname, callback) {
        this.eventname = eventname;
        this.callback = callback;
    }
}

export default class EventEmitter {
    constructor() {
        this.eventListeners = {};
    }

    /**
     * 
     * @param {String} eventname 
     * @param {Function} callback 
     * @returns {EventListener} The Listener to later remove it
     */
    addListener(eventname, callback) {
        if (!this.eventListeners[eventname]) {
            this.eventListeners[eventname] = [];
        }
        let listener = new EventListener(eventname, callback);
        this.eventListeners[eventname].push(listener);

        return listener;
    }

    /**
     * 
     * @param {EventListener} listener The listener to remove
     */
    removeListener(listener) {
        this.eventListeners[listener.eventname] = this.eventListeners[listener.eventname].filter((val) => val != listener);
    }

    /**
     * 
     * @param {String} eventname The name of the Events
     * @param {Array<any>} arguments The Arguments (in order) to pass to the function
     */
    emitEvent(eventname, args = []) {
        if (this.eventListeners[eventname]) {
            for (let i = 0; i < this.eventListeners[eventname].length; i++) {
                const event = this.eventListeners[eventname][i];
                event.callback(...args);
            }
        }
    }
}