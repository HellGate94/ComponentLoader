import EventEmitter from './EventEmitter';

export interface IComponentType<T extends Component> {
    new(element: Element, options: any): T;
    ComponentData: ComponentDataInfo;
    onComponentLoad(): void;
}

export type Transformer = (value: any) => any;

export type ComponentDataInfo = {
    /** The Component Selector */
    selector: string | null;
    /** The dataset name that describes where to find the options for the Component. `element.dataset.<datasetName> = options;` */
    datasetName: string | null;
};

abstract class Component extends EventEmitter {
    public static ComponentData: ComponentDataInfo = {
        selector: null,
        datasetName: null,
    };

    /** The DOM Element the Component lives on */
    public el: Element;

    /** The Options for this Component */
    public options: any;

    /** Called on document ready or whenever the Component is registered later on */
    public static onComponentLoad() {
    }

    /** Called after all Components of this batch are created. Use this to acess other components */
    public onLoad() { }

    constructor(element: Element, options: any = {}) {
        super();
        this.el = element;
        this.options = options;

        element.components ??= new Map<Function, Component>();
        this.el.components.set(this.constructor, this);
    }

    /** Cleans up the base Component */
    public remove() {
        this.el.components.delete(this.constructor);
        this.el = null;
        this.options = null;
    }
}

declare global {
    interface Element {
        components: Map<Function, Component> | undefined;
        getComponent<T extends Component>(componentclass: IComponentType<T>): Component | null;
    }
}

Element.prototype.getComponent = function <T extends Component>(componentclass: IComponentType<T>): Component | null {
    if (this.components && this.components.has(componentclass)) {
        return this.components.get(componentclass);
    }
    return null;
}

export default Component;