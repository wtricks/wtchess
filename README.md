
# WTChess JS

WTChess is a javascript library for chess game moves. It allows you to validate chess piece moves, positions and pieces. It is small and faster than alternatives. The size of this library is 25kb and 11kb is minified


## Installation

You can use this library directly in your html file. Use `script` tag and add it.

```html
  <script src="your-path/wtchess.js"></script>
  <!-- OR Minified -->
  <script src="your-path/wtchess.min.js"></script>
```
## Usage

```javascript
let chess = WTChess();

// call load() method
chess.load();
```


## Features

- Load piece positions from FEN string
- Get all possible and captured moves
- Set how game should be end.
- Detect Stalemate, Checkmate, Three-Fold repeatition, Insufficiant material, Fifty moves 
- Undo, Redo game positions


## Methods

### .load(fen?:string, options?:object)

```javascript
let error = chess.load(
    'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 0',
    {
        'fiftymove': true,
        'insufficiantMaterial': true,
        'threeFoldRepetition': true, 
        'stalemate': false, 
        'checkmate': false
    }
);

console.log(error); 
// if any error found
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `fen` | `string` | **Optional**. Game FEN string |
| `options` | `object` | **Optional**. Game over options |

Here `fen` is valid chess piece oposition string. If you leave this as default then game'll start with default positions. You can use this method `load` to start a new game and reset old pieces positions (if exists). Second parameter `options` is also optional. Default is true for all value but you can decide whether chess game should over with these conditions.

### .square(square?:string)

```javascript
let piece = chess.square('A7');
console.log(piece);
// {PIECE: 'P', COLOR: 'B'}

piece = chess.square('A3');
console.log(piece);
// {PIECE: 'P', COLOR: 'W'}
// OR {PIECE: 'P', COLOR: 'W', ePassant: true}
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `square` | `string` | **Required**. Board square id |

You can get piece information at any board square. If a square contain a piece, you will get a `object` with piece information otherwise it will return null. In `E-PASSANT` condition, if a square has no any piece then this still return piece information with extra property `ePassant`. 

### .position()

```javascript
let piecePosition = chess.position();
console.log(piecePosition);

/* 
{
    A1: {COLOR: 'W', PIECE: 'R'},
    A2: {COLOR: 'W', PIECE: 'N'}
    ...
    ...
    G8: {COLOR: 'B', PIECE: 'N'},
    H8: {COLOR: 'B', PIECE: 'R'}
}
*/
```
This method will return complete board square and piece positions.

### .turn()

```javascript
let turn = chess.turn();
console.log(turn);

// B 
// W
```
Get current turn color value

### .status()

```javascript
let status = chess.status();
console.log(status);

// CHECKMATE
// 50MOVE
// T-FOLD
// STALEMATE
// I-MATERIAL
```
You can get currnet status of the game. If game is not over yet then it will return a empty string or undefined.

### .fen()

```javascript
let fen = chess.fen();
console.log(fen);

// rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 0
```

### .print(type?:boolean)

```javascript
let position = chess.print(false);
console.log(position);

// 8 | r  n  b  q  k  b  n  r
// 7 | p  p  p  p  p  p  p  p
// 6 | -  -  -  -  -  -  -  -
// 5 | -  -  -  -  -  -  -  -
// 4 | -  -  -  -  -  -  -  -
// 3 | -  -  -  -  -  -  -  -
// 2 | P  P  P  P  P  P  P  P
// 1 | R  N  B  Q  K  B  N  R
// - - -  -  -  -  -  -  -  -
//   | a  b  c  d  e  f  g  h


position = chess.print();
console.log(position);

//8 | ♜  ♞  ♝  ♛  ♚  ♝  ♞  ♜
//7 | ♟  ♟  ♟  ♟  ♟  ♟  ♟  ♟
//6 | -   -   -   -   -   -  -   -
//5 | -   -   -   -   -   -  -   -
//4 | -   -   -   -   -   -  -   -
//3 | -   -   -   -   -   -  -   -
//2 | ♙  ♙  ♙  ♙  ♙  ♙  ♙  ♙
//1 | ♖  ♘  ♗  ♕  ♔  ♗  ♘  ♖
//- - -   -   -   -   -   -  -   -
//  | a   b   c   d   e   f  g   h
```

### .on(event:string, handler:function)

```javascript
chess.on('load', () => console.log('Game is started with new positions'));
chess.on('capture', (square, piece) => console.log(`${piece} is captured at ${square}`));
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `event` | `string` | **Required**. A event name |
| `handler` | `function` | **Required**. Event handler function |

| Events | Description | Parameter |
| :-------- | :----------- | :------ |
| `load` | Called when you call `.load()` | `fen`: A valid chess fen |
| `capture` | Called when a piece is captured by another piece | `square`: board position ex. A1, `piece`: Piece name|
| `promote` | Called when pawn wil promote. You can return any valid piece name to replace the pawn otherwise default is `Q` | `square`: board position ex. A1|
| `move` | Called when a piece is moved | `from`: board position ex. A1, `to`: board position ex. G1,|
| `swap` | Called when turn is changed | `color`: color name|
| `check` | Called when king is in check | `pieces`: a object of pieces ex. [{PIECE: 'P', COLOR: 'W'}, {PIECE: 'N', COLOR: 'W'}] |
| `gameover` | Called when game will draw or checkmate | `reason`: reason of game ending|
| `fiftymove` | Called when one side complete 50 moves without capturing and running a pawn | `color`: color name|
| `add` | Called when a piece will be add to the board | `square`: board position ex. A1, `color`: color name, `piece`: Piece name|
| `remove` | Called when a piece will be remove from board | `square`: board position ex. A1, `type`: reason of piece removing|

Use this method before calling `.load()`

### .undo()

```javascript
chess.undo();
```

You can undo position of the game by calling this method. This will return a string if no more undo is possible.

### .redo()

```javascript
chess.redo();
```

You can redo position of the game by calling this method. This will return a string if no more redo is possible.

### .moves(square?:string);
```javascript
let moves = chess.moves('B1');
console.log(moves);
// {valid: ['A3', 'C3'], capture: []}

moves = chess.moves();
console.log(moves);
/* [
    {from: 'A2', to: 'A3', piece: 'P', color: 'W'},
    {from: 'A2', to: 'A4', piece: 'P', color: 'W', flag: 'B'},
    ....
    ....
    {from: 'G1', to: 'F3', piece: 'N', color: 'W'},
    {from: 'G1', to: 'H3', piece: 'N', color: 'W'}
] */
```
This method will return all legal moves for a square of a side. If you will pass square position then this will return all captured and valid square moves in seperate array. But if don't pass any parameter then it will return all possible moves for one side pieces.

| FLAGS | Description                |
| :-------- |:------------------------- |
| `E` |  ePassant capture |
| `Q`| Queen side castle |
| `K` | King side castle |
| `B`| Big pawn |
| `P` | Pawn promotion |

If you are using this method without parameter then you will see these flags in moves.

### .move

```javascript
// first way
chess.move({from: 'A2', to: 'A3', flag: 'P'});

// or second way
chess.move('A2', 'A3');
```

You can move a piece from one square to another by two ways.  You can not use this method before `.moves()` methods. So everytime before moving any piece using this method you have to use `.moves()` method.

### Note:
Here all pieces name, colors name and square positions are capitilized

| Piece name | Piece value  |
| :-------- | :------- |
| `King` | `K` |
| `Queen` | `Q` |
| `Bishop` | `B` |
| `Rook` | `R` |
| `Knight` | `N` |
| `Pawn` | `P` |

| Color name | Color value  |
| :-------- | :------- |
| `Black` | `B` |
| `White` | `W` |

And positions 
``` 
A8 B8 C8 D8 E8 F8 G8 H8 
A7 B7 C7 D7 E7 F7 G7 H7 
A6 B6 C6 D6 E6 F6 G6 H6 
A5 B5 C5 D5 E5 F5 G5 H5 
A4 B4 C4 D4 E4 F4 G4 H4 
A3 B3 C3 D3 E3 F3 G3 H3 
A2 B2 C2 D2 E2 F2 G2 H2 
A1 B1 C1 D1 E1 F1 G1 H1 
```
## License

[MIT](https://choosealicense.com/licenses/mit/)


## Author

- [@wtricks](https://www.github.com/wtricks)

