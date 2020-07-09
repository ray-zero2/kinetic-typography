import Gl from './Gl';

export default class Init {
  constructor() {
    this.gl = new Gl();
    this.init();
  }

  init() {
    this.gl.init();
  }
}
