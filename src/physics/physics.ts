import { Subject, Observable, combineLatest, MonoTypeOperatorFunction } from "rxjs";
import { sample, map, distinctUntilChanged, tap } from "rxjs/operators";

import { AppService } from "../app-service";
import { App } from "../app";
import { TPC } from "./options";

/** Символ для хранения id функции в очереди */
const queueId = Symbol();

/** Символ для хранения приоритета функции в очереди */
const queuePriority = Symbol();

/**
 * Приоритеты выполнения функции из очереди
 * Функции выполняются в порядке возврастания приоритета
 */
export enum QueuePriority {
    system = 0,
    first = 1,
    second = 2,
    third = 3
};

/**
 * Интерфейс функции в очереди на выполнение
 */
export interface QueueCallback {
    (): void;
    [queueId]?: number;
    [queuePriority]?: QueuePriority;
}

/**
 * Сервис для организации цикла физических вычислений
 */
export class PhysicsService extends AppService {
    /** Проверка того, что цикл запущен */
    get isOn() {
        return this._physicsId !== null;
    }

    /** id interval-а цикла расчетов */
    private _physicsId: NodeJS.Timeout = null;

    /** Очередь функций на выполнение */
    private _queue: QueueCallback[] = [];

    /** Счетчик для выставления идентификатора функции в очереди */
    private _queueCounter: number = 1;

    /**
     * Набор Subject-ов для синхронизации кастомных observable с циклом расчетов. Кастомные observale объекты синхронизируются с этими
     * Subject-ами, ожидая эмита в них
     */
    private _queueInitiator: { [k: string]: Subject<boolean> } = {};

    /**
     * Флаг итерации для того, чтобы отличить одну итерацию цикла от предыдущей. Используется для того, чтобы на одной и той же итерации
     * одни и те же события не триггерились несколько раз
     */
    private _iterationSign: boolean = false;

    protected onInit(instance: App) {
        Object.keys(QueuePriority).forEach((priority: any) => {
            this._queueInitiator[priority] = new Subject();
            this.addToQueue(() => {
                this._queueInitiator[priority].next(this._iterationSign);
            });
        });
    }

    /**
     * Проверка того, что это функция находится в цикле
     * @param callback - функция
     */
    isQueueFunction(callback: any) {
        return Boolean(callback[queueId]);
    }

    /**
     * Метод, добавляющий функцию в очередь на выполнение в цикл расчетов. При добавлении той же функции старая удаляется
     * @param callback - функция, которая будет выполнятся в цикле расчетов
     * @param priority - приоритет функции
     * @returns id добавленной функции. Может быть использовано для того, чтобы позже удалить функцию из очереди
     */
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

    /**
     * Удаление функции из очереди на выполнение в цикле расчетов
     * @param callback - функция или id функции в очереди
     */
    removeFromQueue(callback: QueueCallback | number): boolean {
        const id = typeof callback === 'number' ? callback : callback[queueId];
        const index = this._queue.findIndex(item => item[queueId] === id);
        if (index !== -1) {
            delete this._queue[index][queueId];
            delete this._queue[index][queuePriority];
            this._queue.splice(index, 1);
            return true;
        }
        return false;
    }

    /**
     * Добавление/удаление функции из очереди при возникновении события
     * @param toggle - observable на событие
     * @param callback - функция для добавления в очередь
     * @param priority - приоритет функции
     */
    toggleToQueueOn(toggle: Observable<any>, callback: QueueCallback, priority: QueuePriority = QueuePriority.first) {
        let inQueue = this.isQueueFunction(callback);
        return toggle.pipe(
            tap(_ => {
                if (inQueue) {
                    this.removeFromQueue(callback);
                } else {
                    this.addToQueue(callback, priority);
                }
                inQueue = !inQueue;
            })
        )
    }

    /**
     * Пайпа для синхронизации observable с циклом расчетов. Эмит observable откладывается до ближайшего выполнения цикла расчетов
     * @param priority - приоритет выполнения. Определяет очередь выполнения observable внутри цикла
     */
    syncSample<T>(priority: QueuePriority = QueuePriority.first): MonoTypeOperatorFunction<T> {
        return (source: Observable<T>) => source.pipe(
            sample(this._queueInitiator[priority]),
        )
    }

    /**
     * Пайпа для синхронизации observable с циклом расчетов. Последний эмит повторяется с каждым выполнением цикла расчетов
     * @param priority - приоритет выполнения. Определяет очередь выполнения observable внутри цикла
     */
    syncLatest<T>(priority: QueuePriority = QueuePriority.first): MonoTypeOperatorFunction<T> {
        return (source: Observable<T>) => combineLatest([
            source,
            this._queueInitiator[priority]
        ]).pipe(
            distinctUntilChanged((f, s) => f[1] === s[1]),
            map(([observable]) => observable)
        );
    }

    /**
     * Метод для запуска цикла отрисовки
     */
    start() {
        this._physicsId = setInterval(() => this._physics(), TPC);
    }

    /**
     * Метод для остановки цикла отрисовки
     */
    stop() {
        clearInterval(this._physicsId);
    }

    /**
     * Главный метод для выполнения физического расчета, вызывается каждые CPT миллисекунд
     */
    private _physics() {
        this._iterationSign = !this._iterationSign;
        this._queue.forEach(item => item());
    }

}