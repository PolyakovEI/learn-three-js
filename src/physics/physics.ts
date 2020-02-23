import { AppService } from "../app-service";
import { App } from "../app";
import { app } from "../main";
import { TPC } from "./options";
import { Subject, Observable, combineLatest } from "rxjs";
import { sample, map, switchMap, distinctUntilChanged } from "rxjs/operators";

const queueId = Symbol();
const queuePriority = Symbol();

export enum QueuePriority {
    system = 0,
    first = 1,
    second = 2,
    third = 3
};

export interface QueueCallback {
    (): void;
    [queueId]?: number;
    [queuePriority]?: QueuePriority;
}

export class PhysicsService extends AppService {
    get isOn() {
        return this._physicsId !== null;
    }

    private _physicsId: NodeJS.Timeout = null;

    private _queue: QueueCallback[] = [];

    private _queueCounter: number = 1;

    private _queueInitiator: { [k: string]: Subject<number> } = Object.keys(QueuePriority).reduce((queueNotifier: any, priority) => {
        queueNotifier[priority] = new Subject();
        return queueNotifier;
    }, {});

    private _iterationId: number = 0;

    protected onInit(instance: App) {
    }

    addToQueue(callback: QueueCallback, priority: QueuePriority = QueuePriority.first): number {
        this.removeFromQueue(callback);
        callback[queueId] = this._queueCounter++;
        callback[queuePriority] = priority;

        const insertIndex = this._queue.findIndex(item => item[queuePriority] >= callback[queuePriority]);
        if (insertIndex === -1) {
            this._queue.push(callback);
        } else {
            this._queue.splice(insertIndex, 0, callback);
        }

        return callback[queueId];
    }

    removeFromQueue(callback: QueueCallback | number) {
        const id = typeof callback === 'number' ? callback : callback[queueId];
        const index = this._queue.findIndex(item => item[queueId] === id);
        if (index !== -1) {
            this._queue.splice(index, 1);
        }
    }

    // @TODO весь этот sync плохо реализован!
    syncSample<T>(callbackObservable: Observable<T>, priority: QueuePriority = QueuePriority.first): Observable<T> {
        return callbackObservable.pipe(
            sample(this._queueInitiator[priority]),
        );
    }

    syncLatest<T>(callbackObservable: Observable<T>, priority: QueuePriority = QueuePriority.first): Observable<T> {
        return combineLatest([
            this.syncSample(callbackObservable, priority),
            this._queueInitiator[priority]
        ]).pipe(
            distinctUntilChanged((f, s) => f[1] === s[1]),
            map(([observable]) => observable)
        );
    }

    start() {
        this._physicsId = setInterval(() => this._physics(), TPC);
    }

    stop() {
        clearInterval(this._physicsId);
    }

    private _physics() {
        this._iterationId++;
        // @TODO починить типизацию приоритетов
        Object.keys(QueuePriority).forEach((priority: any) => {
            this._queueInitiator[priority].next(this._iterationId);
            this._queue
                .filter(item => item[queuePriority] === priority)
                .forEach(item => item());
        });
    }

}