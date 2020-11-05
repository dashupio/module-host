
// import page interface
import { Struct } from '@dashup/module';

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
    this.hostAction = this.hostAction.bind(this);
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
      host : this.hostAction,
    };
  }

  /**
   * returns object of views
   */
  get views() {
    // return object of views
    return {
      view   : 'page/host/view',
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