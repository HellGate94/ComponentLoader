import Component from './Component';
import $ from 'jquery';

class $Component extends Component {
    /**
     * @type {jQuery}
     */
    $el;

    /**
     * @inheritdoc
     */
    static onComponentLoad() {
        super.onComponentLoad();
    }

    /**
     * @inheritdoc
     */
    onLoad() {
        super.onLoad();
    }

    /**
     * @inheritdoc
     */
    constructor(element, options = {}) {
        super(element, options);
        this.$el = $(this.el);
    }

    /**
     * @inheritdoc
     */
    remove() {
        super.remove();
        this.$el = null;
    }
}

export default $Component;