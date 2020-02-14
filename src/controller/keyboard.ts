import { Observable, fromEvent, EMPTY, Subject } from 'rxjs';
import { filter, tap, share } from 'rxjs/operators';

import { AppService } from '../app-service';
import { App } from '../app';

/**
 * Объект события клавиши
 */
export interface KeyObservableTypes {
    up: Observable<KeyboardEvent>;
    down: Observable<KeyboardEvent>;
    pressed: Observable<KeyboardEvent>;
}

export type KeyObservables = {
  all: KeyObservableTypes;
  combination(...keys: string[]): KeyObservableTypes;
} & {
  [key in string]: KeyObservableTypes;
};

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
    public _iteration: boolean;

    /**
     * Объект observable на нажатие клавиш в приложении
     * * up - событие отжатия клавиши. Срабатывает асинхронно
     * * down - событие нажатия клавиши. Срабатывает асинхронно
     * * preessed - событие зажатия клавиши. Срабатывает синхронно с циклом расчета
     * @TODO срабатывание зажатых клавиш асинхронно сразу же при нажатии (вне предела цикла расчета)
     */
    public keys: KeyObservables;

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

        const keysObservables = {
          all: {
            up: this._$up,
            down: this._$down,
            pressed: this._$pressed,
          } as KeyObservableTypes,
          combination: (...combination: string[]) => {
            let iteration: boolean = false;
            return {
              up: this._$up.pipe(filter(event => {
                return combination.every(key => this._pressedKeyEvents.has(key) || event.key === key);
              })),
              down: this._$down.pipe(filter(_ => {
                return combination.every(key => this._pressedKeyEvents.has(key));
              })),
              pressed: this._$pressed.pipe(filter(_ => {
                if (iteration !== this._iteration && combination.every(key => this._pressedKeyEvents.has(key))) {
                  iteration = this._iteration;
                  return true;
                }
              })),
            } as KeyObservableTypes;
          }
        } as KeyObservables;

        // создается заготовка под будущий обьект
        this.keys = new Proxy(keysObservables, {
          get: (keys, key: string) => {
            if (!(key in keys) && key.match(/^\w$/)) {
              keys[key] = {
                up: this._$up.pipe(filter((event: KeyboardEvent) => event.key === key)),
                down: this._$down.pipe(filter((event: KeyboardEvent) => event.key === key)),
                pressed: this._$pressed.pipe(filter((event: KeyboardEvent) => event.key === key)),
              };
            }
            return keys[key];
          }
        });

        // подписываемся на up и down, чтобы приложение сразу стало записывать клавиши в _pressedKeys
        this._$up.subscribe();
        this._$down.subscribe();
    }

    /**
     * Метод рассылки событий уже нажатых клавиш подписчикам на pressed клавиши
     */
    public emmitPressed() {
        this._iteration = !this._iteration;
        this._pressedKeyEvents.forEach(event => this._$pressed.next(event));
    }
}
