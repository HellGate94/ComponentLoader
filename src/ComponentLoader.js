import Logger from './Logger';

class ComponentData {

    /** @var {{new(): Component}} component */
    component;

    /** @var {any} data */
    data;

    /** @var {(key, value) => any} component */
    optionParser;

    constructor(component, data, optionParser = null) {
        this.component = component;
        this.data = data;
        this.optionParser = optionParser;
    }
}

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
     * @param {any} componentdata the componentdata. if null it will use the static component.ComponentData value
     * @param {(key, value) => any} optionparser callback function to alter component options
     */
    static registerComponent(component, componentdata = null, optionparser = null) {
        ComponentLoader._loadedComponents.push(new ComponentData(component, componentdata || component.ComponentData, optionparser));

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
                const componentdata = this._loadedComponents[i];
                componentdata.component.onComponentLoad();
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
            const componentdata = this._loadedComponents[i];
            let loadedcomponents = ComponentLoader._applyComponent(elements, componentdata);
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
     * @param {ComponentData} componentdata
     */
    static _applyComponent(elements, componentdata) {
        let loadedcomponents = [];

        const component = componentdata.component;

        let sel = componentdata.data['selector'];

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
            
            let options = ComponentLoader._parseComponentOptions(value, componentdata);
    
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
     * @param {ComponentData} componentdata
     */
    static _parseComponentOptions(element, componentdata) {
        let options = {};

        let datasetPrefix = componentdata.data['datasetPrefix'];
        if (datasetPrefix) {
            for (const opt in element.dataset) {
                if (opt.startsWith(datasetPrefix)) {
                    let name = opt.substring(datasetPrefix.length, datasetPrefix.length + 1).toLowerCase() + opt.substring(datasetPrefix.length + 1, opt.length);
                    if (!name || name.length == 0) {
                        name = componentdata.data['baseName'] || 'data';
                    }
                    let value;
                    try {
                        value = JSON.parse(element.dataset[opt]);
                    } catch {
                        value = element.dataset[opt];
                    }
                    if (componentdata.optionParser) {
                        value = componentdata.optionParser(name, value);
                    }
                    options[name] = value;
                }
            }
        }

        return options;
    }
    
    /**
     * 
     * @param {{new(): Component}} componentclass The Component Type to find
     * @param {Element} scope Where to search for. Default document.body
     * @returns {Array<Component>}
     */
    static findComponents(componentclass, scope = document.body) {
        let components = [];
        let sel = componentclass.ComponentData['selector'];
        if (sel) {
            let compelements = scope.querySelectorAll(sel);
            for (const ele of compelements) {
                let elecomp = ele.getComponent(componentclass);
                components.push(elecomp);
            }
        }
        return components;
    }
}

ComponentLoader._l = new Logger('ComponentLoader', 'color: green; font-weight: bold;');

if (document.readyState === "complete" || (document.readyState !== "loading" && !document.documentElement.doScroll)) {
    ComponentLoader._loadDocument();
} else {
    document.addEventListener("DOMContentLoaded", () => { ComponentLoader._loadDocument(); });
}

export default ComponentLoader;