interface IShape {
    name: string
    sides: number
    sidelength: number
    calcPerimeter: () => void
}

class Shape implements IShape {
    name: string
    sides: number
    sidelength: number
    constructor(name: string, sides: number, sidelength: number) {
        this.name = name
        this.sides = sides
        this.sidelength = sidelength
    }
    calcPerimeter() {
        switch (this.name) {
            case 'square':
                console.log(this.sidelength * this.sides)
                break
            case 'rectangle':
                console.log(this.sidelength * 2 + this.sidelength * 2)
                break
            case 'triangle':
                console.log(this.sidelength * 3)
                break
            case 'circle':
                console.log(this.sidelength * 2 * Math.PI)
                break
            default:
                console.log('error')
                break
        }
    }
}

// const square = new Shape('square', 4, 5)
// square.calcPerimeter()
// const triangle = new Shape('triangle', 4, 5)
// triangle.calcPerimeter()

class Square extends Shape {
    constructor(name: string, sidelength: number) {
        super(name, 4, sidelength)
    }
    calcArea() {
        console.log(this.sidelength * this.sidelength)
    }
}

const square1 = new Square('square', 4)

square1.calcArea()
square1.calcPerimeter()