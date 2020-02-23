import { filter, tap, share, pairwise, startWith, map } from "rxjs/operators";
import { Observable, fromEvent, Subject, combineLatest, MonoTypeOperatorFunction } from "rxjs";

import { AppService } from "../app-service";
import { App } from "../app";
import { KeyObservableTypes } from "./keyboard";
import { app } from "../main";
import { Vector3, Vector2, Camera } from "three";

/**
 * Событие мыши в приложении
 */
class AppMouseEvent {
    /** Координаты мыши в рамках canvas */
    screen: {
        /** Координаты */
        position: Vector3,
        /** Скорость движения мыши */
        speed: Vector3,
    } = null;

    /** Координаты мыши внутри мира */
    // @TODO кастовать координаты из камеры
    world: {
        /** Координаты */
        position: Vector3,
        /** Скорость движения мыши */
        speed: Vector3,
    } = null;

    // @TODO игровой объект, на который наведена мышь
    // target: null;

    constructor({ x, y }: { x: number, y: number } = { x: 0, y: 0 }) {
        // координаты мыши над canvas с учетом скрола и отступов внутри документа
        const cx = x - app.renderer.canvas.offsetLeft + window.pageXOffset;
        const cy = y - app.renderer.canvas.offsetTop + window.pageYOffset;

        this.screen = {
            position: new Vector3(cx, cy, 0),
            speed: new Vector3(),
        };

        this.world = {
            position: castOrtho(new Vector2(cx, cy), app.camera.main),
            speed: new Vector3(),
        }
    }
}

/**
 * Метод для определения мирвоой координаты, с которой пересекается луч, брошенный из камеры по координатам coords
 * @param coords - координаты из который кастуется луч
 * @param camera - камера из которой происходит каст
 * @TODO сделать нормальный каст!
 */
export function castOrtho(coords: Vector2, camera: Camera): Vector3 {
    const cameraRift = new Vector2(app.camera.width / 2, app.camera.height / 2);
    const wx = coords.x * app.camera.width / app.renderer.width - cameraRift.x + app.camera.main.position.x;
    const wy = -(coords.y * app.camera.height / app.renderer.height - cameraRift.y) + app.camera.main.position.y;
    return new Vector3(wx, wy, app.camera.main.position.z);
}

export class MouseService extends AppService {
    /** Observable на движение мыши в приложении */
    public move: Observable<AppMouseEvent>;

    /** Observable на вращение колеса мыши в приложении */
    public scroll: {
        up: Observable<MouseWheelEvent>,
        down: Observable<MouseWheelEvent>,
    };

    /** Observable на нажатие клавишей мыши в приложении */
    public key: {
        any: KeyObservableTypes<AppMouseEvent>,
        left: KeyObservableTypes<AppMouseEvent>,
        wheel: KeyObservableTypes<AppMouseEvent>,
        right: KeyObservableTypes<AppMouseEvent>,
    }

    /** Observable на up MouseEvent нажатие клавишь в приложении */
    private _$up: Observable<MouseEvent>;
    
    /** Observable на down  нажатие клавишь в приложении */
    private _$down: Observable<MouseEvent>;

    /** Observable на press MouseEvent нажатие клавишь в приложении */
    private _$pressed: Subject<MouseEvent>;

    /** Мапа с зажатыми клавишами */
    private _pressedKeyEvents: Map<MouseEvent['which'], MouseEvent> = new Map();

    onInit(instance: App) {
        this.move = combineLatest([
            <Observable<MouseEvent>> fromEvent(instance.renderer.canvas, 'mousemove'),
            // при изменении масштаба камеры указатель мыши оказывается в другом месте в мире
            instance.camera.$scale
        ])
        .pipe(
            map(([event]) => new AppMouseEvent(event)),

            // пересчет скорости движения мыши
            startWith(null),
            pairwise(),
            map(([prev, event]) => {
                if (prev) {
                    event.screen.speed = event.screen.position.clone().sub(prev.screen.position);
                    event.world.speed = event.world.position.clone().sub(prev.world.position);
                }
                return event;
            })
        );

        // предотвращение действия по умолчанию через пайпу
        const preventDefault = <T extends Event>(): MonoTypeOperatorFunction<T> => tap((event: T) => event.preventDefault());

        // организация наблюдения за вращением мыши
        const wheel = (<Observable<WheelEvent>> fromEvent(instance.renderer.canvas, 'wheel')).pipe(preventDefault());
        this.scroll = {
            up: wheel.pipe(filter(event => event.deltaY < 0)),
            down: wheel.pipe(filter(event => event.deltaY > 0)),
        };

        // организация наблюдения за нажатием на клавиши мыши
        this._$down = (<Observable<MouseEvent>> fromEvent(instance.renderer.canvas, 'mousedown')).pipe(
            preventDefault(),
            tap(event => this._pressedKeyEvents.set(event.which, event)),
            share()
        );
        this._$up = (<Observable<MouseEvent>> fromEvent(instance.renderer.canvas, 'mouseup')).pipe(
            preventDefault(),
            tap(event => this._pressedKeyEvents.delete(event.which)),
            share()
        );
        this._$pressed = new Subject();
        // подписываемся на up и down, чтобы приложение сразу стало записывать клавиши в _pressedKeys
        this._$up.subscribe();
        this._$down.subscribe();

        this.key = {
            left: {
                up: this._$up.pipe(filter(event => event.which === 1), map(event => new AppMouseEvent(event))),
                down: this._$down.pipe(filter(event => event.which === 1), map(event => new AppMouseEvent(event))),
                pressed: this._$pressed.pipe(filter(event => event.which === 1), map(event => new AppMouseEvent(event))),
            },
            right: {
                up: this._$up.pipe(filter(event => event.which === 3), map(event => new AppMouseEvent(event))),
                down: this._$down.pipe(filter(event => event.which === 3), map(event => new AppMouseEvent(event))),
                pressed: this._$pressed.pipe(filter(event => event.which === 3), map(event => new AppMouseEvent(event))),
            },
            wheel: {
                up: this._$up.pipe(filter(event => event.which === 2), map(event => new AppMouseEvent(event))),
                down: this._$down.pipe(filter(event => event.which === 2), map(event => new AppMouseEvent(event))),
                pressed: this._$pressed.pipe(filter(event => event.which === 2), map(event => new AppMouseEvent(event))),
            },
            any: {
                up: this._$up.pipe(map(event => new AppMouseEvent(event))),
                down: this._$down.pipe(map(event => new AppMouseEvent(event))),
                pressed: this._$pressed.pipe(map(event => new AppMouseEvent(event))),
            }
        }
    }

    /**
     * Метод рассылки событий уже нажатых клавиш подписчикам на pressed клавиши
     */
    public sync() {
        this._pressedKeyEvents.forEach(event => this._$pressed.next(event));
    }
}