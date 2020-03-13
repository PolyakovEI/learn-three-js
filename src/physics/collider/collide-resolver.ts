import { BoxCollider } from "./box.collider"
import { CircleCollider } from "./circle.collider";
import { LineCollider } from "./line.collider";
import { PointCollider } from "./point.collider";
import { Collider, ColliderType } from "./collider";
import { Vector3, Vector2 } from "three";

export interface ColliderResolver {
    (collider1: Collider, collider2: Collider): boolean
}

export function resolver(collider1: Collider, collider2: Collider): boolean {
    return resolverMatrix[collider1.type][collider2.type](collider1, collider2);
}

const types: ColliderType[] = ['box', 'circle', 'line', 'point'];

const resolverMatrix: {
    [key in ColliderType]: {
        [key in ColliderType]: ColliderResolver
    }
} = types.reduce((colliders1, type1: ColliderType) => {
    colliders1[type1] = types.reduce((colliders2, type2: ColliderType) => {
        colliders2[type2] = ((t1, t2) => {
            switch(t1) {
                case 'box':
                    switch(t2) {
                        case 'box':
                            return BoxToBox;
                        case 'circle':
                            return BoxToCircle;
                        case 'line':
                            return BoxToLine;
                        case 'point':
                            return BoxToLine;
                    }
                case 'circle':
                    switch(t2) {
                        case 'box':
                            return BoxToCircle;
                        case 'circle':
                            return CircleToCircle;
                        case 'line':
                            return CircleToLine;
                        case 'point':
                            return CircleToPoint;
                    }
                case 'line':
                    switch(t2) {
                        case 'box':
                            return BoxToLine;
                        case 'circle':
                            return CircleToLine;
                        case 'line':
                            return LineToLine;
                        case 'point':
                            return LineToPoint;
                    }
                case 'point':
                    switch(t2) {
                        case 'box':
                            return BoxToPoint;
                        case 'circle':
                            return CircleToPoint;
                        case 'line':
                            return LineToPoint;
                        case 'point':
                            return PointToPoint;
                    }
            }
        })(type1, type2) as ColliderResolver
        return colliders2;
    }, {} as any)
    return colliders1;
}, {} as any);

function BoxToBox(box1: BoxCollider, box2: BoxCollider): boolean {
    return false;
}

function BoxToCircle(box: BoxCollider, circle: CircleCollider): boolean {
    return false;
}

function BoxToLine(box: BoxCollider, line: LineCollider): boolean {
    return false;
}

function BoxToPoint(box: BoxCollider, point: PointCollider): boolean {
    return false;
}

function CircleToCircle(circle1: CircleCollider, circle2: CircleCollider): boolean {
    return false;
}

function CircleToLine(circle: CircleCollider, line: LineCollider): boolean {
    return false;
}

function CircleToPoint(circle: BoxCollider, point: PointCollider): boolean {
    return false;
}

function LineToLine(line1: LineCollider, line2: LineCollider): boolean {
    return false;
}

function LineToPoint(line: LineCollider, point: PointCollider): boolean {
    return false;
}

function PointToPoint(point1: PointCollider, point2: PointCollider): boolean {
    return point1.position.equals(point2.position);
}

/**
 * Проверка того, что точка, находится на отрезке [a, b]
 * @param point - точка
 * @param a - первый конец отрезка
 * @param b - второй конец отрезка
 */
export function isPointOnLine(point: Vector3, p1: Vector3, p2: Vector3) {
    const a = new Vector2(p1.x - point.x, p1.y - point.y);
    const b = new Vector2(p2.x - point.x, p2.y - point.y);
    const sa = a.x * b.y - b.x * a.y;
    if (sa > 0.0)
        return LEFT;
    if (sa < 0.0)
        return RIGHT;
    if ((a.x * b.x < 0.0) || (a.y * b.y < 0.0))
        return BEHIND;
    if (a.length() < b.length())
        return BEYOND;
    if (pO == p2)
        return ORIGIN;
    if (p1 == p2)
        return DESTINATION;
    return BETWEEN;
}