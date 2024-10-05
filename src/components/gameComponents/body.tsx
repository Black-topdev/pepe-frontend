import { CanvasType } from "./drawer"
import { ColliderType } from "./collider"

export interface IBody {
    actionFinished: boolean
    getColliderType(): ColliderType
    getCanvasType(): CanvasType
    update(curTime: number): void

    reset(): void
}

export class Body implements IBody {
    protected frameIdx: number = 0
    protected prevTime: number = 0
    protected cnt : number = 0
    public actionFinished: boolean = false;

    constructor(
        protected frames: Array<{ canvasType: CanvasType, colliderType: ColliderType }>,
        protected frameSeconds: number) {
    }

    reset(): void {
        this.cnt = 0;
        this.frameIdx = 0
        this.prevTime = 0;
        this.actionFinished = true
    }    

    update(curTime: number): void {

        const delta = (curTime - this.prevTime) / 20
        if (delta >= this.frameSeconds) {
            this.prevTime = curTime
            this.frameIdx = (this.frameIdx + 1) % this.frames.length
            this.cnt ++;
        }
        if(this.cnt === this.frames.length) {
            this.actionFinished = true;
            this.cnt = 0;
        }
        else this.actionFinished = false;

    }

    getColliderType(): ColliderType {
        return this.frames[this.frameIdx].colliderType
    }

    getCanvasType(): CanvasType {
        return this.frames[this.frameIdx].canvasType
    }
}

export class StaticBody implements IBody {
    public actionFinished: boolean = false;

    constructor(
        protected canvasType: CanvasType,
        protected colliderType: ColliderType) {
    }

    reset(): void {}    

    update(curTime: number): void {}

    getColliderType(): ColliderType {
        return this.colliderType
    }

    getCanvasType(): CanvasType {
        return this.canvasType
    }
}
