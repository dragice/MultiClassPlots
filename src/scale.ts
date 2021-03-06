import Color from './color';

export interface ScaleTrait {
    map(value:number):number;
}

export class LinearScale implements ScaleTrait {
    constructor(public domain: [number, number], public range: [number, number]) {

    }

    map(value:number) {
        return this.range[0] + (this.range[1] - this.range[0]) / (this.domain[1] - this.domain[0]) * (value - this.domain[0]);
    }
}

export class LogScale implements ScaleTrait {
    logBase: number;
    internalScale: LinearScale;

    constructor(public domain: [number, number], public range: [number, number], public base:number = Math.E) {
        this.logBase = Math.log(base);
        this.internalScale = new LinearScale([Math.log(domain[0]) / this.logBase, Math.log(domain[1]) / this.logBase], range);
    }

    map(value:number) {
        return this.internalScale.map(Math.log(value) / this.logBase);
    }
}

export class RootScale implements ScaleTrait {
    internalScale: LinearScale;

    constructor(public domain: [number, number], public range: [number, number], public degree: number = 2) {
        this.internalScale = new LinearScale([Math.pow(domain[0], 1 / degree), Math.pow(domain[1], 1 / degree)], range);
    }

    map(value:number) {
        return this.internalScale.map(Math.pow(value, 1 / this.degree));
    }
}

export class SquareRootScale extends RootScale {
    constructor(public domain: [number, number], public range: [number, number]) {
        super(domain, range, 2);
    }
}

export class CubicRootScale extends RootScale {
    constructor(public domain: [number, number], public range: [number, number]) {
        super(domain, range, 3);
    }
}

function arange(n:number): number[] {
    return new Array(n).fill(0).map((d, i) => i);
}

export class EquiDepthScale implements ScaleTrait {
    bounds:number[];

    constructor(public domain: number[], public level:number = 10) {
        let sorted = domain.slice();
        sorted.sort();
        this.bounds = arange(level - 1).map(i => sorted[Math.floor((i + 1) / level * domain.length)]);
    }

    map(value:number) { // TODO: use binary search?
        for(let i = 0; i < this.level - 1; i++) {
            if(value < this.bounds[i]) return i;
        }
        return this.level - 1;
    }
}

export interface ColorScaleTrait {
    map(value:number):Color;
}

export class ColorScale implements ColorScaleTrait {
    // An interpolator maps a domain value to [0, 1]
    constructor(public colorRange:[Color, Color], public interpolator:ScaleTrait) {

    }

    map(value:number) {
        return Color.interpolate(this.colorRange[0], this.colorRange[1], this.interpolator.map(value));
    }
}

export class LinearColorScale extends ColorScale {
    constructor(public domain:[number, number], public colorRange:[Color, Color]) {
        super(colorRange, new LinearScale(domain, [0, 1]));
    }
}

export class LogColorScale extends ColorScale {
    constructor(public domain:[number, number], public colorRange:[Color, Color], public base:number=Math.E) {
        super(colorRange, new LogScale(domain, [0, 1], base));
    }
}

export class SquareRootColorScale extends ColorScale {
    constructor(public domain:[number, number], public colorRange:[Color, Color]) {
        super(colorRange, new SquareRootScale(domain, [0, 1]));
    }
}

export class CubicRootColorScale extends ColorScale {
    constructor(public domain:[number, number], public colorRange:[Color, Color]) {
        super(colorRange, new CubicRootScale(domain, [0, 1]));
    }
}

export class EquiDepthColorScale extends ColorScale {
    constructor(public domain:number[], public colorRange:[Color, Color], public level:number = 10) {
        super(colorRange, new EquiDepthScale(domain, level));
    }

    map(value:number) {
        return Color.interpolate(this.colorRange[0], this.colorRange[1], this.interpolator.map(value) / (this.level - 1));
    }
}
