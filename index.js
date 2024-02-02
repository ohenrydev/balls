const cvs = document.querySelector("canvas")
const ctx = cvs.getContext("2d")

cvs.width = innerWidth
cvs.height = innerHeight

const MIDDLE_X = cvs.width / 2
const MIDDLE_Y = cvs.height / 2
const ARC_ANGLE = Math.PI * 2

const projectiles = []
const enemies = []
const particles = []

class Player {
  constructor(x, y, radius, color) {
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
  }

  draw() {
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.radius, 0, ARC_ANGLE, false)
    ctx.fillStyle = this.color
    ctx.fill()
  }
}

class Projectile {
  constructor(x, y, radius, color, velocity) {
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
    this.velocity = velocity
  }

  draw() {
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.radius, 0, ARC_ANGLE, false)
    ctx.fillStyle = this.color
    ctx.fill()
  }

  update() {
    this.draw()
    this.x += this.velocity.x * 6
    this.y += this.velocity.y * 6
  }
}

class Enemy {
  constructor(x, y, radius, color, velocity) {
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
    this.velocity = velocity
  }

  draw() {
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.radius, 0, ARC_ANGLE, false)
    ctx.fillStyle = this.color
    ctx.fill()
  }

  update() {
    this.draw()
    this.x += this.velocity.x
    this.y += this.velocity.y
  }
}

const friction = 0.99
class Particle {
  constructor(x, y, radius, color, velocity) {
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
    this.velocity = velocity
    this.alpha = 1
  }

  draw() {
    ctx.save()
    ctx.globalAlpha = this.alpha
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.radius, 0, ARC_ANGLE, false)
    ctx.fillStyle = this.color
    ctx.fill()
    ctx.restore()
  }

  update() {
    this.draw()
    this.velocity.x *= friction
    this.velocity.y *= friction
    this.x += this.velocity.x
    this.y += this.velocity.y
    this.alpha -= 0.01
  }
}

const player = new Player(MIDDLE_X, MIDDLE_Y, 15, "white")

let mouseX, mouseY

addEventListener("mousemove", (e) => {
  mouseX = e.clientX
  mouseY = e.clientY
})

addEventListener("click", (e) => {
  const angle = Math.atan2(mouseY - cvs.height / 2, mouseX - cvs.width / 2)
  projectiles.push(new Projectile(MIDDLE_X, MIDDLE_Y, 5, "white", {
    x: Math.cos(angle),
    y: Math.sin(angle)
  })) 
})

addEventListener("keydown", (e) => {
  if(e.code === "Space"){
const angle = Math.atan2(mouseY - cvs.height / 2, mouseX - cvs.width / 2)
  projectiles.push(new Projectile(MIDDLE_X, MIDDLE_Y, 5, "white", {
    x: Math.cos(angle),
    y: Math.sin(angle)
  })) 
  }
})

function spaw() {
  setInterval(() => {
    const radius = parseInt(Math.random() * (50 - 10) + 10)
    let x, y
    if(Math.random() < 0.5){
      x = Math.random() < 0.5 ? (0 - radius) : (cvs.width + radius)
      y = Math.random() * cvs.height 
    } else {
      x = Math.random() * cvs.width
      y = Math.random() < 0.5 ? (0 - radius) : (cvs.height + radius) 
    }

    const color = `hsl(${Math.random() * 360}, 80%, 50%)`

    const angle = Math.atan2(cvs.height / 2 - y, cvs.width / 2 - x)

    enemies.push(new Enemy(x, y, radius, color, {
      x: Math.cos(angle), y: Math.sin(angle)
    }))
  }, 1000)
}

let animation
function loop() {
  animation = requestAnimationFrame(loop)
  ctx.fillStyle = "rgba(0, 0, 0, .3)"
  ctx.fillRect(0, 0, cvs.width, cvs.height)
  player.draw()
  particles.forEach((p, pri) => {
    if(p.alpha <= 0) {
      particles.splice(pri, 1)
    } else {
      p.update()
    }
  })
  projectiles.forEach((p, pi) => {
    p.update()

    if(
      p.x + p.radius < 0 ||
      p.x - p.radius > cvs.width ||
      p.y + p.radius < 0 ||
      p.y - p.radius > cvs.height){
      setTimeout(() => {
        projectiles.splice(pi, 0)
      }, 0)
    }
  })
  enemies.forEach((e, ei) => {
    e.update()

    const dist = Math.hypot(player.x - e.x, player.y - e.y) - e.radius - player.radius
    if(dist < 1) {
      setTimeout(() => cancelAnimationFrame(animation), 0)
    }
    projectiles.forEach((p, pi) => {
      const dist = Math.hypot(p.x - e.x, p.y - e.y) - e.radius - p.radius
      
      if(dist < 1) {

        for(let i = 0; i < e.radius * 2; i++){
          particles.push(new Particle(
            p.x, 
            p.y, 
            Math.random() * 2, 
            e.color, { 
              x: (Math.random() - 0.5) * (Math.random() * 6),
              y: (Math.random() - 0.5) * (Math.random() * 6) 
            }
          ))
        }

        if(e.radius > 10){
          if(e.radius - 10 > 0 && e.radius - 10 < 10){
            setTimeout(() => {
              enemies.splice(ei, 1)
              projectiles.splice(pi, 1)   
            }, 0)
          } else {
            // e.radius -= 10
            gsap.to(e, { radius: e.radius - 10 })
            projectiles.splice(pi, 1)
          }
        } else {
          setTimeout(() => {
            enemies.splice(ei, 1)
            projectiles.splice(pi, 1)   
          }, 0)
        }
      }
    })
  })
}

loop()
spaw()