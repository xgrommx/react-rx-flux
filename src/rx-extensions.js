import Rx from 'rx';

/**
 *
 */
export default class RxExtensions extends Rx.Observable {
    constructor() {
        super(arguments);
    }

    /**
     *
     * @param args
     * @returns {Rx.Observable<TResult>}
     */
    static when(...args) {
        return super.zip(
            ...super.from(args).partition((_, i) => i % 2 === 0),
            (stream, callback) => ({stream, callback})
        ).toArray()
            .flatMapLatest(pairs =>
                super.when(...pairs.map(p =>
                    (Array.isArray(p.stream) ? p.stream.reduce((prev, next) => prev.and(next)) : p.stream).thenDo((...args) =>
                            p.callback(...args)
                    )))
        );
    }

    /**
     *
     * @param initial
     * @param args
     * @returns {Rx.Observable<Function>|Rx.Observable<T>}
     */
    static update(initial, ...args) {
        return super.zip(
            ...super.from(args).partition((_, i) => i % 2 === 0),
            (stream, callback) => ({stream, callback})
        ).toArray()
            .flatMapLatest(pairs =>
                super.when(...pairs.map(p =>
                    (Array.isArray(p.stream) ? p.stream.reduce((prev, next) => prev.and(next)) : p.stream).thenDo((...args) =>
                            (prev) => p.callback(...[prev, ...args])
                    )))
        ).startWith(initial).scan((prev, f) => f(prev))
    }
}