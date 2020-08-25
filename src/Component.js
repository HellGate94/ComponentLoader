import EventEmitter from './EventEmitter';

class Component extends EventEmitter {
    static ComponentData = {
        //selector: 'myselector', // The Component Selector. Can be type of string or ElementSelector
        //datasetPrefix: 'myselector', // the dataset prefix. dataset.<datasetPrefix><optionName>
        //baseName: 'mydata', // the base name in the options object (dataset.<datasetPrefix> with no following name). default 'data'
    };

    /**
     * @type {Element}
     */
    el;

    /**
     * @type {Object}
     */
    options;

    /**
     * Called on document ready or whenever the Component is registered later on
     */
    static onComponentLoad() {
    }

    /**
     * Called after all Components of this batch are created.
     * use this to acess other components
     */
    onLoad() {
    }

    /**
     * @param {Element} element
     * @param {Object} options
     */
    constructor(element, options = {}) {
        super();
        this.el = element;
        this.options = options;

        // Same as editing prototype. find a better / safer way
        if (!element.components) {
            element.components = [];
        }
        this.el.components[this.constructor.name] = this;
    }

    /**
     * Cleans up the base Component
     */
    remove() {
        delete this.el.components[this.constructor.name];
        this.el = null;
        this.options = null;
    }
}

// Editing the prototype can problematic but should work fine
if (!Element.prototype.getComponent) {
    Element.prototype.getComponent = function(componentclass) {
        let componentname = componentclass.name;
        if (this.components && componentname in this.components) {
            return this.components[componentname];
        }
        return null;
    }
}

export default Component;