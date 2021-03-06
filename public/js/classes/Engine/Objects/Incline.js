class Incline {
  constructor() {
    this.id = uuidv4()
    this.place = 0
    this.located = false
    this.width = 3
    this.height = 1.5
    this.sidangle = atan(this.height/this.width) // radians
    this.mass = 2
    this.isincline = true
    this.isellastic = false
    this.frictionOn = true
    this.statcoeff = 0.3
    this.kincoeff = 0.3
    this.pos = createVector(0,0)
    this.vel = createVector(0,0)
    this.acc = createVector(0,0)
    this.topedge = createVector(0,0)
    this.botedge = createVector(0,0)
    this.sidedge = createVector(0,0)
    this.forces = createVector(0,0)
  }

  locate() {
    this.pos.x = rmouseX
    this.pos.y = rmouseY
    this.updateEdges()
    this.located = true
    this.render()
  }

  updateEdges() {
    this.topedge.x = this.pos.x - this.width/2
    this.topedge.y = this.pos.y + this.height/2
    this.botedge.x = this.pos.x - this.width/2
    this.botedge.y = this.pos.y - this.height/2
    this.sidedge.x = this.pos.x + this.width/2
    this.sidedge.y = this.pos.y - this.height/2
    this.sidangle = atan(this.height/this.width) // radians
  }

  checkForces() {
    engine.still_objects.forEach(element => {
      if(element.isgravity) {
        this.forces.y += this.mass*element.vector.y
      }
    })
    engine.still_objects.forEach(element => {
      if(element.isfloor) {
        if(this.pos.y - this.height/2 <= element.y + px) {
          this.pos.y = element.y + this.height/2 + px
          this.vel.y = 0
          if(this.forces.y <= 0) {
            this.forces.y = 0
          }
        }
      }
    })
  }

  update() {
    this.forces.y = 0
    this.forces.x = 0
    this.checkForces()
    this.acc = p5.Vector.div(this.forces, this.mass)
    this.vel.add(p5.Vector.mult(this.acc, engine.timestep))
    this.pos.add(p5.Vector.mult(this.vel, engine.timestep))   
    this.updateEdges()
  }
  
  render(panelHighlight=false) {
    this.mouseOrIndexHighlight = false
    if(this.indexHighlightLoad || this.mouseisover()) {
      this.mouseOrIndexHighlight = true
    }
    stroke(100)
    fill(color(130, 200, 130))
    triangle(this.topedge.x*scl, this.topedge.y*scl, this.botedge.x*scl, this.botedge.y*scl, this.sidedge.x*scl, this.sidedge.y*scl)
    if(this.mouseOrIndexHighlight || panelHighlight) {
      stroke(color(100,100,255))
      triangle(this.topedge.x*scl - 2, this.topedge.y*scl + 2, this.botedge.x*scl - 2, this.botedge.y*scl - 2, this.sidedge.x*scl + 2, this.sidedge.y*scl - 2)
    }
  }

  closestEdges(x, y) {
    if(x > this.topedge.x && y >= this.sidedge.y) {
      return [this.topedge, this.sidedge, 1]
    } else if(x < this.topedge.x) {
      return [this.topedge, this.botedge, 2]
    } else if(x > this.topedge.x && y < this.sidedge.y) {
      return [this.botedge, this.sidedge, 3]
    }
  }

  normalPoint(x, y, edg1, edg2) {
    let edgvec = createVector(edg2.x - edg1.x, edg2.y - edg1.y)
    let edgline = {
      m: edgvec.y/edgvec.x,
    }
    edgline.b = - edgline.m*edg2.x + edg2.y
    let norpt = createVector(0,0)
    norpt.x = (edgvec.x*x + edgvec.y*(y - edgline.b))/(edgvec.x + edgvec.y*edgline.m)
    norpt.y = (edgvec.x*(x - norpt.x) + edgvec.y*y)/edgvec.y
    let dist = ((x - norpt.x)**2 + (y - norpt.y)**2)**0.5

    return [dist, norpt]
  }

  openControl() {
    panel.openControl(this.id)
  }

  mouseisover() {
    if(rmouseX > this.botedge.x && rmouseX < this.sidedge.x && rmouseY > this.botedge.y) {
      let p1 = this.topedge
      let p2 = this.sidedge
      let m = (p2.y - p1.y)/(p2.x - p1.x)
      let b = p1.y - m*p1.x
      let topY = m*rmouseX + b
      if(rmouseY < topY) {
        return true
      }
    }
    return false
  }

  remove() {
    if(this.located) {
      engine.dyn_objects.splice(engine.dyn_objects.indexOf(this), 1)
    }
    engine.dyn_objects_dis.splice(engine.dyn_objects_dis.indexOf(this), 1)
    engine.renderOrder.splice(engine.renderOrder.indexOf(this), 1)
  }
}