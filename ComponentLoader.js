import Component from './Component';
import Logger from './Logger';

class ComponentLoader {
    static _loadedComponents = [];
    static _documentLoaded = false;

    /**
     * if all registered Components should be loaded using applyComponents on document ready.
     * @default true
     */
    static autoLoad = true;

    /**
     * registers a Component. registered Components will be applied on applyComponents.
     * @param {{new(): Component}} component constructor function of a Component subclass
     */
    static registerComponent(component) {
        ComponentLoader._loadedComponents.push(component);

        if (ComponentLoader._documentLoaded) {
            component.onComponentLoad();
            if (this.autoLoad) {
                let loaded = ComponentLoader._applyComponent([document.documentElement], component);
                for (let i = 0; i < loaded.length; i++) {
                    const component = loaded[i];
                    component.onLoad();
                }
            }
        }
    }

    static _loadDocument() {
        if (!ComponentLoader._documentLoaded) {
            ComponentLoader._documentLoaded = true;
            
            for (let i = 0; i < this._loadedComponents.length; i++) {
                const component = this._loadedComponents[i];
                component.onComponentLoad();
            }

            if (this.autoLoad) {
                ComponentLoader.applyComponents([document.documentElement], true);
            }
        }
    }

    /**
     * Applies all registered Components to the elements
     * @param {Array<Element>} elements the elements that need Components applied to them
     * @param {Boolean} logging if logging is enabled
     */
    static applyComponents(elements, logging = false) {
        this._l.muted = !logging;

        this._l.group('Applying JS Scripts');
        this._l.startTimer('Time');
        this._l.group('On Elements', true);
        for (let i = 0; i < elements.length; i++) {
            const element = elements[i];
            this._l.debug(element);
        }
        this._l.groupEnd();

        let loaded = [];

        this._l.group('Components', true);
        for (let i = 0; i < this._loadedComponents.length; i++) {
            const component = this._loadedComponents[i];
            let loadedcomponents = ComponentLoader._applyComponent(elements, component);
            loaded.push(...loadedcomponents);
        }
        this._l.groupEnd();

        this._l.group('Components onLoad Event');
        this._l.startTimer('Components onLoad Time');
        for (let i = 0; i < loaded.length; i++) {
            const component = loaded[i];
            component.onLoad();
        }
        this._l.debug(`Calling on ${loaded.length} Components`);
        this._l.stopTimer('Components onLoad Time');
        this._l.groupEnd();

        this._l.stopTimer('Time');
        this._l.groupEnd();

        this._l.muted = false;
    }


    /**
     * @param {Array<Element>} elements
     * @param {{new(): Component}} component
     */
    static _applyComponent(elements, component) {
        let loadedcomponents = [];

        let sel = component.ComponentData['selector'];

        let componentElements = [];
        for (let i = 0; i < elements.length; i++) {
            const element = elements[i];
            componentElements.push(...element.querySelectorAll(sel));
            
            if (element.matches(sel)) {
                componentElements.push(element);
            }
        }

        this._l.group(`${component.name} (${componentElements.length})`);
        this._l.startTimer('Component Time');
        
        for (let i = 0; i < componentElements.length; i++) {
            const value = componentElements[i];
            
            let options = ComponentLoader._parseComponentOptions(value, component);
    
            this._l.group('Instance', true);
            loadedcomponents.push(new component(value, options));
    
            this._l.debug(value);
            this._l.groupEnd();
        }
        this._l.stopTimer('Component Time');
        this._l.groupEnd();

        return loadedcomponents;
    }

    /**
     * @param {Element} element
     * @param {{new(): Component}} component
     */
    static _parseComponentOptions(element, component) {
        let options = {};

        let datasetPrefix = component.ComponentData['datasetPrefix'];
        if (datasetPrefix) {
            for (const opt in element.dataset) {
                if (opt.startsWith(datasetPrefix)) {
                    let name = opt.substring(datasetPrefix.length, datasetPrefix.length + 1).toLowerCase() + opt.substring(datasetPrefix.length + 1, opt.length);
                    if (!name || name.length == 0) {
                        name = component.ComponentData['baseName'] || 'data';
                    }
                    try {
                        options[name] = JSON.parse(element.dataset[opt]);
                    } catch {
                        options[name] = element.dataset[opt];
                    }
                }
            }
        }

        return options;
    }
}

ComponentLoader._l = new Logger('ComponentLoader', 'color: green; font-weight: bold;');

if (document.readyState === "complete" || (document.readyState !== "loading" && !document.documentElement.doScroll)) {
    ComponentLoader._loadDocument();
} else {
    document.addEventListener("DOMContentLoaded", () => { ComponentLoader._loadDocument(); });
}

export default ComponentLoader;