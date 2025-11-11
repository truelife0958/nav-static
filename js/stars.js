/**
 * 星空背景动画效果
 * 创建动态的星空背景
 */

class StarField {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.stars = [];
    this.shootingStars = [];
    this.animationId = null;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    
    // 查找已存在的 canvas 或创建新的
    this.canvas = document.getElementById('starfield');
    
    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
      this.canvas.id = 'starfield';
      this.canvas.style.position = 'fixed';
      this.canvas.style.top = '0';
      this.canvas.style.left = '0';
      this.canvas.style.width = '100%';
      this.canvas.style.height = '100%';
      this.canvas.style.zIndex = '0';
      this.canvas.style.pointerEvents = 'none';
      
      document.body.insertBefore(this.canvas, document.body.firstChild);
    }
    
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    
    // 创建星星
    this.createStars();
    
    // 开始动画
    this.animate();
    
    // 监听窗口大小变化
    window.addEventListener('resize', () => this.resize());
    
    // 定期创建流星
    setInterval(() => this.createShootingStar(), 3000);
    
    this.initialized = true;
    console.log('✨ 星空背景已初始化');
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  createStars() {
    const numStars = Math.floor((this.canvas.width * this.canvas.height) / 8000);
    this.stars = [];
    
    for (let i = 0; i < numStars; i++) {
      this.stars.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        radius: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.5 + 0.5,
        twinkleSpeed: Math.random() * 0.02 + 0.01,
        twinklePhase: Math.random() * Math.PI * 2
      });
    }
  }

  createShootingStar() {
    if (Math.random() > 0.5) return; // 50% 概率创建流星
    
    const startX = Math.random() * this.canvas.width;
    const startY = Math.random() * this.canvas.height / 2;
    
    this.shootingStars.push({
      x: startX,
      y: startY,
      length: Math.random() * 80 + 40,
      speed: Math.random() * 8 + 6,
      angle: Math.PI / 4 + Math.random() * 0.5,
      opacity: 1,
      life: 1
    });
  }

  drawStar(star) {
    this.ctx.beginPath();
    this.ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    this.ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
    this.ctx.fill();
  }

  drawShootingStar(star) {
    const dx = Math.cos(star.angle) * star.length;
    const dy = Math.sin(star.angle) * star.length;
    
    const gradient = this.ctx.createLinearGradient(
      star.x, star.y,
      star.x - dx, star.y - dy
    );
    
    gradient.addColorStop(0, `rgba(255, 255, 255, ${star.opacity})`);
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    this.ctx.beginPath();
    this.ctx.strokeStyle = gradient;
    this.ctx.lineWidth = 2;
    this.ctx.moveTo(star.x, star.y);
    this.ctx.lineTo(star.x - dx, star.y - dy);
    this.ctx.stroke();
  }

  updateStars() {
    this.stars.forEach(star => {
      // 闪烁效果
      star.twinklePhase += star.twinkleSpeed;
      star.opacity = 0.3 + Math.sin(star.twinklePhase) * 0.4;
    });
  }

  updateShootingStars() {
    this.shootingStars = this.shootingStars.filter(star => {
      star.x += Math.cos(star.angle) * star.speed;
      star.y += Math.sin(star.angle) * star.speed;
      star.life -= 0.01;
      star.opacity = star.life;
      
      return star.life > 0 && 
             star.x > -100 && star.x < this.canvas.width + 100 &&
             star.y > -100 && star.y < this.canvas.height + 100;
    });
  }

  animate() {
    // 清空画布
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // 更新和绘制星星
    this.updateStars();
    this.stars.forEach(star => this.drawStar(star));
    
    // 更新和绘制流星
    this.updateShootingStars();
    this.shootingStars.forEach(star => this.drawShootingStar(star));
    
    this.animationId = requestAnimationFrame(() => this.animate());
  }

  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
    this.initialized = false;
  }
}

// 创建全局实例
window.starField = new StarField();

// 页面加载完成后初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.starField.init();
  });
} else {
  window.starField.init();
}

console.log('🌟 星空背景脚本已加载');