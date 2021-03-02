import React from 'react';
import './App.css';
import audio from '../../raw/music.mp3'

const DIRECTS = {
    up: 'up',
    down: 'down',
    left: 'left',
    right: 'right',
};

const audioPlayer = new Audio(audio);
const fieldSize = 450;
const snakeSize = 10;

// const FIELD_WIDTH = 500;
// const FIELD_HEIGHT = 500;
// const

// let interval = null;
// let ctx = null;

class App extends React.Component {
    state = {
        ctx: null,
        interval: null,
        snake: null,
        currentDirection: DIRECTS.right,
        isFoodExists: false,
        currFoodPosX: null,
        currFoodPosY: null,
        score: 0,
        isGameOver: false,
        sync: true,
        muted: true
    };
    canvas = React.createRef();

    componentDidMount() {
        this.startGame();
    }

    componentWillUnmount() {
        this.stopGame();
    }

    createFood = () => {
        let rnd1 = Math.floor(Math.random() * fieldSize);
        let rnd2 = Math.floor(Math.random() * fieldSize);
        rnd1 = rnd1 - (rnd1 % 10);
        rnd2 = rnd2 - (rnd2 % 10);

        this.setState({ currFoodPosX: rnd1 });
        this.setState({ currFoodPosY: rnd2 });
        this.setState({ isFoodExists: true });
    };
    createSnake = () => {
        return [
            { x: 10, y: 250 },
            { x: 20, y: 250 },
            { x: 30, y: 250 },
            { x: 40, y: 250 },
            { x: 50, y: 250 },
        ];
    };

    handlerKeydown = (e) => {
        const { currentDirection, sync } = this.state;

        switch (e.code) {
            case 'KeyW':
            case 'ArrowUp':
                this.up(currentDirection, sync);
                break;
            case 'KeyS':
            case 'ArrowDown':
                this.down(currentDirection, sync);
                break;
            case 'KeyA':
            case 'ArrowLeft':
                this.left(currentDirection, sync);
                break;
            case 'KeyD':
            case 'ArrowRight':
                this.right(currentDirection, sync);
                break;
            default:
                break;
        }
        this.setState({ sync: false });
    };

    up = (currentDirection, sync) => {
        if (currentDirection !== DIRECTS.up && currentDirection !== DIRECTS.down && sync) {
            this.setState({ currentDirection: DIRECTS.up });
        }
    };
    down = (currentDirection, sync) => {
        if (currentDirection !== DIRECTS.down && currentDirection !== DIRECTS.up && sync) {
            this.setState({ currentDirection: DIRECTS.down });
        }
    };
    left = (currentDirection, sync) => {
        if (currentDirection !== DIRECTS.left && currentDirection !== DIRECTS.right && sync) {
            this.setState({ currentDirection: DIRECTS.left });
        }
    };
    right = (currentDirection, sync) => {
        if (currentDirection !== DIRECTS.right && currentDirection !== DIRECTS.left && sync) {
            this.setState({ currentDirection: DIRECTS.right });
        }
    };

    startGame = () => {
        const ctx = this.canvas.current.getContext('2d');
        document.addEventListener('keydown', this.handlerKeydown);
        const interval = setInterval(this.moveSnake, 70);
        this.setState({ interval, ctx, isGameOver: false, snake: this.createSnake(), score: 0 });
    };

    stopGame = () => {
        clearInterval(this.state.interval);
        document.removeEventListener('keydown', this.handlerKeydown);
        this.setState({ isGameOver: true, currentDirection: DIRECTS.right });
    };

    moveSnake = () => {
        const { currFoodPosX, currFoodPosY, snake, sync } = this.state;
        const { x, y } = snake[snake.length - 1];

        if (!sync) this.setState({ sync: true });

        if (snake.some((el, idx) => (idx < snake.length - 1 ? el.x === x && el.y === y : false))) {
            this.stopGame();
            return;
        }

        this.setState(({ snake, currentDirection, currFoodPosX, currFoodPosY }) => {
            let { x, y } = snake[snake.length - 1];

            if (currentDirection === DIRECTS.up) {
                y -= snakeSize;
            } else if (currentDirection === DIRECTS.down) {
                y += snakeSize;
            } else if (currentDirection === DIRECTS.left) {
                x -= snakeSize;
            } else if (currentDirection === DIRECTS.right) {
                x += snakeSize;
            }

            if (y >= fieldSize) y = 0;
            else if (y < 0) y = fieldSize - snakeSize;

            if (x >= fieldSize) x = 0;
            else if (x < 0) x = fieldSize - snakeSize;

            const newSnake = [...snake];
            newSnake.push({ x, y });

            if (!(currFoodPosX === x && currFoodPosY === y)) {
                newSnake.shift();
            }

            return {
                snake: newSnake,
            };
        });

        if (currFoodPosX === x && currFoodPosY === y) {
            this.setState(({ score }) => ({ isFoodExists: false, score: score + 1 }));
        }
    };
    startMusic = () => {
        audioPlayer.play();
        audioPlayer.loop = true;
        this.setState({muted: false});
    };
    stopMusic = () => {
        audioPlayer.pause();
        this.setState({muted: true});
    }

    render() {
        const {
            ctx,
            snake,
            isFoodExists,
            currFoodPosX,
            currFoodPosY,
            score,
            isGameOver,
            muted
        } = this.state;

        if (ctx) {
            ctx.clearRect(0, 0, fieldSize, fieldSize);
            ctx.fillStyle = 'rgb(200, 0, 0)';
            snake.map((el) => {
                ctx.fillRect(el.x, el.y, snakeSize, snakeSize);
            });

            if (!isFoodExists) this.createFood();
            else {
                ctx.fillStyle = 'rgb(2, 200, 200)';
                ctx.fillRect(currFoodPosX, currFoodPosY, snakeSize, snakeSize);
            }
            
        }

        const music = muted ? <button onClick={this.startMusic}>Unmute music</button> : <button onClick={this.stopMusic}>Mute music</button>

        return (
            <div className="main">
                <div>{music}</div>
                <div className="container">
                    <h1>Score: {score}</h1>
                    <canvas id="canvas" height={fieldSize} width={fieldSize} ref={this.canvas}>
                        Hello world!
                    </canvas>
                    <audio id="audio" src={audio} autoPlay={true} loop={true} muted={true}></audio>
                    {isGameOver ? <GameOver score={score} retry={this.startGame} /> : null}
                </div>
            </div>
        );
    }
}

const GameOver = (props) => {
    const style1 = {
        position: 'absolute',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        height: '100vh',
        width: '100vw',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    };
    const style2 = {
        width: '300px',
        height: '300px',
        opacity: '0.5',
        backgroundColor: 'white',
        textAlign: 'center',
    };
    return (
        <div style={style1}>
            <div style={style2}>
                <h2>You lose!</h2>
                <h3>Score: {props.score}</h3>
                <div>
                    <button onClick={props.retry}>Retry</button>
                </div>
            </div>
        </div>
    );
};

export default App;
