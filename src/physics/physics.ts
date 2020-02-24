import { Subject, Observable, combineLatest, MonoTypeOperatorFunction } from "rxjs";
import { sample, map, distinctUntilChanged } from "rxjs/operators";

import { AppService } from "../app-service";
import { App } from "../app";
import { TPC } from "./options";

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

    private _queueInitiator: { [k: string]: Subject<boolean> } = {};

    private _iterationSign: boolean = false;

    protected onInit(instance: App) {
        Object.keys(QueuePriority).forEach((priority: any) => {
            this._queueInitiator[priority] = new Subject();
            this.addToQueue(() => {
                this._queueInitiator[priority].next(this._iterationSign);
            });
        });
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

    syncSample<T>(priority: QueuePriority = QueuePriority.first): MonoTypeOperatorFunction<T> {
        return (source: Observable<T>) => source.pipe(
            sample(this._queueInitiator[priority]),
        )
    }

    syncLatest<T>(priority: QueuePriority = QueuePriority.first): MonoTypeOperatorFunction<T> {
        return (source: Observable<T>) => combineLatest([
            source,
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
        this._iterationSign = !this._iterationSign;
        this._queue.forEach(item => item());
    }

}