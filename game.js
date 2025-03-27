const tiles = document.getElementById("tiles") // Passionyte
const tiledummy = document.getElementById("tiledummy")

const tileset = []

const binds = {
    ["w"]: "up",
    ["a"]: "lt",
    ["s"]: "dn",
    ["d"]: "rt"
}

const colors = {
    [2]: "rgb(238, 228, 218)",
    [4]: "rgb(237, 224, 200)",
    [8]: "rgb(242, 177, 121)",
    [16]: "rgb(245, 149, 99)"
}

class Tile {
    x = 0
    y = 0
    #size = 0

    get size() {
        return this.#size
    }

    constructor(x, y, size) {
        this.x = x
        this.y = y
        this.#size = size
    }
}

function randInt(min, max) {
    return Math.floor(((max - min) * Math.random() + min))
}

function drawBoard() {
    tiles.innerHTML = null

    for (let x = 0; (x < 4); x++) {
        for (let y = 0; (y < 4); y++) {
            const tile = findTile(x, y)

            if (tile) {
                const e = tiledummy.cloneNode(true)

                const c = e.children

                c[0].innerText = tile.size
    
                const color = colors[tile.size]
                e.style["background-color"] = color
                c[0].style.color = ((color) && "rgb(50, 50, 50)") || "rgb(205, 205, 205)"
    
                e.style.display = "block"
    
                tiles.appendChild(e)
            }
        }
    }
}

function findTile(x, y) {
    let result

    for (const tile of tileset) {
        if (tile.x == x && tile.y == y) {
            result = tile
            break
        }
    }

    return result
}

function shiftTile(tile, dir) {
    const dx = ((dir == "lt") && -1) || ((dir == "rt") && 1) || 0
    const dy = ((dir == "dn") && -1) || ((dir == "up") && 1) || 0

    const newx = (tile.x + dx)
    const newy = (tile.y + dy)

    if (!findTile(newx, newy) && ((Math.abs(newx) < 4) && (Math.abs(newy) < 4))) {
        tile.x = newx
        tile.y = newy
        console.log(`moved to ${newx}, ${newy}`)

        return true
    }

    return false
}

function createTile(x, y, t0, t1) {
    if (!findTile(x, y)) {
        tileset.push(new Tile(x, y, ((t0 && t1) && t0 + t1) || ((Math.random() >= 0.75) && 4) || 2))

        console.log(`created new tile at ${x}, ${y}`)

        drawBoard()

        return true
    }

    return false
}

for (let i = 0; (i < 2); i++) {
    createTile(randInt(0, 3), randInt(0, 3)) 
}

document.addEventListener("keypress", function(ev) {
    const dir = binds[ev.key]

    if (dir) {
        for (const tile of tileset) {
            while (true) { // could be bad
                const r = shiftTile(tile, dir)

                if (!r) {
                    drawBoard()
                    break
                }
            }
        }
        while (true) { // also could be bad. try and place a tile anywhere on the board
            const r = createTile(randInt(0, 3), randInt(0, 3)) 

            if (r) {
                break
            }
        }
    }
})