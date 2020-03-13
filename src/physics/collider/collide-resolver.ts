import { BoxCollider } from "./box.collider"
import { CircleCollider } from "./circle.collider";
import { LineCollider } from "./line.collider";
import { PointCollider } from "./point.collider";
import { Collider, ColliderType, CollideEvent } from "./collider";
import { Vector3, Line3, Vector2 } from "three";

export interface ColliderResolver {
  (collider1: Collider, collider2: Collider): CollideEvent
}

export function resolver(collider1: Collider, collider2: Collider): CollideEvent {
    return resolverMatrix[collider1.type][collider2.type](collider1, collider2);
}


function BoxToBox(box1: BoxCollider, box2: BoxCollider): CollideEvent {
  if (box1.geometry.boundingBox.intersectsBox(box2.geometry.boundingBox)) {
    // @TODO добавить коллизию
    return null;
  }
  return null;
}

function BoxToCircle(box: BoxCollider, circle: CircleCollider): CollideEvent {
  if (box.geometry.boundingBox.intersectsBox(circle.geometry.boundingBox)) {
    // @TODO добавить коллизию
    return null;
  }
  return null;
}

function BoxToLine(box: BoxCollider, line: LineCollider): CollideEvent {
  return null;
}

function BoxToPoint(box: BoxCollider, point: PointCollider): CollideEvent {
  return null;
}

function CircleToCircle(circle1: CircleCollider, circle2: CircleCollider): CollideEvent {
  return null;
}

function CircleToLine(circle: CircleCollider, line: LineCollider): CollideEvent {
  return null;
}

function CircleToPoint(circle: BoxCollider, point: PointCollider): CollideEvent {
  return null;
}

function LineToLine(line1: LineCollider, line2: LineCollider): CollideEvent {
  return null;
}

function LineToPoint(line: LineCollider, point: PointCollider): CollideEvent {
  const line3 = new Line3(line.a, line.b);
  const positionParameter = line3.closestPointToPointParameter(point.position);
  if (positionParameter >= 0 && positionParameter <= 1) {
    return {
      point: point.position.clone(),
    }
  }
  return null;
}

function PointToPoint(point1: PointCollider, point2: PointCollider): CollideEvent {
  return {
    point: point1.position.clone(),
  };
}

/**
 * Проверка того, что точка, находится на отрезке [a, b]
 * @param point - точка
 * @param a - первый конец отрезка
 * @param b - второй конец отрезка
 */
export function isPointOnLine(point: Vector3, p1: Vector3, p2: Vector3) {
  // const a = new Vector2(p1.x - point.x, p1.y - point.y);
  // const b = new Vector2(p2.x - point.x, p2.y - point.y);
  // const sa = a.x * b.y - b.x * a.y;
  // if (sa > 0.0)
  //     return LEFT;
  // if (sa < 0.0)
  //     return RIGHT;
  // if ((a.x * b.x < 0.0) || (a.y * b.y < 0.0))
  //     return BEHIND;
  // if (a.length() < b.length())
  //     return BEYOND;
  // if (pO == p2)
  //     return ORIGIN;
  // if (p1 == p2)
  //     return DESTINATION;
  // return BETWEEN;
}

interface AABBCheckParam {
  position: Vector3 | Vector2,
  sizes: Vector3 | Vector2,
}

interface AABBCheckResult {
  distance: Vector2,
  minDistance: Vector2,
}

export function checkAABBCollision(a: AABBCheckParam, b: AABBCheckParam): AABBCheckResult {
  const reuslt = {
    distance: new Vector2(Math.abs(a.position.x - b.position.x), 0),
    minDistance: new Vector2(a.sizes.x + b.sizes.x, 0),
  };
  if (reuslt.distance.x < reuslt.minDistance.x) {
    reuslt.distance.y = Math.abs(a.position.y - b.position.y);
    reuslt.minDistance.y = a.sizes.y + b.sizes.y;
    if (reuslt.distance.y < reuslt.minDistance.y) {
      return reuslt;
    }
  }
  return null;
}

interface AABBCheckSphereParam {
  position: Vector3 | Vector2,
  radius: number,
}

interface AABBCheckSphereResult {
  distance: Vector2,
  minDistance: number,
}

export function checkAABBSphereCollision(a: AABBCheckSphereParam, b: AABBCheckSphereParam): AABBCheckSphereResult {
  const reuslt = {
    distance: new Vector2(Math.abs(a.position.x - b.position.x), 0),
    minDistance: a.radius + b.radius,
  };
  if (reuslt.distance.x < reuslt.minDistance) {
    reuslt.distance.y = Math.abs(a.position.y - b.position.y);
    if (reuslt.distance.y < reuslt.minDistance) {
      return reuslt;
    }
  }
  return null;
}

// export function checkAABBCollision(a: Collider, b: Collider): boolean {
//   return a.geometry.geometry.boundingBox.intersectsBox(b.geometry.geometry.boundingBox);
// }

const types: ColliderType[] = ['box', 'circle', 'line', 'point'];
const resolverMatrix: {
  [key in ColliderType]: {
    [key in ColliderType]: ColliderResolver
  }
} = types.reduce((colliders1, type1: ColliderType) => {
  colliders1[type1] = types.reduce((colliders2, type2: ColliderType) => {
    colliders2[type2] = ((t1, t2) => {
      switch (t1) {
        case 'box':
          switch (t2) {
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
          switch (t2) {
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
          switch (t2) {
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
          switch (t2) {
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
