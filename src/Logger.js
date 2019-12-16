class Logger {
    static _DEBUG = process.env.NODE_ENV == 'development' && !(/MSIE|Trident/.test(window.navigator.userAgent)); // Logger makes IE crash so disable it

    static _cons;
    static _loggers = {};
    static _groupDepth = 0;

    constructor(name, style = '', muted = false) {
        this.name = name;
        this.style = style;
        if (!this.style) {
            this.style = 'color: ' + Logger.randomColor(this.name);
        }
        this.prefix = name + ': ';
        this.muted = muted;

        Logger._loggers[name] = this;
    }

    static randomColor(seed) {
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

    static get(name = 'Default') {
        if (name in Logger._loggers) {
            return Logger._loggers[name];
        } else {
            return new Logger(name);
        }
    }

    debug(...args) {
        if (!this.muted) {
            if (Logger._DEBUG) {
                if (Logger._groupDepth <= 0) {
                    args.unshift('%c' + this.prefix, this.style);
                }
                Logger._cons.log(...args);
            }
        }
    }

    info(...args) {
        if (!this.muted) {
            if (Logger._groupDepth <= 0) {
                args.unshift('%c' + this.prefix, this.style);
            }
            Logger._cons.info(...args);
        }
    }

    warn(...args) {
        if (!this.muted) {
            if (Logger._groupDepth <= 0) {
                args.unshift('%c' + this.prefix, this.style);
            }
            Logger._cons.warn(...args);
        }
    }

    error(...args) {
        //if (!this.muted) {
            if (Logger._groupDepth <= 0) {
                args.unshift('%c' + this.prefix, this.style);
            }
            Logger._cons.error(...args);
        //}
    }

    group(name, expanded = false) {
        if (!this.muted) {
            if (Logger._DEBUG) {

                let args = [];
                if (Logger._groupDepth <= 0) {
                    args.push('%c' + this.prefix, this.style);
                }
                args.push(name);

                Logger._groupDepth++;
                if (expanded) {
                    Logger._cons.group(...args);
                } else {
                    Logger._cons.groupCollapsed(...args);
                }
            }
        }
    }
    groupEnd() {
        if (!this.muted) {
            if (Logger._DEBUG) {
                Logger._cons.groupEnd();
                Logger._groupDepth--;
            }
        }
    }

    table(...args) {
        if (!this.muted) {
            if (Logger._DEBUG) {
                Logger._cons.table(...args);
            }
        }
    }

    startTimer(name) {
        if (!this.muted) {
            if (Logger._DEBUG) {
                Logger._cons.time(name);
            }
        }
    }
    stopTimer(name) {
        if (!this.muted) {
            if (Logger._DEBUG) {
                Logger._cons.timeEnd(name);
            }
        }
    }
}

Logger._cons = window.console;

export default Logger;