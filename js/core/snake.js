export class Snake {
  constructor(startX, startY) {
    this.segments = [
      { x: startX, y: startY },
      { x: startX - 1, y: startY },
      { x: startX - 2, y: startY },
    ];
    this.direction = { x: 1, y: 0 };
    this.pendingDirection = { x: 1, y: 0 };
    this.growBy = 0;
  }

  setDirection(next) {
    const opposite = this.direction.x + next.x === 0 && this.direction.y + next.y === 0;
    if (!opposite) {
      this.pendingDirection = next;
    }
  }

  move() {
    this.direction = this.pendingDirection;
    const head = this.segments[0];
    const newHead = { x: head.x + this.direction.x, y: head.y + this.direction.y };
    this.segments.unshift(newHead);

    if (this.growBy > 0) {
      this.growBy -= 1;
    } else {
      this.segments.pop();
    }
  }

  grow(amount = 1) {
    this.growBy += amount;
  }

  getHead() {
    return this.segments[0];
  }

  hitsSelf() {
    const head = this.getHead();
    return this.segments.slice(1).some((segment) => segment.x === head.x && segment.y === head.y);
  }
}
