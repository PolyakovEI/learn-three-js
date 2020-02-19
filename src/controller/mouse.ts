import { filter, tap, share } from "rxjs/operators";
import { Observable, fromEvent, Subject } from "rxjs";

import { AppService } from "../app-service";
import { App } from "../app";
import { KeyObservableTypes } from "./keyboard";
import { app } from "../main";

export class MouseService extends AppService {

    world = {
        x: 0,
        y: 0,
        px: 0,
        py: 0,
        vx: 0,
        vy: 0,
    };

    screen = {
        x: 0,
        y: 0,
        px: 0,
        py: 0,
        vx: 0,
        vy: 0,
    }
    
    public move: Observable<MouseEvent>;

    public scroll: {
        up: Observable<MouseWheelEvent>,
        down: Observable<MouseWheelEvent>,
    };

    public key: {
        any: KeyObservableTypes<MouseEvent>,
        left: KeyObservableTypes<MouseEvent>,
        wheel: KeyObservableTypes<MouseEvent>,
        right: KeyObservableTypes<MouseEvent>,
    }

    /** Observable на up MouseEvent нажатие клавишь в приложении */
    private _$up: Observable<MouseEvent>;
    
    /** Observable на down MouseEvent нажатие клавишь в приложении */
    private _$down: Observable<MouseEvent>;

    /** Observable на press MouseEvent нажатие клавишь в приложении */
    private _$pressed: Subject<MouseEvent>;

    /** Мапа с зажатыми клавишами */
    private _pressedKeyEvents: Map<MouseEvent['which'], MouseEvent> = new Map();

    onInit(instance: App) { 
        this.move = (<Observable<MouseEvent>> fromEvent(instance.renderer.canvas, 'mousemove')).pipe(
            tap(event => this._updatePosition(event)),
            share()
        );

        this.scroll = {
            up: (<Observable<WheelEvent>> fromEvent(instance.renderer.canvas, 'wheel')).pipe(filter(event => event.deltaY < 0)),
            down: (<Observable<WheelEvent>> fromEvent(instance.renderer.canvas, 'wheel')).pipe(filter(event => event.deltaY > 0)),
        };

        this._$down = (fromEvent(instance.renderer.canvas, 'mousedown') as Observable<MouseEvent>).pipe(
            filter(event => !this._pressedKeyEvents.has(event.which)),
            tap(event => {
                event.preventDefault();
                this._pressedKeyEvents.set(event.which, event);
            }),
            share()
        );
        this._$up = (fromEvent(instance.renderer.canvas, 'mouseup') as Observable<MouseEvent>).pipe(
            tap(event => {
                event.preventDefault();
                this._pressedKeyEvents.delete(event.which);
            }),
            share()
        );
        this._$pressed = new Subject();

        // подписываемся на up и down, чтобы приложение сразу стало записывать клавиши в _pressedKeys
        this.move.subscribe();
        this._$up.subscribe();
        this._$down.subscribe();

        this.key = {
            left: {
                up: this._$up.pipe(filter(event => event.which === 1)),
                down: this._$down.pipe(filter(event => event.which === 1)),
                pressed: this._$pressed.pipe(filter(event => event.which === 1)),
            },
            right: {
                up: this._$up.pipe(filter(event => event.which === 3)),
                down: this._$down.pipe(filter(event => event.which === 3)),
                pressed: this._$pressed.pipe(filter(event => event.which === 3)),
            },
            wheel: {
                up: this._$up.pipe(filter(event => event.which === 2)),
                down: this._$down.pipe(filter(event => event.which === 2)),
                pressed: this._$pressed.pipe(filter(event => event.which === 2)),
            },
            any: {
                up: this._$up,
                down: this._$down,
                pressed: this._$pressed.asObservable(),
            }
        }
    }

    /**
     * Метод рассылки событий уже нажатых клавиш подписчикам на pressed клавиши
     */
    public sync() {
        this._pressedKeyEvents.forEach(event => this._$pressed.next(event));
    }

    /**
     * Обновление позиции мыши
     * @param event - событие движения мыши
     */
    private _updatePosition(event: MouseEvent) {
        this.screen.px = this.screen.x;
        this.screen.py = this.screen.py;

        this.screen.x = event.x;
        this.screen.y = event.y;

        this.screen.vx = this.screen.x - this.screen.px;
        this.screen.vy = this.screen.y - this.screen.py;

        
        this.world.px = this.world.x;
        this.world.py = this.world.y;
        
        this.world.x = event.x * app.camera.width / app.renderer.width - app.camera.width / 2 + app.camera.main.position.x;
        this.world.y = -(event.y * app.camera.height / app.renderer.height - app.camera.height / 2) + app.camera.main.position.y;

        this.world.vx = this.world.x - this.world.px;
        this.world.vy = this.world.y - this.world.py;
    }

}