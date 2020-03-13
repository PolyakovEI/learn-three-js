import { Observable, fromEvent, Subject, from } from 'rxjs';
import { filter, tap, share, map, concatMap } from 'rxjs/operators';

import { AppService } from '../app-service';
import { App } from '../app';
import { QueuePriority } from '../physics/physics';

/**
 * Объект события клавиши
 */
export interface KeyObservableTypes<ObservableType = KeyboardEvent> {
    up?: Observable<ObservableType>;
    down: Observable<ObservableType>;
    pressed: Observable<ObservableType>;
}

interface KeyMap {
  [key: string]: KeyboardEvent
}

export type KeyObservables = {
  any: KeyObservableTypes;
  anyOff(...keys: string[]): KeyObservableTypes<KeyMap>;
  combination(...keys: string[]): KeyObservableTypes<KeyMap>;
} & {
  [key in string]: KeyObservableTypes;
};

export class KeyboardService extends AppService {
    /** Observable на up KeyboardEvent нажатие клавишь в приложении */
    private _$up: Observable<KeyboardEvent>;
    
    /** Observable на down KeyboardEvent нажатие клавишь в приложении */
    private _$down: Observable<KeyboardEvent>;

    /** Observable на press KeyboardEvent нажатие клавишь в приложении */
    private _$pressed: Subject<KeyMap>;

    /** Массив уже нажатых клавишь */
    private _pressedKeyEvents: KeyMap = {};

    public get pressedKeys() {
      return Object.keys(this._pressedKeyEvents);
    };

    /**
     * Объект observable на нажатие клавиш в приложении
     * * up - событие отжатия клавиши. Срабатывает асинхронно
     * * down - событие нажатия клавиши. Срабатывает асинхронно
     * * preessed - событие зажатия клавиши. Срабатывает синхронно с циклом расчета
     * @TODO срабатывание зажатых клавиш асинхронно сразу же при нажатии (вне предела цикла расчета)
     */
    public keys: KeyObservables;

    protected onInit(instance: App): void {
        // создание слушателей событий нажатий на клавиши
        this._$down = (fromEvent(window, 'keydown') as Observable<KeyboardEvent>).pipe(
            filter(event => !this._pressedKeyEvents[event.key]),
            tap(event => this._pressedKeyEvents[event.key] = event),
            share()
        );
        this._$up = (fromEvent(window, 'keyup') as Observable<KeyboardEvent>).pipe(
            tap(event => delete this._pressedKeyEvents[event.key]),
            share()
        );
        this._$pressed = new Subject();

        const keysObservables = {
          any: <KeyObservableTypes> {
            up: this._$up,
            down: this._$down,
            pressed: this._$pressed.pipe(
              concatMap(events => from(Object.values(events)))
            ),
          },
          anyOff: ((...keys: string[]): KeyObservableTypes<KeyMap> => ({
            up: this._$up.pipe(
              filter(event => keys.includes(event.key)),
              map(event => ({ [event.key]: event }))
            ),
            down: this._$down.pipe(
              filter(event => keys.includes(event.key)),
              map(event => ({ [event.key]: event }))
            ),
            pressed: this._$pressed.pipe(
              filter(events => keys.some(key => events[key])),
              map(events => keys
                .filter(key => events[key])
                .reduce((filteredEvents, key) => {
                  filteredEvents[key] = events[key];
                  return filteredEvents;
                }, {} as KeyMap))
            ),
          })),
          combination: ((...combination: string[]): KeyObservableTypes<KeyMap> => ({
            down: this._$down.pipe(
              filter(_ => combination.every(key => this._pressedKeyEvents[key])),
              map(_ => ({ ...this._pressedKeyEvents })),
            ),
            pressed: this._$pressed.pipe(
              filter(_ => combination.every(key => this._pressedKeyEvents[key])),
            ),
          }))
        } as KeyObservables;

        // создается заготовка под будущий обьект
        this.keys = new Proxy(keysObservables, {
          get: (keys: KeyObservables, key: string) => {
            if (!(key in keys) && key.match(/^\w$/)) {
              // @TODO удаление этого свойства при отписке
              keys[key] = {
                up: this._$up.pipe(filter(event => event.key === key)),
                down: this._$down.pipe(filter(event => event.key === key)),
                pressed: this._$pressed.pipe(
                  filter(events => Boolean(events[key])),
                  map(events => events[key])
                ),
              };
            }
            return keys[key];
          }
        });

        // подписываемся на up и down, чтобы приложение сразу стало записывать клавиши в _pressedKeys
        this._$up.subscribe();
        this._$down.subscribe();

        instance.physics.addToQueue(() => {
          this._$pressed.next(this._pressedKeyEvents)
        }, QueuePriority.system);
    }

    public isPressed(key: string): boolean {
      return Boolean(this._pressedKeyEvents[key]);
    }
}
