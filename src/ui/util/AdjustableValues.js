class AdjustableValue {
  constructor(type, value) {
    this.type = type;
    this._value = value;
    this.listeners = new Set();
  }

  set value(value) {
    this._value = value;
    this.notify();
  }

  get value() {
    return this._value;
  }

  listen(listener) {
    this.listeners.add(listener);
  }

  unlisten(listener) {
    this.listeners.delete(listener);
  }

  notify() {
    for (let listener of this.listeners) {
      listener(this);
    }
  }
}

export class Toggle extends AdjustableValue {
  constructor(value) {
    super('toggle', value);
  }

  // javascript doesnt extend accessors
  set value(val) {
    super.value = val;
  }

  get value() {
    return super.value;
  }
}

export class Slider extends AdjustableValue {
  constructor(min, max, value) {
    super('slider', value);
    this.min = min;
    this.max = max;
  }

  set value(val) {
    val = this.clamp(val);
    super.value = val;
  }

  get value() {
    return super.value;
  }

  clamp(val) {
    if (val < this.min) {
      val = this.min;
    }
    if (val > this.max) {
      val = this.max;
    }
    return val;
  }
}

export class Dropdown extends AdjustableValue {
  constructor(options, index=0) {
    super('dropdown', index);
    this.options = options;
  }

  set value(index) {
    index = Math.min(index, this.options.length-1);
    super.value = index;
  }

  get value() {
    return super.value;
  }

  get current_option() {
    let option = this.options[this.value];
    return option;
  }
}