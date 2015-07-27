import Rx from 'rx';
import curryRight from 'lodash/function/curryRight';

/**
 *
 */
export default class RxExtensions extends Rx.Observable {
    constructor(...args) {
        super(args);
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
                    ((Array.isArray(p.stream) ? p.stream : [p.stream]).reduce((prev, next) => prev.and(next)))
                        .thenDo(...args => p.callback(...args))
                    )
                )
        ).publish().refCount();
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
                    ((Array.isArray(p.stream) ? p.stream : [p.stream]).reduce((prev, next) => prev.and(next)))
                        .thenDo(curryRight((prev, ...args) => p.callback(...[prev, ...args]), 2))
                    )
                )
        ).startWith(initial).scan((prev, f) => f(prev)).publish().refCount();
    }
}