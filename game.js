var GameScene = function (options) {
    Arcadia.Scene.apply(this, arguments);

    options = options || {};

    this.color = 'black';

    var buttonPadding = 5,
        self = this;

    this.running = false;
    this.accumulator = 0;
    this.refreshRate = 1; // in seconds

    this.startButton = new Arcadia.Button({
        color: null,
        border: '2px #fff',
        padding: buttonPadding,
        text: 'start',
        font: '26px monospace',
        action: function () {
            self.toggle();
            this.disabled = true;
            this.alpha = 0.5;
            self.stopButton.disabled = false;
            self.stopButton.alpha = 1.0;
        }
    });
    this.startButton.position = {
        x: this.startButton.size.width / 2 + buttonPadding,
        y: this.startButton.size.height / 2 + buttonPadding
    };
    this.add(this.startButton);

    this.stopButton = new Arcadia.Button({
        color: null,
        border: '2px #fff',
        padding: buttonPadding,
        text: 'stop',
        font: '26px monospace',
        action: function () {
            self.toggle();
            this.disabled = true;
            this.alpha = 0.5;
            self.startButton.disabled = false;
            self.startButton.alpha = 1.0;
        }
    });
    this.stopButton.position = {
        x: this.startButton.position.x + this.startButton.size.width + buttonPadding,
        y: this.stopButton.size.height / 2 + buttonPadding
    };
    this.add(this.stopButton);
    this.stopButton.disabled = true;
    this.stopButton.alpha = 0.5;

    this.resetButton = new Arcadia.Button({
        color: null,
        border: '2px #fff',
        padding: buttonPadding,
        text: 'reset',
        font: '26px monospace',
        action: function () {
            self.reset();
        }
    });
    this.resetButton.position = {
        x: this.stopButton.position.x + this.resetButton.size.width + buttonPadding,
        y: this.resetButton.size.height / 2 + buttonPadding
    };
    this.add(this.resetButton);

    this.decreaseSpeedButton = new Arcadia.Button({
        color: null,
        border: '2px #fff',
        padding: buttonPadding,
        text: '-',
        font: '26px monospace',
        action: function () {
            self.refreshRate += 0.1;
            if (self.refreshRate > 1.5) {
                self.refreshRate = 1.5;
            }
        }
    });
    this.decreaseSpeedButton.position = {
        x: Arcadia.WIDTH - this.decreaseSpeedButton.size.width / 2 - buttonPadding,
        y: this.decreaseSpeedButton.size.height / 2 + buttonPadding
    };
    this.add(this.decreaseSpeedButton);

    this.increaseSpeedButton = new Arcadia.Button({
        color: null,
        border: '2px #fff',
        padding: buttonPadding,
        text: '+',
        font: '26px monospace',
        action: function () {
            self.refreshRate -= 0.1;
            if (self.refreshRate < 0.1) {
                self.refreshRate = 0.1;
            }
        }
    });
    this.increaseSpeedButton.position = {
        x: this.decreaseSpeedButton.position.x - this.increaseSpeedButton.size.width - buttonPadding,
        y: this.increaseSpeedButton.size.height / 2 + buttonPadding
    };
    this.add(this.increaseSpeedButton);

    this.cells = [];

    var CELL_SIZE = 10; // in pixels

    this.ROWS = Math.floor(Arcadia.WIDTH / CELL_SIZE);
    this.COLUMNS = Math.floor(Arcadia.HEIGHT / CELL_SIZE) - 3;

    for (var x = 0; x < this.ROWS; x += 1) {
        for (var y = 0; y < this.COLUMNS; y += 1) {
            var cell = new Arcadia.Shape({
                size: {
                    width: CELL_SIZE,
                    height: CELL_SIZE
                },
                position: {
                    x: CELL_SIZE * x + CELL_SIZE / 2,
                    y: Arcadia.HEIGHT - CELL_SIZE * y + CELL_SIZE / 2
                },
                color: '#333',
                state: 0,
                vertices: 0
            });

            this.add(cell);
            this.cells.push(cell);
        }
    }

    this.nextState = Array(this.cells.length);
};

GameScene.prototype = new Arcadia.Scene();

GameScene.prototype.onPointStart = function (points) {
    var cursor = {
        size: {
            width: 1,
            height: 1
        },
        position: {
            x: points[0].x,
            y: points[0].y
        }
    };

    this.cells.forEach(function (cell) {
        if (cell.collidesWith(cursor)) {
            if (cell.state === 0) {
                cell.color = 'lightyellow';
                cell.state = 1;
                this.drawing = true;
            } else {
                cell.color = '#333';
                cell.state = 0;
                this.drawing = false;
            }
        }
    });
};

GameScene.prototype.onPointMove = function (points) {
    var cursor = {
        size: {
            width: 1,
            height: 1
        },
        position: {
            x: points[0].x,
            y: points[0].y
        }
    };

    this.cells.forEach(function (cell) {
        if (cell.collidesWith(cursor)) {
            if (this.drawing) {
                cell.color = 'lightyellow';
                cell.state = 1;
            } else {
                cell.color = '#333';
                cell.state = 0;
            }
        }
    });
};

GameScene.prototype.toggle = function () {
    this.running = !this.running;
};

GameScene.prototype.reset = function () {
    if (confirm('u sure, bro?')) {
        this.cells.forEach(function (cell) {
            cell.color = '#333';
            cell.state = 0;
        });
    }
};

GameScene.prototype.update = function (delta) {
    Arcadia.Scene.prototype.update.apply(this, arguments);

    if (!this.running) {
        return;
    }

    this.accumulator += delta; // in seconds

    if (this.accumulator < this.refreshRate) {
        return;
    }

    // Reset here
    this.accumulator = 0;

    var cell, top, bottom, left, right, topleft, topright, bottomleft, bottomright,
        neighborCount, self = this;

    // Run the simulation here
    // Note: the calculations need to happen simultaneously! ur doing it sequentially, bro
    for (var i = 0; i < this.cells.length; i += 1) {
        // find indices of eight neighbors
        neighborCount = 0;

        top = i - this.COLUMNS;
        bottom = i + this.COLUMNS;
        left = i - 1;
        right = i + 1;
        topleft = top - 1;
        topright = top + 1;
        bottomleft = bottom - 1;
        bottomright = bottom + 1;

        [top, bottom, left, right, topleft, topright, bottomleft, bottomright].forEach(function (i) {
            var c = self.cells[i];
            if (c === undefined) {
                return;
            }

            if (c.state === 1) {
                neighborCount += 1;
            }
        });

        cell = this.cells[i];

        // If "dead" with three "live" neighbors
        if (cell.state === 0 && neighborCount === 3) {
            this.nextState[i] = 1;
        // If "live" with less than 2 or greater than 3 "live" neighbors
        } else if (cell.state === 1 && (neighborCount < 2 || neighborCount > 3)) {
            this.nextState[i] = 0;
        }
    }

    // move the display to the next state
    this.nextState.forEach(function (state, i) {
        var cell = self.cells[i];
        if (state === 0) {
            cell.color = '#333';
            cell.state = 0;
        } else {
            cell.color = 'lightyellow';
            cell.state = 1;
        }
    });
};
