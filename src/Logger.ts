class Logger {
    private static _DEBUG: boolean = process.env.NODE_ENV == 'development' && !(/MSIE|Trident/.test(window.navigator.userAgent)); // Logger makes IE crash so disable it

    private static _cons: Console = window.console;
    private static _loggers: Map<string, Logger> = new Map<string, Logger>();
    private static _groupDepth: number = 0;

    public name: string;
    public style: string;
    public prefix: string;
    public muted: boolean;

    constructor(name: string, style: string = '', muted: boolean = false) {
        this.name = name;
        this.style = style;
        if (!this.style) {
            this.style = 'color: ' + Logger.randomColor(this.name);
        }
        this.prefix = name + ': ';
        this.muted = muted;

        Logger._loggers.set(name, this);
    }

    private static randomColor(seed: string): string {
        let hash = 0, i, chr;
        for (i = 0; i < seed.length; i++) {
            chr = seed.charCodeAt(i);
            hash = ((hash << 5) - hash) + chr;
            hash |= 0; // Convert to 32bit integer
        }

        let rand = Math.floor((Math.abs(Math.sin(hash) * 16777215)) % 16777215) / 16777215;
        let rand2 = Math.floor((Math.abs(Math.sin(hash + 123456789) * 16777215)) % 16777215) / 16777215;

        let h = rand;
        let s = 0.2 + (rand2 * 0.8);
        let l = 0.4;

        let r, g, b;

        if (s == 0) {
            r = g = b = l; // achromatic
        } else {
            let hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1 / 6) return p + (q - p) * 6 * t;
                if (t < 1 / 2) return q;
                if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            }

            let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            let p = 2 * l - q;
            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }

        r *= 255;
        g *= 255;
        b *= 255;

        let rgb = b | (g << 8) | (r << 16);
        return '#' + (0x1000000 + rgb).toString(16).slice(1);
    }

    public static get(name: string = 'Default'): Logger {
        if (Logger._loggers.has(name)) {
            return Logger._loggers.get(name);
        } else {
            return new Logger(name);
        }
    }

    private applyStyle(args: any[], force: boolean = false) {
        if (force || Logger._groupDepth <= 0) {
            args.unshift('%c' + this.prefix, this.style);
        }
    }

    debug(...args: any[]) {
        if (this.muted) return;
        if (!Logger._DEBUG) return;

        this.applyStyle(args);
        Logger._cons.log(...args);
    }

    info(...args: any[]) {
        if (this.muted) return;

        this.applyStyle(args);
        Logger._cons.info(...args);
    }

    warn(...args: any[]) {
        if (this.muted) return;

        this.applyStyle(args);
        Logger._cons.warn(...args);
    }

    error(...args: any[]) {
        // if (this.muted) return;

        this.applyStyle(args);
        Logger._cons.error(...args);
    }

    group(name: string, body: () => void, expanded: boolean = false) {
        this.groupStart(name, expanded);
            body();
        this.groupEnd();
    }
    groupStart(name: string, expanded: boolean = false) {
        if (this.muted) return;
        if (!Logger._DEBUG) return;

        let args = [];
        this.applyStyle(args);
        args.push(name);

        Logger._groupDepth++;
        if (expanded) {
            Logger._cons.group(...args);
        } else {
            Logger._cons.groupCollapsed(...args);
        }
    }
    groupEnd() {
        if (this.muted) return;
        if (!Logger._DEBUG) return;

        Logger._cons.groupEnd();
        Logger._groupDepth--;
    }

    table(...args: any[]) {
        if (this.muted) return;
        if (!Logger._DEBUG) return;

        Logger._cons.table(...args);
    }

    startTimer(name) {
        if (this.muted) return;
        if (!Logger._DEBUG) return;

        Logger._cons.time(name);
    }
    stopTimer(name) {
        if (this.muted) return;
        if (!Logger._DEBUG) return;

        Logger._cons.timeEnd(name);
    }
}

export default Logger;