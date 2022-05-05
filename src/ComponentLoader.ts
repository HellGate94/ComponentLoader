import Component, { ComponentDataInfo, IComponentType } from './Component';
import Logger from './Logger';

export type OptionParserDelegate = (key: string, value: any) => any;

class ComponentLoader {
    private static _components: IComponentType<Component>[] = [];
    private static _initialized = false;

    private static _componentOnLoadTimer = 'Components onLoad Time';
    private static _totalTimer = 'Time';
    private static _componentTimer = 'Component Time';

    private static _l: Logger = new Logger('ComponentLoader', 'color: green; font-weight: bold;');

    public static initialize() {
        let state = document.readyState;
        if (state === 'complete' || state === 'interactive') {
            ComponentLoader._initialize();
        } else {
            document.addEventListener('DOMContentLoaded', () => {
                ComponentLoader._initialize();
            });
        }
    }

    private static _initialize() {
        if (!this.initializeCheck()) return;

        ComponentLoader._initialized = true;

        for (const component of this._components) {
            component.onComponentLoad();
        }

        ComponentLoader.applyComponents([document.documentElement], true);
    }

    public static registerComponent(component: IComponentType<Component>) {
        if (!this.initializeCheck()) return;

        ComponentLoader._components.push(component);
    }

    private static initializeCheck(): boolean {
        if (ComponentLoader._initialized) {
            this._l.error('Already initialized. Modifications after initialize are not supported.');
            return false;
        }
        return true;
    }

    public static applyComponents(elements: Element[], logging: boolean = false) {
        this._l.muted = !logging;

        this._l.groupStart('Applying JS Scripts');
        {
            this._l.startTimer(this._totalTimer);

            this._l.groupStart('On Elements', true);
            {
                for (let i = 0; i < elements.length; i++) {
                    const element = elements[i];
                    this._l.debug(element);
                }
            }
            this._l.groupEnd();

            let loaded = [];

            this._l.groupStart('Components', true);
            {
                for (const component of this._components) {
                    let loadedcomponents = ComponentLoader._applyComponent(elements, component);
                    loaded.push(...loadedcomponents);
                }
            }
            this._l.groupEnd();

            this._l.groupStart('Components onLoad Event');
            {
                this._l.debug(`Calling on ${loaded.length} Components`);

                this._l.startTimer(this._componentOnLoadTimer);
                for (let i = 0; i < loaded.length; i++) {
                    const component = loaded[i];
                    component.onLoad();
                }
                this._l.stopTimer(this._componentOnLoadTimer);
            }
            this._l.groupEnd();

            this._l.stopTimer('Time');
        }
        this._l.groupEnd();

        this._l.muted = false;
    }

    private static _applyComponent(elements: Element[], component: IComponentType<Component>): Component[] {
        let loadedcomponents: Component[] = [];

        let sel = component.ComponentData.selector;

        let componentElements: Element[] = [];
        for (const element of elements) {
            element.querySelectorAll(sel).forEach((value) => {
                componentElements.push(value);
            });

            // the root can also qualify for components
            if (element.matches(sel)) {
                componentElements.push(element);
            }
        }

        this._l.groupStart(`${component.name} (${componentElements.length})`);
        {
            this._l.startTimer(this._componentTimer);

            for (const element of componentElements) {
                let options = ComponentLoader._parseComponentOptions(element as HTMLElement, component.ComponentData);

                this._l.groupStart('Instance', true);
                {
                    loadedcomponents.push(new component(element, options));

                    this._l.debug(element);
                }
                this._l.groupEnd();
            }
            this._l.stopTimer(this._componentTimer);
        }
        this._l.groupEnd();

        return loadedcomponents;
    }

    private static _parseComponentOptions(element: HTMLElement, componentdata: ComponentDataInfo): any {
        let options: any = {};

        let datasetName = componentdata.datasetName;
        if (datasetName) {
            if (datasetName in element.dataset) {
                let optionstring = element.dataset[datasetName];
                try {
                    options = JSON.parse(optionstring);
                } catch (error) {
                    this._l.error(error);
                }
            }
        }

        return options;
    }

    public static findComponents(componentclass: IComponentType<Component>, scope: Element = document.documentElement): Component[] {
        let components: Component[] = [];
        let sel = componentclass.ComponentData.selector;
        if (sel) {
            let compelements = scope.querySelectorAll(sel);
            for (let i = 0; i < compelements.length; i++) {
                const element = compelements[i];

                let elecomp = element.getComponent(componentclass);
                if (elecomp) {
                    components.push(elecomp);
                }
            }
        }
        return components;
    }
}

export default ComponentLoader;