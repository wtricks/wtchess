/**
 * WTChess - A small & fast javascript chess engine
 * 
 * @author Anuj Kumar <webtricks.ak@gmail.com>
 * @link https://github.com/wtricks/wtchess
 * @link https://instagram.com/webtricks.ak
 */
const WTChess = function () {
  const ALPHA = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const NUM = [8, 7, 6, 5, 4, 3, 2, 1];
  const INSUF = ['Kk', 'BKk', 'KNk', 'KNNk', 'Kbk', 'Kkn', 'Kknn'];
  const ALPHA_NUM = {
    A: 0,
    B: 1,
    C: 2,
    D: 3,
    E: 4,
    F: 5,
    G: 6,
    H: 7
  };
  const FLAGS = {
    QUEEN_CASTLE: 'Q',
    KING_CASTLE: 'K',
    PROMOTION: 'P',
    BIG_PAWN: 'B',
    E_PASSANT: 'E'
  };
  const COLOR = {
    WHITE: 'W',
    BLACK: 'B'
  },
        CONFIG = {};
  const PIECE = {
    KING: 'K',
    QUEEN: 'Q',
    PAWN: 'P',
    KNIGHT: 'N',
    ROOK: 'R',
    BISHOP: 'B'
  };
  const DEFAULT = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 0';
  const EVENTS = ['promote', 'capture', 'move', 'add', 'remove', 'load', 'swap', 'check', 'gameover', 'fiftymove'];
  const BIG_PAWN = {
    W: 3,
    B: 6
  },
        PROMOTE_PAWN = {
    W: 8,
    B: 1
  };
  const MOVES = {
    R: [[-1, 0], [1, 0], [0, -1], [0, 1]],
    B: [[-1, 1], [1, 1], [1, -1], [-1, -1]],
    N: [[-1, 2], [1, 2], [-1, -2], [1, -2], [-2, 1], [-2, -1], [2, 1], [2, -1]],
    K: [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, 1], [1, 1], [1, -1], [-1, -1]],
    Q: [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, 1], [1, 1], [1, -1], [-1, -1]],
    P: {
      W: [[0, 1], [-1, 1], [1, 1]],
      B: [[0, -1], [-1, -1], [1, -1]]
    }
  },
        MOVE_COUNT = {
    K: 1,
    N: 1,
    B: 7,
    R: 7,
    Q: 7,
    P: 1
  },
        EVN = {};
  let pieceTurn = COLOR.WHITE,
      BACKUP = {},
      undo = 0,
      endGame = '',
      ePassant = '-',
      current = null,
      currentSquare = '';
  let HISTORY = [],
      FEN = [],
      POSITION = {},
      KINGS_POSITION = {},
      UNSAFE_POSITION = [];
  let CASTLE = {
    W: {},
    B: {}
  },
      MOVES_COUNT = {
    W: 0,
    W: 0
  },
      redoSquare = false;

  function evaluatePattern(square, piece) {
    let moves = {
      valid: [],
      capture: []
    };
    (piece == PIECE.PAWN ? MOVES.P[pieceTurn] : MOVES[piece]).forEach((pattern, index) => {
      let newSquare = square,
          big = null;

      for (let i = 0; i < MOVE_COUNT[piece]; i++) {
        let first = ALPHA_NUM[newSquare[0]] + pattern[0];
        let second = +newSquare[1] + pattern[1];

        if (first >= 0 && second > 0 && first < 8 && second < 9) {
          let nextSquare = ALPHA[first] + second,
              position = POSITION[nextSquare];
          if ((position == null ? void 0 : position.COLOR) === pieceTurn) break;else if (PIECE.PAWN === piece) {
            if (PROMOTE_PAWN[pieceTurn] == second) moves.flag = FLAGS.PROMOTION;
            if (!position && index === 0 || index !== 0 && ePassant === nextSquare) moves.valid.push(nextSquare);else if (position && index !== 0 && position.COLOR !== pieceTurn) moves.capture.push(nextSquare);
            if (!POSITION[big = ALPHA[first] + (BIG_PAWN[pieceTurn] === 3 ? 4 : 5)] && PIECE.PAWN === piece && BIG_PAWN[pieceTurn] == second && index === 0) moves.valid.push(big);
            newSquare = nextSquare;
            break;
          } else {
            if (position && POSITION.COLOR !== pieceTurn) {
              moves.capture.push(nextSquare);
              break;
            } else {
              moves.valid.push(nextSquare);
              newSquare = nextSquare;
            }
          }
        } else break;
      }
    });
    return moves;
  }

  function getDirection(square1, square2) {
    if (square1[0] == square2[0] || square1[1] == square2[1]) return "P";
    if (Math.abs(square1[1] - square2[1]) == Math.abs(ALPHA_NUM[square1[0]] - ALPHA_NUM[square2[0]])) return "D";
  }

  function isKingUnsafe(square) {
    UNSAFE_POSITION = [];
    let temp = KINGS_POSITION[pieceTurn];
    KINGS_POSITION[pieceTurn] = null;
    [PIECE.QUEEN, PIECE.PAWN, PIECE.KNIGHT].forEach(piece => {
      evaluatePattern(square, piece).capture.forEach(path => {
        var _POSITION$path;

        if (piece == PIECE.QUEEN) {
          var _Math$abs;

          let direction = getDirection(path, square),
              distance = (_Math$abs = Math.abs(path[1] - square[1])) != null ? _Math$abs : Math.abs(ALPHA_NUM[path[0]] - ALPHA_NUM[square[0]]);
          if (distance == 1 && direction === 'P' && [PIECE.QUEEN, PIECE.ROOK, PIECE.KING].some(p => p == POSITION[path].PIECE)) UNSAFE_POSITION.push(path);else if (distance == 1 && direction === 'D' && [PIECE.QUEEN, PIECE.BISHOP, PIECE.KING].some(p => p == POSITION[path].PIECE)) UNSAFE_POSITION.push(path);else if (direction === 'P' && [PIECE.QUEEN, PIECE.ROOK].some(p => p == POSITION[path].PIECE)) UNSAFE_POSITION.push(path);else if (direction === 'D' && [PIECE.QUEEN, PIECE.BISHOP].some(p => p == POSITION[path].PIECE)) UNSAFE_POSITION.push(path);
        } else ((_POSITION$path = POSITION[path]) == null ? void 0 : _POSITION$path.PIECE) == piece && UNSAFE_POSITION.push(path);
      });
    });
    KINGS_POSITION[pieceTurn] = temp;
    return UNSAFE_POSITION;
  }

  function makeBackupOrRestore(backup = false) {
    if (!backup) {
      pieceTurn = BACKUP[0], POSITION = BACKUP[0];
      KINGS_POSITION = BACKUP[2], CASTLE = BACKUP[3];
      UNSAFE_POSITION = BACKUP[4], MOVES_COUNT = BACKUP[5];
      undo = BACKUP[6], endGame = BACKUP[7];
      BACKUP.length = 0;
    } else BACKUP = [pieceTurn, Object.assign({}, POSITION), Object.assign({}, KINGS_POSITION), Object.assign({}, CASTLE), UNSAFE_POSITION, Object.assign({}, MOVES_COUNT), undo, endGame];
  }

  function piecePosition() {
    let fen = [],
        row = 8,
        skip = 0,
        current = "";

    for (const square in POSITION) {
      if (square[1] != row) {
        fen.push(current + (skip ? skip : '')), row = square[1], current = "", skip = 0;
      }

      if (POSITION[square]) {
        skip && (current += skip) && (skip = 0);
        current += POSITION[square].COLOR == COLOR.BLACK ? POSITION[square].PIECE.toLowerCase() : POSITION[square].PIECE;
      } else skip += 1;
    }

    fen.push(current + (skip ? skip : ''));
    return fen.join("/");
  }

  function isValid(piece, num) {
    if (CASTLE[pieceTurn][piece] && KINGS_POSITION[pieceTurn] == 'E' + num && UNSAFE_POSITION.length == 0) {
      let square = piece == PIECE.QUEEN ? ['B' + num, 'C' + num, 'D' + num] : ['F' + num, 'G' + num],
          len = square.length;

      for (let i = 0; i < len; i++) if (POSITION[square[i]] || isKingUnsafe(square[i]).length > 0) {
        return false;
      }

      return true;
    }
  }

  function kingMoves(moves) {
    let newMoves = {
      valid: [],
      capture: []
    },
        sameColor = pieceTurn == COLOR.WHITE,
        UNSAFE = UNSAFE_POSITION;

    for (const type in moves) moves[type].forEach(square => {
      if (isKingUnsafe(square).length == 0) {
        newMoves[type].push(square);
      }
    });

    UNSAFE_POSITION = UNSAFE;

    if (newMoves.valid.length > 0 && isValid(PIECE.QUEEN, sameColor ? 1 : 8)) {
      newMoves.valid.push(sameColor ? "D1" : 'D8');
      newMoves.flag = FLAGS.QUEEN_CASTLE;
    }

    if (newMoves.valid.length > 0 && isValid(PIECE.KING, sameColor ? 1 : 8)) {
      newMoves.valid.push(sameColor ? "G1" : 'G8');
      newMoves.flag = FLAGS.KING_CASTLE;
    }

    return newMoves;
  }

  function canPieceMove(moves) {
    var _POSITION$UNSAFE_POSI, _POSITION$UNSAFE_POSI2;

    if (UNSAFE_POSITION.length > 1) return {
      valid: [],
      capture: []
    };

    if (((_POSITION$UNSAFE_POSI = POSITION[UNSAFE_POSITION[0]]) == null ? void 0 : _POSITION$UNSAFE_POSI.PIECE) == PIECE.KNIGHT) {
      return moves.capture.some(square => square == UNSAFE_POSITION[0]) ? {
        valid: [],
        capture: [UNSAFE_POSITION[0]]
      } : {
        valid: [],
        capture: []
      };
    } else if (((_POSITION$UNSAFE_POSI2 = POSITION[UNSAFE_POSITION[0]]) == null ? void 0 : _POSITION$UNSAFE_POSI2.PIECE) == PIECE.PAWN) {
      let can = KINGS_POSITION[pieceTurn][1] == UNSAFE_POSITION[0][1] + (pieceTurn == COLOR.WHITE ? -1 : 1);
      return !can ? moves : moves.capture.some(sqr => sqr == UNSAFE_POSITION[0]) ? {
        valid: [],
        capture: [UNSAFE_POSITION[0]]
      } : {
        valid: [],
        capture: []
      };
    }

    let square = squareBetween(KINGS_POSITION[pieceTurn], UNSAFE_POSITION[0]),
        newmove = {
      valid: [],
      capture: []
    };

    for (const type in moves) moves[type].forEach(sqr => {
      if (square.includes(sqr)) newmove[type].push(sqr);
    });

    return newmove;
  }

  function squareBetween(sqr1, sqr2) {
    let block = [[0, 1], [0, -1], [-1, 0], [1, 0], [-1, 1], [1, 1], [-1, -1], [1, -1]];

    for (let j = 0; j < 8; j++) {
      let stack = [],
          newSquare = sqr1;

      for (let i = 0; i < MOVE_COUNT[POSITION[sqr2].PIECE]; i++) {
        let first = ALPHA_NUM[newSquare[0]] + block[j][0];
        let second = +newSquare[1] + block[j][1];
        if (!first || second == 0 || second > 8) continue;
        newSquare = ALPHA[first] + second;
        stack.push(newSquare);
        if (newSquare == sqr2) return stack;
        if (POSITION[newSquare]) break;
      }
    }
  }

  function getMove(square) {
    let info = POSITION.hasOwnProperty(square) ? POSITION[square] : null;
    if (!info || info.COLOR !== pieceTurn || endGame) return {
      valid: [],
      capture: []
    }; // Return empty array

    let moves = evaluatePattern(square, info.PIECE);
    if (info.PIECE == PIECE.KING) return kingMoves(moves);
    if (UNSAFE_POSITION.length > 0) return canPieceMove(moves);
    let temp = POSITION[square];
    POSITION[square] = null;
    if (isKingUnsafe(KINGS_POSITION[pieceTurn]).length > 0) return {
      valid: [],
      capture: []
    };
    POSITION[square] = temp;
    return moves;
  }

  function fullMoves() {
    let aimoves = [];

    for (const square in POSITION) {
      if (POSITION[square] && POSITION[square].COLOR == pieceTurn) {
        let moves = getMove(square);

        for (const type in moves) {
          if (type == 'valid' || type == 'capture') moves[type].forEach((sqr, index) => {
            var _POSITION$square;

            let capture = type == 'capture' ? !POSITION[sqr] ? POSITION[sqr[0] + (pieceTurn == COLOR.WHITE ? 4 : 5)].PIECE : POSITION[sqr].PIECE : undefined;
            let flag = moves.flag ? moves.flag : '',
                data;
            flag += (type == 'valid' && ((_POSITION$square = POSITION[square]) == null ? void 0 : _POSITION$square.PIECE) == PIECE.PAWN && index == 1 ? FLAGS.BIG_PAWN : '') + (capture ? FLAGS[!POSITION[sqr] ? 'E_PASSANT' : 'CAPTURE'] : '');
            data = {
              from: square,
              to: sqr,
              piece: POSITION[square].PIECE,
              color: pieceTurn
            };
            if (capture) data.capture = capture;
            if (flag) data.flag = flag;
            aimoves.push(data);
          });
        }
      }
    }

    return current = aimoves;
  }

  function checkEndGame() {
    let moves = kingMoves(evaluatePattern(KINGS_POSITION[pieceTurn], PIECE.KING));
    if ((moves = moves.valid.concat(moves.capture)).length == 0) for (const square in POSITION) {
      var _POSITION$square2, _POSITION$square3;

      if (((_POSITION$square2 = POSITION[square]) == null ? void 0 : _POSITION$square2.COLOR) == pieceTurn && ((_POSITION$square3 = POSITION[square]) == null ? void 0 : _POSITION$square3.PIECE) !== PIECE.KING) {
        moves = evaluatePattern(square, POSITION[square].PIECE);
        if ((moves = moves.valid.concat(moves.capture)).length > 0) break;
      }
    }
    if (CONFIG.checkmate && UNSAFE_POSITION.length > 0 && moves.length == 0) return "CHECKMATE";
    if (CONFIG.fiftymove && MOVES_COUNT[COLOR.WHITE] > 49 && MOVE_COUNT[COLOR.BLACK] > 49) return "50MOVE";
    if (CONFIG.stalemate && UNSAFE_POSITION.length == 0 && moves.length == 0) return "STALEMATE";

    if (CONFIG.threeFoldRepetition) {
      let position = {}; // Hold position

      FEN.forEach(fen => position[fen] = fen in position ? position[fen] + 1 : 1);
      if (Object.values(position).some(n => n >= 3)) return "T-FOLD";
    }

    if (CONFIG.insufficiantMaterial) {
      let piece = {},
          string = '';

      for (const square in POSITION) if (POSITION[square]) {
        var _POSITION$square4;

        let key = POSITION[square].COLOR == COLOR.BLACK ? POSITION[square].PIECE.toLowerCase() : POSITION[square].PIECE;
        if (((_POSITION$square4 = POSITION[square]) == null ? void 0 : _POSITION$square4.PIECE) == PIECE.BISHOP) piece[key] = square;
        string += key;
      }

      string = string.split('').sort().join('');
      if (INSUF.includes(string) || 'BKbk' == string && [1, 3, 5, 7].includes(piece.b[1]) !== [1, 3, 5, 7].includes(piece.B[1])) return "I-MATERIAL";
    }
  }

  function swap() {
    return pieceTurn == COLOR.WHITE ? COLOR.BLACK : COLOR.WHITE;
  }

  return {
    square: function (square) {
      var _POSITION$square$toUp;

      if (ePassant === square) return {
        PIECE: PIECE.PAWN,
        COLOR: pieceTurn === COLOR.WHITE ? COLOR.BLACK : COLOR.WHITE,
        ePassant: true
      };
      return (_POSITION$square$toUp = POSITION[square.toUpperCase()]) != null ? _POSITION$square$toUp : null;
    },
    position: function () {
      return POSITION;
    },
    move: function (from, to) {
      var _from$flag, _currentSquare$flag, _currentSquare, _POSITION$from;

      let flag = '';
      if (typeof from === 'object') to = from.to, from = from.from, flag = (_from$flag = from.flag) != null ? _from$flag : '';

      if (Array.isArray(currentSquare)) {
        if (!currentSquare.some(square => square.to == to && square.from == from)) return;
      } else if (currentSquare.from !== from || !currentSquare.valid.concat(currentSquare.capture).some(square => square === to)) return;

      if (endGame || !POSITION[from]) return;
      flag = Array.isArray(currentSquare) ? "" : (_currentSquare$flag = (_currentSquare = currentSquare) == null ? void 0 : _currentSquare.flag) != null ? _currentSquare$flag : "";
      let data = {
        from,
        to,
        castles: CASTLE,
        count: MOVES_COUNT,
        ePassant,
        castle: null
      };
      if (ePassant !== '-' && (POSITION[from].PIECE !== PIECE.PAWN || pieceTurn == COLOR.WHITE && from[1] != 5 || pieceTurn == COLOR.BLACK && from[1] != 4)) ePassant = '-';

      if (POSITION[to]) {
        FEN.length = 0;
        MOVES_COUNT[pieceTurn] = 0;
        data.capture = {
          piece: POSITION[to].PIECE,
          square: to
        };
        EVN.capture(to, POSITION[to].PIECE, swap());
        EVN.remove(to, 'CAPTURE');
      } else if (((_POSITION$from = POSITION[from]) == null ? void 0 : _POSITION$from.PIECE) == PIECE.PAWN && to == ePassant) {
        let square = ePassant[0] + (pieceTurn == COLOR.WHITE ? 5 : 4);
        EVN.capture(square, PIECE.PAWN, swap(), 'epssant');
        EVN.remove(square, 'EPASSANT');
        POSITION[square] = null;
        data.capture = {
          square: square,
          piece: PIECE.PAWN
        };
        FEN.length = 0;
        MOVES_COUNT[pieceTurn] = 0;
      } else {
        POSITION[from].PIECE == PIECE.PAWN ? MOVES_COUNT[pieceTurn] = 0 : MOVES_COUNT[pieceTurn]++;

        if (POSITION[from].PIECE == PIECE.PAWN) {
          from[1] == 2 && to[1] == 4 && (ePassant = from[0] + 3) || from[1] == 7 && to[1] == 5 && (ePassant = from[0] + 6);
        } else if (ePassant != '-') ePassant = '-';
      }

      if (POSITION[from].PIECE == PIECE.KING) {
        KINGS_POSITION[pieceTurn] = to;
        CASTLE[pieceTurn] = {};
      } else if (POSITION[from].PIECE == PIECE.ROOK && CASTLE[pieceTurn][from[0] == 'A' ? 'Q' : 'K']) {
        CASTLE[pieceTurn][from[0] == 'A' ? 'Q' : 'K'] = false;
      }

      POSITION[to] = POSITION[from], POSITION[from] = null;
      EVN.move(from, to, POSITION[to].PIECE);

      if (flag.includes(FLAGS.PROMOTION)) {
        var _EVN$promote;

        let piece = (_EVN$promote = EVN.promote(to)) != null ? _EVN$promote : PIECE.QUEEN;
        piece = ![PIECE.QUEEN, PIECE.ROOK, PIECE.BISHOP, PIECE.KNIGHT].some(p => p == piece) ? PIECE.QUEEN : piece;
        POSITION[to].PIECE = piece;
        data.promote = piece;
        FEN.length = 0;
        EVN.remove(to, 'PROMOTE');
        EVN.add(to, POSITION[to].COLOR, POSITION[to].PIECE);
      } else if (flag.includes(FLAGS.QUEEN_CASTLE)) {
        POSITION['C' + (pieceTurn == COLOR.WHITE ? 1 : 8)] = POSITION['A' + (pieceTurn == COLOR.WHITE ? 1 : 8)];
        POSITION['A' + (pieceTurn == COLOR.WHITE ? 1 : 8)] = null;
        data.castle = {
          from: 'A' + (pieceTurn == COLOR.WHITE ? 1 : 8),
          to: 'C' + (pieceTurn == COLOR.WHITE ? 1 : 8)
        };
        EVN.move(data.castle.from, data.castle.to, PIECE.ROOK);
      } else if (flag.includes(FLAGS.KING_CASTLE)) {
        POSITION['F' + (pieceTurn == COLOR.WHITE ? 1 : 8)] = POSITION['H' + (pieceTurn == COLOR.WHITE ? 1 : 8)];
        POSITION['H' + (pieceTurn == COLOR.WHITE ? 1 : 8)] = null;
        data.castle = {
          from: 'H' + (pieceTurn == COLOR.WHITE ? 1 : 8),
          to: 'F' + (pieceTurn == COLOR.WHITE ? 1 : 8)
        };
        EVN.move(data.castle.from, data.castle.to, PIECE.ROOK);
      }

      if (MOVES_COUNT[pieceTurn] > 49) EVN.fiftymove(pieceTurn);

      if (!redoSquare) {
        FEN.push(piecePosition());
        if (HISTORY.length > undo) HISTORY.splice(undo);
        HISTORY.push(data);
        undo = HISTORY.length;
      }

      EVN.swap(pieceTurn = swap());
      if (isKingUnsafe(KINGS_POSITION[pieceTurn]).length > 0) EVN.check(UNSAFE_POSITION.map(s => ({
        piece: POSITION[s].PIECE,
        square: s,
        color: POSITION[s].COLOR
      })));
      if (endGame = checkEndGame()) return EVN.gameover(endGame, swap());
    },
    moves: function (square = false) {
      if (endGame) return;
      currentSquare = square ? getMove(square) : fullMoves();
      if (!Array.isArray(currentSquare)) currentSquare.from = square;
      return currentSquare;
    },
    undo: function () {
      let stack = typeof HISTORY[undo - 1] ? HISTORY[undo - 1] : null;
      if (!stack || endGame) return "No more undo";else undo--;
      CASTLE = stack.castles, MOVES_COUNT = stack.count, ePassant = stack.ePassant;

      if (stack.castle) {
        POSITION[stack.castle.from] = POSITION[stack.castle.to], POSITION[stack.castle.to] = null;
        EVN.move(stack.castle.to, data.castle.from, PIECE.ROOK);
      } else if (stack.promote) {
        POSITION[stack.to].PIECE = PIECE.PAWN;
        EVN.remove(stack.to, 'UNDO');
        EVN.add(stack.to, POSITION[stack.to].COLOR, POSITION[stack.to].PIECE);
      }

      EVN.move(stack.to, stack.from, POSITION[stack.to].PIECE);
      POSITION[stack.from] = POSITION[stack.to], POSITION[stack.to] = null;

      if (stack.capture) {
        POSITION[stack.capture.square] = {
          PIECE: stack.capture.piece,
          COLOR: pieceTurn
        };
        EVN.add(stack.capture.square, POSITION[stack.capture.square].COLOR, POSITION[stack.capture.square].PIECE);
      }

      FEN.pop(); // Remove last board position

      MOVES_COUNT[pieceTurn] -= 1;
      endGame = ''; // Remove reason if game was ended

      EVN.swap(pieceTurn = swap());
      if (POSITION[stack.from].PIECE == PIECE.KING) KINGS_POSITION[pieceTurn] = stack.from;
      if (isKingUnsafe(KINGS_POSITION[pieceTurn]).length > 0) EVN.check(UNSAFE_POSITION.map(s => ({
        piece: POSITION[s].PIECE,
        square: s,
        color: POSITION[s].COLOR
      })));
    },
    redo: function () {
      let stack = typeof HISTORY[undo] ? HISTORY[undo] : null;
      if (!stack || endGame) return "No more redo";else undo++;
      redoSquare = true;
      this.moves(stack.from);
      this.move(stack.from, stack.to);
      redoSquare = false;
    },
    fen: function () {
      let position = piecePosition();
      let chance = pieceTurn.toLowerCase();
      let castle = "";
      if (CASTLE[COLOR.WHITE][PIECE.KING]) castle += PIECE.KING;
      if (CASTLE[COLOR.WHITE][PIECE.QUEEN]) castle += PIECE.QUEEN;
      if (CASTLE[COLOR.BLACK][PIECE.KING]) castle += PIECE.KING.toLowerCase();
      if (CASTLE[COLOR.BLACK][PIECE.QUEEN]) castle += PIECE.QUEEN.toLowerCase();
      return `${position} ${chance} ${castle ? castle : '-'} ${ePassant.toLowerCase()} ${MOVES_COUNT[COLOR.BLACK]} ${MOVES_COUNT[COLOR.WHITE]}`;
    },
    load: function (fen = '', options) {
      var _options;

      options = (_options = options) != null ? _options : {};
      fen = fen ? fen : DEFAULT;
      fen = fen.split(/\s+/g);
      if (fen.length !== 6) return "Invalid FEN string found";
      makeBackupOrRestore(true);
      KINGS_POSITION = {};
      NUM.forEach(n => ALPHA.forEach(s => POSITION[s + n] = null));

      try {
        fen[0] = fen[0].split("/");
        if (fen[0].length !== 8) throw new Error("Invalid FEN string found");
        let index = 0;
        fen[0].forEach((row, line) => {
          if (index !== 0 && index !== 8) throw new Error(`In the ${line}${line == 0 ? 'st' : line == 1 ? 'nd' : line == 0 ? 'rd' : 'th'} row must have 8 square`);
          index = 0;
          row.split("").forEach(piece => {
            if ("12345678".includes(piece)) {
              index += parseInt(piece);
              return;
            } else index++;

            if (index > 8) throw new Error(`Maximum 8 piece is allowed in ${line + 1}${line == 0 ? 'st' : line == 1 ? 'nd' : line == 0 ? 'rd' : 'th'} row`);
            let color = Object.values(PIECE).join("").includes(piece) ? COLOR.WHITE : Object.values(PIECE).map(p => p.toLowerCase()).join("").includes(piece) ? COLOR.BLACK : null;
            if (color == null) throw new Error(`Invalid piece code given in '${piece}' in ${line + 1}${line == 0 ? 'st' : line == 1 ? 'nd' : line == 0 ? 'rd' : 'th'} row`);
            piece = piece.toUpperCase();
            POSITION[ALPHA[index - 1] + NUM[line]] = {
              PIECE: piece,
              COLOR: color
            };
            if (piece == PIECE.KING && KINGS_POSITION[color]) throw new Error(`One side must have only one king`);
            if (piece == PIECE.KING) KINGS_POSITION[color] = ALPHA[index - 1] + NUM[line];
          });
        });
        if (!KINGS_POSITION[COLOR.WHITE] && !KINGS_POSITION[COLOR.BLACK]) throw new Error('Both side have no king');
        if (!KINGS_POSITION[COLOR.WHITE]) throw new Error('White has not king');
        if (!KINGS_POSITION[COLOR.BLACK]) throw new Error('Black has not king');
      } catch (error) {
        makeBackupOrRestore();
        return error.message;
      }

      EVENTS.forEach(event => !EVN.hasOwnProperty(event) && (EVN[event] = function () {}));
      ['fiftymove', 'insufficiantMaterial', 'threeFoldRepetition', 'stalemate', 'checkmate'].forEach(type => CONFIG[type] = options[type] ? options[type] : true);
      MOVES_COUNT[COLOR.BLACK] = parseInt(fen[4]);
      MOVES_COUNT[COLOR.WHITE] = parseInt(fen[5]);
      MOVES_COUNT = {
        W: 0,
        B: 0
      };
      [COLOR.BLACK, COLOR.WHITE].forEach(e => {
        pieceTurn = e;
        if (isKingUnsafe(KINGS_POSITION[pieceTurn]).length > 0) EVN.check(UNSAFE_POSITION.map(s => ({
          piece: POSITION[s].PIECE,
          square: s,
          color: POSITION[s].COLOR
        })));
        if (endGame = checkEndGame()) EVN.gameover(endGame, swap());
      });
      if (!endGame) endGame = "";
      pieceTurn = fen[1] == COLOR.BLACK.toLowerCase() ? COLOR.BLACK : COLOR.WHITE;
      ePassant = fen[3].toUpperCase(), undo = 0;
      CASTLE[COLOR.WHITE].K = fen[2].includes(PIECE.KING);
      CASTLE[COLOR.BLACK].K = fen[2].includes(PIECE.KING.toLowerCase());
      CASTLE[COLOR.WHITE].Q = fen[2].includes(PIECE.QUEEN);
      CASTLE[COLOR.BLACK].Q = fen[2].includes(PIECE.QUEEN.toLowerCase());
      EVN.load();
      EVN.swap(pieceTurn);

      for (const square in BACKUP[1]) if (POSITION[square]) EVN.remove(square, 'NEW');

      BACKUP.length = 0;

      for (const square in POSITION) if (POSITION[square]) EVN.add(square, POSITION[square].COLOR, POSITION[square].PIECE);
    },
    print: function (type = true) {
      let code = {
        W: {
          K: "♔",
          P: "♙",
          N: "♘",
          R: "♖",
          B: "♗",
          Q: "♕"
        },
        B: {
          K: "♚",
          P: "♟",
          N: "♞",
          R: "♜",
          B: "♝",
          Q: "♛"
        }
      },
          map = "",
          count = 8;

      const getPieceValue = square => {
        return POSITION[square] ? type ? code[POSITION[square].COLOR][POSITION[square].PIECE] : POSITION[square].COLOR == COLOR.BLACK ? POSITION[square].PIECE.toLowerCase() : POSITION[square].PIECE.toUpperCase() : '-';
      };

      for (let square in POSITION) {
        map += `${square[0] === 'A' ? `${count} |` : ''} ${getPieceValue(square)}${square[0] === 'H' ? `\n` : ' '}`;
        if (square[0] === 'H') count--;
      }

      map += "- - -  -  -  -  -  -  -  -\n";
      map += "  | a  b  c  d  e  f  g  h";
      return map;
    },
    turn: function () {
      return pieceTurn;
    },
    status: function () {
      return endGame;
    },
    on: function (event, handler) {
      if (!EVENTS.some(evm => evm == event)) return `Unknown event name '${event}' given`;
      if (typeof handler !== 'function') return `Invalid event handler given with '${event}' name`;
      EVN[event] = handler;
    },
    FLAGS,
    COLOR,
    PIECE
  };
};
