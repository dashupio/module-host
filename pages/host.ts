
// import page interface
import saas from 'node-sass';
import fetch from 'node-fetch';
import { Struct } from '@dashup/module';
import { compile } from '@riotjs/compiler';

/**
 * build address helper
 */
export default class HostPage extends Struct {
  
  /**
   * construct host page
   *
   * @param args 
   */
  constructor(...args) {
    // super
    super(...args);

    // host action
    this.hostAction  = this.hostAction.bind(this);
    this.bodyAction  = this.bodyAction.bind(this);
    this.dataAction  = this.dataAction.bind(this);
    this.blockAction = this.blockAction.bind(this);
  }

  /**
   * returns page type
   */
  get type() {
    // return page type label
    return 'host';
  }

  /**
   * returns page type
   */
  get icon() {
    // return page type label
    return 'fa fa-upload';
  }

  /**
   * returns page type
   */
  get title() {
    // return page type label
    return 'Host Page';
  }

  /**
   * returns page data
   */
  get actions() {
    // return page data
    return {
      host  : this.hostAction,
      body  : this.bodyAction,
      data  : this.dataAction,
      block : this.blockAction,
    };
  }

  /**
   * returns object of views
   */
  get views() {
    // return object of views
    return {
      view   : 'page/host/view',
      menu   : 'page/host/menu',
      config : 'page/host/config',
    };
  }

  /**
   * returns category list for page
   */
  get categories() {
    // return array of categories
    return ['API'];
  }

  /**
   * returns page descripton for list
   */
  get description() {
    // return description string
    return 'Hosting API page';
  }

  /**
   * gets website data
   *
   * @param opts 
   */
  async website(opts) {
    // get website
    const website = await this.dashup.fetch(opts.page, 'website.json') || {};

    // routes
    if (!website.scss) website.scss = {};
    if (!website.blocks) website.blocks = {};
    if (!website.routes) website.routes = {};

    // return website
    return website;
  }

  /**
   * compile block
   *
   * @param opts 
   * @param website 
   */
  async blockAction(opts, block, website) {
    // load hidden opts
    if (!website) website = await this.website(opts);

    // compile block
    const { code, map } = compile(block);

    // split
    const split = code.split('export default ');
    split.shift();

    // return code
    return split.join('export default ');
  }

  /**
   * scss action
   *
   * @param opts 
   */
  async scssAction(opts, website) {
    // load hidden opts
    if (!website) website = await this.website(opts);

    // create scss
    const data = [
      `@import './node_modules/bootstrap/scss/_functions';`,
      `@import './node_modules/bootstrap/scss/_variables';`,

      // variables
      ...Object.keys(website.scss || []).map((key) => {
        return `$${key}:${website.scss[key]};`;
      }),

      `@import './node_modules/bootstrap/scss/bootstrap';`,
    ].join('');

    // render sync
    return saas.renderSync({
      data,
    }).css.toString();
  }

  /**
   * gets body
   *
   * @param opts 
   */
  async bodyAction(opts, website) {
    // load hidden opts
    if (!website) website = await this.website(opts);

    // create scss
    const scss = await this.scssAction(opts, website);

    // fetch riot
    const riot = await fetch('https://cdn.jsdelivr.net/npm/riot@5/riot+compiler.min.js');

    // create scss/js
    return [
      `<style>${scss}</style>`,
      `{BLOCKS}`,
      `<script type="text/javascript">${await riot.text()}</script>`,
      `<script>`,
      `var send = function(name, data) {`,
      `parent.eden.dashup.emit('host.website', {name:name,data:data});`,
      `};`,
      `{MOUNTS}`,
      `riot.mount('div');`,
      `send('mounted');`,
      `Promise.all(Array.from(document.images).filter(img => !img.complete).map(img => new Promise(resolve => { img.onload = img.onerror = resolve; }))).then(() => {`,
      `send('mounted');`,
      `});`,
      `</script>`,
    ].join('');
  }

  /**
   * gets body
   *
   * @param opts 
   */
  async dataAction(opts, data = null, website) {
    // load hidden opts
    if (!website) website = await this.website(opts);

    // check data
    if (data) {
      // get website
      await this.dashup.push(opts.page, 'website.json', JSON.stringify(data)) || {};
    }
    
    // return data
    return data ? data : website;
  }

  /**
   * host action
   *
   * @param opts 
   * @param id 
   */
  async hostAction(opts, page) {
    // load key
    const key = await this.dashup.connection.rpc(opts, 'page.key', page);

    // return info
    return {
      key,
      git  : this.dashup.config.git,
      host : this.dashup.config.host,
    };
  }
}