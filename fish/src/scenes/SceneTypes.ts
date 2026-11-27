import * as THREE from 'three';

export interface GameScene {
  readonly scene: THREE.Scene;
  readonly camera: THREE.PerspectiveCamera;
  enter(): void;
  exit(): void;
  update(dt: number, elapsed: number): void;
  resize(width: number, height: number): void;
  onPointerMove?(ndcX: number, ndcY: number, isDown: boolean): void;
  onPointerDown?(ndcX: number, ndcY: number): void;
  onPointerUp?(ndcX: number, ndcY: number): void;
  onKeyDown?(code: string): void;
  onKeyUp?(code: string): void;
}
