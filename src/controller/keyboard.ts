import { Observable, fromEvent, EMPTY, Subject } from 'rxjs';
import { filter, tap, share } from 'rxjs/operators';

import { AppService } from '../app-service';
import { App } from '../app';

/**
 * Массив клавиш
 */
export const KeysArray = ['w', 'a', 's', 'd'];

/**
 * Клавиши
 */
export type Keys = typeof KeysArray[number];

/**
 * Объект события клавиши
 */
export interface KeyEventsObservable {
    up: Observable<KeyboardEvent>;
    down: Observable<KeyboardEvent>;
    pressed: Observable<KeyboardEvent>;
}

export class KeyboardService extends AppService {
    /** Observable на up KeyboardEvent нажатие клавишь в приложении */
    private _$up: Observable<KeyboardEvent>;
    
    /** Observable на down KeyboardEvent нажатие клавишь в приложении */
    private _$down: Observable<KeyboardEvent>;

    /** Observable на press KeyboardEvent нажатие клавишь в приложении */
    private _$pressed: Subject<KeyboardEvent>;

    /** Массив уже нажатых клавишь */
    private _pressedKeyEvents: Map<KeyboardEvent['key'], KeyboardEvent> = new Map();

    /**
     * Комбинация зажатых клавишь проверяется для каждой клавиши в одну итерацию. Таким образом за одну итерацию
     * обработка срабатывает столько раз, сколько клавишь в комбинации. Чтобы предотвратить это использую lock объект,
     * который обновляется в начале каждой итерации
     */
    private _combinationLock: { [key: number]: true };

    /** Объект observable на нажатие клавиш в приложении */
    public keys: {
        [key in Keys]: KeyEventsObservable;
    } & {
        all: KeyEventsObservable;
        combination(...keys: Keys[]): KeyEventsObservable;
    };

    public onInit(instance: App): void {
        // создание слушателей событий нажатий на клавиши
        this._$down = (fromEvent(window, 'keydown') as Observable<KeyboardEvent>).pipe(
            filter(event => !this._pressedKeyEvents.has(event.key)),
            tap(event => this._pressedKeyEvents.set(event.key, event)),
            share()
        );
        this._$up = (fromEvent(window, 'keyup') as Observable<KeyboardEvent>).pipe(
            tap(event => this._pressedKeyEvents.delete(event.key)),
            share()
        );
        this._$pressed = new Subject();

        // создается заготовка под будущий обьект
        this.keys = {} as any;

        // создание observable-ов для каждой клавиши
        KeysArray.forEach(key => {
            this.keys[key] = {
                up: this._$up.pipe(filter((event: KeyboardEvent) => event.key === key)),
                down: this._$down.pipe(filter((event: KeyboardEvent) => event.key === key)),
                pressed: this._$pressed.pipe(filter((event: KeyboardEvent) => event.key === key)),
            };
        });

        // создание observable-ов на все клавиши
        this.keys.all = {
            up: this._$up,
            down: this._$down,
            pressed: this._$pressed,
        };

        // создание функции комбинации клавиш
        this.keys.combination = (...combination) => {
            const combinationId = Math.random();
            return {
                up: this._$up.pipe(filter(event => {
                    return combination.every(key => this._pressedKeyEvents.has(key) || event.key === key);
                })),
                down: this._$down.pipe(filter(_ => {
                    return combination.every(key => this._pressedKeyEvents.has(key));
                })),
                pressed: this._$pressed.pipe(filter(_ => {
                    if (!this._combinationLock[combinationId] && combination.every(key => this._pressedKeyEvents.has(key))) {
                        return this._combinationLock[combinationId] = true;
                    }
                })),
            } as KeyEventsObservable;
        };

        // подписываемся на up и down, чтобы приложение сразу стало записывать клавиши в _pressedKeys
        this._$up.subscribe();
        this._$down.subscribe();
    }

    /**
     * Метод рассылки событий уже нажатых клавиш подписчикам на pressed клавиши
     */
    public emmitPressed() {
        // очищаем lock объект для комбинаций
        this._combinationLock = {};
        this._pressedKeyEvents.forEach(event => this._$pressed.next(event));
    }
}
