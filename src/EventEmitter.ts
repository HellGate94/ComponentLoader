type EventCallback = (...args: any[]) => void;

export class EventListener {
    constructor(public eventname: string, public callback: EventCallback) { }
}

export default class EventEmitter {
    eventListeners: Map<string, EventListener[]> = new Map<string, EventListener[]>();

    addListener(eventname: string, callback: EventCallback): EventListener {
        let listeners: EventListener[];
        if (!this.eventListeners.has(eventname)) {
            listeners = [];
            this.eventListeners.set(eventname, listeners);
        } else {
            listeners = this.eventListeners.get(eventname);
        }
        let listener = new EventListener(eventname, callback);
        listeners.push(listener);

        return listener;
    }

    removeListener(listener: EventListener) {
        let listeners = this.eventListeners.get(listener.eventname);
        listeners = listeners.filter((val) => val != listener);
    }

    emitEvent(eventname: string, args: any[] = []) {
        if (this.eventListeners.has(eventname)) {
            const listeners = this.eventListeners.get(eventname);
            for (const listener of listeners) {
                listener.callback(...args);
            }
        }
    }
}