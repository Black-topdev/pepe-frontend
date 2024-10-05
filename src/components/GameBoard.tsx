import React, { useEffect, useState } from "react";
import { AudioPlayer, AudioType } from "./gameComponents/audio";
import { IBody, Body, StaticBody } from "./gameComponents/body";
import { Drawer } from "./gameComponents/drawer";
import { hasCollided } from "./gameComponents/collider";
import {
  BIRD,
  BottomAxisBox,
  CACTUS,
  CAMERA,
  CLOUD,
  DAY_TIME_PERIOD,
  DEBUG,
  DINO,
  GAME_SIZE,
  HIGH_SCORE_BLINK,
  LAND,
  MOON,
  STAR,
} from "./gameComponents/config";
import { InfoHandler, State } from "./gameComponents/info_handler";
import { Key, KeyHandler } from "./gameComponents/key_handler";
import { LandSpawner } from "./gameComponents/land";
import { MoonMovement, MoonObj } from "./gameComponents/moon";
import { IMovement, Movement } from "./gameComponents/movement";
import { IObj, Obj } from "./gameComponents/obj";
import {
  Player,
  PlayerBody,
  PlayerMovement,
  PlayerState,
} from "./gameComponents/player";
import { Spawner } from "./gameComponents/spawner";
import { getNightDensity, randInt } from "./gameComponents/utils";

const genCactusObj = (offX: number): IObj => {
  const { types, pos, spd, acc } = CACTUS;
  const { canvasType, colliderType } = types[randInt(0, types.length - 1)];
  return new Obj(
    (): IBody => {
      return new StaticBody(canvasType, colliderType);
    },
    (): IMovement => {
      return new Movement({ x: pos.x + offX, y: pos.y }, spd, acc);
    }
  );
};

const genBirdObj = (offX: number): IObj => {
  const { frames, frameSeconds, pos, spd, acc } = BIRD;
  return new Obj(
    (): IBody => {
      return new Body(frames, frameSeconds);
    },
    (): IMovement => {
      return new Movement(
        { x: pos.x + offX, y: pos.ys[randInt(0, pos.ys.length - 1)] },
        { x: spd.x, y: spd.y },
        acc
      );
    }
  );
};

const genCloudObj = (offX: number): IObj => {
  const { canvasType, colliderType, pos, spd, acc } = CLOUD;
  return new Obj(
    (): IBody => {
      return new StaticBody(canvasType, colliderType);
    },
    (): IMovement => {
      return new Movement(
        { x: pos.x + offX, y: randInt(pos.y.min, pos.y.max) },
        { x: randInt(spd.x.min, spd.x.max), y: spd.y },
        acc
      );
    }
  );
};

const genStarObj = (offX: number): IObj => {
  const { frames, frameSeconds, pos, spd, acc } = STAR;
  return new Obj(
    (): IBody => {
      return new Body(frames, frameSeconds);
    },
    (): IMovement => {
      return new Movement(
        { x: pos.x + offX, y: randInt(pos.y.min, pos.y.max) },
        { x: spd.x, y: spd.y },
        acc
      );
    }
  );
};

const genLandObj = (offX: number): IObj => {
  const { canvasType, colliderType, pos, spd, acc } = LAND;
  return new Obj(
    (): IBody => {
      return new StaticBody(canvasType, colliderType);
    },
    (): IMovement => {
      return new Movement({ x: pos.x + offX, y: pos.y }, spd, acc);
    }
  );
};

class Time {
  private curTime: number = 0;

  reset(): void {
    this.curTime = 0;
  }

  update(timeElapsed: number): number {
    this.curTime += timeElapsed;
    return this.curTime;
  }

  getCurTime(): number {
    return this.curTime;
  }
}

function init() {
  const time = new Time();
  const camera = new Movement(CAMERA.pos, CAMERA.spd, CAMERA.acc);
  const drawer = new Drawer(GAME_SIZE);
  const starSpawner = new Spawner(STAR.minGap, STAR.maxGap, genStarObj);
  const cactusSpawner = new Spawner(CACTUS.minGap, CACTUS.maxGap, genCactusObj);
  const birdSpawner = new Spawner(BIRD.minGap, BIRD.maxGap, genBirdObj);
  const cloudSpawner = new Spawner(CLOUD.minGap, CLOUD.maxGap, genCloudObj);
  const landSpawner = new LandSpawner(genLandObj);
  const moonObj = new MoonObj(
    (): IBody => {
      return new Body(MOON.frames, MOON.frameSeconds);
    },
    (): MoonMovement => {
      return new MoonMovement(MOON.pos, MOON.spd, MOON.acc);
    }
  );
  const player = new Player(
    DINO.jumpSpd,
    DINO.fallAcc,
    DINO.hardDropAcc,
    (): PlayerBody => {
      const { frames, frameSeconds } = DINO.statusInfo[PlayerState.RUN];
      return new PlayerBody(frames, frameSeconds);
    },
    (): PlayerMovement => {
      return new PlayerMovement(DINO.pos, DINO.spd, DINO.acc);
    }
  );
  const audioPlayer = new AudioPlayer();
  const infoHandler = new InfoHandler(HIGH_SCORE_BLINK, GAME_SIZE);
  const keyHandler = new KeyHandler();

  const draw = () => {
    const curTime = time.getCurTime();
    const cameraPosX = camera.getPos().x;

    drawer.clearCanvas();
    // const { isNight, nightDensity } = getNightDensity(curTime, DAY_TIME_PERIOD);
    // drawer.setCanvas(isNight, nightDensity);

    if (DEBUG) {
      cactusSpawner.drawColliderBoxes(drawer, cameraPosX);
      birdSpawner.drawColliderBoxes(drawer, cameraPosX);
      drawer.drawBoxes(
        player.getColliderBoxes().map((box) => ({
          left: box.left - cameraPosX,
          top: box.top,
          width: box.width,
          height: box.height,
        }))
      );
    }

    // if (isNight) {
    //   starSpawner.drawCanvas(drawer, cameraPosX);
    //   const { x, y } = moonObj.getPos();
    //   drawer.drawCanvas(moonObj.getCanvasType(), { x: x - cameraPosX, y: y });
    // }

    if (!infoHandler.checkIsState(State.NOT_START)) {
      cloudSpawner.drawCanvas(drawer, cameraPosX);
      landSpawner.drawCanvas(drawer, cameraPosX);
      cactusSpawner.drawCanvas(drawer, cameraPosX);
      birdSpawner.drawCanvas(drawer, cameraPosX);

      infoHandler.drawCanvas(drawer);
    }

    const { x, y } = player.getPos();
    drawer.drawCanvas(player.getCanvasType(), { x: x - cameraPosX, y: y });
  };

  const update = (timeElapsed: number) => {
    const curTime = time.update(timeElapsed);

    // camera movement
    camera.update(curTime);
    const cameraPosX = camera.getPos().x;

    // objects movement
    starSpawner.update(curTime, cameraPosX);
    moonObj.updateMoon(curTime, cameraPosX);
    cloudSpawner.update(curTime, cameraPosX);
    landSpawner.update(curTime, cameraPosX);
    cactusSpawner.update(curTime, cameraPosX);
    birdSpawner.update(curTime, cameraPosX);
    player.updatePlayer(curTime, keyHandler.getPressingKeys());
    infoHandler.update(audioPlayer, cameraPosX);
  };

  const onKeyDown = (event: KeyboardEvent) => {
    keyHandler.onKeyDown(event);
    if (keyHandler.getPressingKeys().has(Key.ENTER)) {
      if (infoHandler.checkIsState(State.GAME_OVER)) {
        time.reset();
        camera.reset();
        starSpawner.reset();
        cactusSpawner.reset();
        birdSpawner.reset();
        cloudSpawner.reset();
        landSpawner.reset();
        moonObj.reset();
        player.reset();
        infoHandler.reset();
      }
      infoHandler.updateState(State.PLAYING);
    }
    player.updateEvent(keyHandler.getPressingKeys());
  };

  const onKeyUp = (event: KeyboardEvent) => {
    keyHandler.onKeyUp(event);
    player.updateEvent(keyHandler.getPressingKeys());
  };

  const onResize = () => {
    drawer.setCanvasSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });
    draw();
  };

  return {
    drawer,
    cactusSpawner,
    birdSpawner,
    player,
    audioPlayer,
    infoHandler,
    update,
    draw,
    onKeyDown,
    onKeyUp,
    onResize,
  };
}

const {
  drawer,
  cactusSpawner,
  birdSpawner,
  player,
  audioPlayer,
  infoHandler,
  update,
  draw,
  onKeyDown,
  onKeyUp,
  onResize,
} = init();

export default function GameBoard() {
  const [gameStarted, setGameStarted] = useState(false);
  const updatePeriod = 20;
  useEffect(() => {
    // draw();

    const interval = setInterval(() => {
      if (infoHandler.checkIsState(State.PLAYING) && document.hasFocus()) {
        setGameStarted(!infoHandler.checkIsState(State.NOT_START));
        draw();
        update(updatePeriod);

        // check game status
        if (
          hasCollided(
            player.getColliderBoxes(),
            cactusSpawner.getColliderBoxes()
          )
        ) {
          audioPlayer.playSound(AudioType.CRASH);
          player.enterState(PlayerState.CRASH);
          infoHandler.updateState(State.GAME_OVER);
        }

        if (
          hasCollided(player.getColliderBoxes(), birdSpawner.getColliderBoxes())
        ) {
          if (player.getState() !== PlayerState.ATTACK) {
            audioPlayer.playSound(AudioType.CRASH);
            player.enterState(PlayerState.CRASH);
            infoHandler.updateState(State.GAME_OVER);
          } else {
            birdSpawner.reset();
          }
        }
      }
    }, updatePeriod);

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);
    window.addEventListener("resize", onResize);

    return () => {
      clearInterval(interval);
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("keyup", onKeyUp);
      window.addEventListener("resize", onResize);
      infoHandler.saveHighScore();
    };
  }, []);

  return (
    <div>
      <canvas
        style={{ width: "100%" }} // no set height to follow canvas auto aspect ratio
        width={window.innerWidth}
        height={window.innerHeight}
        ref={(ref) => ref && drawer.setCanvasRef(ref)}
      />
      {gameStarted === false ? (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <p className="text-white font-sans text-[24px]">
            Press Enter to start Game
          </p>
        </div>
      ) : (
        ""
      )}
    </div>
  );
}
