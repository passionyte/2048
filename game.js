const tiles = document.getElementById("tiles") // Passionyte
const tiledummy = document.getElementById("tiledummy")
const sc = document.getElementById("score")
const bt = document.getElementById("best")
const gameo = document.getElementById("gameover")
const gamew = document.getElementById("gamewin") 

let tileset = []
let gameover = false
let busy = false
let score = 0
let best = 0
let merged
let cgameo
let cgamew

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
    [16]: "rgb(245, 149, 99)",
    [32]: "rgb(246, 124, 95)",
    [64]: "rgb(246, 94, 59)",
    [128]: "rgb(237, 207, 114)",
    [256]: "rgb(237, 204, 97)",
    [512]: "rgb(237, 200, 80)",
    [1024]: "rgb(237, 197, 63)",
    [2048]: "rgb(237, 194, 46)"
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

function loseCheck() {
    for (let x = 0; (x < 4); x++) {
        for (let y = 0; (y < 4); y++) {
            const me = findTile(x, y)

            if (me) {
                const dirs = []
                dirs.push(findTile(x, (y - 1)))
                dirs.push(findTile(x, (y + 1)))
                dirs.push(findTile((x - 1), y))
                dirs.push(findTile((x + 1), y))

                for (const dir of dirs) {
                    if (dir) {
                        if (dir.size == me.size) {
                            return false
                        }
                    }
                }
            }
            else {
                return false
            }
        }
    }

    return true
}

function incScore(x) {
    score += x
    if (score > best) {
        best = score
    }
}

function drawGame() {
    if (gameover) { 
        return
    }

    sc.innerText = score
    bt.innerText = best
    tiles.innerHTML = null

    for (let y = 0; (y < 4); y++) {
        for (let x = 0; (x < 4); x++) {
            const tile = findTile(x, y)

            if (tile) {
                const e = tiledummy.cloneNode(true)

                e.id = "tile"

                const c = e.children

                c[0].innerText = tile.size
    
                const color = colors[tile.size]
                e.style["background-color"] = color || "rgb(0, 0, 0)"
                c[0].style.color = ((color) && "rgb(50, 50, 50)") || "rgb(205, 205, 205)"
    
                e.style.display = "block"
    
                tiles.appendChild(e)
            }
            else {
                const e = tiledummy.cloneNode(true)

                e.id = "tile"

                e.style.display = "block"
    
                tiles.appendChild(e)
            }
        }
    }
}

function findTile(x, y) {
    let result

    for (const tile of tileset) { // Grrr! could be inefficient
        if (tile.x == x && tile.y == y) {
            result = tile
            break
        }
    }

    return result
}

function handleResults(clear, win) {
    if (!clear) {
        gameover = true
        if (win) {
            cgamew = gamew.cloneNode(true)
            cgamew.hidden = false

            const c = cgamew.children
            c[1].addEventListener("click", function() {
                handleResults(true, true)
            })
            c[2].addEventListener("click", newGame)
            tiles.appendChild(cgamew)
        }
        else {
            cgameo = gameo.cloneNode(true)
            cgameo.hidden = false
            cgameo.children[1].addEventListener("click", newGame)
            tiles.appendChild(cgameo)
        }
    }
    else {
        gameover = false
        haswon = (win)

        if (cgameo) {
            cgameo.remove()
            cgameo = null
        }
        if (cgamew) {
            cgamew.remove()
            cgamew = null
        }
    }
}

function shiftTile(tile, dir) {
    const dx = ((dir == "lt") && -1) || ((dir == "rt") && 1) || 0
    const dy = ((dir == "dn") && 1) || ((dir == "up") && -1) || 0

    const newx = (tile.x + dx)
    const newy = (tile.y + dy)

    if ((newx < 4 && newx > -1) && (newy < 4 && newy > -1)) {
        const occupant = findTile(newx, newy)

        if (!occupant) {
            tile.x = newx
            tile.y = newy
            console.log(`moved to ${newx}, ${newy}`)
    
            return true
        }
        else {
            if (occupant.size == tile.size && merged != occupant) {
                console.log(`combining two ${tile.size} tiles`)
                createTile(occupant.x, occupant.y, tile, occupant)
                merged = occupant

                return false
            }
        }
    }

    return false
}

function createTile(x, y, t0, t1) {
    const occupant = findTile(x, y)
    if (!occupant || occupant == t0 || occupant == t1) {
        let size

        if (t0 && t1) {
            tileset = tileset.filter(v => v !== t0 && v !== t1)
            size = (t0.size + t1.size) 

            incScore(size)

            if (!haswon && (size == 2048)) { // win
                handleResults(null, true)
            }
        }
        else {
            size = ((Math.random() >= 0.75) && 4) || 2
        }

        console.log(`new tile of size ${size} created at ${x}, ${y}`)
        tileset.push(new Tile(x, y, size))

        drawGame()

        return true
    }

    return false
}

function newGame() {
    canmove = true
    score = 0

    handleResults(true)

    tiles.innerHTML = null
    tileset = []

    for (let i = 0; (i < 2); i++) {
        createTile(randInt(0, 3), randInt(0, 3)) 
    }
}
newGame()

document.addEventListener("keydown", function(ev) {
    if (gameover || (busy)) {
        return
    }

    merged = null

    const dir = binds[ev.key]

    if (dir) {
        busy = ev.key

        for (const tile of tileset) {
            let shift = false
            do { // could still be bad?
                shift = (shiftTile(tile, dir))
            } while (shift)
        }
        drawGame()

        if (tileset.length < 16) {
            const available = []

            for (let y = 0; (y < 4); y++) {
                for (let x = 0; (x < 4); x++) {
                    if (!findTile(x, y)) {
                        available.push([x, y])
                    }
                }
            }

            if (available.length > 0) {
                const rand = ((available.length > 1) && available[randInt(0, (available.length - 1))]) || available[0]

                if (rand) {
                    createTile(rand[0], rand[1])
                }
            }
        }

        if (loseCheck()) {
            handleResults(null, false)
        }
    }
})

document.addEventListener("keyup", function(ev) {
    if (busy == ev.key) {
        busy = false
    }
})